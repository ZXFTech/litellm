"use client";

import { ActivityIcon, BadgeDollarSignIcon, ChartNoAxesCombinedIcon, CheckIcon, LayoutDashboardIcon, Settings2Icon, ShoppingBagIcon, TrendingUpIcon, UsersRoundIcon } from "lucide-react";
import { Chart } from "../ai-elements/elements/chart";
import { DataTable, type DataTableColumn } from "../ai-elements/elements/data-table";
import { Sidebar, SidebarProvider, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ai-elements/connected/ui/sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DASHBOARD_REFERENCE_PAGE } from "./data";

export type DashboardPage = Readonly<{
  dateRange: string;
  navigation: readonly string[];
  kpis: readonly Readonly<{ label: string; value: string; change: string }>[];
  revenue: Readonly<{ value: string; delta: string; points: readonly number[] }>;
  activity: readonly Readonly<Record<string, string | number>>[];
}>;

const ACTIVITY_COLUMNS: readonly DataTableColumn[] = [
  { key: "event", label: "活动", priority: "primary" },
  { key: "account", label: "客户" },
  { key: "amount", label: "金额", format: { kind: "currency", currency: "USD" } },
  { key: "status", label: "状态", format: { kind: "badge", tones: { "已完成": "success", "处理中": "warning" } } },
];
const NAVIGATION_ICONS = [LayoutDashboardIcon, ChartNoAxesCombinedIcon, UsersRoundIcon, Settings2Icon];
const KPI_ICONS = [BadgeDollarSignIcon, UsersRoundIcon, ActivityIcon, ShoppingBagIcon];

// Both the reference and finished preview render this same local snapshot.
// The presentation changes, while the four KPIs, chart points and rows stay fixed.
export function DashboardSnapshot({ page, purpose = "reference" }: { page: DashboardPage; purpose?: "reference" | "completed" }) {
  const completed = purpose === "completed";
  return <div data-slot={completed ? "dashboard-final-preview" : "dashboard-reference-preview"} className="@container/reference w-full min-w-0" role="region" aria-label={completed ? "本地 Dashboard 完成页面" : "本地 Dashboard 参考页面"}>
    <div className="flex min-w-0 flex-col @2xl/reference:flex-row">
      <Sidebar collapsible="none" className="h-auto w-full min-w-0 shrink-0 border-b @2xl/reference:w-40 @2xl/reference:border-e @2xl/reference:border-b-0" aria-label="Sidebar · 模拟导航">
        <SidebarHeader><span className="text-sm font-medium">Metric Studio</span><Badge variant={completed ? "outline" : "secondary"} className="w-fit">{completed ? "完成快照" : "模拟参考"}</Badge></SidebarHeader>
        <SidebarContent><SidebarGroup><SidebarGroupLabel>Workspace</SidebarGroupLabel><SidebarMenu className="flex-row flex-wrap @2xl/reference:flex-col">
          {page.navigation.map((label, index) => {
            const Icon = completed ? (NAVIGATION_ICONS[index] ?? LayoutDashboardIcon) : LayoutDashboardIcon;
            return <SidebarMenuItem key={label} className="min-w-0">
              <SidebarMenuButton render={<span />} isActive={index === 0}><Icon aria-hidden /><span>{label}</span></SidebarMenuButton>
            </SidebarMenuItem>;
          })}
        </SidebarMenu></SidebarGroup></SidebarContent>
      </Sidebar>
      <section className="min-w-0 flex-1" aria-label="Dashboard 页面内容">
        <header data-slot={completed ? "dashboard-page-header" : "reference-page-header"} className="flex min-w-0 flex-wrap items-center justify-between gap-2 border-b p-4">
          <div className="min-w-0"><p className="text-xs text-muted-foreground">AI Analytics / Overview</p><h3 className="text-sm font-medium">{completed ? "Analytics Dashboard" : "Dashboard Overview"}</h3></div>
          {completed ? <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge variant="secondary"><CheckIcon aria-hidden data-icon="inline-start" />已完成 · 模拟</Badge>
            <Badge variant="outline">{page.dateRange}</Badge>
          </div> : <Badge variant="outline">{page.dateRange}</Badge>}
        </header>
        <div className="flex min-w-0 flex-col gap-4 p-4">
          <div data-slot={completed ? "dashboard-kpis" : "reference-kpis"} className="grid min-w-0 grid-cols-1 gap-3 @md/reference:grid-cols-2" aria-label="KPI Cards">
            {page.kpis.map((kpi, index) => {
              const Icon = KPI_ICONS[index] ?? ActivityIcon;
              return <Card key={kpi.label} size="sm">
                <CardHeader><CardDescription className={completed ? "flex min-w-0 items-center justify-between gap-2" : undefined}>{kpi.label}{completed && <Icon aria-hidden className="size-4 shrink-0" />}</CardDescription></CardHeader>
                <CardContent><p className="text-2xl font-medium tabular-nums wrap-anywhere">{kpi.value}</p>{completed
                  ? <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2"><Badge variant="outline"><TrendingUpIcon aria-hidden data-icon="inline-start" />{kpi.change}</Badge><span className="text-xs text-muted-foreground">较上期</span></div>
                  : <p className="text-xs text-muted-foreground">{kpi.change} 较上期</p>}</CardContent>
              </Card>;
            })}
          </div>
          <section className="flex min-w-0 flex-col gap-2" aria-label="Revenue Chart">
            <Chart className="max-w-none" label="Revenue Chart" value={page.revenue.value} delta={page.revenue.delta} points={page.revenue.points} visibleCount={page.revenue.points.length} variant={completed ? "line" : "area"} />
            <p className="text-xs text-muted-foreground">{page.dateRange} · 每日收入：{page.revenue.points.map(value => value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })).join(" / ")}。</p>
          </section>
          <section className="flex min-w-0 flex-col gap-2" aria-label="Recent Activity Table">
            {completed ? <div className="flex min-w-0 flex-wrap items-center justify-between gap-2"><CardTitle>Recent Activity Table</CardTitle><Badge variant="secondary">{page.activity.length} 条记录</Badge></div> : <CardTitle>Recent Activity Table</CardTitle>}
            <DataTable columns={ACTIVITY_COLUMNS} rows={page.activity} rowKey="id" caption="最近活动 · 本地模拟数据" locale="en-US" />
          </section>
          <p className="text-xs text-muted-foreground">{completed ? "页面已完成 · 指标、图表和活动记录均为静态模拟数据。导航和日期只读展示。" : "静态参考预览，导航和时间范围仅作展示。"}</p>
        </div>
      </section>
    </div>
  </div>;
}

/** Standalone local starter. Supply your own data through page. */
export function Dashboard({ page = DASHBOARD_REFERENCE_PAGE }: { page?: DashboardPage }) {
  return <SidebarProvider className="min-h-0"><DashboardSnapshot page={page} purpose="completed" /></SidebarProvider>;
}
