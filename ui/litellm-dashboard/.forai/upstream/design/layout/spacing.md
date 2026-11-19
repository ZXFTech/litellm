> 设计规范来源参考，来自 `skills/design/layout/spacing/SKILL.md`。原文 SHA256：`5dd0fe32237cbef943bec051cde3d9072f05888e011bc6a17c5ccacc3d9c41c1`。
> 本文不是已激活的 Skill。涉及 ForAI 路由、文档站、演示、参考目录及源仓库命令的内容保留其原作用域。消费项目先读[消费范围说明](../README.md)，再按已安装源码、宿主配置和本项目指引核对适用要求。

# Spacing：间距与密度展示页

本文件仅适用于 `/[theme]/layout/spacing`。

## 页面与交互

* 使用“布局示例”和“使用规范”两个 Tabs，默认打开布局示例。
* 标题操作栏使用单选 ToggleGroup 切换紧凑 Compact、默认 Default、宽松 Comfortable，默认 Default；使用已保存的全局选择时恢复该选择，页面与顶部 navbar 保持同步；当前选项不能被取消成空值。
* 切换 Tabs 时保留所选密度与标注显隐状态，目录只指向当前标签页中的章节。
* 密度通过根元素 `data-layout-density` 在全站生效，包含导航、标题、规范页和浮层；`.layout-density[data-layout-density]` 示例作用域与全局选择同步。
* 布局示例依次覆盖纵向区块、横向元素、标题与正文、通用元素、页面直接子元素、通用组件、组合与浮层。
* 通用元素展示内外边距、列表项间距和表格单元格留白；组件使用当前已接入的共享实现，并展示内部及外围间距。
* 规范中的刻度只保留数值对照，不显示实际长度示意条。每条规范明确列出对应的 CSS token 名称。

## 本页标注接入

* `SpacingWorkspace` 用独立的 `showAnnotations` 状态控制标注，初始化为 `true`；不写入全局显示偏好存储。标注显隐不修改全局密度选择。
* 示例根节点与 ComboboxContent、PopoverContent、DialogContent、AlertDialogContent 均带 `data-spacing-annotations={showAnnotations}`；`ComponentExamples` 接收同一状态，浮层不遗漏。
* 开启时挂载 `SpacingLegend` 和 `SpacingOverlay`。关闭时卸载两者，并通过 `.layout-density[data-spacing-annotations="false"]` 下的 `.spacing-guide-token`、`.spacing-token-label` 隐藏静态标注；选择器不覆盖“使用规范”。
* 用 `data-spacing-padding`、`data-spacing-margin`、`data-spacing-gap` 声明标注类型及对应 token，`SpacingTokens` 展示同色标签。FileInput 的透明原生 input 使用 `data-spacing-target="parent"`，测量实际可见的文字包装，避免把隐藏控件的留白画到文字上。
* `SpacingOverlay` 读取 `getComputedStyle` 与 `getBoundingClientRect`，通过尺寸、内容变化观察和密度、滚动事件安排重测；卸载时清理观察器、监听和 animation frame。滚动浮层使用精确的视口尺寸与裁剪，色带与中间 overflow 祖先的可视区域求交，避免整数尺寸舍入或负外边距扩大标注范围。

## 三档基础值

取值由 `src/app/globals.css` 的 `:root[data-layout-density]`、`.layout-density` 及其密度属性选择器维护。以下 px 按根字号 16px 换算，三档是本项目预设，不是上游已有的成套密度。

| token / 属性 | Compact | Default | Comfortable |
| --- | --- | --- | --- |
| `--layout-unit`，映射到 `--spacing` | 0.21875rem / 3.5px | 0.25rem / 4px | 0.3125rem / 5px |
| `--layout-font-scale` | 0.875 | 1 | 1.125 |
| `--layout-body-font-size` | 0.875rem / 14px | 1rem / 16px | 1.125rem / 18px |
| `--layout-body-line-height` | 1.25rem / 20px | 1.5rem / 24px | 1.75rem / 28px |
| 默认控件 `h-8`，即 `--spacing × 8` | 28px | 32px | 40px |

## 间距语义映射

下表倍数均以当前作用域的 `--spacing` 为单位。

| CSS token | 倍数或值 |
| --- | --- |
| `--layout-section-gap` | 6 |
| `--layout-stack-gap` | 4 |
| `--layout-inline-gap` | 2 |
| `--layout-heading-body-gap` | 2 |
| `--layout-paragraph-gap` | 3 |
| `--layout-component-group-gap` | 4 |
| `--layout-field-gap`、`--layout-list-gap` | 2 |
| `--layout-element-padding-inline` / `--layout-element-padding-block` | 4 / 3 |
| `--layout-element-margin-inline` / `--layout-element-margin-block` | 0px / 2 |
| `--layout-page-padding-inline` | 4；md（48rem）起为 6 |
| `--layout-page-padding-block` | 6；lg（64rem）起为 8 |
| `--layout-child-padding-inline` / `--layout-child-padding-block` | 4 / 4 |
| `--layout-child-margin-inline` / `--layout-child-margin-block` | 2 / 2 |
| `--layout-cell-padding-inline` / `--layout-cell-padding-block` | 3 / 2 |
| `--card-spacing` | 4；用于 default Card 结构示意 |

## 字体与组件

* `--text-xs`、`--text-sm` 分别为 0.75rem、0.875rem 乘 `--layout-font-scale`；`--text-base` 引用 `--layout-body-font-size`。
* xs、sm、base 行高 token 分别为正文行高减 `--spacing × 2`、减 `--spacing`、正文行高；Default 为 16 / 20 / 24px。
* 区块标题 `--layout-title-font-size` 引用缩放后的 `--text-xl`（1.25rem 乘字号比例），`--layout-title-line-height` 为正文行高加一个 spacing；Default 为 20 / 28px。
* 页面示例标题 `--layout-page-title-font-size` 引用缩放后的 `--text-3xl`（1.875rem 乘字号比例），`--layout-page-title-line-height` 为正文行高加三个 spacing；Default 为 30 / 36px。
* 小号 Button 使用 `--button-sm-font-size = 0.8rem × --layout-font-scale`，行高继续使用 `--typeset-leading: 1.75`。Default 为 12.8 / 22.4px，全站随当前密度同步变化。
* 共享组件的高度、padding、gap 与图标尺寸继续消费 Nova 配方及 `--spacing`；组件默认 margin 为 0，外围由父容器 gap 管理。
* Tabs 列表外壳的 3px 留白为 Nova 固定值；规范注明其不随 spacing 缩放。
* Combobox、Popover、Dialog、Modal 的 Portal 内容带相同的 `.layout-density` 与 `data-layout-density`，不能遗漏浮层字体和内边距。

## 验证

* 应用代码或样式变更后执行 lint、独立类型检查和生产构建；仅更新本规范时检查 `git diff --check`。
* 在浏览器验证初始 Tabs 与密度、三档的真实 computed style、反复切换回 Default、Tabs 切换保留密度、当前目录、键盘操作及窄屏溢出。
* 检查弹出内容、文档导航与规范页跟随全局密度；验证顶部与页面控件同步及刷新保留。
* 验证标注默认开启及反复开关；关闭后示例与四类浮层的色带、图例、token 标签和固定值说明均不可见，规范页 token 保持可见。
* 切换标注前后核对密度、Tabs、输入值、选项和分页状态；检查重开后按当前密度重绘，鼠标、键盘和标签操作均可用。
* 规范不把新增 token 归为上游原生变量，不把未执行的检查写成通过。

## 普通源码依据

* `src/app/globals.css`
* `src/app/[theme]/layout/spacing/page.tsx`
* `src/app/[theme]/layout/spacing/_components/spacing-workspace.tsx`、`component-examples.tsx`
* `src/app/[theme]/layout/spacing/_components/spacing-annotations.tsx`、`spacing-overlay.tsx`
* `src/components/ui/switch.tsx`
* `src/components/ui/`
* `reference/ui-main/apps/v4/registry/styles/style-nova.css`
* `reference/ui-main/skills/shadcn/rules/styling.md`
