# ForAI 设计规范参考

本目录由 `@forai/rules` 安装，保存现有设计规范的完整来源快照。它是普通 Markdown 资料，不是已激活的 Skill，也不会改写消费项目的 Agent 指引。

## 安装与补装

`@forai/setup` 和 `@forai/all-components` 会带入本目录。已有组件项目若尚未安装规范，可在已配置 `@forai` 命名空间的项目根目录预览：

```powershell
pnpm exec shadcn add @forai/rules --dry-run
```

核对全部资料与依赖差异后，移除 `--dry-run` 安装。已有同名文档有本地修改时先比较并合并，不强制覆盖。安装后从本 README 开始，再按下表读取所需规范；本目录不是自动发现入口。

## 阅读入口

| 内容 | 来源快照 | 适用范围 |
| --- | --- | --- |
| 主题、语义变量、字体与圆角 | [通用设计规范](index.md) | 以宿主已接入的主题、组件和配置核对；其中 ForAI 主题路由、导航、文档站和编辑器规则仅用于理解源仓库 |
| 组件实现、组合、状态与焦点 | [组件规范](components/index.md) | 共享实现与消费约定可参考；示例页组织、DocsPage、DocsSection 及参考库迁移属于源仓库开发流程 |
| Button 配方、尺寸、异步反馈 | [Button](components/button.md) | 按当前安装的 Button、反馈 hook 与实际回调核对；演示时长不作为真实请求延迟 |
| 内容卡片与窄屏边界 | [Card](components/card.md) | 卡片布局、完整内容和实际溢出检查 |
| 表格状态、错误与编辑恢复 | [Data Table](components/data-table.md) | 用于评估业务表格行为；规范说明不表示已安装了筛选、排序或服务端数据能力 |
| 密度、布局示例与标注 | [布局](layout/index.md)、[间距](layout/spacing.md) | 实际 token 与密度可参考；间距标注工具、示例开关和专用文档页面没有随组件安装 |

## 在消费项目中使用

1. 先确认本项目自己的 Agent 指引、框架、风格与组件路径。来源快照中的 `src/app/[theme]`、`reference/`、`requireDesignTheme`、`DocsPage` 等均指 ForAI 源仓库，不要求宿主创建这些目录或接口。
2. 读取所需规范，再核对实际安装源码。默认组件位于 `src/components/ui/`、`src/components/ai-elements/`、`src/components/dashboard/`，实际位置由消费项目 `components.json` 的别名决定。未安装组件不能仅凭这份资料直接导入。
3. 主题 CSS 默认位于项目根 `styles/forai/`；项目覆盖位于宿主拥有的 `styles/forai-overrides.css`。保留宿主业务规则，依照实际接入情况使用规范中适用的主题、状态、无障碍和布局约定。
4. 普通资料不会让 Agent 自动发现或执行 Skill。需要让当前任务遵循规范时，可明确要求阅读本目录及对应章节。创建或修改实际 Agent/Skill 入口须另按项目规则审阅与确认。

## 来源与更新

正文由当前 7 份 `skills/design/**/SKILL.md` 生成，去掉 Skill 发现元数据。原规范正文保留，包内互引指向同包 Markdown；未分发的源码与参考资料使用明确的 ForAI 源路径说明，不伪装为消费项目已有文件。

正文中所有源码依据路径（包括反引号里的 `src/...`、`reference/...`、`components.json`）均相对 ForAI 源仓库。它们不是消费项目中的可用路径；消费项目实际路径以自己的安装结果和别名为准。

每份快照标记原始路径与原文 SHA256；Registry manifest 另有源文及载荷摘要。当前仍为 `local-draft`，没有借此声明公开发布 commit 或消费端安装锁。

开发服务会检测已登记规范变化并生成新快照。消费项目需要重新查询和比较，再明确更新本地资料；不要强制覆盖本地编辑。项目自己的补充规范宜放在项目维护的位置，与 `.forai/upstream/` 的来源快照区分。

规范只覆盖源仓库目前写明的内容；目前没有独立的 AI 元件或 Dashboard 专用叶子规范。AI 界面与 Dashboard 继续结合共享规范、真实接口和宿主业务约定判断，不能把“已安装规则”当作这些组件已通过业务、运行或视觉验收。
