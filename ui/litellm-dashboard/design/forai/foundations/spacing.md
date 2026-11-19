# 间距与密度

适用于页面布局和控件的密度。项目可修改以下预设，检查以当前本地条款和样式为准。

## SPACE-1 统一布局

同级布局使用 flex / grid 与 gap，分别核对区块间距、横向间距、标题与正文、内边距和外边距。等宽高使用 size，单行截断使用 truncate。消费侧 className 主要用于宽度、位置及外边距；控件颜色、字体、高度和内部留白由主题、风格及共享变体管理。

## SPACE-2 三档预设

| 当前预设 | --layout-unit（映射 --spacing） | --layout-font-scale | 正文字号 / 行高 |
| --- | --- | --- | --- |
| compact | 0.21875rem | 0.875 | 0.875rem / 1.25rem |
| default | 0.25rem | 1 | 1rem / 1.5rem |
| comfortable | 0.3125rem | 1.125 | 1.125rem / 1.75rem |

密度通过真实 CSS 属性改变间距、字号、行高和控件尺寸，不用 zoom 或 transform 缩放。--button-sm-font-size 跟随密度字体比例，不能只改变页面外边距。

--layout-section-gap、--layout-stack-gap、--layout-inline-gap、--layout-heading-body-gap 分别为 --spacing 的 6、4、2、2 倍。具体实际属性核对当前 CSS，不凭工具类名称虚构 token。

根元素维护全局密度，Portal 继承同一组变量。变更密度不清空表单、标签页或其他业务状态。核对三档密度与窄屏重排后的完整内容及交互。
