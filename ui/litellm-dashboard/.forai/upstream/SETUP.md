# ForAI 本机 Registry 接入手册

最新完整指南位于 ForAI 本地仓库的 docs/guides/local-registry.md。安装后的本文也包含完整配置、主题接入、第 12 节的 AI 与 Dashboard，以及第 13 节的规范资料安装与更新说明。

本文对应 0.1.0 的本地草稿，主路径为 Windows PowerShell 7、Next.js App Router、React 和 Tailwind CSS 4。第 1 至 10 节提供三组件最小接入路径，第 11 节补充主题、23 个共享组件及朝夕业务，第 12 节介绍 AI 与 Dashboard，第 13 节介绍规范、后台页面参考及入口草案，第 14 节说明已有 Vite 宿主的接入边界。组件安装后均使用消费项目的本地路径导入。

当前没有可用的公开 ForAI 发布地址或 tag，项目发布许可也尚未确定。需要先取得包含 P1 实现的本地 ForAI 源码目录；不能假定克隆远端默认分支就能取得本次尚未提交的实现。不要将本文的 localhost 安装解释为匿名公开安装已经通过。

本文也是 setup 条目安装后的 `.forai/upstream/SETUP.md`。它只是一份说明，不会自动执行其中命令。消费项目不安装 ForAI 自有 npm 运行包。

## 1. 环境与工作目录

| 项目 | 本文基线 |
| --- | --- |
| Node.js | Node.js 22 或更高；遵循源仓库 package.json 的 engines |
| pnpm | 12.9.1 |
| create-next-app / Next.js | 16.4.2，仅用于可复现验证 |
| React / React DOM | 19.3.0，由消费项目提供 |
| Tailwind CSS / PostCSS 插件 | 4.3.3 |
| TypeScript | 5.9.3 |
| shadcn CLI | 4.22.1，作为消费项目的精确开发依赖安装 |

先安装符合要求的 [Node.js](https://nodejs.org/en/download)。如果尚未安装 pnpm，可使用 Node 自带的 npm 安装全局包管理器；项目依赖随后全部使用 pnpm。

```powershell
npm install --global pnpm@12.9.1
node --version
pnpm --version
```

已有 pnpm 12.9.1 时跳过全局安装。首次下载第三方依赖需要联网访问 npm Registry，CLI 解析主题信息时也可能访问 shadcn 官方源。本机 ForAI Registry 无需 GitHub 登录。

后续使用两个终端：

| 终端 | 工作目录 | 职责 |
| --- | --- | --- |
| A | 本地 ForAI 仓库根目录，能看到 registry/items/pilot.json | 生成载荷并保持本机 Registry 运行 |
| B | 起初是新消费项目的父目录，创建后切换到 forai-p1-consumer | 配置、预览、安装和验证 |

本文完整文件示例用于新建的空白消费项目。已有业务项目先保留自己的文件，检查实际别名、依赖与同名文件，再逐项合并；不要直接用示例覆盖原有配置。

Next.js 16.4.2 是本文的可复现验证基线，不是组件安装的强制框架版本。已有宿主维护自己的 Next 声明、实际解析版本和配置，组件接入不得自动升级或降级框架。其他 Next 版本与其他宿主需各自验证，原生 React 图片实现也不等于通用 React 消费已验收。

已有项目还应保留 React、Tailwind 和编译插件的现有版本，以及 next.config.*、postcss.config.*、tailwind.config.*、Webpack/Turbopack 的规则和 CSS loader。安装前后核对这些声明、解析版本及配置内容摘要。本文的新建项目版本固定和完整配置示例不用于覆盖已有宿主；遇到依赖或编译不兼容时停止并报告，不通过改版或切换编译链绕过。

## 2. 生成并启动本机 Registry

在终端 A 的 ForAI 根目录运行：

```powershell
pnpm install --frozen-lockfile
pnpm registry:dev
```

开发服务自动生成并监听已登记源码及清单。默认仅绑定 127.0.0.1:4173；编译成功后刷新完整快照，失败保留上次成功结果。仅提供固定快照使用 `pnpm registry:serve`，两者均支持 `--port 4273`。保持终端 A 运行，Ctrl+C 停止。当前为 local-draft，登记数量以服务日志为准。

终端 B 可查看 `http://127.0.0.1:4173/r/0.1.0/registry.json` 和 `manifest.json`。源码变化不会自动覆盖业务项目已经安装的文件。新组件必须显式登记到 registry/items 后才可分发。

`registry/prepared/` 与 `registry/generated/` 都由生成器维护，不手工修改。仅生成而不启动服务可运行 `pnpm registry:build` 与 `pnpm registry:check`。

修改 Registry 生成器、校验器或服务脚本后，需要重启服务加载新实现；开发模式会自动重建已登记组件和规范的内容变化。修改 registry/release.json 的版本号后，应重启服务并同步消费项目命名空间 URL，旧版本路径不会自动转到新版本。

## 3. 创建空白消费项目

在终端 B 切换到准备存放消费项目的父目录。目标目录必须尚不存在：

```powershell
if (Test-Path ./forai-p1-consumer) { throw "目标目录已存在，请选择新的空目录名称" }
pnpm dlx create-next-app@16.4.2 forai-p1-consumer --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm --skip-install --disable-git --no-react-compiler --no-cache-components --no-agents-md --no-agent-feedback --yes
Set-Location forai-p1-consumer
pnpm add --save-dev --save-exact shadcn@4.22.1 tailwindcss@4.3.3 @tailwindcss/postcss@4.3.3 typescript@5.9.3 @types/node@20.19.43 @types/react@19.3.0 @types/react-dom@19.3.0
pnpm exec shadcn --version
pnpm list next react react-dom tailwindcss --depth 0
```

初始化命令明确关闭 Agent 文件生成、Git 初始化、React Compiler 和 Cache Components，先创建模板再安装依赖。shadcn 版本应为 4.22.1，Next、React 与 Tailwind 应符合本节基线。保存生成的 pnpm-lock.yaml，后续复现使用 pnpm install --frozen-lockfile。

已有项目不要执行以上新建及版本固定命令。本机接入仅验证表中的 Next.js 技术栈组合；React、Tailwind 或已有 Base UI 等依赖不一致时先评估兼容性，不能把安装命令当成自动兼容检测或自动迁移工具。

## 4. 配置消费端 Registry 与别名

在新消费项目根目录新建 components.json：

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-nova",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "registries": {
    "@forai": "http://127.0.0.1:4173/r/0.1.0/{name}.json"
  }
}
```

create-next-app 已在 tsconfig.json 配置 @/* 指向 ./src/*。components.json 的别名必须能由 TypeScript 解析。@forai 只用于 CLI 查找安装项，业务代码使用本地导入。

此配置直接用于 ForAI 安装，不需要再运行会生成 cn 和主题变量的 shadcn init。若已有 components.json，只合并 registries.@forai，保留原有配置并先核对实际目标。P1 的 utils 目标为 aliases.lib 下的 utils.ts，aliases.utils 必须对应 aliases.lib + /utils。

自定义别名的已验证例子是 ui=~/widgets/core、lib=~/shared、utils=~/shared/utils，并由 tsconfig 的 ~/* 映射到 ./src/*。安装会落到 src/widgets/core/ 与 src/shared/。不要为适配 ForAI 擅自改写已有全局别名；其他 utils 布局尚无自动安装计划支持。

## 5. 预览、核对与安装

在消费项目根目录先执行预览：

```powershell
$previewBefore = Get-FileHash package.json,pnpm-lock.yaml -Algorithm SHA256
pnpm exec shadcn add @forai/setup @forai/button @forai/input @forai/dialog --dry-run
$previewAfter = Get-FileHash package.json,pnpm-lock.yaml -Algorithm SHA256
Compare-Object $previewBefore $previewAfter -Property Path,Hash
```

最后一条应没有输出。dry-run 用于查看变化，不应写入组件、CSS 或项目依赖。还应查看目标目录，确认预览没有创建这些文件。

先核对完整依赖闭包与目标列表，再执行安装。同版且内容相同的目标复用。有一处未解决文件或依赖冲突就停止整批，按第 11 节处理并重新预检；不要用强制覆盖继续。

| 目标 | 拥有者 |
| --- | --- |
| src/components/ui/button.tsx、input.tsx、dialog.tsx | 对应 ForAI UI 条目 |
| src/lib/utils.ts | utils |
| src/lib/forai-recipes/button-variants.ts | button-variants |
| styles/forai/base.css、density.css、motion.css、tailwind.css | theme |
| .forai/upstream/SETUP.md | setup |
| .forai/upstream/THIRD_PARTY_NOTICES.md | notices |

主题与公共依赖会通过同一 @forai 源解析，共享文件只有一个拥有者。P1 的第三方依赖是 @base-ui/react 1.6.0、class-variance-authority 0.7.1、clsx 2.1.1、tailwind-merge 3.6.0、lucide-react 0.546.0，按条目实际需要安装。React 与 React DOM 由宿主提供。

确认新项目没有上述同名文件后安装：

```powershell
pnpm exec shadcn add @forai/setup @forai/button @forai/input @forai/dialog --yes
pnpm list @base-ui/react class-variance-authority clsx tailwind-merge lucide-react react react-dom --depth 0
```

安装后读取实际文件，确认 Dialog 导入本地 Button，Button 导入本地 utils 与配方，依赖版本符合预览。官方 CLI 负责文件转换和依赖安装；P1 没有额外的安全更新安装器，也不保证失败时原子回滚。中断后先读回文件与锁文件，再判断如何恢复。

Windows 上优先使用本文的 @forai 地址。CLI 4.22.1 会把某些带盘符的绝对 JSON 路径当作 URL；必须使用本地 JSON 文件时，传相对于消费项目的路径。

## 6. 接入 Tailwind、主题与项目覆盖

以下为新消费项目的完整文件内容。已有项目只合并必要部分，先清点原有颜色变量、@theme 映射、导入顺序和字体设置。相同变量的未分层旧声明会覆盖 ForAI 默认值，需要按项目意图整理，不能只追加导入就认为接入完成。

Tailwind CSS 4 沿用宿主已工作的编译链，不要求复制 ForAI 源站配置。已有项目只合并必要的全局样式导入和 CSS 内容扫描，保持编译配置不变。核对所有安装后的组件与配方源码已被扫描，使用 source(none) 或限定目录时，只在 CSS 追加实际目录的 @source。目标不是 Tailwind 4 或当前链无法编译必要样式时，停止并说明不兼容。下面的 PostCSS 和 Next 完整配置仅供新建、尚未配置编译链的示例使用，不是已有项目的迁移步骤。新建 Next 示例使用标准 PostCSS 接法，将 postcss.config.mjs 设为：

```js
export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
```

不要同时用 `@tailwindcss/turbopack` CSS loader 和 PostCSS 处理同一份 Tailwind CSS。ForAI 源站也采用 PostCSS，旧 loader 配置属于历史实现。

新示例的 next.config.ts 只保留必要的框架配置。下面的 root 为放在其他仓库内部的隔离 fixture 明确应用边界，不是 ForAI 组件要求业务项目复制的配置：

```ts
import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
};

export default config;
```

将新项目 src/app/globals.css 设为：

```css
@layer theme, base, brand, components, utilities;
@import "tailwindcss" source("../");
@import "../../styles/forai/tailwind.css";
@import "../../styles/forai/base.css";
@import "../../styles/forai/density.css";
@import "../../styles/forai/motion.css";
@import "../../styles/forai-overrides.css";
```

这些相对路径只适用于 src/app/globals.css。其他入口先计算真实路径。source("../") 扫描消费项目的 src/，包括本地 UI 和纯配方；自定义组件放到扫描范围外时，需要补充真实 @source，再检查生产构建。

新建 styles/forai-overrides.css。它由消费项目拥有，不属于 Registry 清单，也不会由 theme 条目创建或覆盖：

```css
:root {
  --primary: #1d4ed8;
  --primary-foreground: #ffffff;
  --ring: #2563eb;
  --radius: 0.75rem;
  --forai-font-sans: ui-sans-serif, system-ui, sans-serif;
  --forai-font-mono: ui-monospace, monospace;
}

:root[data-theme="dark"] {
  --primary: #93c5fd;
  --primary-foreground: #172554;
  --ring: #60a5fa;
}
```

默认颜色与密度处于 theme layer，项目覆盖使用未分层的普通声明。品牌色要同时提供背景、前景和明暗取值，不把颜色散落到每个控件。新业务状态色的完整扩展检查尚未交付。

将新项目 src/app/layout.tsx 设为：

```tsx
import type { ReactNode } from "react";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN" data-design-theme="base" data-theme="light" data-layout-density="default" data-motion="full">
      <body>{children}</body>
    </html>
  );
}
```

主题、密度和动态效果属性设在 html，body 下的 Dialog Portal 才能继承同一组根变量。局部容器主题和 Portal 隔离不在 P1 支持范围内。若要跟随系统，宿主需按系统偏好写入 light 或 dark；移除 data-theme 只会让 color-scheme 和 light-dark 颜色跟随系统，不会自动激活依赖 data-theme 的 dark 工具类。

| 根属性 | 可用值 | 本例初始值 |
| --- | --- | --- |
| data-theme | light、dark；本例显式设置 | light |
| data-layout-density | compact、default、comfortable | default |
| data-motion | full、reduced | full |

本文使用系统字体。已有宿主可保留自己的字体加载器，提供 --forai-font-sans / --forai-font-mono；也兼容宿主的 --font-geist-sans / --font-geist-mono。保留 Geist 时，可移除覆盖示例的两条 --forai-font-* 声明，或让它们引用已加载的宿主字体变量。ForAI 主题本身不下载字体，不自动读取或持久化显示偏好。

## 7. 添加最小消费示例

在 src/app/forai-demo.tsx 新建交互示例。它仅用于接入自检，计数、名称和根属性由当前页面管理，不代表已交付业务组合或偏好存储：

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from "@/components/ui/dialog";

export function ForAIDemo() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <section id="forai-demo" className="flex min-w-0 flex-col gap-4">
      <h2 className="text-lg font-medium">P1 接入自检</h2>
      <div className="flex flex-wrap items-center gap-2">
        {(["light", "dark"] as const).map((theme) => (
          <Button key={theme} variant="outline" onClick={() => { document.documentElement.dataset.theme = theme; }}>
            主题 {theme}
          </Button>
        ))}
        {(["compact", "default", "comfortable"] as const).map((density) => (
          <Button key={density} variant="outline" onClick={() => { document.documentElement.dataset.layoutDensity = density; }}>
            密度 {density}
          </Button>
        ))}
        <Button variant="outline" onClick={() => { document.documentElement.dataset.motion = "reduced"; }}>减少动态效果</Button>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button onClick={() => setCount((value) => value + 1)}>计数 {count}</Button>
        <Button disabled onClick={() => setCount((value) => value + 100)}>禁用操作</Button>
        <Button size="sm">小号按钮</Button>
      </div>
      <label htmlFor="project-name">项目名称</label>
      <Input id="project-name" value={name} onChange={(event) => setName(event.target.value)} />
      <output aria-live="polite">当前名称：{name || "未填写"}</output>
      <label htmlFor="invalid-name">错误状态</label>
      <Input id="invalid-name" aria-invalid="true" aria-describedby="name-error" defaultValue="无效名称" />
      <p id="name-error" className="text-sm text-destructive">请修改名称</p>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>打开对话框</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>本地安装的 Dialog</DialogTitle>
            <DialogDescription>检查根主题、键盘和焦点返回。</DialogDescription>
          </DialogHeader>
          <label htmlFor="dialog-name">对话框名称</label>
          <Input id="dialog-name" />
          <DialogFooter><DialogClose render={<Button />}>关闭并返回</DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
```

将 src/app/page.tsx 设为以下服务端页面。它直接调用独立纯配方，业务交互保留在客户端示例内：

```tsx
import { buttonVariants } from "@/lib/forai-recipes/button-variants";
import { ForAIDemo } from "./forai-demo";

export default function Page() {
  const recipe = buttonVariants({ variant: "outline", size: "sm" });
  return (
    <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">ForAI P1 消费项目</h1>
      <a className={recipe} href="#forai-demo">服务端样式配方</a>
      <ForAIDemo />
    </main>
  );
}
```

自定义别名项目应按实际安装路径修改这些导入。不要把 @forai/button 当成 JavaScript 包导入，也不要导入 ForAI 源仓库、reference/ 或文档站内部模块。Button 没有示例中未出现的 isLoading API；异步业务反馈由调用方负责。

## 8. 构建与浏览器验收

在消费项目根目录执行：

```powershell
pnpm lint
pnpm build
pnpm exec tsc --noEmit
pnpm start --hostname 127.0.0.1 --port 4180
```

lint、构建及独立类型检查都应退出 0。先构建再执行 tsc，确保 Next 的路由类型已生成。浏览器打开 http://127.0.0.1:4180，按下表验收；不能只以文件已下载判断通过。

| 步骤 | 应看到的结果 |
| --- | --- |
| 点击计数，再对计数按钮按 Enter、空格 | 从 0 到 3；禁用按钮不执行，Tab 跳过它 |
| 输入名称，观察错误输入框 | 名称实时更新；错误框有 aria-invalid 与关联说明 |
| 用 Tab 移动焦点 | 有可见焦点环，可访问名称完整 |
| 打开 Dialog，正反向 Tab，再按 Escape | 焦点留在浮层内，关闭后回到打开按钮；关闭按钮也可用 |
| 明暗主题分别切换三档密度 | 控件与 Portal 同时更新，品牌色和圆角保留 |
| Compact / Comfortable 切回 Default | 小号按钮恢复 28px，高度不漂移；字体为 12.8px / 22.4px |
| 切换减少动态效果 | data-motion=reduced，控件与 Portal 的过渡被关闭 |
| 360px 窄屏，输入长连续文本并打开 Dialog | 页面不横向溢出，浮层保持可操作 |
| 查看服务端配方链接与浏览器控制台 | 服务端配方已产生样式，没有水合或运行错误 |

本例 Default 密度主要按钮背景应为浅色 rgb(29, 78, 216)、深色 rgb(147, 197, 253)，根 --radius 为 0.75rem。小号按钮在 Compact / Default / Comfortable 的高度分别为 24.5 / 28 / 35px，字号分别为 11.2 / 12.8 / 14.4px。切换有过渡时等待实际绘制稳定后读 computed style。

安装和构建完成后，在终端 A 按 Ctrl+C 停止 Registry，再刷新消费项目。现有组件应继续运行；新安装或更新将因源不可达而停止，不能自动换到其他组件源。终端 B 按 Ctrl+C 停止生产服务。

## 9. 同版补装、冲突与故障处理

如果首次未选择 Input，可先 dry-run，再按前面的文件冲突检查安装 @forai/input。完整执行本文后，Input 已存在，再预览应显示无变化或 skip。

补装前后用 Get-FileHash 比较 styles/forai-overrides.css，确认项目主题文件内容没有变化；同时检查浏览器中的品牌色和圆角。P1 验证脚本已覆盖真实补装保留主题，但尚未提供升级合并工具。

已有本地修改时只做针对文件的差异预览，例如：

```powershell
pnpm exec shadcn add @forai/dialog --diff src/components/ui/button.tsx
```

这仍是预览，不应改写文件。无路径参数的 --diff 可能只展示前 5 个文件，不能把它当成已看过全部冲突。审阅并合并之前，不执行覆盖安装；P1 没有自动三方合并、消费端基线登记或回滚命令。

| 现象 | 检查与处理 |
| --- | --- |
| localhost 连接失败 | 检查终端 A 是否运行，URL 端口和 /r/0.1.0/ 路径是否一致；用 Invoke-RestMethod 直接读取 setup.json |
| EADDRINUSE | 选择其他空闲端口，使用 --port 指定端口，同时修改 components.json 和验证 URL；不关闭来源不明的进程 |
| 找不到 @forai 条目 | 检查 components.json 是否在消费项目根、命名空间模板是否保留 {name}.json、源是否已生成 |
| 模块找不到或导入仍含 @/registry | 核对 tsconfig、components.json、实际文件和 CLI 4.22.1；不要改成源仓库绝对路径规避 |
| 控件无样式或项目颜色被覆盖 | 核对六条 CSS 导入、Tailwind 扫描、未分层旧变量、重复 @theme 及项目覆盖位置 |
| Portal 没有跟随主题 | 将根属性和语义变量设在 html/:root；局部容器主题不在 P1 支持范围 |
| 字体下载失败 | 检查宿主字体加载器；本文系统字体示例不依赖字体下载，ForAI 主题也不负责下载 |
| 依赖版本变化或安装中断 | 读回 package.json、pnpm-lock.yaml 和实际文件，保存差异后再恢复；不宣称原子成功或自动回滚 |

维护 ForAI 源时，可在终端 A 的仓库根目录运行 pnpm registry:test、pnpm registry:check 和 pnpm registry:verify。最后一条会创建自己的临时源和默认、自定义别名的两套隔离消费项目；它不依赖本文的 4173 服务，也不代替真实项目的浏览器验收。不要在消费项目中运行这些仓库维护脚本。

## 10. 当前支持范围

| 能力 | 当前状态 |
| --- | --- |
| Button、Input、Dialog、theme、utils、button-variants、setup、notices | 已交付，可按本文本机安装 |
| 默认与上述自定义 UI/lib 别名 | 已真实安装、类型检查和构建验证 |
| 明暗主题、三档密度、宿主字体变量、减少动态效果、根主题 Portal | 试点已有浏览器证据；其他组件族未据此关闭验收 |
| 全部 23 个共享 UI、142 个 AI 元件模块、Generative UI 与独立 Dashboard | 已登记，按第 11、12 节及本机接入指南安装 |
| Vite 消费 | 第 14 节精确隔离基线已通过安装、类型、构建和浏览器验收；不包含真实业务项目 |
| 其他 Next 版本、其他 React 宿主 | 本次仍未验证；16.4.2 只是可复现基线 |
| ConfirmAction、ActionButton、业务扩展登记 | 尚未交付，待 P2 |
| rules 普通规范资料 | 已交付：7 份现有规范参考与消费范围说明，setup 自动带入，不激活 Skill |
| tooling、ai-guidance、完整消费 catalog | 尚未交付；当前没有自动 Skill 激活、安全更新工具或安装锁 |
| scripts/forai 下的 init、install、check、sync-ai | 尚未实现，不要执行规格中的拟议命令 |
| registry-lock、实际源 commit 解析、消费端基线、三方升级与回滚 | 尚未交付；manifest 摘要只用于本地内容核对 |
| Agent/Skill 生成、模型审阅后的激活与新会话探针 | 尚未交付；安装 setup 不创建或激活 Agent/Skill |
| 公开 GitHub / HTTPS 源、发布 tag、匿名公开安装、项目发布许可 | 尚未落实，待 P4 与另行发布授权 |
| 其他框架、无 Tailwind 消费、局部主题与 Portal 隔离 | 不在当前验证范围 |

首次安装、补装和核心文件本地修改都不应被理解为更新机制已经完成。需要保留项目覆盖、源快照、文件与依赖差异；摘要不能替代来源信任或真实 commit。

## 11. 指定主题、完整组件与页面补丁

主题登记来自 `src/lib/design-themes.ts`。`theme` 和旧安装地址仍采用 base。共享组件无主题前缀，每个源码文件只由一个条目拥有，补装朝夕不会再复制一份共享实现。

| 需要 | 安装预览 |
| --- | --- |
| 只安装 Button 和 base | `pnpm exec shadcn add @forai/button @forai/theme-base --dry-run` |
| 只安装 Button 和朝夕 | `pnpm exec shadcn add @forai/button @forai/theme-zhaosie --dry-run` |
| base 整套共享组件 | `pnpm exec shadcn add @forai/all-base --dry-run` |
| 朝夕整套共享与业务组件 | `pnpm exec shadcn add @forai/all-zhaosie --dry-run` |
| 未指定主题的整套入口 | `pnpm exec shadcn add @forai/all --dry-run`，等同依赖 `all-base` |
| 可直接使用的内存录音组合 | `pnpm exec shadcn add @forai/zhaosie-record --dry-run`，自动带入朝夕主题及所需共享组件 |

全部共享条目为 `alert-dialog`、`badge`、`button`、`checkbox`、`combobox`、`dialog`、`drawer`、`file-input`、`hover-card`、`input-group`、`input`、`label`、`pagination`、`popover`、`switch`、`tabs`、`toggle-group`。

业务条目为 `zhaosie-record-button`、`zhaosie-record-mode`、`zhaosie-waveform`、`zhaosie-record-card`、`zhaosie-record-panel`、`zhaosie-navigation`、`zhaosie-toast`、`zhaosie-discard-dialog`、`zhaosie-recorder`、`zhaosie-record`。支持模块按真实依赖自动带入。React 由宿主提供，依赖保持当前精确版本。

### 完整预检、已解决差异与正式安装

以下流程由安装执行者负责。官方 CLI 不会自动实施整批冲突拦截，也不保证多文件写入原子性。

1. 先保留宿主文件与锁状态。记录本次选择的所有入口、Registry 源地址、载荷版本及 SHA256、实际别名和第三方依赖计划。读取每个入口的完整 JSON，递归读取其 `registryDependencies`，核对每个依赖来自同源同版。逐一收集所有 `files.target`，按 `components.json` 的实际别名解析最终目标。`manifest.json` 只辅助核对源码摘要，不能替代真实载荷或宿主路径核对。
2. 对全部目标比较宿主文件和待安装内容，核对依赖版本。原先没有的目标记录为新增；同版且相同的共享文件复用。有差异的每个目标使用带路径的 `--diff` 读完整差异，例如 `pnpm exec shadcn add @forai/all-zhaosie --diff src/components/ui/button.tsx`。不要把只显示前几项的预览摘要当作完整检查。
3. 一处未解决文件、目标或依赖冲突就停止本批全部安装，不先执行无冲突入口。审阅后可以保留本地版本，或先手动合并；保留差异也需要核对它与这次组件和依赖是否兼容。
4. 每处解决决定写入本次安装记录，至少包括目标路径、确认后本地 SHA256、源地址与载荷版本或摘要、完整入口与依赖计划摘要、实际别名、保留或合并决定、兼容性核对。可用 `Get-FileHash -Algorithm SHA256 -LiteralPath <实际文件>` 计算文件摘要。记录不归 Registry 管理。
5. 正式执行前重新检查整个闭包与上述摘要。文件、别名、源载荷或依赖计划有变化时，原确认失效，重新预检。通过后才执行相同入口去掉 `--dry-run` 的交互式命令，不使用强制覆盖。对记录中已确认保留的目标，在 CLI 覆盖询问中选择 No，保留已审阅的本地文件；这个询问只执行已确认决定，不能现场批准新差异。
6. 安装后读回全部新增和既有目标，尤其比对已确认保留目标的 SHA256，核对项目覆盖、锁文件、类型和构建。出现未检查差异、无法跳过覆盖、读回不符或部分写入失败时，停止继续安装并记录实际完成项。先检查当前文件与锁状态，再决定恢复方式，不盲目重跑命令。

消费验证脚本在自己的隔离 fixture 演练这套流程：先发现修改后的 Button 而停止整批，再记录仅增加注释的兼容差异，检验确认失效，交互选择不覆盖，最后读回摘要。它不是给真实宿主新增的安装器，真实项目仍由使用者或执行 Agent 完整预检。

### 手动接入朝夕与两个主题共存

安装后，在第 6 节的 CSS 中按下面顺序手动合并。业务结构样式沿用源码的未分层规则，不额外包进 `components` 层，否则较后的 Tailwind utilities 会遮住录音按钮等业务尺寸。

```css
@layer theme, base, brand, components, utilities;
@import "tailwindcss" source("../");
@import "../../styles/forai/tailwind.css";
@import "../../styles/forai/base.css";
@import "../../styles/forai/density.css";
@import "../../styles/forai/motion.css";
@import "../../styles/forai/themes/zhaosie.css";
@import "../../styles/forai/themes/zhaosie-components.css";
/* 如已有本页导出的补丁，在这里导入实际文件。 */
@import "../../styles/forai-overrides.css";
```

在宿主 `html` 设置 `data-design-theme="zhaosie"` 激活朝夕。同项目可保留两个主题，切到 `base` 时只改根属性，不卸载 CSS、不重新安装共享组件。品牌缺失值继续继承 base；明暗用 `data-theme`，密度用 `data-layout-density`。录音波形按 `data-motion` 决定是否减少动态效果，未设置时跟随系统。安装和补装均不自动修改这些根属性或宿主布局。

第 6 节的项目覆盖使用未分层 `:root`，会按正常级联盖住对应品牌值。验证品牌时先明确这些覆盖的意图。需要只覆盖 base 的值可由宿主改成 `:root[data-design-theme="base"]`；不要让安装命令替你修改覆盖文件。`--record-panel-max-width` 是朝夕可覆盖的业务 Token，默认 `calc(var(--spacing) * 160)`。字体变量仍由宿主提供。

### 当前页面补丁

在 ForAI 的 `/base/...` 或 `/zhaosie/...` 页面编辑颜色、密度和 Button，下载固定得到 `base-overrides.css` 或 `zhaosie-overrides.css`。编辑器没有目标主题选择器；有效未保存草稿也会导出，单项重置和清空后不恢复旧保存项。

把实际下载文件放入消费项目，在完整主题和组件样式之后、项目自有覆盖之前导入。补丁只含有效差异，保留原 Token 名、选择器、条件、具名层和声明自身的重要性；原先未分层的声明仍未分层，不加入预览用的 `!important`。补丁作用于当前设计主题，另一主题不生效，也不会保证压过宿主更高优先级覆盖。

同一旧 Token ID 出现多次时，继续选最后扫描的代表声明，而不是浏览器级联胜出者。行内声明、匿名层、隐式 `@scope` 及失效或受阻来源无法作为同一位置的独立 CSS 还原，会提示原因并阻止整个下载，草稿保留。通用嵌入模式与原 `runtime-css-tokens.css` 导出继续兼容，已有快照不迁移、不清除。

### 临时录音与可选保存

默认别名下的零配置使用：

```tsx
"use client";
import { TemporaryRecorder } from "@/components/zhaosie/temporary-recorder";

export function Recorder() {
  return <TemporaryRecorder />;
}
```

Hook 位于 `@/hooks/use-temporary-recorder`，引擎与内存容器位于 `@/lib/zhaosie/`。自定义别名以安装结果为准。挂载不会请求麦克风或保存，录音由明确的按住或点击操作开始；默认保存仅确认当前内存内容。

需要宿主存储时，由客户端包装组件传入 `onSave: RecordingSaveHandler`。接口接收只读 `RecordingSaveRequest`（`recordId`、`saveId`、有序 `clips`），每个片段含 `id`、原始 `audio: Blob`、`mimeType` 和 `bytes`，第二个参数提供 `signal: AbortSignal`。Hook 返回 `saveState`（idle、saving、saved、error），`save()` 返回 Promise。进行中禁用新录音和重复保存，但允许重置。

失败后片段与试听保留，不自动重试。先核对宿主结果，再显式重试；未变化的重试保留同一 `saveId`，宿主按请求和片段身份去重。重置、离开或卸载会使旧会话失效、中止待处理请求、释放音轨和预览地址，迟到结果不回填。中止不撤销宿主已经完成的写入，也不会删除宿主已保存数据。Blob 快照没有临时 URL，宿主可以继续持有 Blob。

本次没有 IndexedDB、后端、历史记录或上传驱动。宿主负责存储、鉴权、超时和结果核对，不能在浏览器传入服务端密钥。公开发布、Vite 验收、规则工具与 AI 资料仍由各自范围管理。

## 官方参考

CLI 的 add、dry-run、diff 和 view 参数可查阅 [shadcn CLI 文档](https://ui.shadcn.com/docs/cli)。components.json 的命名空间模板见 [Registry Namespaces](https://ui.shadcn.com/docs/registry/namespace)。本文以本地锁定的 4.22.1 实测行为为准，不用官网 latest 示例替换本机版本。

## 12. AI、Dashboard 与开发期间的更新

完整接入朝夕、全部已登记组件和规范，只需预览 `pnpm exec shadcn add @forai/all-components --dry-run`，核对完整文件与第三方依赖后移除 --dry-run 安装。该入口已带入 setup、朝夕主题和 rules，不需重复列出。`all-ai` 仅安装 AI 元件及其依赖；`dashboard` 安装独立静态 Dashboard 组合；`all-base` / `all` 保持基础组件语义。单个 AI 示例为 `ai-agent-plan`、`ai-chart`、`ai-thread-aui`，Generative UI 入口为 `ai-generative-generative-renderer`。

默认业务导入：`@/components/dashboard/dashboard` 的 Dashboard、`@/components/ai-elements/elements/agent-plan` 的 AgentPlan。Dashboard 的 page 可替换示例数据。`.aui.tsx` 组件由宿主提供 AssistantRuntimeProvider 与真实 runtime，模型服务和鉴权不包含在安装内容中。现有模拟操作辅助保留演示语义。文档页面和 Agent 开发播放剧本未分发。

分发 MarkdownText 使用 `@assistant-ui/react-markdown` / `react-markdown`，完整 Registry 依赖闭包不使用 Streamdown，不需要增加其 CSS 扫描。宿主自行采用 Streamdown 时才按真实安装路径配置，pnpm 传递依赖不保证位于根 `node_modules/streamdown`。CSS Module 和第三方类型包随对应条目安装。分发图片组件使用原生 `img`，不依赖 `next/image`；`ImagePreview` 采用原生图片属性，Next 专属 `loader`、`quality`、`priority`、`fill`、`unoptimized` 等 props 已移除。需要 Next 图片优化时由宿主适配，本次不新增适配产品。第 14 节的精确 Vite 隔离基线已验证，真实业务和其他宿主仍需独立验证。

安装前后核对 package.json 的 Next 声明及 `pnpm list next --depth 0` 的解析版本保持不变。registry:verify 会记录其默认/自定义别名 fixture 在完整安装前后的这两项值；它只覆盖 fixture 基线，不证明其他 Next 版本兼容。

根 html 激活朝夕时，沿用宿主已有明暗、密度、减少动态效果和偏好持久化，只映射同一状态到 ForAI 所需根属性。没有朝夕色系设置时使用 red；其余设置缺失时才补默认值，不用 light/default/full 覆盖既有用户选择。CSS 导入与扫描的合并不等于允许改写受保护的编译配置。

registry:dev 成功生成后，其他项目重新请求 registry.json / manifest.json 即可查询新增条目和摘要。可用 HTTP ETag 检查响应内容是否变化。没有主动推送或自动写入消费项目；更新仍需 --dry-run / --diff、审阅合并和类型及构建验证。新增源码文件必须先登记。

## 13. 规范资料的安装与更新

setup 与 all-components 自动带入 rules；已有项目可预览 `pnpm exec shadcn add @forai/rules --dry-run`。资料安装到 .forai/upstream/design/，先读 README.md，再读对应组件或布局规范。7 份来源快照保留原文，并明确源仓库文档站规则的作用域，内部链接指向同包 Markdown；原始源码/reference 路径是 ForAI 的来源说明。

需要同时安装完整组件、可编辑规范、后台页面参考和 AI 接入草案时，使用 `pnpm exec shadcn add @forai/all-components @forai/design-guidelines @forai/ai-guidance --dry-run` 预览。核对差异后移除 `--dry-run` 安装。已有组件时可以单独选择 `@forai/design-guidelines @forai/ai-guidance`，或在规划器选择仅规范模式。

可编辑规范从 `design/forai/index.md` 开始阅读。`design/forai/admin/page-references.md` 说明后台页面和示例交互，同目录 `workspace-source.md` 提供便于离线查阅的 Markdown 源码快照。宿主自行实现业务路由、权限与数据。AI 接入说明和入口候选位于 `.forai/drafts/`。

普通文档不创建 AGENTS.md、SKILL.md 或自动发现入口。按实际已安装组件、别名与宿主约定判断适用规则。规范源码更新后开发服务刷新新快照；消费项目仍需重新查询、比较并主动更新，保留本地补充。没有 AI/Dashboard 专用叶子规范，不据此声称存在额外业务能力。

## 14. 已有 Vite 项目

本节不要求迁移宿主版本或编译配置。完整操作见 ForAI 源仓库的 `docs/guides/vite-registry.md`。源仓库的 `pnpm registry:verify:vite` 已在隔离基线通过真实 CLI 安装、245 个目标核对、宿主保护、类型检查及生产构建；配套浏览器验收也已通过。基线为 pnpm 12.15.0、React/React DOM 19.3.1、Tailwind CSS 及 `@tailwindcss/vite` 4.3.3、Vite 8.3.5、`@vitejs/plugin-react` 6.1.2、shadcn CLI 4.22.1，证据见[隔离 Vite 验收记录](../../docs/reviews/registry-vite/README.md)。结果不代表真实业务项目、固定深色练习页或任意宿主布局已经通过。

在 ForAI 根目录运行只读依赖预检：

```powershell
node scripts/registry/preflight-consumer.mjs "../consumer-project"
```

命令读取当前 `all-components` 完整依赖闭包并对照 manifest 校验载荷摘要，数量以当前预检输出为准。命令不运行 CLI、不解析最终安装路径、不比较目标文件，也不安装。实际解析版本必须与 Registry 精确版本相等且满足宿主声明；不同版本仍阻断，避免降级宿主依赖。当前 `lucide-react@0.546.0` 是 pin，没有发布兼容范围。CLI 4.22.1 会把已有 `lucide-react: ^0.546.0` 固定为 `0.546.0`；实际解析版本相同也必须审阅 `declarationChanges`。Motion 不在分发依赖范围，保留宿主声明和解析版本。预检通过后仍按第 11 节核对 CLI 路径、文件差异和最终安装计划。

当 Vite 项目 `@/*` 指向项目根时，保留该映射。`components.json` 使用 `rsc: false`、`tailwind.css: "src/index.css"`，别名分别为 `components: "@/src/components"`、`ui: "@/src/components/ui"`、`lib: "@/src/lib"`、`utils: "@/src/lib/utils"`、`hooks: "@/src/hooks"`。不要复制 Next 的别名或 `rsc` 设置。

从 `src/index.css` 导入根目录的 `styles/forai/` 时，前缀是 `../styles/`，不是 Next 示例的 `../../styles/`。保留已有 Tailwind 导入、字体与 `@tailwindcss/vite`，按第 11 节顺序合并基础、密度、动态效果、朝夕主题、业务结构和宿主覆盖。必要时补 `@source "./";`、`@source "../styles";`；当前分发不需要 Streamdown 扫描。

已有主题系统只需映射现有状态到根 `html` 的属性。没有偏好系统时，可参考 `integration/fixtures/vite-consumer/src/forai-preferences.ts.template`，在 `main` 的 `createRoot` 之前通过 `matchMedia` 同步明暗、减少动态效果并监听系统变化；三档密度使用 compact/default/comfortable，缺失色系使用 red。不要硬写 light/default/full 覆盖既有偏好。Portal 保持在根主题内，通常置于 `document.body`；中文字体通过 `--forai-font-sans` 映射到宿主已经加载的字体。验收确认中文优先字体栈被保留，没有安装或下载字体。固定深色练习业务页尚未验收，需单独检查，不通过全局根强设 dark 掩盖问题。

`RunActivity` 已用循环替代 `findLast`，此基线使用 ES2022 可通过类型检查，无需为该组件调整宿主 `tsconfig`。隔离 fixture 在纵向 flex 布局为 `InputOTP` 设置 `containerClassName="w-fit"`，使容器保持内容宽度，避免密码管理器兼容机制给透明输入额外增加的 40px 引起横向溢出；保留库的密码管理器策略，不据此声称任意宿主布局都已通过。

浏览器已验证系统明暗与减少动态效果实时变化、朝夕默认 red 与保留 blue、三档密度、根主题 Portal 和 Escape 焦点恢复、CSS Module、Thread、OTP 输入、原生图片成功/失败状态，以及 390px 下两种明暗乘三档密度的六种组合。业务页面仍需按自身状态、布局和资源重新验收。
