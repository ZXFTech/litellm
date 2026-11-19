"use client";

import { Children, createContext, isValidElement, useContext, useId, useState, type ReactNode } from "react";
import { useDemoTask } from "@/hooks/use-demo-task";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { Checkbox } from "@/components/ui/checkbox";
import { AiDemoStatus } from "./demo-status";

type Task = ReturnType<typeof useDemoTask>;
const ActionContext = createContext<{ task: Task; fail: boolean; label: string; setLabel: (label: string) => void; note: string; setNote: (note: string) => void } | null>(null);

/** Each example owns its task; remounting the card aborts pending feedback. */
export function AiActionScope({ children }: { children: ReactNode }) {
  const task = useDemoTask();
  const [fail, setFail] = useState(false);
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  return <ActionContext value={{ task, fail, label, setLabel, note, setNote }}>
    {children}
    <div data-ai-project-only className="flex w-full flex-col gap-3">
      <label className="flex items-center gap-2 text-sm"><Checkbox checked={fail} onCheckedChange={value => setFail(value === true)} disabled={task.busy} />模拟操作失败</label>
      <AiDemoStatus error={task.status === "error"}>{task.loading ? `正在处理本地操作：${label}` : task.status === "success" ? `本地操作已完成：${label}` : task.status === "error" ? `本地操作失败：${label}。原有内容保留，可以重试。` : note || "操作仅影响当前本地示例。"}</AiDemoStatus>
    </div>
  </ActionContext>;
}

/** Finite demo actions keep their originating button through result feedback. */
export function AiAsyncButton({ children, onClick, disabled, asyncAction = true, actionKey, ...props }: ButtonProps & { asyncAction?: boolean; actionKey?: string }) {
  const fallback = useDemoTask();
  const scope = useContext(ActionContext);
  const generatedId = useId();
  const id = actionKey ?? generatedId;
  const task = scope?.task ?? fallback;
  const status = task.buttonStatus(id);
  const content = status === "idle" ? children : Children.toArray(children).filter(child => !(isValidElement<{ className?: string }>(child) && /\bsize-/.test(child.props.className ?? "")));
  return <Button {...props} disabled={disabled || !onClick || task.busy} focusableWhenDisabled aria-busy={status === "loading" || undefined} onClick={event => {
    if (!asyncAction) { onClick?.(event); return; }
    event.preventDefault();
    scope?.setLabel(event.currentTarget.getAttribute("aria-label") || event.currentTarget.textContent?.trim() || "当前操作");
    void task.run(scope?.fail ? "error" : "success", undefined, { action: id, onSuccessFeedbackEnd: () => onClick?.(event) });
  }}>
    {status !== "idle" && <ButtonFeedbackIcon status={status} />}{content}
  </Button>;
}

export function useAiActionController() {
  const scope = useContext(ActionContext);
  return { busy: scope?.task.busy ?? false,
    notify: (note: string) => { scope?.task.reset(); scope?.setNote(note); },
    cancel: () => scope?.task.reset(),
    run: (callback: () => void, label: string, action = "composer-send") => {
      if (!scope) { callback(); return; }
      scope.setLabel(label); scope.setNote("");
      void scope.task.run(scope.fail ? "error" : "success", undefined, { action, onSuccessFeedbackEnd: callback });
    } };
}
