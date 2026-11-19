export type TerminalSessionStatus = "starting" | "running" | "stopping" | "ended" | "failed" | "unknown";
export type TerminalLogStatus = "starting" | "running" | "stopping" | "done" | "failed" | "cancelled" | "unknown";

export const terminalSessionLabels: Record<TerminalSessionStatus, string> = {
  starting: "启动中", running: "会话运行中", stopping: "停止中", ended: "会话已结束", failed: "会话失败", unknown: "状态未知",
};
export const terminalLogLabels: Record<TerminalLogStatus, string> = {
  starting: "启动中", running: "执行中", stopping: "停止中", done: "已完成", failed: "失败", cancelled: "已取消", unknown: "状态未知",
};
export function isTerminalPending(status: TerminalSessionStatus | TerminalLogStatus) {
  return status === "starting" || status === "running" || status === "stopping";
}
export function resolveTerminalLogStatus(done: boolean, exitCode?: number, status?: TerminalLogStatus): TerminalLogStatus {
  if (status !== undefined) return status;
  if (!done) return "running";
  if (exitCode === undefined) return "unknown";
  return exitCode === 0 ? "done" : "failed";
}
