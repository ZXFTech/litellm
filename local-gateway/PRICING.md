# 人民币计费

更新于 2026-11-09。这个独立网关将实际调用费用、用量汇总与密钥预算统一按人民币 CNY 解释，不做美元换算。LiteLLM 原有 `spend` 字段没有独立币种类型，部署价格使用人民币数值，日志元数据记录 `billing_currency=CNY` 和 `pricing_version`，管理界面显示 `¥` / `CNY`。模型参考目录保留原始参考币种，其价格不能直接作为本机账本价格使用

## 价格与口径

配置来源为 [MiniMax 中国区价格总览](https://platform.minimax.cn/docs/pricing/overview)，核对日期为 2026-11-09。机器可读配置保存在 `pricing.json`，版本为 `minimax-cn-2026-11-09`。下表文字模型金额单位均为人民币元 / 百万 token

| 模型和服务档位 | 单次总输入 | 普通输入 | 输出 | 缓存读取 |
| --- | --- | ---: | ---: | ---: |
| MiniMax-M3 standard | ≤ 512k | 2.10 | 8.40 | 0.42 |
| MiniMax-M3 standard | > 512k | 4.20 | 16.80 | 0.84 |
| MiniMax-M3 priority | ≤ 512k | 3.15 | 12.60 | 0.63 |
| MiniMax-M3 priority | > 512k | 6.30 | 25.20 | 1.26 |
| MiniMax-M3.1-Flash | 已公布的统一档位 | 1.00 | 4.00 | 0.10 |

image-01 按实际返回图片数量计费，每张 ¥0.025，当前公布价格不区分分辨率。适配器把数量保存在 `usage.generated_images`，日志对应 `metadata.additional_usage_values.generated_images`

MiniMax-M3 使用官网已经包含优惠的价格，不再额外乘一次折扣。priority 是 standard 的 1.5 倍。Flash 不支持 priority，不配置推测的服务档位价格。参见 [Anthropic 兼容接口](https://platform.minimax.cn/docs/api-reference/text-anthropic-api)

缓存读取与普通输入分别计算。LiteLLM 的归一化 `prompt_tokens` 包含缓存读取 token，因此计算时先减去缓存读取数量，再按普通输入价计费。缓存写入采用普通输入价，没有额外写入溢价。思考 token 已计入输出，不重复相加。参见 [提示缓存说明](https://platform.minimax.cn/docs/api-reference/text-prompt-caching) 和 [MiniMax-M3 说明](https://www.minimax.io/blog/minimax-m3)

官网写作 512k，没有明确十进制或二进制边界。本机沿用 LiteLLM 的既有解释，以归一化总输入 `512000` 为边界，只有严格大于它才切换长上下文价格，整次请求采用对应档位。这个精确边界是本地实现假设，不表述为供应商已经确认的规则

## 配置与运行时

价格通过 `/model/{model_id}/update` 写入 `litellm_params`。`model_info` 只保存 `pricing_currency`、`pricing_version` 和来源等说明。LiteLLM v1.108.3 会过滤直接写入 `model_info` 的部分价格字段，而 `/model/info` 又可能展示内置美元参考价格，因此不能仅凭一次 PATCH 成功判断运行时价格已经生效

`gateway_pricing.py` 在调用前添加币种和版本元数据，并拒绝 `pricing.json` 未登记的模型。新增模型时必须先确定人民币计价规则，在该配置登记，再向数据库写入其部署价格，重启网关并验证实际费用。不要把美元数值直接加入这份人民币账本。价格配置文件与数据库价格需要同时维护，回调不会自动把文件中的价格写入数据库

固定镜像额外只读挂载三处源码修复

| 文件 | 用途 |
| --- | --- |
| `litellm/utils.py` | 保留 CustomLLM 图片请求的 `n` 和 `size` |
| `litellm/litellm_core_utils/llm_cost_calc/utils.py` | CustomLLM 图片按实际返回数量计费 |
| `litellm/types/utils.py` | 补齐 512k 以上缓存写入及 priority 的五个价格字段，保证配置进入 Router 运行时 |

Compose 另外挂载 `gateway_minimax.py`、`gateway_pricing.py`、`pricing.json` 和生成后的 `cny-ui`。这些挂载针对固定的 v1.108.3 镜像及其 Python 3.13 安装路径。升级前要重新验证，不能假定同一路径或补丁仍然适用

## 历史回填

2026-11-09 已在网关停止并排空请求后回填 8 条历史记录，保留调用 ID 和关联元数据。能核实的人民币费用合计为 ¥0.05091432。回填同时校正日汇总与密钥、用户计数器，按完整桶维度匹配，核对每条日志唯一归桶及请求数量

图片调用 `f5656202-ec45-4d46-8409-219d02593a1f` 没有保留实际返回图片数量，标记为 `pricing_status=unconfirmed`。其数据库数值暂为 0，但界面显示“未确认”并隐藏费用拆分，不解释为免费，也不计入已确认费用。其余两条历史成功图片调用各返回一张，数量由 agent-platform 保留的验证证据确认

迁移脚本 `configure-pricing.mjs` 是这次有限数据集的操作脚本，包含 `prepare`、`apply`、`backfill` 三步和数据边界断言。不要把历史回填当作未来调价的通用命令。私有数据库备份、原账本、计划及结果保存在 `.local/pricing-cny-20261109/`，目录已限制访问 ACL，并排除 Git。原账本包含敏感配置，不能上传或提交

日志金额由已配置单价与可核实用量计算，不读取 MiniMax 的结算账单。未确认记录需要补充供应商用量或返回证据才能结算

## 重建人民币界面

界面由仓库里的 `ui/litellm-dashboard` 静态导出。以下命令从仓库根目录运行，使用现有 lockfile，不升级依赖。已有依赖时可以跳过 `npm ci`

```powershell
$gatewayRoot = (Get-Location).Path
Push-Location (Join-Path $gatewayRoot 'ui/litellm-dashboard')
npm ci --ignore-scripts --no-audit --no-fund
npm run build
if ($LASTEXITCODE -ne 0) { throw 'UI build failed' }
Pop-Location
$uiTarget = Join-Path $gatewayRoot 'local-gateway/cny-ui'
New-Item -ItemType Directory -Force -Path $uiTarget | Out-Null
Copy-Item -Path (Join-Path $gatewayRoot 'ui/litellm-dashboard/out/*') -Destination $uiTarget -Recurse -Force
Set-Content -LiteralPath (Join-Path $uiTarget '.litellm_ui_ready') -Value 'CNY static UI' -Encoding utf8
docker compose --env-file local-gateway/.env --file local-gateway/compose.yaml up -d --wait gateway
```

`cny-ui` 是忽略的构建产物，不能只修改它而不保存对应 UI 源码。调用日志、用量、预算及相关金额格式已调整；模型参考目录不改成虚假的人民币报价

## 验证状态

离线价格测试 6/6 通过，覆盖缓存读取不重复收费、写入无溢价、512000 边界、priority、实际图片数量，以及价格经过配置解析和 Router 装载后仍然生效。新增 Router 回归在未修复镜像上失败，挂载修复后通过。测试容器禁止网络，没有发送真实模型请求

金额单元格测试 7/7、格式化测试 27/27 通过，Next 静态构建通过。真实生产构建与隔离数据库下，MiniMax-M3 流式聊天、Flash 配置验证和 image-01 单张生图均成功，日志保留平台关联和 CNY 元数据。分别按缓存与普通输入、输出及图片数量复算，费用为 ¥0.00026586、¥0.00008470、¥0.025，均与日志一致。验证时明细、用户日汇总、团队日汇总和密钥累计均为 ¥0.07626488，另外保留 1 条未确认记录

浏览器实际登录与日志页验收通过，CNY 列和未确认详情均正确，未确认详情不显示零元费用拆分。只读健康验证通过，网关与数据库就绪且已加载三个模型。证据为本目录 `.local/pricing-cny-20261109/live-evidence.json`、`ui-evidence.json`、`ui-logs.png` 和 `ui-unconfirmed.png`；平台隔离验收证据在 `.local/litellm-pricing-live/`。未做真实超长上下文或 priority 付费调用，这两部分由离线 Router 计费回归覆盖；未逐屏验收全部管理功能。没有提交或推送
