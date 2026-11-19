> 设计规范来源参考，来自 `skills/design/SKILL.md`。原文 SHA256：`bb3606672cf994df0519f96401abc2a8c894857dc42a1bc15c13eb5ffaad0ab2`。
> 本文不是已激活的 Skill。涉及 ForAI 路由、文档站、演示、参考目录及源仓库命令的内容保留其原作用域。消费项目先读[消费范围说明](README.md)，再按已安装源码、宿主配置和本项目指引核对适用要求。

# Design：通用设计规范

本文件维护页面、组件和主题共享的设计约定。组件实现和具体控件的要求按下级入口读取。

## 开始前确认

1. 阅读实际应用的 `package.json`、主题 CSS、现有实现，以及存在时的 `components.json`。参考目录里的配置不代表当前应用配置。
2. 沿用已确认的基础组件库、风格、主题、字体、圆角和图标库。尚未确定时，在首次界面设计中确认一套组合，再用于整批界面；不要逐个控件混选风格。
3. 核对主题变量是否已接入。缺失时将必要的基础接入纳入当次实现，不引用尚未定义的主题类。

基础组件库决定行为接口，风格决定尺寸与外观，主题决定颜色，分别维护。参考库提供 Vega、Nova、Maia、Lyra、Mira、Luma、Sera、Rhea 八套风格；实际选择以应用配置为准。

## 信息层级与视觉分组

* 先识别当前任务区域的主要内容、辅助信息和核心操作，再选择已有字体层级、语义色及强调程度；同类信息跨组件保持相近的视觉权重，主要操作按任务区域确定。
* 用间距表达关联：同组内容紧密，组间通过留白、标题或分隔建立边界。卡片、背景、边框与阴影应承担明确的分组或层级用途；已有边界足够时保持结构简洁。具体示例的容器要求仍按下级规范执行。

## 主题路由与公共页面

* 设计主题来自 URL 的 `theme` 参数，页面统一使用 `/[theme]/component/<name>` 与 `/[theme]/layout/<name>`。仅主题段动态化，页面仍保留明确的路由文件；公共页面维护一份，不按主题复制。
* `src/lib/design-themes.ts` 是主题与页面目录的统一来源：`designThemes` 登记主题，`publicComponentPages` / `layoutPages` 登记公共页，`themeExtensions` 登记主题独有页面。新增公共页会被所有已登记主题复用。
* 服务端根布局通过 `requireDesignTheme(params)` 校验主题并在 `html` 输出 `data-design-theme`；业务专属页额外传入页面路径，例如 `requireDesignTheme(params, "component/record")`。未知主题及未登记给该主题的业务页面返回 404，不能只在导航中隐藏。
* 导航与站内引用使用当前主题，由 `themeHref`、`navigationGroups` 等现有接口生成。主题切换沿用 `switchThemeHref`：公共页保留当前位置，目标主题不支持的业务页回到 Button。新链接使用单数 `component`，保留已有旧地址重定向。

## 基础样式与主题差异继承

| 位置 | 职责 |
| --- | --- |
| `src/app/globals.css` | 统一样式入口、加载顺序和 layer 顺序 |
| `src/themes/base/globals.css` | 聚合设计系统默认值、密度、动态效果和文档基础样式 |
| `src/themes/<theme>/globals.css` | 只维护该主题与 base 不同的 token 声明，以及该主题独有的 token |
| `src/components/ui/` 与现有设计系统 | 所有主题默认复用的组件实现与变体 |

* 同一用途使用与 base 完全相同的 token 名称，例如品牌操作色仍覆盖 `--primary`。不复制一整套 base 变量，也不为同一用途另起品牌前缀变量。没有写入品牌文件的值自动使用 base。
* 沿用入口的 `theme, base, brand, components, utilities` 层级顺序，在 `@layer brand` 中使用 `:root[data-design-theme="<theme>"]` 限定品牌声明，由 CSS 级联实现“品牌已有声明优先，缺失声明继承 base”。新主题文件由统一入口导入，不在每个页面重复加载或重新声明默认值，不用 `!important` 抢占主题优先级。
* 比较差异时保留 `var()`、`calc()`、`light-dark()` 的绑定与媒体、支持条件；不要把一次 computed style 的结果当作全部条件下的基准。同名别名仍指向共享语义变量，不逐页展开成固定值。
* 品牌身份使用 `data-design-theme`；明暗继续使用 `data-theme` 与 `color-scheme`，密度继续使用 `data-layout-density`。三者分别维护，主题切换不另造一套明暗或密度状态。
* 页面根元素承载主题，Portal 消费同一组变量。需要同页比较不同主题时复用 `DesignThemePreview`，让基础别名在预览节点重新计算；新增主题选择器同时覆盖对应 `[data-design-theme="<theme>"][data-theme-preview]` 作用域。
* 默认颜色偏好为跟随主题，不注入行内颜色覆盖。个人颜色与样式编辑器的预览、保存、重置和导出沿用按设计主题隔离的实现，重置删除覆盖后恢复品牌声明或 base 继承。主题组件的结构样式按需放在对应 `components.css`，继续消费共享 token，不把组件规则混入差异 token 清单。

## 新增主题与页面的接入

* 新增主题：登记 `designThemes` 与 `themeExtensions`（没有专属页时为空数组），创建差异样式并从统一入口导入。复用公共路由、文档外框和组件；核对现有主题专属文案、预览选择器及条件分支，避免将朝夕的名称或业务内容套到新主题。
* 新增公共页：在 `src/app/[theme]/component/` 或 `src/app/[theme]/layout/` 下创建明确的页面，并登记到对应公共目录；站内链接保持当前主题。组件示例的区块组织与主题附加内容按下级组件规范接入。
* 新增主题业务页：复用动态主题路由，仅登记到所属主题的 `themeExtensions`，在页面入口校验主题与路径；公共页面上的附加示例按当前主题条件追加，保留公共示例与公共目录。

## 主题、颜色与字体

使用表达用途的变量和 Tailwind 语义类，同一用途使用同一组变量。

| 用途 | 共享变量或类 |
| --- | --- |
| 页面背景与正文 | `background`、`foreground` |
| 卡片与浮层 | `card` / `card-foreground`、`popover` / `popover-foreground` |
| 主要与次要操作 | `primary` / `primary-foreground`、`secondary` / `secondary-foreground` |
| 辅助内容与交互强调 | `muted` / `muted-foreground`、`accent` / `accent-foreground` |
| 错误、边框、输入和焦点 | `destructive`、`border`、`input`、`ring` |

* 例如主要操作使用 `bg-primary text-primary-foreground`，辅助文字使用 `text-muted-foreground`。颜色数值集中在主题 CSS 中，避免在业务界面散落固定色。
* 明暗主题分别赋值给同名变量，沿用应用已确认的主题切换方式，不逐页拼接另一套明暗配色。
* 新的业务状态颜色在主题层定义成对的语义变量、明暗取值和 Tailwind 映射，再供界面共同使用。
* 正文、标题和等宽内容使用统一字体变量；标题层级、字号和字重沿用当前风格。

## 圆角尺度

* 圆角共享 `--radius`。参考尺度为 `sm = 0.6 × radius`、`md = 0.8 × radius`、`lg = radius`、`xl = 1.4 × radius`、`2xl = 1.8 × radius`、`3xl = 2.2 × radius`、`4xl = 2.6 × radius`。
* 使用当前风格规定的圆角档位。存在已确认的品牌尺度时统一替换主题尺度，不在单个页面临时增加圆角数值。

## 下级入口

* 新增、修改或审阅组件及组件示例页时，先读取 [组件通用规范](components/index.md)，再按其中入口读取具体组件规范。
* 新增、修改或审阅页面布局、布局示例、布局密度及其规范展示时，继续读取 [布局规范](layout/index.md)。

## 验证与交付

* 应用代码或主题配置变更后执行 `pnpm lint` 和 `pnpm build`，并运行该任务已有的相关测试。
* 在可运行的界面中检查对齐、字体层级、图标间距、明暗主题和交互状态；按页面需要检查窄屏布局，说明实际检查过哪些状态。
* 新增或修改主题及共享路由时，验证两种以上已登记主题的公共页面、专属页的 404 边界、主题切换与旧地址；同时核对明暗、三档密度、窄屏及 Portal。新增主题应逐一纳入已有主题测试。
* 验证品牌覆盖和缺省继承均生效，个人颜色与编辑器覆盖不串主题，重置回到当前主题；正式导出只包含有效差异，保留表达式、条件与主题作用域。

* 仅修改规范文档时检查 `git diff --check`。未执行的检查如实标记，不把规则文件的创建当成视觉一致性已经验证。

## 规范来源

以下为普通参考资料路径：

* 主题与页面注册表（ForAI 源仓库路径：`src/lib/design-themes.ts`，未随规范安装）
* 服务端主题与页面校验（ForAI 源仓库路径：`src/lib/design-theme-server.ts`，未随规范安装）
* 统一样式入口（ForAI 源仓库路径：`src/app/globals.css`，未随规范安装）
* 基础主题入口（ForAI 源仓库路径：`src/themes/base/globals.css`，未随规范安装）
* 朝夕差异样式示例（ForAI 源仓库路径：`src/themes/zhaosie/globals.css`，未随规范安装）
* 局部主题预览（ForAI 源仓库路径：`src/components/docs/design-theme-preview.tsx`，未随规范安装）

* 主题规范与圆角尺度（ForAI 源仓库路径：`reference/ui-main/apps/v4/content/docs/(root)/theming.mdx`，未随规范安装）
* 风格名称与定位（ForAI 源仓库路径：`reference/ui-main/apps/v4/registry/styles.tsx`，未随规范安装）
* 基础配置模型（ForAI 源仓库路径：`reference/ui-main/apps/v4/registry/config.ts`，未随规范安装）
