# 语义颜色与主题

适用于组件、页面、主题及浮层的颜色。

## COLORS-1 语义用途

页面使用 background / foreground，卡片使用 card / card-foreground，浮层使用 popover / popover-foreground。主要和次要操作使用 primary / primary-foreground、secondary / secondary-foreground。辅助内容使用 muted / muted-foreground，交互强调使用 accent / accent-foreground。边框、输入、错误与焦点使用 border、input、destructive、ring。

同一用途复用同一组变量和语义类。颜色值集中在主题 CSS，业务调用处不散落固定颜色。明暗分别赋值给相同变量；新增业务状态色提供配套前景、明暗值和 Tailwind 映射。

## COLORS-2 继承与覆盖

品牌只声明与基础主题不同的同名变量，缺省值继承基础主题。保留 var()、calc()、light-dark() 及媒体、支持条件，不把一次 computed style 当成全部条件。

默认变量位于 theme 层，品牌差异遵循项目既有层级；项目可以在集中覆盖文件中维护自己的要求。不要用行内颜色、反复 JavaScript 写值或 !important 抢占默认主题。styles/forai-overrides.css 属于项目，补装或更新不能替换它。

## COLORS-3 根主题与 Portal

设计主题使用 data-design-theme，明暗使用 data-theme 与 color-scheme，密度使用 data-layout-density。根主题位于 html / :root，body 下的 Portal 消费同一变量。首版不承诺局部容器主题自动传入 Portal。字体加载与偏好持久化由宿主维护。

在真实浏览器中分别核对明暗、品牌覆盖与缺省继承、浮层和交互状态。只检查 CSS 声明不能证明视觉结果。
