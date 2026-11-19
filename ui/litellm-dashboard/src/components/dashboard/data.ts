export const DASHBOARD_REFERENCE_PAGE = {
  url: "demo://mock-dashboard/layout/overview",
  title: "Metric Studio · Dashboard Overview",
  dateRange: "Oct 1–6, 2026",
  navigation: ["Overview", "Analytics", "Customers", "Settings"],
  kpis: [
    { label: "Total Revenue", value: "$128,430", change: "+12.8%" },
    { label: "Active Users", value: "12,480", change: "+8.2%" },
    { label: "Conversion Rate", value: "4.8%", change: "+0.6pp" },
    { label: "Total Orders", value: "1,284", change: "+10.4%" },
  ],
  revenue: { value: "$128,430", delta: "+12.8%", points: [18200, 19600, 21450, 22100, 23580, 23500] },
  activity: [
    { id: "evt-01", event: "订阅续费", account: "Acme Studio", amount: 249, status: "已完成" },
    { id: "evt-02", event: "新增订阅", account: "Nova Labs", amount: 149, status: "已完成" },
    { id: "evt-03", event: "用量账单", account: "Orbit AI", amount: 99, status: "处理中" },
  ],
  analysis: [
    { label: "Sidebar", value: "左侧组织 Overview、Analytics、Customers 和 Settings；窄屏重排为顶部导航区域。" },
    { label: "Header", value: "页首保留 Dashboard 标题和统一时间范围，让指标与下方数据具备一致上下文。" },
    { label: "KPI Cards", value: "四张指标卡先呈现收入、活跃用户、转化率和订单数，并用文字标明变化幅度。" },
    { label: "Revenue Chart", value: "收入图位于指标之后，展示 10 月 1–6 日的变化；六个收入点合计为 $128,430。" },
    { label: "Recent Activity Table", value: "底部列出最近三条活动、客户、金额及状态；窄屏沿用响应式记录布局完整展示字段。" },
  ],
} as const;

export type ReferenceDashboardPage = typeof DASHBOARD_REFERENCE_PAGE;
