# 字体与圆角

适用于文字、标题、等宽内容和共享控件的形状。

## TYPE-1 字体

正文、标题和等宽内容使用宿主提供的统一字体变量，沿用选定风格的字号、行高和字重。默认 Button 使用 Geist 及系统中文回退，宿主可以修改字体规范并提供实际字体。不由主题安装过程下载字体。

## TYPE-2 圆角

共享圆角来自 --radius。参考尺度为 sm = 0.6 × radius、md = 0.8 × radius、lg = radius、xl = 1.4 × radius、2xl = 1.8 × radius、3xl = 2.2 × radius、4xl = 2.6 × radius。项目有明确品牌尺度时统一修改主题或本地条款，不在每个页面临时堆圆角数值。

控件使用当前风格规定的档位；具体 Button 要求见 [Button](../components/button.md)。这里的尺度用于设计，实际映射需要核对本地 CSS。
