# 本机模型网关

这个目录管理独立的 LiteLLM 和 PostgreSQL 服务。项目名为 `llm-gateway`，只监听本机 `127.0.0.1:4000`，数据库没有宿主端口

源码来自 `ZXFTech/litellm` fork，上游为 `BerriAI/litellm`。本地分支基于 `v1.108.3`，提交 `b7d579fab2818968322ef96e5b8e98dc8178fafc`。服务使用固定摘要的同版本官方数据库镜像，并通过 Compose 只读挂载本机图片适配器、计费回调、三处 Python 修复和人民币管理界面。挂载清单见 `compose.yaml`，其他源码改动不会自动进入运行中的镜像。升级时必须复核这些修复和模块路径

在本目录运行以下命令。首次启动生成随机凭据，以后启动保留原凭据

```powershell
.\gateway.ps1 start
.\gateway.ps1 status
.\gateway.ps1 verify
.\gateway.ps1 logs
.\gateway.ps1 stop
```

管理页为 [LiteLLM 管理界面](http://127.0.0.1:4000/ui/)，账号为 `admin`。密码保存在 `.local/admin-login.txt`。模型调用客户端使用管理页创建的虚拟 Key，管理主密钥仅用于管理操作

## agent-platform 接入

2026-11-09 已将 MiniMax-M3、MiniMax-M3.1-Flash、image-01 导入网关数据库。agent-platform 使用仅允许这三个模型的虚拟密钥，保留业务配置、模型 ID 和历史记录。供应商凭据保存在 LiteLLM 加密数据库中

[调用日志](http://127.0.0.1:4000/ui/logs/) 可按平台回执中的 `gateway.gatewayCallId` 查询。元数据包含 `sessionId`、`attemptId`，图片调用还包含 `operationId`。请求与回复正文默认不写入 spend logs，基础日志保存在数据库，目前没有自动清理期限

这个独立网关统一使用人民币 CNY 账本。三个模型已配置中国区人民币价格，日志、用量合计和密钥预算按人民币解释。模型参考目录仍保留其原币种。历史用量不足以还原费用的记录显示“未确认”，不计入已确认费用。价格、历史回填、验证状态和界面重建方法见 [PRICING.md](PRICING.md)

`gateway_minimax.py` 将标准图片接口适配到 MiniMax image-01，每次请求只发送一次上游 POST，并保留实际返回图片数量。它区分业务拒绝与交付结果不明。`gateway_pricing.py` 为日志添加币种和价格版本，并阻止未登记在 `pricing.json` 中的模型调用

平台迁移、备份与回退说明保存在 agent-platform 的 `docs/reviews/litellm-gateway/develop.md`

## 运行与数据

缓存、重试、fallback 和后台真实模型健康请求默认关闭，后续模型或请求配置仍需核对其覆盖行为。容器健康检查使用 `/health/readiness`，`gateway.ps1 verify` 只检查服务、界面、鉴权和模型列表，不调用模型。普通 `/health` 和管理页的模型测试会发送真实模型请求

PostgreSQL 数据保存在独立 Docker named volume。停止服务保留数据。Docker Desktop 必须运行，电脑睡眠或关机时网关不可用

`.env`、`.local`、数据库备份及生成的 `cny-ui` 均已排除 Git。保留并安全备份原 `.env`，其中 `LITELLM_SALT_KEY` 用于解密供应商凭据。升级前备份数据库及凭据，按目标版本处理迁移。数据库已迁移时，仅换回旧镜像不保证能够回滚。不要使用 `docker compose down -v` 删除数据卷

首次启动会在这个新建专用数据库应用 LiteLLM 自带迁移。后续启动固定在同一镜像摘要，不会自动拉取最新版。新检出的工程还需要按 [PRICING.md](PRICING.md) 构建本地人民币界面，生成 `cny-ui` 后再启动
