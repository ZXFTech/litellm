# 后台工作区源码参考

本页随 `design-guidelines` 导出当前 ForAI 后台示例的路由、页面外壳、页面组件、状态与样式源码，由 Registry 用源码自动生成代码附录。先读[后台页面参考](page-references.md)了解页面结构和状态，再按原文件路径查阅实现。

附录以 Markdown 文档交付。示例使用 ForAI 的 Next.js App Router、主题注册、共有组件、主题 token 与本地模拟订单台账。在宿主中采用参考时，使用宿主现有路由、权限和数据接口，按本地实现选择组件与导入路径。

## 源码附录

### `src/app/[theme]/template/admin/layout.tsx`

~~~tsx
import type { Metadata } from "next";

import { requireDesignTheme } from "@/lib/design-theme-server";

import { AdminOrdersProvider } from "./_components/admin-orders";
import { AdminWorkspaceSettingsProvider } from "./_components/admin-workspace-settings";
import { AdminWorkspace } from "./_components/admin-workspace";

export const metadata: Metadata = {
  title: { default: "ForAI 订单运营", template: "%s · ForAI 订单运营" },
  description: "订单运营工作区的后台布局与正常业务流程示例。",
  robots: { index: false, follow: false },
};

export default async function AdminWorkspaceLayout({ children, params }: LayoutProps<"/[theme]/template/admin">) {
  const theme = await requireDesignTheme(params);
  return (
    <AdminOrdersProvider>
      <AdminWorkspaceSettingsProvider>
        <AdminWorkspace theme={theme.id}>{children}</AdminWorkspace>
      </AdminWorkspaceSettingsProvider>
    </AdminOrdersProvider>
  );
}
~~~

### `src/app/[theme]/template/admin/page.tsx`

~~~tsx
import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminDashboard } from "./_components/admin-dashboard";
import { AdminPage } from "./_components/admin-page";

export const metadata = { title: adminWorkspacePages.dashboard.title, description: "订单运营、交易金额与履约进度。" };

export default async function AdminWorkspacePage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.dashboard.path);
  return <AdminPage mode="wide"><AdminDashboard theme={theme.id} /></AdminPage>;
}
~~~

### `src/app/[theme]/template/admin/orders/page.tsx`

~~~tsx
import type { Metadata } from "next";

import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { OrdersList } from "./orders-list";

export const metadata: Metadata = { title: "订单管理" };

export default async function OrdersPage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.orders.path);
  return <OrdersList theme={theme.id} />;
}
~~~

### `src/app/[theme]/template/admin/orders/orders-list.tsx`

~~~tsx
"use client";

import { ArrowDownIcon, ArrowUpIcon, ArrowUpDownIcon, DownloadIcon, EllipsisIcon, PlusIcon, RotateCwIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef, useState } from "react";

import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { useDemoTask } from "@/components/docs/use-demo-task";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Pagination, PaginationButton, PaginationContent, PaginationEllipsis, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { NUMERIC_CELL_CLASS, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToastManager } from "@/components/ui/toast";
import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";

import {
  adminOrderChannelLabels,
  adminOrderHref,
  adminOrderStatusLabels,
  adminOrderStatusVariants,
  formatOrderCurrency,
  useAdminOrders,
  type AdminOrder,
  type AdminOrderChannel,
  type AdminOrderStatus,
} from "../_components/admin-orders";
import { AdminPage, AdminPageHeading } from "../_components/admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "../_components/admin-scenario";

type OrderFilters = { search: string; status: AdminOrderStatus | ""; channel: AdminOrderChannel | "" };
type OrderSort = { field: "date" | "amount"; descending: boolean };
const initialFilters: OrderFilters = { search: "", status: "", channel: "" };
const pageSize = 8;
const statusOptions = [{ value: "", label: "全部状态" }, ...Object.entries(adminOrderStatusLabels).map(([value, label]) => ({ value: value as AdminOrderStatus, label }))] as const;
const channelOptions = [{ value: "", label: "全部渠道" }, ...Object.entries(adminOrderChannelLabels).map(([value, label]) => ({ value: value as AdminOrderChannel, label }))] as const;

function downloadOrders(records: readonly AdminOrder[]) {
  const columns = ["订单编号", "客户", "渠道", "状态", "下单日期", "金额（元）"];
  const rows = records.map(order => [
    order.id, order.customer, adminOrderChannelLabels[order.channel], adminOrderStatusLabels[order.status],
    order.date, order.amount.toFixed(2),
  ]);
  const content = [columns, ...rows]
    .map(row => row.map(value => {
      const safeText = /^\s*[=+@-]/.test(value) ? `'${value}` : value;
      return `"${safeText.replaceAll('"', '""')}"`;
    }).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob(["\uFEFF", content], { type: "text/csv;charset=utf-8" }));
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = "订单.csv";
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export function OrdersList({ theme }: { theme: DesignTheme }) {
  const { orders, updateOrderStatus } = useAdminOrders();
  const router = useRouter();
  const { add: notify } = useToastManager();
  const id = useId();
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const [draft, setDraft] = useState(initialFilters);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState<OrderSort>({ field: "date", descending: true });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const retryButton = useRef<HTMLButtonElement>(null);
  const retry = useDemoTask();

  const loading = scenario === "loading";
  const readFailed = scenario === "error";
  const availableOrders = scenario === "normal" ? orders : [];
  const search = filters.search.toLowerCase();
  const matches = availableOrders.filter(order => {
    return (!search || `${order.id} ${order.customer} ${order.product}`.toLowerCase().includes(search))
      && (!filters.status || order.status === filters.status)
      && (!filters.channel || order.channel === filters.channel);
  }).sort((a, b) => {
    const difference = sort.field === "amount"
      ? a.amount - b.amount
      : a.date.localeCompare(b.date);
    return (sort.descending ? -difference : difference) || a.id.localeCompare(b.id);
  });
  const pageCount = Math.max(1, Math.ceil(matches.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const first = (currentPage - 1) * pageSize;
  const visibleOrders = matches.slice(first, first + pageSize);
  const selectedOrders = visibleOrders.filter(order => selectedIds.includes(order.id));
  const pendingOrders = selectedOrders.filter(order => order.status === "pending");
  const allVisibleSelected = visibleOrders.length > 0 && selectedOrders.length === visibleOrders.length;
  const visiblePageNumbers = Array.from({ length: pageCount }, (_, index) => index + 1)
    .filter(number => number === 1 || number === pageCount || Math.abs(number - currentPage) <= 1);
  const activeFilters = [
    filters.search ? `关键词：${filters.search}` : "",
    filters.status ? adminOrderStatusLabels[filters.status] : "",
    filters.channel ? adminOrderChannelLabels[filters.channel] : "",
  ].filter(Boolean).join(" · ");
  const exportRecords = selectedOrders.length ? selectedOrders : matches;

  function goToPage(next: number) {
    setPage(next);
    setSelectedIds([]);
  }

  function apply(next: OrderFilters) {
    setFilters({ ...next, search: next.search.trim() });
    goToPage(1);
  }

  function clearFilters() {
    setDraft(initialFilters);
    apply(initialFilters);
  }

  function changeScenario(next: AdminScenario) {
    retry.reset();
    setScenario(next);
    if (next === "empty" || next === "error") setSelectedIds([]);
  }

  function retryOrders() {
    void retry.run("success", undefined, { onSuccessFeedbackEnd: () => {
      if (retryButton.current === document.activeElement) resultsHeading.current?.focus({ preventScroll: true });
      setScenario("normal");
      notify({ type: "success", title: "订单列表已重新加载。" });
    } });
  }

  function changeSort(field: OrderSort["field"]) {
    setSort({ field, descending: sort.field === field ? !sort.descending : true });
    goToPage(1);
  }

  function startProcessing(records: readonly AdminOrder[]) {
    updateOrderStatus(records.map(order => order.id), "processing");
    setSelectedIds([]);
    notify({ type: "success", title: `已将 ${records.length} 笔订单标记为处理中。` });
  }

  function exportOrders() {
    try {
      downloadOrders(exportRecords);
    } catch {
      notify({ type: "error", title: "订单 CSV 下载未能发起", description: "可在订单列表中重新导出。" });
      return;
    }
    notify({ type: "success", title: `已发起 ${exportRecords.length} 笔订单的 CSV 下载。` });
  }

  function sortIcon(field: OrderSort["field"]) {
    if (field !== sort.field) return <ArrowUpDownIcon aria-hidden="true" data-icon="inline-end" />;
    return sort.descending
      ? <ArrowDownIcon aria-hidden="true" data-icon="inline-end" />
      : <ArrowUpIcon aria-hidden="true" data-icon="inline-end" />;
  }

  return (
    <AdminPage mode="standard">
      <AdminPageHeading title="订单管理" description="查询各渠道订单，跟进处理与履约状态。"
        breadcrumbs={[{ title: "经营概览", href: themeHref(theme, adminWorkspacePages.dashboard.path) }, { title: "订单管理" }]}
        actions={<>
          <AdminScenarioSelect value={scenario} onValueChange={changeScenario} />
          <Link href={adminOrderHref(theme, "orderForm")} className={buttonVariants()} onNavigate={scenario === "empty" ? () => changeScenario("normal") : undefined}><PlusIcon aria-hidden="true" data-icon="inline-start" />新建订单</Link>
        </>} />

      <section aria-label="筛选订单" className="grid min-w-0 gap-(--layout-heading-body-gap) rounded-lg border border-border bg-card p-(--layout-stack-gap)">
        <form className="grid min-w-0 gap-(--layout-stack-gap) @min-[48rem]/admin-page:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] @min-[48rem]/admin-page:items-end" onSubmit={(event) => { event.preventDefault(); apply(draft); }}>
          <Field>
            <FieldLabel htmlFor={`${id}-search`}>搜索订单</FieldLabel>
            <Input id={`${id}-search`} type="search" value={draft.search} maxLength={80} placeholder="订单号、客户或商品" onChange={(event) => setDraft({ ...draft, search: event.target.value })} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-status`}>订单状态</FieldLabel>
            <Select items={statusOptions} value={draft.status} onValueChange={next => {
              const option = statusOptions.find(({ value }) => value === next);
              if (option) setDraft(current => ({ ...current, status: option.value }));
            }}>
              <SelectTrigger id={`${id}-status`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {statusOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-channel`}>销售渠道</FieldLabel>
            <Select items={channelOptions} value={draft.channel} onValueChange={next => {
              const option = channelOptions.find(({ value }) => value === next);
              if (option) setDraft(current => ({ ...current, channel: option.value }));
            }}>
              <SelectTrigger id={`${id}-channel`} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {channelOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit"><SearchIcon aria-hidden="true" data-icon="inline-start" />查询</Button>
            <Button variant="outline" onClick={clearFilters}>重置</Button>
          </div>
        </form>
        <p className="wrap-anywhere text-sm text-muted-foreground">{activeFilters ? `已应用：${activeFilters}` : "查询后应用搜索词和筛选条件。"}</p>
      </section>

      <section aria-labelledby={`${id}-results`} className="grid min-w-0 gap-(--layout-heading-body-gap)">
        <div className="grid min-w-0 gap-(--layout-inline-gap) @min-[48rem]/admin-page:flex @min-[48rem]/admin-page:flex-wrap @min-[48rem]/admin-page:items-center @min-[48rem]/admin-page:justify-between">
          <div>
            <h2 ref={resultsHeading} id={`${id}-results`} tabIndex={-1} className="text-base font-semibold">订单列表</h2>
            {loading ? (
              <AdminLoadingStatus>正在加载订单…</AdminLoadingStatus>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {readFailed ? "订单数据恢复后可以批量处理或导出。" : (
                  <>本页已选 {selectedOrders.length} 笔{selectedOrders.length > 0 ? `，其中 ${pendingOrders.length} 笔待处理。` : "。批量处理适用于待处理订单。"}</>
                )}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" disabled={pendingOrders.length === 0} focusableWhenDisabled onClick={() => startProcessing(pendingOrders)}>批量开始处理</Button>
            <Button variant="outline" disabled={exportRecords.length === 0} onClick={exportOrders}>
              <DownloadIcon aria-hidden="true" data-icon="inline-start" />{selectedOrders.length ? "导出所选订单" : "导出查询结果"}
            </Button>
          </div>
        </div>
        <p role="status" className="sr-only">{retry.loading ? "正在重新读取订单。" : ""}</p>

        <div className="min-w-0 rounded-lg border border-border" aria-busy={retry.loading || undefined}>
          <div role="region" aria-label="订单列表横向滚动区域" tabIndex={0}
            className="min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
            <Table aria-label="订单列表" aria-busy={loading || undefined} className="min-w-[45rem]">
              <TableHeader className="bg-muted/35">
                <TableRow>
                  <TableHead scope="col" className="w-10 ps-4">
                    <Checkbox checked={allVisibleSelected} indeterminate={selectedOrders.length > 0 && !allVisibleSelected}
                      disabled={visibleOrders.length === 0} aria-label="选择本页全部订单"
                      onCheckedChange={(checked) => setSelectedIds(checked ? visibleOrders.map(order => order.id) : [])} />
                  </TableHead>
                  <TableHead scope="col">订单编号</TableHead>
                  <TableHead scope="col">客户<span className="sr-only">及商品</span></TableHead>
                  <TableHead scope="col">销售渠道</TableHead>
                  <TableHead scope="col">状态</TableHead>
                  <TableHead scope="col" aria-sort={sort.field === "date" ? sort.descending ? "descending" : "ascending" : undefined}>
                    <Button size="sm" variant="ghost" disabled={availableOrders.length === 0} onClick={() => changeSort("date")}>下单日期{sortIcon("date")}</Button>
                  </TableHead>
                  <TableHead scope="col" className={NUMERIC_CELL_CLASS} aria-sort={sort.field === "amount" ? sort.descending ? "descending" : "ascending" : undefined}>
                    <Button size="sm" variant="ghost" disabled={availableOrders.length === 0} onClick={() => changeSort("amount")}>订单金额{sortIcon("amount")}</Button>
                  </TableHead>
                  <TableHead scope="col" className="w-16 text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index} aria-hidden="true" className="hover:bg-transparent">
                    <TableCell className="ps-4"><Skeleton className="size-4" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="mb-1 h-4 w-20 max-w-full" /><Skeleton className="h-3 w-28 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-14 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="ms-auto h-4 w-16 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="mx-auto size-4" /></TableCell>
                  </TableRow>
                )) : visibleOrders.map(order => (
                  <TableRow key={order.id} data-state={selectedIds.includes(order.id) ? "selected" : undefined}>
                    <TableCell className="ps-4">
                      <Checkbox checked={selectedIds.includes(order.id)} aria-label={`选择订单 ${order.id}`}
                        onCheckedChange={(checked) => setSelectedIds(previous => checked ? [...previous, order.id] : previous.filter(value => value !== order.id))} />
                    </TableCell>
                    <TableHead scope="row">
                      <Link className="inline-block rounded-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        href={adminOrderHref(theme, "orderDetail", order.id)}>{order.id}</Link>
                    </TableHead>
                    <TableCell className="whitespace-normal">
                      <span className="block max-w-48 wrap-anywhere font-medium">{order.customer}</span>
                      <span className="block max-w-48 wrap-anywhere text-xs text-muted-foreground">{order.product}</span>
                    </TableCell>
                    <TableCell>{adminOrderChannelLabels[order.channel]}</TableCell>
                    <TableCell><Badge variant={adminOrderStatusVariants[order.status]}>{adminOrderStatusLabels[order.status]}</Badge></TableCell>
                    <TableCell className="tabular-nums"><time dateTime={order.date}>{order.date}</time></TableCell>
                    <TableCell className={NUMERIC_CELL_CLASS}>{formatOrderCurrency(order.amount)}</TableCell>
                    <TableCell className="text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button size="icon-sm" variant="ghost" aria-label={`订单 ${order.id} 的操作`} />}><EllipsisIcon aria-hidden="true" /></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(adminOrderHref(theme, "orderDetail", order.id))}>查看详情</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => router.push(adminOrderHref(theme, "orderForm", order.id))}>编辑订单</DropdownMenuItem>
                          {order.status === "pending" && <DropdownMenuItem onClick={() => startProcessing([order])}>开始处理</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {!loading && visibleOrders.length === 0 && (
            <EmptyState className="max-w-none gap-3 px-(--layout-stack-gap) py-8 text-center">
              {readFailed ? (
                <>
                  <div role="alert" className="grid gap-1">
                    <h3 className="text-base font-medium text-destructive">订单列表加载失败</h3>
                    <p className="text-sm text-muted-foreground">暂时无法读取订单。重试时会保留已应用的筛选条件。</p>
                  </div>
                  <Button ref={retryButton} variant="outline" {...retry.buttonProps()} onClick={retryOrders}>
                    {retry.buttonStatus() === "idle" ? <RotateCwIcon aria-hidden="true" data-icon="inline-start" /> : <ButtonFeedbackIcon status={retry.buttonStatus()} />}
                    {retry.loading ? "正在加载…" : "重试加载"}
                  </Button>
                </>
              ) : availableOrders.length === 0 ? (
                <>
                  <div role="status" className="grid gap-1">
                    <h3 className="text-base font-medium">暂无订单</h3>
                    <p className="text-sm text-muted-foreground">登记首笔订单后，可以在这里跟进处理与履约状态。</p>
                  </div>
                  <Link href={adminOrderHref(theme, "orderForm")} className={buttonVariants({ variant: "outline" })} onNavigate={() => changeScenario("normal")}>登记首笔订单</Link>
                </>
              ) : (
                <>
                  <div role="status" className="grid gap-1">
                    <h3 className="text-base font-medium">没有匹配的订单</h3>
                    <p className="text-sm text-muted-foreground">可调整关键词或筛选条件，也可以清除条件查看全部订单。</p>
                  </div>
                  <Button variant="outline" onClick={() => { clearFilters(); resultsHeading.current?.focus({ preventScroll: true }); }}>清除筛选条件</Button>
                </>
              )}
            </EmptyState>
          )}
        </div>
        {!loading && !readFailed && (
          <div className="grid min-w-0 gap-2 @min-[48rem]/admin-page:flex @min-[48rem]/admin-page:flex-wrap @min-[48rem]/admin-page:items-center @min-[48rem]/admin-page:justify-between">
            <p role="status" className="text-sm tabular-nums text-muted-foreground">
              共 {matches.length} 笔订单{matches.length > 0 && ` · 第 ${currentPage} / ${pageCount} 页`}
            </p>
            {pageCount > 1 && (
              <Pagination aria-label="订单分页" className="w-auto">
                <PaginationContent>
                  <PaginationItem><PaginationPrevious iconOnly disabled={currentPage === 1} focusableWhenDisabled onClick={() => goToPage(currentPage - 1)} /></PaginationItem>
                  {visiblePageNumbers.map((number, index) => (
                    <PaginationItem className="flex items-center" key={number}>
                      {index > 0 && number - visiblePageNumbers[index - 1] > 1 && <PaginationEllipsis />}
                      <PaginationButton isActive={number === currentPage} aria-label={`第 ${number} 页`} onClick={() => goToPage(number)}>{number}</PaginationButton>
                    </PaginationItem>
                  ))}
                  <PaginationItem><PaginationNext iconOnly disabled={currentPage === pageCount} focusableWhenDisabled onClick={() => goToPage(currentPage + 1)} /></PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </section>
    </AdminPage>
  );
}
~~~

### `src/app/[theme]/template/admin/orders/detail/page.tsx`

~~~tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminPage, AdminPageHeading } from "../../_components/admin-page";
import { OrderDetails } from "./order-details";

export const metadata: Metadata = { title: "订单详情" };

export default async function OrderDetailPage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.orderDetail.path);
  return (
    <AdminPage mode="standard">
      <Suspense fallback={<AdminPageHeading title="订单详情" description="查看订单商品、配送信息和处理记录。" />}>
        <OrderDetails theme={theme.id} />
      </Suspense>
    </AdminPage>
  );
}
~~~

### `src/app/[theme]/template/admin/orders/detail/order-details.tsx`

~~~tsx
"use client";

import { PencilIcon, RotateCwIcon } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NUMERIC_CELL_CLASS, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToastManager } from "@/components/ui/toast";
import { useDemoTask } from "@/hooks/use-demo-task";
import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";

import type { AdminBreadcrumbItem } from "../../_components/admin-breadcrumb";
import {
  adminOrderChannelLabels,
  adminOrderHref,
  adminOrderStatusLabels,
  adminOrderStatusVariants,
  formatOrderCurrency,
  sampleOrderId,
  useAdminOrders,
  type AdminOrder,
} from "../../_components/admin-orders";
import { AdminPageHeading } from "../../_components/admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "../../_components/admin-scenario";

export function OrderDetails({ theme }: { theme: DesignTheme }) {
  const query = useSearchParams();
  const { orders } = useAdminOrders();
  const order = orders.find(({ id }) => id === (query.get("order") ?? sampleOrderId));
  const listHref = themeHref(theme, adminWorkspacePages.orders.path);
  const breadcrumbs = [
    { title: "经营概览", href: themeHref(theme, adminWorkspacePages.dashboard.path) },
    { title: "订单管理", href: listHref },
    { title: "订单详情" },
  ];

  if (!order) return (
    <AdminPageHeading title="订单详情" description="此订单链接已失效。可返回列表选择订单。" breadcrumbs={breadcrumbs}
      actions={<Link className={buttonVariants({ variant: "outline" })} href={listHref}>返回订单列表</Link>} />
  );

  return <OrderDetailsView key={order.id} theme={theme} order={order} breadcrumbs={breadcrumbs} />;
}

function OrderDetailsView({ theme, order, breadcrumbs }: { theme: DesignTheme; order: AdminOrder; breadcrumbs: readonly AdminBreadcrumbItem[] }) {
  const { updateOrderStatus } = useAdminOrders();
  const { add: notify } = useToastManager();
  const [updated, setUpdated] = useState(false);
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const [tab, setTab] = useState<"items" | "history">("items");
  const retry = useDemoTask();
  const retryButton = useRef<HTMLButtonElement>(null);
  const historyTab = useRef<HTMLButtonElement>(null);

  function changeScenario(next: AdminScenario) {
    if (next === scenario) return;
    retry.reset();
    setScenario(next);
    if (next !== "normal") setTab("history");
  }

  function retryHistory() {
    void retry.run("success", undefined, { onSuccessFeedbackEnd: () => {
      if (document.activeElement === retryButton.current) historyTab.current?.focus({ preventScroll: true });
      setScenario("normal");
      notify({ title: "订单处理记录已重新加载。", type: "success" });
    } });
  }

  return (
    <>
      <AdminPageHeading
        title={`订单 ${order.id}`}
        description={`${order.customer} · ${order.product}`}
        breadcrumbs={breadcrumbs}
        badge={<Badge variant={adminOrderStatusVariants[order.status]}>{adminOrderStatusLabels[order.status]}</Badge>}
        actions={<>
          <AdminScenarioSelect value={scenario} onValueChange={changeScenario} />
          {(order.status === "pending" || updated) && (
            <Button variant="outline" disabled={order.status !== "pending"} focusableWhenDisabled onClick={() => {
              updateOrderStatus([order.id], "processing");
              setUpdated(true);
            }}>{order.status === "pending" ? "开始处理" : "处理中"}</Button>
          )}
          <Link className={buttonVariants()} href={adminOrderHref(theme, "orderForm", order.id)}>
            <PencilIcon aria-hidden="true" data-icon="inline-start" />编辑订单
          </Link>
        </>}
      />

      <p role="status" className={updated ? "text-sm text-muted-foreground" : "sr-only"}>
        {updated && "订单已标记为处理中。"}
      </p>

      <Card>
        <CardHeader><h2 className="text-base font-semibold">订单摘要</h2></CardHeader>
        <CardContent>
          <dl className="grid min-w-0 gap-(--layout-stack-gap) @min-[48rem]/admin-page:grid-cols-4">
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">订单金额</dt>
              <dd className="text-xl font-semibold tabular-nums">{formatOrderCurrency(order.amount)}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">下单日期</dt>
              <dd className="font-medium tabular-nums"><time dateTime={order.date}>{order.date}</time></dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">销售渠道</dt>
              <dd className="font-medium">{adminOrderChannelLabels[order.channel]}</dd>
            </div>
            <div className="grid gap-1">
              <dt className="text-sm text-muted-foreground">商品数量</dt>
              <dd className="font-medium tabular-nums">{order.quantity} 件</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid min-w-0 gap-(--layout-section-gap) @min-[48rem]/admin-page:grid-cols-2">
        <Card>
          <CardHeader><h2 className="text-base font-semibold">客户与配送</h2></CardHeader>
          <CardContent>
            <dl className="grid gap-(--layout-field-gap)">
              <div className="grid gap-1"><dt className="text-sm text-muted-foreground">客户名称</dt><dd className="wrap-anywhere font-medium">{order.customer}</dd></div>
              <div className="grid gap-1"><dt className="text-sm text-muted-foreground">联系邮箱</dt><dd className="wrap-anywhere">{order.email}</dd></div>
              <div className="grid gap-1"><dt className="text-sm text-muted-foreground">收货地址</dt><dd className="wrap-anywhere">{order.address}</dd></div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><h2 className="text-base font-semibold">配送备注</h2></CardHeader>
          <CardContent><p className="wrap-anywhere whitespace-pre-line">{order.notes.trim() || "未填写"}</p></CardContent>
        </Card>
      </div>

      <Tabs value={tab} onValueChange={next => {
        if (next === "items" || next === "history") setTab(next);
      }} className="gap-(--layout-stack-gap)">
        <TabsList aria-label="订单详情分区">
          <TabsTrigger value="items">订单项目</TabsTrigger>
          <TabsTrigger ref={historyTab} value="history">处理记录</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="min-w-0 rounded-lg border border-border bg-card">
          <Table aria-label="订单项目" className="table-fixed">
            <TableHeader className="bg-muted/35">
              <TableRow>
                <TableHead scope="col" className="w-2/5 whitespace-normal ps-4">商品</TableHead>
                <TableHead scope="col" className={`${NUMERIC_CELL_CLASS} whitespace-normal`}>数量</TableHead>
                <TableHead scope="col" className={`${NUMERIC_CELL_CLASS} whitespace-normal`}>单价</TableHead>
                <TableHead scope="col" className={`${NUMERIC_CELL_CLASS} whitespace-normal pe-4`}>小计</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableHead scope="row" className="ps-4 wrap-anywhere whitespace-normal">{order.product}</TableHead>
                <TableCell className={`${NUMERIC_CELL_CLASS} whitespace-normal`}>{order.quantity}</TableCell>
                <TableCell className={`${NUMERIC_CELL_CLASS} wrap-anywhere whitespace-normal`}>{formatOrderCurrency(order.unitPrice)}</TableCell>
                <TableCell className={`${NUMERIC_CELL_CLASS} pe-4 wrap-anywhere whitespace-normal`}>{formatOrderCurrency(order.amount)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="history" className="rounded-lg border border-border bg-card p-(--layout-stack-gap)">
          {scenario === "loading" ? (
            <div className="grid gap-(--layout-stack-gap)">
              <AdminLoadingStatus>正在加载订单处理记录…</AdminLoadingStatus>
              <div role="group" aria-label="处理记录内容" aria-busy="true">
                <div aria-hidden="true" className="grid min-w-0 gap-(--layout-inline-gap) border-s border-border ps-(--layout-stack-gap)">
                  {[0, 1].map(row => (
                    <div key={row} className="grid gap-1">
                      <Skeleton className="h-4 w-36 max-w-full" />
                      <Skeleton className="h-3 w-24 max-w-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : scenario === "error" ? (
            <EmptyState className="max-w-none gap-3 py-6 text-center" aria-busy={retry.loading || undefined}>
              <div role="alert" className="grid gap-1">
                <h2 className="text-base font-medium text-destructive">订单处理记录加载失败</h2>
                <p className="text-sm text-muted-foreground">暂时无法读取处理记录。可重试加载当前订单的记录。</p>
              </div>
              <Button ref={retryButton} variant="outline" {...retry.buttonProps()} onClick={retryHistory}>
                {retry.buttonStatus() === "idle" ? <RotateCwIcon aria-hidden="true" data-icon="inline-start" /> : <ButtonFeedbackIcon status={retry.buttonStatus()} />}
                {retry.loading ? "正在重试…" : "重试处理记录"}
              </Button>
            </EmptyState>
          ) : scenario === "empty" || order.activities.length === 0 ? (
            <EmptyState role="status" className="max-w-none gap-1 py-6 text-center">
              <h2 className="text-base font-medium">暂无处理记录</h2>
              <p className="text-sm text-muted-foreground">订单处理产生的记录将显示在这里。</p>
            </EmptyState>
          ) : (
            <ol className="grid gap-(--layout-inline-gap) border-s border-border ps-(--layout-stack-gap)">
              {order.activities.map(({ date, label }, index) => (
                <li key={`${index}-${date}-${label}`} className="relative grid min-w-0 gap-1 before:absolute before:-start-[calc(var(--layout-stack-gap)+3px)] before:top-2 before:size-1.5 before:rounded-full before:bg-primary">
                  <span className="wrap-anywhere font-medium">{label}</span>
                  <time className="text-xs text-muted-foreground tabular-nums" dateTime={date}>{date}</time>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
~~~

### `src/app/[theme]/template/admin/orders/form/page.tsx`

~~~tsx
import type { Metadata } from "next";
import { Suspense } from "react";

import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminPage, AdminPageHeading } from "../../_components/admin-page";
import { OrderForm } from "./order-form";

export const metadata: Metadata = { title: "订单表单" };

export default async function OrderFormPage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.orderForm.path);
  return (
    <AdminPage mode="focused">
      <Suspense fallback={<AdminPageHeading title="订单表单" description="维护客户、商品及配送信息。" />}>
        <OrderForm theme={theme.id} />
      </Suspense>
    </AdminPage>
  );
}
~~~

### `src/app/[theme]/template/admin/orders/form/order-form.tsx`

~~~tsx
"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { FieldLegend, FieldSet } from "@/components/ui/field";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useDemoTask } from "@/hooks/use-demo-task";
import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";

import {
  adminOrderChannelLabels,
  adminOrderHref,
  adminOrderStatusLabels,
  useAdminOrders,
  type AdminOrder,
  type AdminOrderDraft,
} from "../../_components/admin-orders";
import { AdminPageActions, AdminPageHeading } from "../../_components/admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "../../_components/admin-scenario";

type OrderFormValues = Omit<AdminOrderDraft, "quantity" | "unitPrice"> & {
  quantity: string;
  unitPrice: string;
};

const initialValues: OrderFormValues = {
  customer: "",
  email: "",
  product: "",
  quantity: "1",
  unitPrice: "",
  channel: "online",
  status: "pending",
  address: "",
  notes: "",
};

function orderValues(order: AdminOrder): OrderFormValues {
  const { customer, email, product, quantity, unitPrice, channel, status, address, notes } = order;
  return { customer, email, product, quantity: String(quantity), unitPrice: unitPrice.toFixed(2), channel, status, address, notes };
}

function RequiredLabel({ children }: { children: ReactNode }) {
  return <>{children}<span className="text-xs font-normal text-muted-foreground" aria-hidden="true">必填</span></>;
}

function OrderEditor({ theme, order }: { theme: DesignTheme; order?: AdminOrder }) {
  const { createOrder, updateOrder } = useAdminOrders();
  const router = useRouter();
  const formId = useId();
  const submitting = useRef(false);
  const continueEditing = useRef<HTMLButtonElement | null>(null);
  const restoreFormFocus = useRef(false);
  const [navigating, setNavigating] = useState(false);
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const submission = useDemoTask();
  const form = useForm<OrderFormValues>({ defaultValues: order ? orderValues(order) : initialValues, disabled: submission.busy });
  const { formState: { isDirty, isSubmitting, errors }, setFocus } = form;
  const title = order ? "编辑订单" : "新建订单";
  const listHref = themeHref(theme, adminWorkspacePages.orders.path);
  const cancelHref = order ? adminOrderHref(theme, "orderDetail", order.id) : listHref;
  const blockUnload = isDirty && !navigating;
  const submissionFailed = submission.status === "error";
  const submitLabel = order ? "保存订单" : "创建订单";
  const prefillLoading = scenario === "loading";

  useEffect(() => {
    if (!blockUnload) return;
    function warn(event: BeforeUnloadEvent) {
      event.preventDefault();
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [blockUnload]);

  useEffect(() => {
    if (scenario === "empty" || prefillLoading || !restoreFormFocus.current) return;
    restoreFormFocus.current = false;
    setFocus("customer");
  }, [scenario, prefillLoading, setFocus]);

  function changeScenario(next: AdminScenario) {
    if (next === scenario) return;
    submission.reset();
    setScenario(next);
  }

  function saveOrder(values: OrderFormValues) {
    if (submitting.current) return;
    submitting.current = true;
    setNavigating(true);
    const draft = {
      ...values,
      customer: values.customer.trim(),
      email: values.email.trim(),
      product: values.product.trim(),
      address: values.address.trim(),
      notes: values.notes.trim(),
      quantity: Number(values.quantity),
      unitPrice: Number(values.unitPrice),
    };
    const record = order ?? createOrder(draft);
    if (order) updateOrder(order.id, draft);
    form.reset(values);
    toast.add({ title: order ? "订单已保存" : "订单已创建", description: record.id, type: "success" });
    router.replace(adminOrderHref(theme, "orderDetail", record.id));
  }

  function submitOrder(values: OrderFormValues) {
    if (prefillLoading || submitting.current || submission.busy) return;
    if (scenario !== "error") {
      saveOrder(values);
      return;
    }
    void submission.run(submissionFailed ? "success" : "error", undefined, {
      onError: () => { toast.add({ title: "订单提交失败", description: "可检查订单资料后重试。", type: "error" }); },
      onSuccessFeedbackEnd: () => saveOrder(values),
    });
  }

  const heading = (
    <AdminPageHeading title={title} description={order ? `维护 ${order.id} 的客户、商品及配送信息。` : "登记客户、商品及配送信息，保存后进入订单详情。"}
      breadcrumbs={[
        { title: "经营概览", href: themeHref(theme, adminWorkspacePages.dashboard.path) },
        { title: "订单管理", href: listHref },
        ...(order ? [{ title: "订单详情", href: cancelHref }] : []),
        { title },
      ]}
      actions={<AdminScenarioSelect value={scenario} onValueChange={changeScenario} />} />
  );

  if (order && scenario === "empty") return (
    <>
      {heading}
      <EmptyState role="status" className="max-w-none gap-1 rounded-lg border bg-card px-(--layout-stack-gap) py-8 text-center">
        <h2 className="text-base font-medium">暂无可编辑的订单资料</h2>
        <p className="text-sm text-muted-foreground">恢复当前订单资料后，可以继续编辑。</p>
      </EmptyState>
      <AdminPageActions>
        <Button type="button" onClick={() => {
          restoreFormFocus.current = true;
          changeScenario("normal");
        }}>恢复订单资料</Button>
      </AdminPageActions>
    </>
  );

  const cancel = isDirty ? (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="outline" />}>取消</AlertDialogTrigger>
      <AlertDialogContent initialFocus={continueEditing}>
        <AlertDialogHeader>
          <AlertDialogTitle>放弃未保存的修改？</AlertDialogTitle>
          <AlertDialogDescription>继续编辑可保留当前输入。放弃后将返回{order ? "订单详情" : "订单列表"}。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={continueEditing}>继续编辑</AlertDialogCancel>
          <AlertDialogAction variant="destructive" closeOnClick onClick={() => { form.reset(); router.push(cancelHref); }}>放弃修改</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ) : (
    <Link href={cancelHref} className={buttonVariants({ variant: "outline" })}>取消</Link>
  );

  if (prefillLoading) return (
    <>
      {heading}
      <AdminLoadingStatus>正在读取订单资料…</AdminLoadingStatus>
      <div role="group" aria-label="订单表单字段" aria-busy="true">
        <div aria-hidden="true" className="grid gap-(--layout-section-gap)">
          {[4, 3, 2].map(fieldCount => (
            <div key={fieldCount} className="grid min-w-0 gap-(--layout-stack-gap) rounded-lg border border-border bg-card p-(--layout-stack-gap)">
              <Skeleton className="h-4 w-24" />
              <div className={`grid min-w-0 gap-(--layout-stack-gap) ${fieldCount > 2 ? "@min-[48rem]/admin-page:grid-cols-2" : ""}`}>
                {Array.from({ length: fieldCount }, (_, field) => (
                  <div key={field} className={`grid gap-2 ${fieldCount === 3 && field === 0 ? "col-span-full" : ""}`}>
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className={fieldCount === 2 && field === 1 ? "h-16 w-full" : "h-8 w-full"} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <AdminPageActions>
        {cancel}
        <Button disabled>{submitLabel}</Button>
      </AdminPageActions>
    </>
  );

  let formMessage = order ? "当前显示已保存的资料。" : "请填写必填字段。";
  if (scenario === "empty") formMessage = "暂无预填资料，可直接新建订单。";
  if (isDirty) formMessage = "有未保存的修改。";
  if (submissionFailed) formMessage = "本次提交未保存，已保留输入。";
  if (submission.loading) formMessage = "正在提交订单…";
  if (Object.keys(errors).length > 0) formMessage = "请修正标出的字段后保存。";

  return (
    <>
      {heading}

      <form id={formId} aria-label={title} noValidate className="flex min-w-0 flex-col gap-(--layout-section-gap)"
        onSubmit={(event) => { void form.handleSubmit(submitOrder)(event); }}>
        <FieldSet className="grid min-w-0 gap-(--layout-stack-gap) rounded-lg border border-border bg-card px-(--layout-stack-gap) pb-(--layout-stack-gap)">
          <FieldLegend className="px-1">订单与客户</FieldLegend>
          <div className="grid min-w-0 gap-(--layout-stack-gap) @min-[48rem]/admin-page:grid-cols-2">
            <FormField name="customer" control={form.control} label={<RequiredLabel>客户名称</RequiredLabel>}
              rules={{ validate: value => !!value.trim() || "请输入客户名称。" }}>
              {input => <Input {...input} required maxLength={80} />}
            </FormField>
            <FormField name="email" control={form.control} label={<RequiredLabel>联系邮箱</RequiredLabel>}
              rules={{ validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || "请输入有效的联系邮箱。" }}>
              {input => <Input {...input} type="email" required maxLength={128} />}
            </FormField>
            <FormField name="channel" control={form.control} label={<RequiredLabel>销售渠道</RequiredLabel>}>
              {({ name, value, disabled, onChange, ...trigger }) => (
                <Select items={adminOrderChannelLabels} name={name} value={value} disabled={disabled} required onValueChange={next => {
                  if (next !== null) onChange(next);
                }}>
                  <SelectTrigger {...trigger} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(adminOrderChannelLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField name="status" control={form.control} label={<RequiredLabel>订单状态</RequiredLabel>}>
              {({ name, value, disabled, onChange, ...trigger }) => (
                <Select items={adminOrderStatusLabels} name={name} value={value} disabled={disabled} required onValueChange={next => {
                  if (next !== null) onChange(next);
                }}>
                  <SelectTrigger {...trigger} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {Object.entries(adminOrderStatusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>
        </FieldSet>

        <FieldSet className="grid min-w-0 gap-(--layout-stack-gap) rounded-lg border border-border bg-card px-(--layout-stack-gap) pb-(--layout-stack-gap)">
          <FieldLegend className="px-1">商品项目</FieldLegend>
          <div className="grid min-w-0 gap-(--layout-stack-gap) @min-[48rem]/admin-page:grid-cols-2">
            <FormField name="product" control={form.control} label={<RequiredLabel>商品名称</RequiredLabel>} className="col-span-full"
              rules={{ validate: value => !!value.trim() || "请输入商品名称。" }}>
              {input => <Input {...input} required maxLength={100} />}
            </FormField>
            <FormField name="quantity" control={form.control} label={<RequiredLabel>数量</RequiredLabel>}
              rules={{ validate: value => (/^\d+$/.test(value.trim()) && Number(value) >= 1 && Number(value) <= 99999) || "请输入 1 到 99999 的整数。" }}>
              {input => <Input {...input} required maxLength={5} inputMode="numeric" />}
            </FormField>
            <FormField name="unitPrice" control={form.control} label={<RequiredLabel>单价（元）</RequiredLabel>}
              rules={{ validate: value => (/^\d+(?:\.\d{1,2})?$/.test(value.trim()) && Number(value) >= 0.01) || "请输入大于零且最多保留两位小数的单价。" }}>
              {input => <Input {...input} required maxLength={12} inputMode="decimal" />}
            </FormField>
          </div>
        </FieldSet>

        <FieldSet className="grid min-w-0 gap-(--layout-stack-gap) rounded-lg border border-border bg-card px-(--layout-stack-gap) pb-(--layout-stack-gap)">
          <FieldLegend className="px-1">配送信息</FieldLegend>
          <FormField name="address" control={form.control} label={<RequiredLabel>收货地址</RequiredLabel>}
            rules={{ validate: value => !!value.trim() || "请输入收货地址。" }}>
            {input => <Input {...input} required maxLength={160} />}
          </FormField>
          <FormField name="notes" control={form.control} label="订单备注" description="可填写送货时间、签收安排等信息。">
            {input => <Textarea {...input} rows={3} maxLength={300} />}
          </FormField>
        </FieldSet>
      </form>

      <AdminPageActions>
        <p role="status" className="min-w-0 wrap-anywhere text-sm text-muted-foreground">
          {formMessage}
        </p>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {cancel}
          <Button type="submit" form={formId} {...submission.buttonProps()} disabled={isSubmitting || navigating || submission.busy}>
            {submission.busy && <ButtonFeedbackIcon status={submission.buttonStatus()} />}
            {submission.loading ? "正在提交…" : submissionFailed ? "重试提交" : submitLabel}
          </Button>
        </div>
      </AdminPageActions>
    </>
  );
}

export function OrderForm({ theme }: { theme: DesignTheme }) {
  const id = useSearchParams().get("order");
  const { orders } = useAdminOrders();
  const order = orders.find(record => record.id === id);

  if (id !== null && !order) {
    const listHref = themeHref(theme, adminWorkspacePages.orders.path);
    return <AdminPageHeading title="编辑订单" description="此订单链接已失效。可返回列表选择订单。"
      breadcrumbs={[{ title: "订单管理", href: listHref }, { title: "编辑订单" }]}
      actions={<Link href={listHref} className={buttonVariants({ variant: "outline" })}>返回订单列表</Link>} />;
  }

  return <OrderEditor key={order?.id ?? "create"} theme={theme} order={order} />;
}
~~~

### `src/app/[theme]/template/admin/settings/page.tsx`

~~~tsx
import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminPage } from "../_components/admin-page";
import { AdminSettingsForm } from "../_components/admin-settings-form";

export const metadata = { title: adminWorkspacePages.settings.title, description: "维护工作区资料、出库默认值和通知。" };

export default async function AdminSettingsPage({ params }: { params: Promise<{ theme: string }> }) {
  await requireDesignTheme(params, adminWorkspacePages.settings.path);
  return <AdminPage mode="focused"><AdminSettingsForm /></AdminPage>;
}
~~~

### `src/app/[theme]/template/admin/workflows/page.tsx`

~~~tsx
import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminPage } from "../_components/admin-page";
import { AdminShipmentWizard } from "../_components/admin-shipment-wizard";

export const metadata = { title: adminWorkspacePages.wizard.title, description: "选取订单并批量安排出库。" };

export default async function AdminWizardPage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.wizard.path);
  return <AdminPage mode="focused"><AdminShipmentWizard theme={theme.id} /></AdminPage>;
}
~~~

### `src/app/[theme]/template/admin/monitor/page.tsx`

~~~tsx
import { requireDesignTheme } from "@/lib/design-theme-server";
import { adminWorkspacePages } from "@/lib/design-themes";

import { AdminDashboard } from "../_components/admin-dashboard";
import { AdminPage } from "../_components/admin-page";

export const metadata = { title: adminWorkspacePages.monitor.title, description: "全屏查看订单及履约进度。" };

export default async function AdminMonitorPage({ params }: { params: Promise<{ theme: string }> }) {
  const theme = await requireDesignTheme(params, adminWorkspacePages.monitor.path);
  return <AdminPage mode="fullscreen"><AdminDashboard theme={theme.id} monitor /></AdminPage>;
}
~~~

### `src/app/[theme]/template/admin/_components/admin-workspace.tsx`

~~~tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { BellIcon, BoxesIcon, CircleHelpIcon, ClipboardCheckIcon, LayoutDashboardIcon, MenuIcon, PackageIcon, PanelLeftCloseIcon, PanelLeftOpenIcon, SearchIcon, Settings2Icon, SlidersHorizontalIcon, UserRoundIcon } from "lucide-react";

import { DensityControls } from "@/components/docs/density-controls";
import { ThemeModeControls } from "@/components/docs/theme-controls";
import { useRuntimeCssTokenEditor } from "@/components/runtime-css-token-editor/runtime-css-token-editor";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Popover, PopoverClose, PopoverContent, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { adminGlobalLayoutPage, adminWorkspacePages, designThemes, switchThemeHref, themeHref, type DesignTheme } from "@/lib/design-themes";

import { adminLayout, adminWidthTokens, getAdminBreakpoint } from "../../../layout/admin/admin-layout-data";
import { useAdminOrders } from "./admin-orders";
import { useAdminWorkspaceSettings } from "./admin-workspace-settings";
import styles from "./admin-workspace.module.css";

const dimensions = {
  [adminWidthTokens.header]: `${adminLayout.headerHeight}px`,
  [adminWidthTokens.sidebar]: `${adminLayout.sidebarWidth}px`,
  [adminWidthTokens.collapsed]: `${adminLayout.sidebarCollapsed}px`,
  [adminWidthTokens.detail]: `${adminLayout.detailMaxWidth}px`,
  [adminWidthTokens.form]: `${adminLayout.formMaxWidth}px`,
} as CSSProperties;

const navigation = [
  { ...adminWorkspacePages.dashboard, icon: LayoutDashboardIcon },
  { ...adminWorkspacePages.orders, icon: PackageIcon },
  { ...adminWorkspacePages.wizard, icon: ClipboardCheckIcon },
  { ...adminWorkspacePages.settings, icon: Settings2Icon },
] as const;

const focusClass = "rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
const itemClass = `flex min-w-0 items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted ${focusClass}`;

function subscribeToWidth(notify: () => void) {
  window.addEventListener("resize", notify);
  return () => window.removeEventListener("resize", notify);
}

function defaultNavigation() {
  return getAdminBreakpoint(window.innerWidth).navigation;
}

function WorkspaceNavigation({ theme, pathname, onNavigate }: { theme: DesignTheme; pathname: string; onNavigate?: () => void }) {
  return (
    <nav aria-label="后台主导航" className="w-full min-w-0 px-2 py-4">
      <p data-sidebar-label className="px-3 pb-2 text-xs font-medium text-muted-foreground">工作区</p>
      <ul className="grid gap-1">
        {navigation.map(({ title, path, icon: Icon }) => {
          const href = themeHref(theme, path);
          const current = pathname === href;
          const inModule = current || (path === adminWorkspacePages.orders.path && pathname.startsWith(`${href}/`));
          return (
            <li key={path} className="min-w-0">
              <Link href={href} onNavigate={onNavigate} aria-label={title} title={title} aria-current={current ? "page" : inModule ? "location" : undefined}
                data-sidebar-link className={`${itemClass} ${inModule ? "bg-primary/10 font-semibold text-primary hover:bg-primary/15" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                <span data-sidebar-label className="truncate">{title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function WorkspaceSearch({ theme }: { theme: DesignTheme }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const { orders } = useAdminOrders();
  const searchId = useId();
  const key = query.trim().toLowerCase();
  const pages = navigation.filter(({ title }) => title.includes(key));
  const matches = key ? orders.filter(({ id, customer }) => `${id} ${customer}`.toLowerCase().includes(key)).slice(0, 6) : [];

  return (
    <Dialog open={open} onOpenChange={next => { setOpen(next); if (!next) setQuery(""); }}>
      <DialogTrigger render={<Button variant="ghost" />} className="px-2 min-[36rem]:border min-[36rem]:bg-muted/50 min-[36rem]:px-3" aria-label="全局搜索">
        <SearchIcon data-icon="inline-start" aria-hidden="true" />
        <span className="hidden min-[36rem]:inline">搜索订单或页面</span>
      </DialogTrigger>
      <DialogContent className="max-w-lg" initialFocus={input}>
        <DialogHeader>
          <DialogTitle>搜索工作区</DialogTitle>
          <DialogDescription>按订单号、客户名称或页面名称查找。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <label className="sr-only" htmlFor={searchId}>关键词</label>
          <Input ref={input} id={searchId} type="search" value={query} onChange={event => setQuery(event.currentTarget.value)} placeholder="例如 订单管理" />
        </div>
        <ul aria-label="搜索结果" className="divide-y">
          {pages.map(({ title, path, icon: Icon }) => (
            <li key={path}><Link className={itemClass} href={themeHref(theme, path)} onNavigate={() => { setOpen(false); setQuery(""); }}><Icon className="size-4 shrink-0" aria-hidden="true" />{title}</Link></li>
          ))}
          {matches.map(({ id, customer }) => (
            <li key={id}><Link className={itemClass} href={`${themeHref(theme, adminWorkspacePages.orderDetail.path)}?order=${encodeURIComponent(id)}`} onNavigate={() => { setOpen(false); setQuery(""); }}>
              <PackageIcon className="size-4 shrink-0" aria-hidden="true" /><span className="min-w-0 wrap-anywhere">{id} · {customer}</span>
            </Link></li>
          ))}
        </ul>
        {pages.length === 0 && matches.length === 0 && <p role="status" className="text-sm text-muted-foreground">试试订单号、客户名称或工作区页面名称。</p>}
      </DialogContent>
    </Dialog>
  );
}

function WorkspaceUtilities({ theme, pathname }: { theme: DesignTheme; pathname: string }) {
  const { openEditor } = useRuntimeCssTokenEditor();
  const userMenuTrigger = useRef<HTMLButtonElement>(null);
  const pendingEditor = useRef(false);
  const { orders } = useAdminOrders();
  const { settings } = useAdminWorkspaceSettings();
  const pending = orders.filter(({ status }) => status === "pending").length;
  const shipped = orders.filter(({ status }) => status === "shipped").length;

  const docsLink = (
    <PopoverClose render={<Link href={themeHref(theme, adminGlobalLayoutPage.path)} />} className={itemClass}>
      <CircleHelpIcon className="size-4 shrink-0" aria-hidden="true" />后台设计规范
    </PopoverClose>
  );

  return (
    <div className="flex shrink-0 items-center gap-1">
      <WorkspaceSearch theme={theme} />
      <Popover>
        <PopoverTrigger render={<Button variant="ghost" size="icon" />} aria-label="工作区通知" title="工作区通知"><BellIcon aria-hidden="true" /></PopoverTrigger>
        <PopoverContent align="end">
          <PopoverHeader><PopoverTitle>工作区通知</PopoverTitle></PopoverHeader>
          {settings.orderNotifications && <p className="text-sm text-muted-foreground">订单队列有 {pending} 笔待处理订单。</p>}
          {settings.shipmentSummary && <p className="text-sm text-muted-foreground">出库摘要有 {shipped} 笔已发货订单。</p>}
          {!settings.orderNotifications && !settings.shipmentSummary && <p className="text-sm text-muted-foreground">工作区通知已暂停。</p>}
          <PopoverClose render={<Link href={themeHref(theme, adminWorkspacePages.orders.path)} />} className={buttonVariants({ variant: "outline" })}>查看订单队列</PopoverClose>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger render={<Button variant="ghost" size="icon" />} className="hidden min-[30rem]:inline-flex" aria-label="帮助" title="帮助"><CircleHelpIcon aria-hidden="true" /></PopoverTrigger>
        <PopoverContent align="end">
          <PopoverHeader><PopoverTitle>帮助</PopoverTitle></PopoverHeader>
          {docsLink}
        </PopoverContent>
      </Popover>
      <Popover onOpenChangeComplete={open => {
        if (open || !pendingEditor.current) return;
        pendingEditor.current = false;
        openEditor(userMenuTrigger.current);
      }}>
        <PopoverTrigger render={<Button ref={userMenuTrigger} variant="outline" size="icon" />} aria-label="运营用户菜单" title="运营用户菜单"><UserRoundIcon aria-hidden="true" /></PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <PopoverHeader><PopoverTitle className="wrap-anywhere">{settings.name}</PopoverTitle></PopoverHeader>
          <div className="grid gap-2 border-t pt-3">
            <p className="text-xs font-medium text-muted-foreground">设计主题</p>
            <nav aria-label="设计主题" className="flex flex-wrap gap-1">
              {designThemes.map(item => (
                <a key={item.id} href={switchThemeHref(pathname, item.id)} aria-current={item.id === theme ? "true" : undefined}
                  className={buttonVariants({ size: "sm", variant: item.id === theme ? "secondary" : "ghost" })}>{item.label}</a>
              ))}
            </nav>
            <p className="text-xs font-medium text-muted-foreground">显示外观</p>
            <ThemeModeControls />
            <p className="text-xs font-medium text-muted-foreground">布局密度</p>
            <DensityControls />
            <PopoverClose render={<Button variant="ghost" />} className="justify-start" aria-haspopup="dialog"
              onClick={() => { pendingEditor.current = true; }}>
              <SlidersHorizontalIcon data-icon="inline-start" aria-hidden="true" />样式编辑器
            </PopoverClose>
          </div>
          <div className="min-[30rem]:hidden">{docsLink}</div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function AdminWorkspace({ theme, children }: { theme: DesignTheme; children: ReactNode }) {
  const pathname = usePathname();
  const { settings } = useAdminWorkspaceSettings();
  const band = useSyncExternalStore(subscribeToWidth, defaultNavigation, () => "drawer" as const);
  const [override, setOverride] = useState<{ defaultMode: typeof band; mode: "expanded" | "collapsed" }>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const currentMode = override?.defaultMode === band ? override.mode : band;
  const dashboardHref = themeHref(theme, adminWorkspacePages.dashboard.path);
  const monitorHref = themeHref(theme, adminWorkspacePages.monitor.path);
  const fullscreen = pathname === monitorHref;
  const main = useRef<HTMLElement>(null);
  const drawerTrigger = useRef<HTMLButtonElement>(null);
  const sidebarToggle = useRef<HTMLButtonElement>(null);
  const previousRoute = useRef(pathname);
  const previousOverviewScroll = useRef(0);

  useEffect(() => {
    function closeOversizedDrawer() {
      if (defaultNavigation() !== "drawer") setDrawerOpen(false);
    }
    return subscribeToWidth(closeOversizedDrawer);
  }, []);

  useEffect(() => {
    const previous = previousRoute.current;
    if (previous === pathname || !main.current) return;
    const restoringOverview = previous === monitorHref && pathname === dashboardHref;
    main.current.scrollTop = restoringOverview ? previousOverviewScroll.current : 0;
    if (restoringOverview) main.current.querySelector<HTMLElement>(`a[href="${monitorHref}"]`)?.focus({ preventScroll: true });
    previousRoute.current = pathname;
  }, [dashboardHref, monitorHref, pathname]);

  return (
    <div className={`${styles.shell} bg-background`} style={dimensions} data-admin-workspace data-sidebar-mode={currentMode} data-fullscreen={fullscreen}>
      <a href="#admin-main" className={`sr-only z-50 bg-background p-2 focus:not-sr-only focus:absolute ${focusClass}`}>跳到主内容</a>
      {!fullscreen && (
        <header data-admin-region="global-header" className="flex min-w-0 items-center justify-between gap-2 border-b bg-background px-(--admin-page-padding-x)">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Drawer open={drawerOpen && band === "drawer"} onOpenChange={setDrawerOpen} swipeDirection="left">
              <DrawerTrigger render={<Button ref={drawerTrigger} variant="ghost" size="icon" />} className="lg:hidden" aria-label="打开后台导航"><MenuIcon aria-hidden="true" /></DrawerTrigger>
              <DrawerContent finalFocus={() => defaultNavigation() === "drawer" ? drawerTrigger.current : sidebarToggle.current}>
                <DrawerHeader align="start">
                  <div className="flex items-center justify-between gap-2">
                    <DrawerTitle className="min-w-0 wrap-anywhere">{settings.name}</DrawerTitle>
                    <DrawerClose render={<Button size="sm" variant="ghost" />}>关闭导航</DrawerClose>
                  </div>
                  <DrawerDescription className="sr-only">切换到工作区页面</DrawerDescription>
                </DrawerHeader>
                <div className="min-h-0 flex-1 overflow-y-auto px-2">
                  <WorkspaceNavigation theme={theme} pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
                </div>
              </DrawerContent>
            </Drawer>
            <Button ref={sidebarToggle} type="button" size="icon" variant="ghost" className="hidden lg:inline-flex" aria-expanded={currentMode === "expanded"} aria-controls="admin-sidebar" aria-label={currentMode === "expanded" ? "折叠侧栏" : "展开侧栏"}
              onClick={() => setOverride({ defaultMode: band, mode: currentMode === "expanded" ? "collapsed" : "expanded" })}>
              {currentMode === "expanded" ? <PanelLeftCloseIcon aria-hidden="true" /> : <PanelLeftOpenIcon aria-hidden="true" />}
            </Button>
            <Link href={dashboardHref} className={`flex min-w-0 items-center gap-2 font-semibold ${focusClass}`} aria-label="ForAI 订单运营首页">
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground"><BoxesIcon className="size-4" aria-hidden="true" /></span>
              <span className="truncate text-sm">ForAI<span className="hidden min-[30rem]:inline"> {settings.name}</span></span>
            </Link>
          </div>
          <WorkspaceUtilities theme={theme} pathname={pathname} />
        </header>
      )}
      <div className={styles.workspace}>
        {!fullscreen && <aside id="admin-sidebar" data-admin-region="sidebar" className={`${styles.sidebar} border-e bg-muted/25`}><WorkspaceNavigation theme={theme} pathname={pathname} /></aside>}
        <main ref={main} id="admin-main" tabIndex={-1} data-admin-region="main" className={styles.main} onScroll={(event) => {
          if (pathname === dashboardHref && previousRoute.current === dashboardHref) previousOverviewScroll.current = event.currentTarget.scrollTop;
        }}>{children}</main>
      </div>
    </div>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-workspace.module.css`

~~~css
.shell {
  --admin-page-padding-x: var(--layout-page-padding-inline);
  display: grid;
  width: 100%;
  height: 100dvh;
  min-width: 0;
  flex: none;
  grid-template-rows: var(--admin-header-height) minmax(0, 1fr);
}

.workspace {
  display: grid;
  min-width: 0;
  min-height: 0;
  grid-template-columns: minmax(0, 1fr);
  overflow: hidden;
}

.sidebar {
  display: none;
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.main {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-block-start: var(--admin-breadcrumb-height, 0px);
}

.main:has(.actions) {
  scroll-padding-block-end: calc(var(--admin-action-bar-height, var(--spacing) * 16) + var(--layout-inline-gap));
}

.page {
  --admin-page-padding-start: var(--layout-page-padding-block);
  box-sizing: content-box;
  margin-inline: auto;
  padding-inline: var(--admin-page-padding-x);
  padding-block: var(--admin-page-padding-start) var(--layout-page-padding-block);
}

.page[data-container-mode="standard"] { max-width: var(--admin-detail-max-width); }
.page[data-container-mode="focused"] { max-width: var(--admin-form-max-width); }

.page:has(> .breadcrumb) { --admin-page-padding-start: 0px; }

.page:has(.actions) {
  min-block-size: calc(100% - var(--admin-page-padding-start));
  padding-block-end: 0;
}

.page > form:has(> .actions) {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.breadcrumb {
  position: sticky;
  inset-block-start: 0;
  z-index: 20;
  padding-block: var(--layout-page-padding-block) var(--layout-stack-gap);
  /* The breadcrumb already includes its spacing to the page heading. */
  margin-block-end: calc(-1 * var(--layout-section-gap));
}

.actions {
  position: sticky;
  inset-block-end: 0;
  margin-block-start: auto;
  min-height: calc(var(--spacing) * 16);
}

:global(body):has(.actions) :global([data-slot="toast-viewport"]) {
  bottom: calc(var(--admin-action-bar-height, 0px) + var(--spacing) * 4);
}

@media (width >= 1024px) {
  .shell { --admin-page-padding-x: calc(var(--spacing) * 6); }
  .workspace { grid-template-columns: var(--admin-sidebar-collapsed) minmax(0, 1fr); }
  .sidebar { display: flex; }
  .shell[data-sidebar-mode="expanded"] .workspace { grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr); }
  .shell[data-sidebar-mode="collapsed"] .sidebar [data-sidebar-label] { display: none; }
  .shell[data-sidebar-mode="collapsed"] .sidebar [data-sidebar-link] { justify-content: center; }
}

@media (width >= 1280px) {
  .workspace { grid-template-columns: var(--admin-sidebar-width) minmax(0, 1fr); }
  .shell[data-sidebar-mode="collapsed"] .workspace { grid-template-columns: var(--admin-sidebar-collapsed) minmax(0, 1fr); }
}

@media (width >= 1600px) {
  .shell { --admin-page-padding-x: calc(var(--spacing) * 8); }
}

.shell[data-fullscreen="true"] { grid-template-rows: minmax(0, 1fr); }
.shell[data-fullscreen="true"] .workspace { grid-template-columns: minmax(0, 1fr); }
~~~

### `src/app/[theme]/template/admin/_components/admin-workspace-settings.tsx`

~~~tsx
"use client";

import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

import type { AdminOrder } from "./admin-orders";

export const warehouseNames = ["杭州中心仓", "苏州转运仓", "广州南区仓"] as const;
export const carrierNames = ["顺丰速运", "京东物流", "德邦快递"] as const;

export type WorkspaceSettings = {
  name: string;
  warehouse: (typeof warehouseNames)[number];
  carrier: (typeof carrierNames)[number];
  orderNotifications: boolean;
  shipmentSummary: boolean;
};

export const defaultWorkspaceSettings: WorkspaceSettings = {
  name: "澜仓运营工作区",
  warehouse: warehouseNames[0],
  carrier: carrierNames[0],
  orderNotifications: true,
  shipmentSummary: false,
};

export const reportPeriods = [7, 14, 30] as const;

type DashboardFilters = {
  period: (typeof reportPeriods)[number];
  channel: AdminOrder["channel"] | "all";
};

const WorkspaceSettingsContext = createContext<{
  settings: WorkspaceSettings;
  saveSettings: (settings: WorkspaceSettings) => void;
  filters: DashboardFilters;
  setFilters: Dispatch<SetStateAction<DashboardFilters>>;
} | null>(null);

export function AdminWorkspaceSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, saveSettings] = useState(defaultWorkspaceSettings);
  const [filters, setFilters] = useState<DashboardFilters>({ period: 7, channel: "all" });

  return (
    <WorkspaceSettingsContext.Provider value={{ settings, saveSettings, filters, setFilters }}>
      {children}
    </WorkspaceSettingsContext.Provider>
  );
}

export function useAdminWorkspaceSettings() {
  const context = useContext(WorkspaceSettingsContext);
  if (!context) throw new Error("AdminWorkspaceSettingsProvider is required.");
  return context;
}
~~~

### `src/app/[theme]/template/admin/_components/admin-page.tsx`

~~~tsx
import type { ReactNode } from "react";

import { AdminBreadcrumb, type AdminBreadcrumbItem } from "./admin-breadcrumb";
import styles from "./admin-workspace.module.css";

export { AdminPageActions } from "./admin-page-actions";

export function AdminPage({ mode = "standard", children }: {
  mode?: "standard" | "wide" | "focused" | "fullscreen";
  children: ReactNode;
}) {
  return (
    <article data-container-mode={mode} className={`${styles.page} @container/admin-page flex min-w-0 flex-col gap-(--layout-section-gap)`}>
      {children}
    </article>
  );
}

export function AdminPageHeading({ title, description, breadcrumbs, badge, actions }: {
  title: string;
  description: string;
  breadcrumbs?: readonly AdminBreadcrumbItem[];
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && <AdminBreadcrumb items={breadcrumbs} />}
      <header className="flex min-w-0 flex-col items-start gap-(--layout-stack-gap) @min-[48rem]/admin-page:flex-row @min-[48rem]/admin-page:justify-between">
        <div className="min-w-0 space-y-(--layout-heading-body-gap)">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight wrap-anywhere" tabIndex={-1}>{title}</h1>
            {badge}
          </div>
          <p className="max-w-[70ch] text-sm text-muted-foreground">{description}</p>
        </div>
        {actions && <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    </>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-breadcrumb.tsx`

~~~tsx
"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import { useRef } from "react";

import styles from "./admin-workspace.module.css";
import { useAdminScrollInset } from "./use-admin-scroll-inset";

export type AdminBreadcrumbItem = { title: string; href?: string };

export function AdminBreadcrumb({ items }: { items: readonly AdminBreadcrumbItem[] }) {
  const breadcrumb = useRef<HTMLElement>(null);
  useAdminScrollInset(breadcrumb, "--admin-breadcrumb-height");

  return (
    <nav ref={breadcrumb} aria-label="面包屑" data-admin-region="breadcrumb"
      className={`${styles.breadcrumb} min-w-0 bg-background text-sm text-muted-foreground`}>
      <ol className="flex flex-wrap items-center gap-2">
        {items.map(({ title, href }, index) => (
          <li key={`${title}-${index}`} className="flex min-w-0 items-center gap-2 wrap-anywhere">
            {index > 0 && <ChevronRightIcon className="size-3 shrink-0" aria-hidden="true" />}
            {href ? <Link href={href} className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring">{title}</Link>
              : <span aria-current="page" className="text-foreground">{title}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-page-actions.tsx`

~~~tsx
"use client";

import { useRef, type ReactNode } from "react";

import styles from "./admin-workspace.module.css";
import { useAdminScrollInset } from "./use-admin-scroll-inset";

export function AdminPageActions({ children }: { children: ReactNode }) {
  const actions = useRef<HTMLElement>(null);
  useAdminScrollInset(actions, "--admin-action-bar-height", "document");

  return (
    <footer ref={actions} data-admin-region="page-action-bar"
      className={`${styles.actions} z-10 flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-2 border-t bg-background py-2`}>
      {children}
    </footer>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/use-admin-scroll-inset.ts`

~~~ts
"use client";

import { useEffect, type RefObject } from "react";

export function useAdminScrollInset(
  ref: RefObject<HTMLElement | null>,
  property: "--admin-breadcrumb-height" | "--admin-action-bar-height",
  scope: "main" | "document" = "main",
) {
  useEffect(() => {
    const region = ref.current;
    const target = scope === "document" ? document.documentElement : region?.closest<HTMLElement>('[data-admin-region="main"]');
    if (!region || !target) return;

    const updateInset = () => target.style.setProperty(property, `${region.offsetHeight}px`);
    updateInset();
    const observer = new ResizeObserver(updateInset);
    observer.observe(region, { box: "border-box" });
    return () => {
      observer.disconnect();
      target.style.removeProperty(property);
    };
  }, [ref, property, scope]);
}
~~~

### `src/app/[theme]/template/admin/_components/admin-scenario.tsx`

~~~tsx
"use client";

import { useId, type ReactNode } from "react";

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

const scenarios = [
  { value: "normal", label: "常规" },
  { value: "loading", label: "加载中" },
  { value: "empty", label: "空数据" },
  { value: "error", label: "错误" },
] as const;

export type AdminScenario = (typeof scenarios)[number]["value"];

export function AdminLoadingStatus({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
      <Spinner className="shrink-0" aria-hidden="true" />{children}
    </p>
  );
}

export function AdminScenarioSelect({ value, onValueChange }: {
  value: AdminScenario;
  onValueChange: (value: AdminScenario) => void;
}) {
  const id = useId();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label htmlFor={id} className="text-sm text-muted-foreground">演示场景</label>
      <Select items={scenarios} value={value} onValueChange={next => {
        const scenario = scenarios.find(option => option.value === next);
        if (scenario) onValueChange(scenario.value);
      }}>
        <SelectTrigger id={id}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {scenarios.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-orders.tsx`

~~~tsx
"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";

import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";

export const adminOrderStatusLabels = {
  pending: "待处理",
  processing: "处理中",
  shipped: "已发货",
  completed: "已完成",
} as const;

export const adminOrderChannelLabels = {
  online: "线上商城",
  dealer: "经销商",
  retail: "直营门店",
} as const;

export type AdminOrderStatus = keyof typeof adminOrderStatusLabels;
export type AdminOrderChannel = keyof typeof adminOrderChannelLabels;

export const adminOrderStatusVariants = {
  pending: "warning",
  processing: "secondary",
  shipped: "outline",
  completed: "success",
} as const;

export type AdminOrderDraft = {
  customer: string;
  email: string;
  product: string;
  quantity: number;
  unitPrice: number;
  channel: AdminOrderChannel;
  status: AdminOrderStatus;
  address: string;
  notes: string;
};

export type AdminOrder = AdminOrderDraft & {
  id: string;
  amount: number;
  date: string;
  activities: readonly { date: string; label: string }[];
};

const locations = [
  "上海市浦东新区科苑路 18 号 华东中心仓",
  "杭州市滨江区滨盛路 56 号 滨江门店",
  "苏州市工业园区金鸡湖大道 66 号 东区收货台",
  "南京市建邺区江东中路 120 号 河西配送站",
  "宁波市鄞州区首南中路 28 号 明州仓",
  "广州市天河区科韵路 12 号 华南中心仓",
];
const fixtures: readonly (readonly [string, string, string, number, number, AdminOrderChannel, AdminOrderStatus])[] = [
  ["11-16", "锦程贸易", "竹木桌面收纳套装", 12, 159, "online", "pending"],
  ["11-16", "木禾生活馆", "棉麻靠垫组合", 28, 129, "retail", "processing"],
  ["11-15", "松间集合店", "轻量折叠边桌", 16, 329, "dealer", "shipped"],
  ["11-15", "拾光家居", "原木托盘套组", 20, 89, "online", "pending"],
  ["11-14", "东澜商贸", "模块化储物柜", 11, 569, "dealer", "completed"],
  ["11-14", "南岸设计社", "蘑菇台灯", 9, 289, "retail", "processing"],
  ["11-13", "启元百货", "可叠放储物箱", 34, 99, "online", "shipped"],
  ["11-13", "一方生活", "磨砂玻璃花瓶", 18, 139, "retail", "completed"],
  ["11-12", "海屿选物", "胡桃木衣帽架", 7, 499, "dealer", "processing"],
  ["11-12", "金禾商行", "帆布收纳篮", 24, 89, "online", "shipped"],
  ["11-11", "北辰集合店", "原木长凳", 14, 419, "dealer", "completed"],
  ["11-10", "雨城生活馆", "黄铜壁挂置物架", 12, 169, "retail", "processing"],
  ["11-09", "江左商贸", "组合置物架", 22, 259, "dealer", "shipped"],
  ["11-08", "晴川家居", "亚麻桌旗", 30, 69, "online", "completed"],
  ["11-07", "闻竹设计", "落地阅读灯", 5, 599, "retail", "completed"],
  ["11-06", "久木百货", "方形矮凳", 19, 219, "dealer", "completed"],
  ["11-04", "纸鹤商店", "陶瓷杯碟组", 35, 99, "online", "shipped"],
  ["11-02", "蓝庭优选", "双层床边柜", 8, 489, "dealer", "completed"],
  ["10-31", "山原集合店", "藤编托盘", 15, 149, "retail", "completed"],
  ["10-29", "百川商贸", "棉织地垫", 31, 109, "online", "completed"],
  ["10-27", "米树生活馆", "旅行收纳包", 20, 95, "retail", "completed"],
  ["10-24", "明州家居", "木质厨房推车", 8, 429, "dealer", "completed"],
  ["10-22", "半岛精品店", "香氛扩散瓶", 20, 149, "online", "completed"],
  ["10-20", "河畔选物", "玄关挂钟", 16, 199, "retail", "completed"],
];

export const adminSampleDate = "2026-11-16";
export const sampleOrderId = "SO-20261116-001";

function orderTotal({ quantity, unitPrice }: Pick<AdminOrderDraft, "quantity" | "unitPrice">) {
  return Math.round(quantity * unitPrice * 100) / 100;
}

const initialOrders: readonly AdminOrder[] = fixtures.map(([shortDate, customer, product, quantity, unitPrice, channel, status], index) => {
  const date = `2026-${shortDate}`;
  const number = String(index + 1).padStart(3, "0");
  return {
    id: `SO-${date.replaceAll("-", "")}-${number}`,
    customer,
    email: `orders+${number}@example.com`,
    product,
    quantity,
    unitPrice,
    amount: orderTotal({ quantity, unitPrice }),
    channel,
    status,
    address: locations[index % locations.length],
    notes: index % 2 === 0 ? "工作日 09:00 至 17:00 收货，配送前请与仓库联系。" : "按渠道约定配送，签收后回传收货信息。",
    date,
    activities: status === "pending"
      ? [{ date, label: "订单已登记" }]
      : [{ date, label: "订单已登记" }, { date, label: `状态已更新为${adminOrderStatusLabels[status]}` }],
  };
});

const currency = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" });

export function formatOrderCurrency(amount: number) {
  return currency.format(amount);
}

export function adminOrderHref(theme: DesignTheme, page: "orderDetail" | "orderForm", id?: string) {
  const path = themeHref(theme, adminWorkspacePages[page].path);
  return id === undefined ? path : `${path}?order=${encodeURIComponent(id)}`;
}

type AdminOrderStore = {
  orders: readonly AdminOrder[];
  createOrder: (draft: AdminOrderDraft) => AdminOrder;
  updateOrder: (id: string, draft: AdminOrderDraft) => void;
  updateOrderStatus: (ids: readonly string[], status: AdminOrderStatus) => void;
};

const OrderContext = createContext<AdminOrderStore | null>(null);

export function AdminOrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState(initialOrders);
  const nextId = useRef(initialOrders.length + 1);

  function createOrder(draft: AdminOrderDraft) {
    const order = {
      ...draft,
      id: `SO-${adminSampleDate.replaceAll("-", "")}-${String(nextId.current++).padStart(3, "0")}`,
      amount: orderTotal(draft),
      date: adminSampleDate,
      activities: [{ date: adminSampleDate, label: "订单已登记" }],
    };
    setOrders(previous => [order, ...previous]);
    return order;
  }

  function updateOrder(id: string, draft: AdminOrderDraft) {
    setOrders(previous => previous.map(order => {
      if (order.id !== id) return order;
      const label = order.status === draft.status
        ? "订单资料已更新"
        : `订单资料已更新，状态为${adminOrderStatusLabels[draft.status]}`;
      return {
        ...order,
        ...draft,
        amount: orderTotal(draft),
        activities: [...order.activities, { date: adminSampleDate, label }],
      };
    }));
  }

  function updateOrderStatus(ids: readonly string[], status: AdminOrderStatus) {
    const selected = new Set(ids);
    setOrders(previous => previous.map(order => !selected.has(order.id) || order.status === status ? order : {
      ...order,
      status,
      activities: [...order.activities, { date: adminSampleDate, label: `状态已更新为${adminOrderStatusLabels[status]}` }],
    }));
  }

  return <OrderContext value={{ orders, createOrder, updateOrder, updateOrderStatus }}>{children}</OrderContext>;
}

export function useAdminOrders() {
  const context = useContext(OrderContext);
  if (context === null) throw new Error("AdminOrdersProvider must wrap the admin workspace.");
  return context;
}
~~~

### `src/app/[theme]/template/admin/_components/admin-dashboard.tsx`

~~~tsx
"use client";

import Link from "next/link";
import { ArrowDownRightIcon, ArrowRightIcon, ArrowUpRightIcon, CircleDollarSignIcon, Maximize2Icon, Minimize2Icon, PackageCheckIcon, PackageIcon, ShoppingBagIcon, TruckIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { Chart } from "@/components/ai-elements/elements/chart";
import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Card, CardAction, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToastManager } from "@/components/ui/toast";
import { useDemoTask } from "@/hooks/use-demo-task";
import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";

import { adminOrderChannelLabels, adminOrderStatusLabels, adminOrderStatusVariants, adminSampleDate, formatOrderCurrency, useAdminOrders, type AdminOrder } from "./admin-orders";
import { AdminPageHeading } from "./admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "./admin-scenario";
import { reportPeriods, useAdminWorkspaceSettings } from "./admin-workspace-settings";

const orderChannels = Object.entries(adminOrderChannelLabels) as [AdminOrder["channel"], string][];
const channelOptions = [{ value: "all", label: "全部渠道" }, ...orderChannels.map(([value, label]) => ({ value, label }))] as const;
const periodOptions = reportPeriods.map(value => ({ value, label: `近 ${value} 天` }));
const dateFormat = new Intl.DateTimeFormat("zh-CN", { month: "short", day: "numeric", timeZone: "UTC" });
const numberFormat = new Intl.NumberFormat("zh-CN");
const moneyFormat = new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY", maximumFractionDigits: 0 });

function offsetDate(value: string, days: number) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shortDate(value: string) {
  return dateFormat.format(new Date(`${value}T00:00:00Z`));
}

function totalAmount(orders: readonly AdminOrder[]) {
  return orders.reduce((sum, order) => sum + order.amount, 0);
}

function TrendSkeleton({ label }: { label: string }) {
  return (
    <Card>
      <CardHeader><h3 className="text-sm font-medium">{label}</h3></CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-7 w-20" aria-hidden="true" />
        <Skeleton className="h-[88px] w-full" aria-hidden="true" />
      </CardContent>
    </Card>
  );
}

export function AdminDashboard({ theme, monitor = false }: { theme: DesignTheme; monitor?: boolean }) {
  const id = useId();
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const retry = useDemoTask();
  const { add: addToast } = useToastManager();
  const retryButton = useRef<HTMLButtonElement>(null);
  const trendHeading = useRef<HTMLHeadingElement>(null);
  const { orders } = useAdminOrders();
  const { settings, filters, setFilters } = useAdminWorkspaceSettings();
  const { channel, period } = filters;
  const start = offsetDate(adminSampleDate, 1 - period);
  const previousStart = offsetDate(start, -period);
  const scoped = scenario === "empty" ? [] : orders.filter(order => channel === "all" || order.channel === channel);
  const active = scoped.filter(order => order.date >= start && order.date <= adminSampleDate);
  const previous = scoped.filter(order => order.date >= previousStart && order.date < start);
  const hasData = active.length > 0;
  const loading = scenario === "loading";
  const amountTrendUnavailable = scenario === "error";
  const series = Array.from({ length: period }, (_, index) => {
    const date = offsetDate(start, index);
    const daily = active.filter(order => order.date === date);
    return { date, amount: totalAmount(daily), count: daily.length };
  });
  const amount = totalAmount(active);
  const shipped = active.filter(order => order.status === "shipped" || order.status === "completed").length;
  const pending = active.length - shipped;
  const difference = active.length - previous.length;
  const recent = [...active].sort((left, right) => right.date.localeCompare(left.date) || right.id.localeCompare(left.id)).slice(0, 5);
  const channelSummary = orderChannels.filter(([key]) => channel === "all" || key === channel).map(([key, label]) => {
    const matching = active.filter(order => order.channel === key);
    return { label, count: matching.length, amount: totalAmount(matching) };
  });
  const metrics = [
    { label: "订单金额", value: moneyFormat.format(amount), unit: "元", detail: "所选时段全部订单金额合计", icon: CircleDollarSignIcon },
    { label: "订单总量", value: `${numberFormat.format(active.length)} 单`, unit: "单", detail: !hasData ? "所选时段全部订单数量" : difference === 0 ? "较上个等长时段持平" : `较上个等长时段${difference > 0 ? "增加" : "减少"} ${Math.abs(difference)} 单`, icon: ShoppingBagIcon },
    { label: "待出库", value: `${numberFormat.format(pending)} 单`, unit: "单", detail: "待处理及处理中订单", icon: PackageIcon },
    { label: "已出库", value: `${numberFormat.format(shipped)} 单`, unit: "单", detail: "已发货及已完成订单", icon: PackageCheckIcon },
  ];
  const overview = themeHref(theme, adminWorkspacePages.dashboard.path);
  const ordersHref = themeHref(theme, adminWorkspacePages.orders.path);
  const monitorHref = themeHref(theme, adminWorkspacePages.monitor.path);
  const detailHref = themeHref(theme, adminWorkspacePages.orderDetail.path);
  const reportScope = `${shortDate(start)}至${shortDate(adminSampleDate)}（北京时间） · ${channel === "all" ? "全部渠道" : adminOrderChannelLabels[channel]}`;

  return (
    <>
      <AdminPageHeading
        title={monitor ? adminWorkspacePages.monitor.title : adminWorkspacePages.dashboard.title}
        description={monitor ? "连续查看订单量及履约进度。" : `${settings.name}的订单、交易金额及出库进度。`}
        actions={
          <>
            <AdminScenarioSelect value={scenario} onValueChange={next => {
              retry.reset();
              setScenario(next);
            }} />
            {monitor ? (
              <Link href={overview} className={buttonVariants({ variant: "outline" })}>
                <Minimize2Icon aria-hidden="true" data-icon="inline-start" />退出全屏监控
              </Link>
            ) : (
              <>
                <Link href={monitorHref} className={buttonVariants({ variant: "outline" })}>
                  <Maximize2Icon aria-hidden="true" data-icon="inline-start" />全屏监控
                </Link>
                <Link href={themeHref(theme, adminWorkspacePages.wizard.path)} className={buttonVariants()}>
                  <TruckIcon aria-hidden="true" data-icon="inline-start" />发起出库
                </Link>
              </>
            )}
          </>
        }
      />

      <section aria-label="统计筛选" className="grid min-w-0 items-end gap-3 rounded-xl border bg-card p-4 @min-[768px]/admin-page:grid-cols-[11rem_11rem_minmax(0,1fr)]">
        <Field>
          <FieldLabel htmlFor={`${id}-period`}>统计时段</FieldLabel>
          <Select items={periodOptions} value={period} onValueChange={next => {
            const value = reportPeriods.find(item => item === next);
            if (value) setFilters(current => ({ ...current, period: value }));
          }}>
            <SelectTrigger id={`${id}-period`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {periodOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${id}-channel`}>销售渠道</FieldLabel>
          <Select items={channelOptions} value={channel} onValueChange={next => {
            const option = channelOptions.find(({ value }) => value === next);
            if (option) setFilters(current => ({ ...current, channel: option.value }));
          }}>
            <SelectTrigger id={`${id}-channel`} className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {channelOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <p role="status" className="pb-1 text-sm text-muted-foreground @min-[768px]/admin-page:justify-self-end">{reportScope}</p>
      </section>

      {loading && <AdminLoadingStatus>正在加载订单统计…</AdminLoadingStatus>}
      <section aria-label="关键指标" aria-busy={loading || undefined} className="grid min-w-0 gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-2 @min-[1024px]/admin-page:grid-cols-4">
        {metrics.map(({ label, value, unit, detail, icon: Icon }) => (
          <Card key={label}>
            <CardHeader>
              <h2 className="text-sm font-medium">{label}</h2>
              <CardAction><Icon aria-hidden="true" className="size-4 text-muted-foreground" /></CardAction>
            </CardHeader>
            <CardContent className="grid gap-1">
              {loading ? <Skeleton className="h-8 w-20" aria-hidden="true" /> : <p className="text-2xl font-semibold tracking-tight tabular-nums">
                {hasData ? value : (
                  <>
                    <span aria-hidden="true">— <span className="text-sm font-medium text-muted-foreground">{unit}</span></span>
                    <span className="sr-only">暂无数据，单位为{unit}</span>
                  </>
                )}
              </p>}
              <p className="flex items-start gap-1 text-xs leading-normal text-muted-foreground">
                {!loading && hasData && label === "订单总量" && difference !== 0 && (difference > 0 ? <ArrowUpRightIcon className="size-3 shrink-0" aria-hidden="true" /> : <ArrowDownRightIcon className="size-3 shrink-0" aria-hidden="true" />)}
                {loading && label === "订单总量" ? "所选时段全部订单数量" : detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-labelledby={`${id}-trend`} aria-busy={loading || undefined} className="grid min-w-0 gap-(--layout-heading-body-gap)">
        <div>
          <h2 id={`${id}-trend`} ref={trendHeading} tabIndex={-1} className="text-lg font-semibold tracking-tight">订单趋势</h2>
          <p className="text-sm text-muted-foreground">来源为工作区订单台账，按录入日期汇总，金额以人民币计。数据截至 <time dateTime={adminSampleDate}>{adminSampleDate}</time>。</p>
        </div>
        {loading ? (
          <div className="grid min-w-0 gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
            <TrendSkeleton label="每日订单金额" />
            <TrendSkeleton label="每日订单数（单）" />
          </div>
        ) : hasData ? (
          <>
            <p role="status" className="sr-only">{retry.loading ? "正在重试订单金额趋势。" : ""}</p>
            <div className="grid min-w-0 gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
              {amountTrendUnavailable ? (
                <Card className="min-h-44" aria-busy={retry.loading || undefined}>
                  <CardHeader><h3 className="text-sm font-medium">每日订单金额</h3></CardHeader>
                  <CardContent className="grid gap-2">
                    <p role="alert" className="font-medium text-destructive">订单金额趋势加载失败</p>
                    <p className="text-sm text-muted-foreground">重试将使用当前筛选条件。订单数趋势和其他统计仍可查看。</p>
                    <Button ref={retryButton} variant="outline" size="sm" className="mt-1 w-fit" {...retry.buttonProps()} onClick={() => {
                      void retry.run("success", undefined, { onSuccessFeedbackEnd: () => {
                        if (document.activeElement === retryButton.current) trendHeading.current?.focus({ preventScroll: true });
                        setScenario("normal");
                        addToast({ title: "订单金额趋势已恢复", type: "success" });
                      } });
                    }}>
                      <ButtonFeedbackIcon status={retry.buttonStatus()} />{retry.loading ? "正在重试…" : "重试金额趋势"}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Chart className="max-w-none" label="每日订单金额" value={moneyFormat.format(amount)} points={series.map(row => row.amount)} visibleCount={series.length} variant="area" role="group" aria-describedby={`${id}-trend-details`} />
              )}
              <Chart className="max-w-none" label="每日订单数（单）" value={numberFormat.format(active.length)} points={series.map(row => row.count)} visibleCount={series.length} variant="line" role="group" aria-describedby={`${id}-trend-details`} />
            </div>
            <details className="min-w-0 rounded-lg border bg-card px-4 py-3">
              <summary id={`${id}-trend-details`} className="w-fit max-w-full cursor-pointer rounded-sm text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">查看每日趋势明细</summary>
              <Table aria-label="每日订单趋势" className="mt-2">
                <TableHeader><TableRow>
                  <TableHead scope="col">日期</TableHead>
                  <TableHead scope="col" className="text-right">订单数（单）</TableHead>
                  <TableHead scope="col" className="text-right">金额（元）</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {series.map(row => <TableRow key={row.date}>
                    <TableHead scope="row">{shortDate(row.date)}</TableHead>
                    <TableCell className="text-right tabular-nums">{numberFormat.format(row.count)}</TableCell>
                    <TableCell className="text-right tabular-nums">{amountTrendUnavailable ? <span className="text-muted-foreground">金额暂缺</span> : formatOrderCurrency(row.amount)}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </details>
          </>
        ) : (
          <EmptyState role="status" className="min-h-44 max-w-none justify-center gap-2 rounded-lg border bg-card p-4 text-center">
            <p className="font-medium">暂无统计数据</p>
            <p className="text-sm text-muted-foreground">
              {scenario === "empty" ? "当前场景没有订单记录。可切换回常规场景查看数据。" : "所选时段和销售渠道没有订单记录。请尝试扩大筛选范围。"}
            </p>
          </EmptyState>
        )}
      </section>

      <div className="grid min-w-0 items-start gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)]">
        <Card role="region" aria-labelledby={`${id}-channels`} aria-busy={loading || undefined}>
          <CardHeader>
            <h2 id={`${id}-channels`} className="text-base font-semibold">渠道表现</h2>
            <CardDescription>各销售渠道的订单和金额</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || hasData ? <Table aria-label="分渠道订单明细">
              <TableHeader><TableRow>
                <TableHead scope="col">销售渠道</TableHead>
                <TableHead scope="col" className="text-right">订单（单）</TableHead>
                <TableHead scope="col" className="text-right">金额（元）</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {channelSummary.map(row => loading ? (
                  <TableRow key={row.label} aria-hidden="true">
                    <TableCell><Skeleton className="h-4 w-16 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-8 max-w-full" /></TableCell>
                    <TableCell><Skeleton className="ml-auto h-4 w-12 max-w-full" /></TableCell>
                  </TableRow>
                ) : <TableRow key={row.label}>
                  <TableHead scope="row">{row.label}</TableHead>
                  <TableCell className="text-right tabular-nums">{numberFormat.format(row.count)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatOrderCurrency(row.amount)}</TableCell>
                </TableRow>)}
              </TableBody>
            </Table> : <p className="text-sm text-muted-foreground">当前范围内暂无渠道明细。</p>}
          </CardContent>
        </Card>

        <Card role="region" aria-labelledby={`${id}-recent`} aria-busy={loading || undefined}>
          <CardHeader className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 id={`${id}-recent`} className="text-base font-semibold">最近订单</h2>
              <CardDescription>所选范围内最新的 5 笔订单</CardDescription>
            </div>
            <Link href={ordersHref} className={buttonVariants({ variant: "ghost", size: "sm" })}>
              查看订单<ArrowRightIcon aria-hidden="true" data-icon="inline-end" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div aria-hidden="true" className="grid divide-y">
                {[0, 1, 2, 3, 4].map(row => (
                  <div key={row} className="flex flex-wrap items-center justify-between gap-2 py-2 first:pt-0 last:pb-0">
                    <div className="grid gap-1">
                      <Skeleton className="h-5 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : hasData ? <ul aria-label="最近订单明细" className="divide-y">
              {recent.map(order => <li key={order.id} className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 py-2 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <Link href={`${detailHref}?${new URLSearchParams({ order: order.id })}`} className="rounded-sm font-medium wrap-anywhere hover:underline focus-visible:outline-2 focus-visible:outline-ring">{order.id}</Link>
                  <p className="text-xs text-muted-foreground wrap-anywhere">{order.customer}</p>
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="text-sm tabular-nums">{formatOrderCurrency(order.amount)}</p>
                  <Badge variant={adminOrderStatusVariants[order.status]}>{adminOrderStatusLabels[order.status]}</Badge>
                </div>
              </li>)}
            </ul> : <p className="text-sm text-muted-foreground">当前范围内暂无最近订单。</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-settings-form.tsx`

~~~tsx
"use client";

import { BellIcon, Building2Icon, RotateCcwIcon, TruckIcon } from "lucide-react";
import { useId, useRef, useState } from "react";

import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useToastManager } from "@/components/ui/toast";
import { useDemoTask } from "@/hooks/use-demo-task";

import { AdminPageActions, AdminPageHeading } from "./admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "./admin-scenario";
import { carrierNames, defaultWorkspaceSettings, useAdminWorkspaceSettings, warehouseNames, type WorkspaceSettings } from "./admin-workspace-settings";

const warehouseOptions = warehouseNames.map(value => ({ value, label: value }));
const carrierOptions = carrierNames.map(value => ({ value, label: value }));

const categories = [
  { key: "general", label: "基本资料", title: "工作区资料", icon: Building2Icon },
  { key: "fulfillment", label: "出库规则", title: "出库默认值", icon: TruckIcon },
  { key: "notifications", label: "业务通知", title: "通知偏好", icon: BellIcon },
] as const;

const notificationFields = [
  { key: "orderNotifications", label: "订单状态更新", description: "工作区成员接收订单状态变更提醒。" },
  { key: "shipmentSummary", label: "每日出库汇总", description: "工作区成员接收当日已出库订单汇总。" },
] as const;

export function AdminSettingsForm() {
  const { settings, saveSettings } = useAdminWorkspaceSettings();
  const { add: notify } = useToastManager();
  const [draft, setDraft] = useState(settings);
  const [category, setCategory] = useState<(typeof categories)[number]["key"]>("general");
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const [failNextSave, setFailNextSave] = useState(false);
  const [notice, setNotice] = useState("");
  const generalButton = useRef<HTMLButtonElement>(null);
  const save = useDemoTask();
  const id = useId();
  const dirty = (Object.keys(draft) as (keyof WorkspaceSettings)[]).some(key => draft[key] !== settings[key]);
  const loading = scenario === "loading";
  const sectionTitle = categories.find(({ key }) => category === key)?.title;
  const emptyNotifications = scenario === "empty" && category === "notifications";
  const saveFailed = scenario === "error" && save.status === "error";

  function update<Key extends keyof WorkspaceSettings>(key: Key, value: WorkspaceSettings[Key]) {
    setNotice("");
    setDraft(previous => ({ ...previous, [key]: value }));
  }

  return (
    <>
      <AdminPageHeading
        title="工作区设置"
        description={`配置 ${settings.name} 的资料、出库默认值和通知。已保存的设置对整个工作区生效。`}
        actions={(
          <AdminScenarioSelect value={scenario} onValueChange={next => {
            save.reset();
            setScenario(next);
            setFailNextSave(next === "error");
            setNotice("");
            if (next === "empty") setCategory("notifications");
          }} />
        )}
      />
      <form className="grid min-w-0 gap-(--layout-section-gap)" onSubmit={event => {
        event.preventDefault();
        if (loading || !dirty || emptyNotifications || save.busy) return;
        if (!draft.name.trim()) {
          setCategory("general");
          return;
        }
        const nextSettings = { ...draft, name: draft.name.trim() };

        function persist() {
          saveSettings(nextSettings);
          setDraft(nextSettings);
          setNotice("");
          notify({ type: "success", title: "工作区设置已保存。" });
        }

        if (scenario === "error") {
          void save.run(failNextSave ? "error" : "success", () => {
            persist();
            setScenario("normal");
          }, { onError: () => setFailNextSave(false) });
        } else {
          persist();
        }
      }}>
        <div className="grid min-w-0 items-start gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-[10rem_minmax(0,1fr)]">
          <nav aria-label="设置分类" className="flex min-w-0 flex-wrap gap-2 @min-[768px]/admin-page:flex-col">
            {categories.map(({ key, label, icon: Icon }) => (
              <Button key={key} ref={key === "general" ? generalButton : undefined} variant={category === key ? "secondary" : "ghost"} className="justify-start" aria-current={category === key ? "true" : undefined} aria-controls={`${id}-section`} onClick={() => setCategory(key)}>
                <Icon aria-hidden="true" data-icon="inline-start" />{label}
              </Button>
            ))}
          </nav>

          <div id={`${id}-section`} className="grid min-w-0 gap-(--layout-section-gap)">
            {loading && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold">{sectionTitle}</h2>
                  <AdminLoadingStatus>正在加载当前分类设置…</AdminLoadingStatus>
                </CardHeader>
                <CardContent role="region" aria-label="当前分类设置" aria-busy="true">
                  <div aria-hidden="true" className="grid min-w-0 gap-4 @min-[768px]/admin-page:grid-cols-2">
                    {["first", "second"].map(field => (
                      <div key={field} className="grid min-w-0 gap-(--layout-field-gap)">
                        <Skeleton className="h-4 w-24 max-w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && category === "general" && (
              <>
                <Card>
                  <CardHeader>
                    <h2 className="text-base font-semibold">{sectionTitle}</h2>
                    <CardDescription>工作区名称用于经营概览和业务范围提示。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FieldGroup>
                      <Field className="max-w-md">
                        <FieldLabel htmlFor={`${id}-name`}>工作区名称</FieldLabel>
                        <Input id={`${id}-name`} value={draft.name} required maxLength={36} readOnly={save.loading} onChange={event => update("name", event.currentTarget.value)} />
                      </Field>
                      <dl className="grid gap-3 @min-[768px]/admin-page:grid-cols-2">
                        <div><dt className="text-xs text-muted-foreground">业务时区</dt><dd className="mt-1 font-medium">北京时间（UTC+8）</dd></div>
                        <div><dt className="text-xs text-muted-foreground">默认货币</dt><dd className="mt-1 font-medium">人民币（CNY）</dd></div>
                      </dl>
                    </FieldGroup>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h2 className="text-base font-semibold">恢复默认设置</h2>
                    <CardDescription>恢复工作区名称、出库默认值和通知偏好。</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="outline" />} disabled={save.busy}>
                        <RotateCcwIcon aria-hidden="true" data-icon="inline-start" />恢复默认设置
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>恢复工作区设置？</AlertDialogTitle>
                          <AlertDialogDescription>将工作区名称、默认仓库、承运商和通知偏好恢复为初始值，未保存的修改也会被清除。</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>取消</AlertDialogCancel>
                          <AlertDialogAction closeOnClick variant="destructive" onClick={() => {
                            save.reset();
                            saveSettings(defaultWorkspaceSettings);
                            setDraft(defaultWorkspaceSettings);
                            setNotice("已恢复工作区的默认设置。");
                          }}>确认恢复</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </>
            )}

            {!loading && category === "fulfillment" && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold">{sectionTitle}</h2>
                  <CardDescription>用于预填新的出库任务，经办人可在向导中调整。</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid min-w-0 gap-4 @min-[768px]/admin-page:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`${id}-warehouse`}>默认仓库</FieldLabel>
                      <Select items={warehouseOptions} value={draft.warehouse} disabled={save.loading} onValueChange={next => {
                        const warehouse = warehouseNames.find(value => value === next);
                        if (warehouse) update("warehouse", warehouse);
                      }}>
                        <SelectTrigger id={`${id}-warehouse`} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {warehouseOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${id}-carrier`}>默认承运商</FieldLabel>
                      <Select items={carrierOptions} value={draft.carrier} disabled={save.loading} onValueChange={next => {
                        const carrier = carrierNames.find(value => value === next);
                        if (carrier) update("carrier", carrier);
                      }}>
                        <SelectTrigger id={`${id}-carrier`} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {carrierOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                </CardContent>
              </Card>
            )}

            {!loading && category === "notifications" && (
              <Card>
                <CardHeader>
                  <h2 className="text-base font-semibold">{sectionTitle}</h2>
                  <CardDescription>配置工作区成员关注的订单事件。</CardDescription>
                </CardHeader>
                <CardContent className={emptyNotifications ? undefined : "divide-y"}>
                  {emptyNotifications ? (
                    <EmptyState className="max-w-none items-start gap-2 text-start">
                      <p className="font-medium">暂无通知偏好</p>
                      <p className="text-sm text-muted-foreground">当前工作区没有可配置的业务通知。可返回基本资料继续管理工作区。</p>
                      <Button variant="outline" size="sm" onClick={() => {
                        setCategory("general");
                        generalButton.current?.focus();
                      }}>返回基本资料</Button>
                    </EmptyState>
                  ) : notificationFields.map(({ key, label, description }) => (
                    <Field key={key} orientation="horizontal" className="items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="min-w-0 flex-1">
                        <FieldLabel htmlFor={`${id}-${key}`}>{label}</FieldLabel>
                        <FieldDescription id={`${id}-${key}-description`} className="mt-1">{description}</FieldDescription>
                      </div>
                      <Switch id={`${id}-${key}`} aria-describedby={`${id}-${key}-description`} checked={draft[key]} disabled={save.loading} onCheckedChange={checked => update(key, checked)} />
                    </Field>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <AdminPageActions>
          {saveFailed ? (
            <p id={`${id}-save-error`} role="alert" className="mr-auto min-w-0 text-sm text-destructive">设置保存失败，修改已保留，请重试。</p>
          ) : (
            <p role={loading ? undefined : "status"} className="mr-auto min-w-0 text-sm text-muted-foreground">
              {loading ? "当前分类加载完成后可保存。" : save.loading ? "正在保存工作区设置…" : emptyNotifications ? "当前分类没有可保存的设置。" : notice || (dirty ? "有未保存的更改。" : scenario === "error" ? "修改设置后保存，首次提交将模拟失败。" : "设置已同步。")}
            </p>
          )}
          {!emptyNotifications && (
            <>
              <Button variant="outline" disabled={loading || !dirty || save.busy} onClick={() => {
                save.reset();
                setDraft(settings);
                setNotice("已放弃未保存的更改。");
              }}>取消修改</Button>
              <Button type="submit" {...save.buttonProps()} disabled={loading || !dirty || !draft.name.trim() || save.busy} aria-describedby={saveFailed ? `${id}-save-error` : undefined}>
                {save.buttonStatus() !== "idle" && <ButtonFeedbackIcon status={save.buttonStatus()} />}
                {save.loading ? "正在保存…" : saveFailed ? "重试保存" : "保存设置"}
              </Button>
            </>
          )}
        </AdminPageActions>
      </form>
    </>
  );
}
~~~

### `src/app/[theme]/template/admin/_components/admin-shipment-wizard.tsx`

~~~tsx
"use client";

import Link from "next/link";
import { CheckIcon, CircleCheckIcon, PackageCheckIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { EmptyState } from "@/components/ai-elements/elements/empty-state";
import { useDemoTask } from "@/components/docs/use-demo-task";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastManager } from "@/components/ui/toast";
import { adminWorkspacePages, themeHref, type DesignTheme } from "@/lib/design-themes";
import { cn } from "@/lib/utils";

import { adminOrderStatusLabels, adminOrderStatusVariants, useAdminOrders } from "./admin-orders";
import { AdminPageActions, AdminPageHeading } from "./admin-page";
import { AdminLoadingStatus, AdminScenarioSelect, type AdminScenario } from "./admin-scenario";
import { carrierNames, useAdminWorkspaceSettings, warehouseNames } from "./admin-workspace-settings";

const warehouseOptions = warehouseNames.map(value => ({ value, label: value }));
const carrierOptions = carrierNames.map(value => ({ value, label: value }));

const steps = [
  { label: "选择订单", description: "确定本批需要安排出库的订单。", loadingLabel: "正在加载可出库订单…" },
  { label: "填写出库信息", description: "指定发货仓库与承运商。", loadingLabel: "正在加载发货仓库和承运商…" },
  { label: "核对并确认", description: "确认订单范围与发货安排。", loadingLabel: "正在加载出库确认信息…" },
] as const;

export function AdminShipmentWizard({ theme }: { theme: DesignTheme }) {
  const { orders, updateOrderStatus } = useAdminOrders();
  const { settings } = useAdminWorkspaceSettings();
  const { add: notify } = useToastManager();
  const [scenario, setScenario] = useState<AdminScenario>("normal");
  const [index, setIndex] = useState(0);
  const [ids, setIds] = useState<string[]>([]);
  const [warehouse, setWarehouse] = useState(settings.warehouse);
  const [carrier, setCarrier] = useState(settings.carrier);
  const [completed, setCompleted] = useState<{ count: number; quantity: number } | null>(null);
  const submission = useDemoTask();
  const currentHeading = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  const id = useId();
  const listHref = themeHref(theme, adminWorkspacePages.orders.path);
  const loading = scenario === "loading";
  const eligible = scenario === "empty" ? [] : orders.filter(order => order.status === "pending" || order.status === "processing");
  const selected = eligible.filter(order => ids.includes(order.id));
  const quantity = selected.reduce((sum, order) => sum + order.quantity, 0);
  const visibleIndex = loading || eligible.length > 0 ? index : 0;
  const currentStep = steps[visibleIndex];
  const hasSubmitError = submission.status === "error" || submission.action === "retry";
  const submitLabel = visibleIndex < steps.length - 1 ? "下一步" : submission.loading ? "正在提交…" : hasSubmitError ? "重试出库" : "确认出库";
  const feedbackAction = submission.action ?? undefined;

  useEffect(() => {
    if (moved.current) currentHeading.current?.focus();
  }, [index, completed]);

  function changeScenario(next: AdminScenario) {
    if (scenario === next) return;
    moved.current = false;
    submission.reset();
    if (completed) {
      setCompleted(null);
      setIndex(0);
      setIds([]);
    }
    setScenario(next);
  }

  function completeShipment() {
    moved.current = true;
    updateOrderStatus(selected.map(order => order.id), "shipped");
    setCompleted({ count: selected.length, quantity });
  }

  return (
    <>
      <AdminPageHeading title="出库向导" description="选取订单并安排发货。确认后，本批订单统一更新为已发货。"
        actions={<AdminScenarioSelect value={scenario} onValueChange={changeScenario} />} />
      {completed ? (
        <Card className="max-w-full">
          <CardHeader>
            <CircleCheckIcon aria-hidden="true" className="mb-2 size-8 text-success" />
            <h2 className="rounded-sm text-lg font-semibold focus-visible:outline-2 focus-visible:outline-ring" ref={currentHeading} tabIndex={-1}>已安排出库</h2>
            <CardDescription>本批 {completed.count} 笔订单、共 {completed.quantity} 件商品已更新为已发货。</CardDescription>
          </CardHeader>
          <CardContent className="grid min-w-0 gap-4">
            <p className="text-sm text-muted-foreground">{warehouse} · {carrier}</p>
            <Link href={listHref} className={cn(buttonVariants(), "justify-self-start")}><PackageCheckIcon aria-hidden="true" data-icon="inline-start" />返回订单管理</Link>
          </CardContent>
        </Card>
      ) : (
        <form className="grid min-w-0 gap-(--layout-section-gap)" onSubmit={event => {
          event.preventDefault();
          if (loading || !selected.length || submission.busy) return;
          if (index < steps.length - 1) {
            moved.current = true;
            setIndex(value => value + 1);
            return;
          }
          if (scenario === "normal") {
            completeShipment();
            return;
          }
          void submission.run(hasSubmitError ? "success" : "error", undefined, {
            action: hasSubmitError ? "retry" : "submit",
            onSuccessFeedbackEnd: () => {
              completeShipment();
              setScenario("normal");
              notify({ type: "success", title: "出库重试成功" });
            },
          });
        }}>
          <div className="grid min-w-0 items-start gap-(--layout-section-gap) @min-[768px]/admin-page:grid-cols-[13rem_minmax(0,1fr)]">
            <ol aria-label="出库步骤" className="grid min-w-0 gap-2">
              {steps.map(({ label, description }, stepIndex) => (
                <li key={label} aria-current={visibleIndex === stepIndex ? "step" : undefined} className={cn("flex min-w-0 items-start gap-3 rounded-lg p-2", visibleIndex === stepIndex && "bg-accent text-accent-foreground")}>
                  <span aria-hidden="true" className={cn("flex size-7 shrink-0 items-center justify-center rounded-full border text-sm tabular-nums", visibleIndex === stepIndex && "border-primary bg-primary text-primary-foreground")}>
                    {visibleIndex > stepIndex ? <CheckIcon className="size-4" /> : stepIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{label}{visibleIndex > stepIndex && <span className="sr-only">，已完成</span>}</p>
                    <p className="hidden text-xs text-muted-foreground @min-[768px]/admin-page:block">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <Card className="min-w-0">
              <CardHeader>
                <h2 ref={currentHeading} tabIndex={-1} className="rounded-sm text-lg font-semibold focus-visible:outline-2 focus-visible:outline-ring">{currentStep.label}</h2>
                <CardDescription>{currentStep.description}</CardDescription>
                {loading && <AdminLoadingStatus>{currentStep.loadingLabel}</AdminLoadingStatus>}
              </CardHeader>
              <CardContent role={loading ? "region" : undefined} aria-label={loading ? "当前步骤内容" : undefined} aria-busy={loading || undefined}>
                {loading ? (
                  <div aria-hidden="true" className={cn("grid min-w-0 gap-3", visibleIndex !== 0 && "@min-[768px]/admin-page:grid-cols-2")}>
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    {visibleIndex !== 1 && <Skeleton className="col-span-full h-10 w-full" />}
                  </div>
                ) : eligible.length === 0 ? (
                  <EmptyState className="max-w-none gap-3 py-6 text-center">
                    <h3 className="font-medium">暂无可出库订单</h3>
                    <p className="text-sm text-muted-foreground">待处理和处理中的订单可安排出库。</p>
                    <Link href={listHref} className={buttonVariants({ variant: "outline" })}>返回订单管理</Link>
                  </EmptyState>
                ) : visibleIndex === 0 && (
                  <fieldset className="min-w-0">
                    <legend className="sr-only">选取待出库订单</legend>
                    <ul className="divide-y">
                      {eligible.map(order => (
                        <li key={order.id} className="flex min-w-0 items-center gap-3 py-3 ps-2 first:pt-1 last:pb-1">
                          <Checkbox
                            id={`${id}-${order.id}`}
                            checked={ids.includes(order.id)}
                            aria-label={`选择 ${order.id}`}
                            aria-describedby={`${id}-${order.id}-summary`}
                            onCheckedChange={checked => setIds(current => checked ? [...current, order.id] : current.filter(value => value !== order.id))}
                          />
                          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1">
                            <div className="min-w-0">
                              <label htmlFor={`${id}-${order.id}`} className="cursor-pointer text-sm font-medium wrap-anywhere">{order.id}</label>
                              <p id={`${id}-${order.id}-summary`} className="text-xs text-muted-foreground wrap-anywhere">{order.customer} · {order.product} × {order.quantity}</p>
                            </div>
                            <Badge variant={adminOrderStatusVariants[order.status]}>{adminOrderStatusLabels[order.status]}</Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </fieldset>
                )}

                {!loading && visibleIndex === 1 && (
                  <div className="grid min-w-0 gap-4 @min-[768px]/admin-page:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`${id}-warehouse`}>发货仓库</FieldLabel>
                      <Select items={warehouseOptions} value={warehouse} onValueChange={next => {
                        const value = warehouseNames.find(name => name === next);
                        if (value) setWarehouse(value);
                      }}>
                        <SelectTrigger id={`${id}-warehouse`} aria-describedby={`${id}-warehouse-hint`} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {warehouseOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FieldDescription id={`${id}-warehouse-hint`}>由所选仓库负责订单拣货和交接。</FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${id}-carrier`}>承运商</FieldLabel>
                      <Select items={carrierOptions} value={carrier} onValueChange={next => {
                        const value = carrierNames.find(name => name === next);
                        if (value) setCarrier(value);
                      }}>
                        <SelectTrigger id={`${id}-carrier`} className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {carrierOptions.map(({ value, label }) => <SelectItem key={value} value={value}>{label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                )}

                {!loading && visibleIndex === 2 && (
                  <div className="grid min-w-0 gap-4">
                    {hasSubmitError && (
                      <div role="alert" className="grid gap-1 rounded-lg border p-3">
                        <p className="font-medium text-destructive">出库提交失败</p>
                        <p className="text-sm text-muted-foreground">订单状态未更新。已保留订单、发货仓库和承运商，可在本步重试。</p>
                      </div>
                    )}
                    <dl className="grid min-w-0 gap-3 @min-[768px]/admin-page:grid-cols-2">
                      <div><dt className="text-xs text-muted-foreground">发货仓库</dt><dd className="mt-1 font-medium">{warehouse}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">承运商</dt><dd className="mt-1 font-medium">{carrier}</dd></div>
                      <div><dt className="text-xs text-muted-foreground">商品数量</dt><dd className="mt-1 font-medium tabular-nums">{quantity} 件</dd></div>
                      <div><dt className="text-xs text-muted-foreground">订单状态</dt><dd className="mt-1 font-medium">更新为已发货</dd></div>
                    </dl>
                    <div className="min-w-0 rounded-lg border bg-muted/30 p-3">
                      <h3 className="text-sm font-medium">本批订单（{selected.length}）</h3>
                      <ul className="mt-2 grid gap-1">
                        {selected.map(order => <li key={order.id} className="text-sm text-muted-foreground wrap-anywhere">{order.id} · {order.customer}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <AdminPageActions>
            <p className="mr-auto text-sm text-muted-foreground" role={loading ? undefined : "status"}>{loading ? "当前步骤的数据加载完成后可继续。" : eligible.length === 0 ? "有可出库订单后可继续。" : selected.length ? `已选 ${selected.length} 笔订单，共 ${quantity} 件` : "请选择要安排出库的订单。"}</p>
            {visibleIndex === 0 && (loading || eligible.length > 0) && (
              <Link href={listHref} className={buttonVariants({ variant: "outline" })}>取消</Link>
            )}
            {visibleIndex > 0 && (
              <Button variant="outline" disabled={loading || submission.busy} onClick={() => {
                submission.reset();
                moved.current = true;
                setIndex(value => value - 1);
              }}>上一步</Button>
            )}
            <Button type="submit" {...submission.buttonProps(feedbackAction)} disabled={loading || !selected.length || submission.busy} focusableWhenDisabled={submission.busy}>
              <ButtonFeedbackIcon status={submission.buttonStatus(feedbackAction)} />{submitLabel}
            </Button>
          </AdminPageActions>
        </form>
      )}
    </>
  );
}
~~~
