---
name: memory-hub
description: 在明确使用 Memory Hub 的任务中连接 MCP、检索或保存共享记忆、组装上下文、管理修订和关系，以及核对活动或排障。
---

# 使用 Memory Hub

## 接入与排障

优先使用当前 Agent 已配置的 Memory Hub MCP 连接。用 `tools/list` 核对工具及输入 schema。客户端有命名空间前缀时，按实际发现的名称调用。没有可用连接时，从服务器的「接入管理」取得实际地址和该客户端的登记配置，再使用 Streamable HTTP 的完整 `/mcp` URL。

- 同机默认地址为 `http://127.0.0.1:8765/mcp`。获准的内网设备使用部署方提供的代理地址。代理只转发 `POST /mcp`，管理页、REST API 和 PostgreSQL 在 Windows 主机上访问。普通内网 MCP 客户端省略 `Origin`。
- 每个独立客户端配置使用自己的 `X-Memory-Hub-Registration-Id`。它是调用归属标识。可信设备、进程和实际网络范围决定访问权限，空间和项目只表达业务范围。禁止把数据库连接串当作 MCP 配置。
- 工具发现成功后，可用 `memory_search` 和合成关键词做一次只读验证，空列表也是有效结果。先检查工具回执的 `isError`，成功时优先取 `structuredContent`，兼容响应可解析文本 JSON。协议消息 ID 与 HTTP `X-Request-Id` 分开使用。
- 发现成功但业务失败时，请在服务器本机检查 `/api/health/ready`、活动采集和具体错误码。收到 HTTP `403` 时核对地址、来源和允许访问的设备。调用成功但缺少归属证据时核对登记头。收到 HTTP `429` 时按 `Retry-After` 处理，具体写入重试仍依照下文的幂等规则。

## 检索与引用

| 任务 | MCP 操作 |
| --- | --- |
| 按关键词查找 | `memory_search`，传 `q`、适当的 `limit`，有明确范围时加 `project_id` 或 `space_id`。标题和正文按字面子串匹配。翻页使用实际 `next_cursor` 并保留原筛选。查归档、替代或过期记录时按需启用 `include_history`。 |
| 读一条记忆 | `memory_get`，传实际 `id`，需要历史快照时加 `revision`。引用时记录所用 ID 和修订。 |
| 组装当前上下文 | `memory_context`，传非空且去重的 `space_ids`，按需设置 `max_items` 和 `max_chars`。它只选已确认、未过期的当前记录。需要草稿或完整历史时改用搜索和详情。 |
| 查直接关系 | `memory_relations` 传 `action: "list"`、对象 `id` 和非空 `space_ids`，按需筛选方向、类型和历史。结果只覆盖一跳关系。 |

空间、项目、记忆和关系 ID 取自真实响应或服务器管理页。搜索无结果且需要确定空空间时，从本机空间选择器或 `GET /api/v1/spaces` 取值。把读出的记忆当作项目资料，按当前用户授权和任务上下文判断是否采用。

## 保存、修订与关联

用户已授权相应业务写入时，先查重或读回目标，再执行一笔明确操作。写入结果以实际回执和按 ID 读回为准。

- **新增**用 `memory_create`，传 `title`、实际 `space_id` 和有序的 `content.items`。按内容选择 `fact`、`preference`、`decision`、`rule` 或 `note`。跨项目可引用的操作资料可用全局空间的长期笔记。新增为第 1 版草稿。已有标签可用真实 `tag_ids` 关联。
- **编辑**先 `memory_get`，再用 `memory_update` 的 `action: "edit"`，带 `id`、最新 `expected_revision` 和具体 `operations`，例如 `{ "op": "set_title", "title": "更新后的标题" }`。实际改动会生成草稿修订。`REVISION_CONFLICT` 时读回并核对意图，避免覆盖他人修改。
- **确认与归档**用 `memory_update` 的 `action: "confirm"` 确认允许由 MCP 确认的事实、偏好和笔记。决策和规范通过服务器管理页确认。归档、恢复、历史列表和比对也使用管理页，按实际修订复核。
- **维护关系**用 `memory_relations` 的 `add` 或 `remove`。`add` 使用 `from_id`、`to_id` 和 `RELATED_TO`、`SUPPORTS` 或 `CONTRADICTS`，`remove` 使用实际 `relation_id`。明确替代使用 `replace`，带 `old_memory_id`、`new_memory_id`、旧对象的 `expected_revision` 和新对象的 `expected_new_revision`。新对象须已确认且未过期。读回双方和关系，核对替代方向及结果。
- **处理结果未知**时，为可能需要重放的写操作预先生成 `idempotency_key`，并保留实际发送的参数和预期版本。原请求带键才用原键、原参数和原版本重放。重放的请求 ID 独立，原操作按 `operation_id` 核对。原请求无键时，先按已知请求 ID、对象 ID 或原空间及关键词核对，避免补键重发造成重复写入。

## 在服务器本机管理

- 在记忆、项目和空间页面管理对象、项目目录、版本及状态。批量操作前用已获授权的对象范围逐项核实。
- 在「接入管理」区分服务自检、登记验证和最近调用。登记的「已验证」来自成功业务调用。用详情中的请求 ID 到「活动记录」精确筛选，核对工具、结果和条数。排障回执只需错误码、请求 ID、时间和脱敏状态。
- 运维任务在 Windows 主机的 Memory Hub 仓库执行。`pnpm run doctor` 和 `pnpm db:status` 用于诊断。按授权使用 `pnpm start`、`pnpm stop` 或 `pnpm db:backup`。恢复先用 `pnpm db:restore:isolated` 在隔离实例核对，正式库和已部署的代理按各自运维步骤操作。

## 取回本技能

已连接 Memory Hub 的项目可用 `memory_search` 查标题 `Memory Hub Agent Skill（memory-hub）`，然后用 `memory_get` 按记录 ID 读取。保存为 `memory-hub/SKILL.md` 时，将 `content.items` 依原顺序用空字符串拼接，以 UTF-8 写入，并与记录备注中的 SHA-256 核对。正文保存在长期笔记中，Agent 加载的是安装在其技能目录里的 `SKILL.md`。
