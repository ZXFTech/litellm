> 设计规范来源参考，来自 `skills/design/components/button/SKILL.md`。原文 SHA256：`b0d985ec8bd2f0e88118bd8e457bce97aadd4d6c6269abbebdddc0f94fe1303c`。
> 本文不是已激活的 Skill。涉及 ForAI 路由、文档站、演示、参考目录及源仓库命令的内容保留其原作用域。消费项目先读[消费范围说明](../README.md)，再按已安装源码、宿主配置和本项目指引核对适用要求。

# Button：统一按钮规范

## 当前实现与使用

- 当前使用 `@base-ui/react/button`、Nova 风格、Lucide 图标和以 Neutral 为基础的文档默认配色；以实际 `components.json`、组件源码及主题变量为准。
- 复用 `@/components/ui/button` 导出的 `Button`、`buttonVariants` 与 `ButtonProps`。外观支持 `default`、`outline`、`secondary`、`ghost`、`destructive`、`link`，通过内置选项使用。
- 默认 `type="button"`，只有显式提交操作使用 `type="submit"`。导航使用链接元素或 Link，配合 `buttonVariants()` 保留导航语义。
- 保留 `data-slot="button"`、`data-variant`、`data-size`、禁用属性兼容及减少动态效果支持。加载图标、`disabled`、`aria-busy` 和调用结果由调用方组合。

## Nova 尺寸与字体

文字按钮使用 Geist 及系统中文回退，字重为 500，沿用主题颜色和圆角变量。

| size      | 高度 | 字号   | 行高   |
| --------- | ---- | ------ | ------ |
| `xs`      | 24px | 12px   | 16px   |
| `sm`      | 28px | 12.8px | 22.4px |
| `default` | 32px | 14px   | 20px   |
| `lg`      | 36px | 14px   | 20px   |

- 纯图标尺寸 `icon-xs`、`icon-sm`、`icon`、`icon-lg` 的宽高分别为 24、28、32、36px。
- `sm` 使用 `--typeset-leading: 1.75` 的显式行高，保持与 reference 默认文档预览一致，避免随容器继承值变化。
- `sm` 字号使用 `--button-sm-font-size`，全局密度在根元素统一调整；Default 密度下字号和行高为 12.8 / 22.4px，其他密度继续沿用 1.75 倍行高。
- default 与 lg 使用 `rounded-lg`（当前 10px），xs 与 sm 使用配方规定的圆角上限（当前 8px）。outline 沿用 Nova 配方，不附加阴影；内边距和图标间距直接复用组件变体。
- 风格高度对照仅供选择配方时参考：Vega 默认 Button 为 `h-9`、Nova 为 `h-8`、Mira 为 `h-7`，不要在当前 Nova 实现中混用其他风格的数值。

## 图标、状态与焦点

- 文字旁的图标使用 `data-icon="inline-start"` 或 `data-icon="inline-end"`，图标尺寸与前后留白由 Button 控制。
- 纯图标按钮必须提供可访问名称；装饰图标使用 `aria-hidden="true"`。
- toggle 类按钮开启时，图标使用主题色 `text-primary`；关闭时恢复组件原有图标颜色。
- 异步操作按钮回调成功时，结果图标使用 `text-success`；回调失败时使用 `text-danger`。默认和加载状态沿用原有图标颜色。
- 复制成功及下载触发成功时，反馈图标同样使用 `text-success`；成功必须依据实际回调，下载仅能报告“已触发下载”。
- 状态颜色只作用于对应图标，不改变按钮容器、文字、背景、边框、阴影、尺寸或间距。
- 焦点沿用 `border-ring`、`ring-3`、`ring-ring/50`。计数演示的程序化聚焦使用 `focus:border-ring focus:ring-3 focus:ring-ring/50`，鼠标触发聚焦时也显示焦点环，失焦后自动移除。
- 禁用操作不触发计数或提交；需要在加载期间保留焦点时使用 Base UI 的 `focusableWhenDisabled`，同时阻止重复执行。

```tsx
import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

<Button variant="outline">
  <SearchIcon data-icon="inline-start" aria-hidden="true" />
  搜索
</Button>;
```

## 异步按钮：加载、完成与恢复

此流程适用于页面及组件中的有限异步操作，包括保存、发布、读取、刷新、重试和复制；组合在 Dialog、Drawer、AlertDialog、Popover、分页或表格中的按钮同样遵循。

| 阶段 | 按钮图标与文字 | 禁用与可访问性 |
| --- | --- | --- |
| idle | 原有图标与操作文案 | 满足业务条件时可操作 |
| loading | 旋转加载图标，可使用“保存中…”等进行中文案 | 阻止重复执行；`disabled` 与 `aria-busy=true` |
| success / error | 成功图标 `text-success` 或失败图标 `text-danger`；恢复操作文案 | 仍阻止重复执行；`aria-busy` 清除；结果图标保留 **618ms** |
| 恢复 idle | 移除结果图标，恢复原有图标与文案 | 618ms 结束后解除本次操作的禁用，其他业务禁用条件仍有效 |

- 真实操作按实际 Promise / 回调完成时机结束 loading；1400ms 仅是示例模拟时长，不给真实请求人为增加等待。加载图标使用 `motion-reduce:animate-none`；需要保留键盘焦点时组合 `focusableWhenDisabled`。
- 临时按钮状态与持久结果分开保存；图标恢复不清除成功或失败文字。通过关联的 `role=status` / `aria-live=polite` 输出结果，纯图标按钮仍保留清晰名称；失败提供原因和可用重试入口，不能吞掉 rejection 或把失败当作成功。
- 共享一个任务的多个按钮共同阻止重复提交，只有实际发起本次操作的按钮展示加载和结果图标。每个独立任务、卡片和表格行独立管理反馈，其他按钮和非按钮状态图标不继承这次临时反馈。
- 如果成功后要自动关闭弹窗、切换详情或移除发起按钮，先保留按钮完成 618ms 的结果反馈，再执行这些界面转换；请求成功及已提交的数据不因展示等待、取消或关闭而回滚。按钮触发的读取若使用正文骨架，将发起操作保留在骨架外的稳定位置。
- loading 与结果反馈期间都能使用原有取消、关闭或重置入口；清理演示计时器，真实请求可取消时使用取消信号，并隔离过期回调。新一轮操作不能被旧 Promise、旧结果计时器或旧自动关闭回调覆盖。重置清除本例临时状态与提示；正常结束保留结果提示。
- 同步交互（切换、计数、清空、纯布局示例）维持自身交互；录音 / 播放等可持续启停的媒体状态遵循对应状态机。其有限异步保存、读取、删除、恢复操作仍使用上述按钮流程。复制 / 下载反馈遵循相同 618ms 恢复；下载反馈不声称文件已下载完成。
- 验证 loading、成功、失败、618ms 前后禁用与 `aria-busy`、结果文字保留、快速重复触发、多按钮归属、取消、重置、卸载及过期回调，并检查明暗主题和减少动态效果。

## Button 示例页交互

- 点击与键盘演示支持鼠标、Enter、空格和程序化聚焦，聚焦操作不增加点击计数。
- 普通按钮点击计数与表单提交计数分别成卡，各自重置；普通按钮及重置按钮不触发表单提交。
- 成功与失败分别演示，当前模拟加载时间为 1400ms；两例均使用上面的统一异步流程。
- 按钮临时图标反馈和后方结果文字分别管理。图标消失不清除“保存完成”或“保存失败”；再次操作可更新结果文字，重置才清回“尚未保存”。
- 每张卡片独立重置，加载和结果图标展示期间均可重置；重置与卸载时清理尚未完成的计时器，避免旧回调影响后续操作。
- 验证八种尺寸、六种外观、明暗主题、禁用与焦点状态，以及独立计数、重试、重置和结果文字保留。

## 实现与规范来源

以下为普通源码与说明路径：

- 当前 Button 实现（ForAI 源仓库路径：`src/components/ui/button.tsx`，未随规范安装）
- 当前示例页（ForAI 源仓库路径：`src/app/[theme]/component/button/page.tsx`，未随规范安装）
- 当前交互演示（ForAI 源仓库路径：`src/app/[theme]/component/button/_components/button-interactions.tsx`，未随规范安装）
- 当前主题变量（ForAI 源仓库路径：`src/app/globals.css`，未随规范安装）
- 当前基础配置（ForAI 源仓库路径：`components.json`，未随规范安装）
- 参考 Base UI 按钮（ForAI 源仓库路径：`reference/ui-main/apps/v4/registry/bases/base/ui/button.tsx`，未随规范安装）
- 参考 Nova 配方（ForAI 源仓库路径：`reference/ui-main/apps/v4/registry/styles/style-nova.css`，未随规范安装）
