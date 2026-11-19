# 业务组合

适用于实际安装的朝夕录音、导航、Toast、丢弃确认及其他登记业务组合。先读取本地源码、依赖组件和主题，不能把文档站演示视为业务契约。

| 登记条目 | 本页适用范围 |
| --- | --- |
| zhaosie-record-button、zhaosie-record-mode、zhaosie-waveform | 主题、组合和持续媒体 |
| zhaosie-record-card、zhaosie-record-panel | 主题、卡片组合和持续媒体 |
| zhaosie-navigation、zhaosie-toast、zhaosie-discard-dialog | 主题、组合及有限操作反馈 |
| zhaosie-recorder、zhaosie-record | 持续媒体、清理与宿主保存 |

条目名称只用于适用范围路由，不复制导出或 props。实际文件与依赖仍从项目源码读取。

## BUSINESS-1 主题与组合

复用共享控件和语义变量，品牌差异只维护自己的声明，基础值继续继承。结构样式和主题变量分别接入，Portal 同步根主题与密度。

有限保存、读取和重试遵循 [Button](button.md)，确认与取消遵循 [浮层与对话框](dialog.md)。结果说明保留可读上下文，不只依赖短暂 Toast。

## BUSINESS-2 持续媒体

录音、播放等持续状态按实际状态机处理。开始录音需要明确操作，不因挂载自动申请麦克风。取消、重置及卸载清理音轨和预览地址，迟到结果不回填新会话。保存失败保留可恢复内容，重试前核对宿主效果，不能自动重放结果未知的外部操作。

宿主保存接口、鉴权和存储由项目实际实现决定，规范不承诺默认组件已有远端持久化。按实际设备、权限、键盘、窄屏与减少动态效果分别验证。
