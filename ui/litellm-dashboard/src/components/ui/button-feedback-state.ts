export type ButtonFeedbackStatus = "idle" | "loading" | "success" | "error";
export const buttonFeedbackDurationMs = 618;

type Snapshot = { status: ButtonFeedbackStatus; buttonStatus: ButtonFeedbackStatus; action: string | null };
type Options = { action?: string; feedbackDurationMs?: number; onSuccess?: () => void; onError?: () => void; onSuccessFeedbackEnd?: () => void };

/** Keeps the durable request result separate from the short button feedback. */
export function createButtonFeedback() {
  let snapshot: Snapshot = { status: "idle", buttonStatus: "idle", action: null };
  let version = 0;
  let controller: AbortController | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const listeners = new Set<() => void>();

  function publish(next: Snapshot) {
    snapshot = next;
    listeners.forEach((listener) => listener());
  }

  function reset() {
    ++version;
    controller?.abort();
    controller = null;
    if (timer !== null) clearTimeout(timer);
    timer = null;
    publish({ status: "idle", buttonStatus: "idle", action: null });
  }

  async function run(operation: (signal: AbortSignal) => unknown | Promise<unknown>, options: Options = {}) {
    if (snapshot.buttonStatus !== "idle") return false;
    const current = ++version;
    controller = new AbortController();
    const { signal } = controller;
    const action = options.action ?? "default";
    publish({ status: "loading", buttonStatus: "loading", action });
    let result: "success" | "error";
    try {
      const value = await operation(signal);
      if (current !== version) return false;
      result = value === false ? "error" : "success";
    } catch {
      if (current !== version) return false;
      result = "error";
    }
    if (current !== version) return false;
    try {
      if (result === "success") options.onSuccess?.();
      else options.onError?.();
    } catch { result = "error"; }
    if (current !== version) return false;
    controller = null;
    publish({ status: result, buttonStatus: result, action });
    timer = setTimeout(() => {
      if (current !== version) return;
      timer = null;
      publish({ status: result, buttonStatus: "idle", action: null });
      if (result === "success") options.onSuccessFeedbackEnd?.();
    }, options.feedbackDurationMs ?? buttonFeedbackDurationMs);
    return result === "success";
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    run,
    reset,
  };
}
