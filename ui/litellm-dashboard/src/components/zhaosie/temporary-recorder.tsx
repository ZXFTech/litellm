"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonFeedbackIcon } from "@/components/ui/button-feedback-icon";
import { useButtonFeedback } from "@/components/ui/use-button-feedback";
import { cn } from "@/lib/cva.config";
import { RecordButton } from "./record-button";
import { RecordMode, type RecordModeValue } from "./record-mode";
import { Waveform } from "./waveform";
import { useTemporaryRecorder, type RecordingSaveHandler } from "@/hooks/use-temporary-recorder";

export type TemporaryRecorderProps = { className?: string; onSave?: RecordingSaveHandler };
export type { RecordingClipForSave, RecordingSaveRequest, RecordingSaveHandler } from "@/lib/zhaosie/temporary-recordings";

function AudioPreview({ url, index }: { url: string; index: number }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  useLayoutEffect(() => {
    const audio = audioRef.current;
    if (audio) { audio.src = url; audio.load(); }
    return () => { if (audio) { audio.pause(); audio.removeAttribute("src"); audio.load(); } };
  }, [url]);
  return <li className="flex min-w-0 flex-col gap-2">
    <span className="text-sm font-medium">语音片段 {index}</span>
    <audio ref={audioRef} controls preload="metadata" src={url} aria-label={`播放第 ${index} 段音频`} className="w-full min-w-0 max-w-full" />
  </li>;
}

/** Visit scoped recording; a host save adapter runs only after an explicit save. */
export function TemporaryRecorder({ className, onSave }: TemporaryRecorderProps) {
  const [mode, setMode] = useState<RecordModeValue>("hold");
  useLayoutEffect(() => () => setMode("hold"), []);
  const recorder = useTemporaryRecorder({ onSave });
  const save = useButtonFeedback();
  const instructionId = useId();
  const busy = recorder.phase !== "idle";
  const saving = recorder.saveState === "saving" || save.loading;
  const saveLocked = saving || save.busy;
  const recording = recorder.phase === "recording";
  const instruction = saving ? "正在保存，请等待确认" : recorder.phase === "requesting" ? "请允许使用麦克风" : recorder.phase === "stopping" ? "正在结束录音" : recording ? (mode === "hold" ? "松开停止记录" : "再次点击停止记录") : mode === "hold" ? "按住开始，松开停止" : "点击开始，再次点击停止";

  return <div role="group" aria-label="临时录音" className={cn("flex w-full min-w-0 flex-col gap-4", className)}>
    <div className="flex flex-wrap items-center gap-6">
      <div className="w-full max-w-xs p-2">
        <RecordButton recording={recording} aria-label={busy || saving ? instruction : mode === "hold" ? "按住开始记录" : "开始记录"} aria-describedby={instructionId} aria-busy={recorder.phase === "requesting" || recorder.phase === "stopping"} disabled={saveLocked || recorder.phase === "stopping"} focusableWhenDisabled className="touch-none"
          onPointerDown={(event) => { if (mode !== "hold" || event.button !== 0 || !event.isPrimary) return; event.currentTarget.setPointerCapture(event.pointerId); recorder.armHold(); }}
          onPointerUp={() => { if (mode === "hold") recorder.releaseHold(); }} onPointerCancel={recorder.releaseHold} onLostPointerCapture={() => { if (mode === "hold") recorder.releaseHold(); }}
          onKeyDown={(event) => { if (event.key === "Escape") { recorder.releaseHold(); recorder.stop(); } else if (mode === "hold" && (event.key === " " || event.key === "Enter")) { event.preventDefault(); if (!event.repeat) recorder.armHold(); } }}
          onKeyUp={(event) => { if (mode === "hold" && (event.key === " " || event.key === "Enter")) { event.preventDefault(); recorder.releaseHold(); } }} onBlur={() => { if (mode === "hold") recorder.releaseHold(); }}
          onContextMenu={(event) => event.preventDefault()} onClick={() => { if (mode === "click") { if (busy) recorder.stop(); else recorder.start(); } }} />
      </div>
      <div className="flex min-w-0 flex-col items-start gap-4">
        <RecordMode value={mode} disabled={busy || saveLocked} onValueChange={(value) => { recorder.releaseHold(); setMode(value); }} />
        <p id={instructionId} className="text-sm text-muted-foreground">{instruction}</p>
        <Waveform active={recording} levels={recorder.levels} />
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-4">
      <Button {...save.buttonProps()} disabled={busy || saveLocked || !recorder.clips.length || recorder.saved} onClick={() => void save.run(() => recorder.save())}><ButtonFeedbackIcon status={save.buttonStatus()} />{save.loading ? "正在保存" : recorder.saveState === "error" ? "核对后重试保存" : "保存本次记录"}</Button>
      <Button variant="outline" onClick={() => { save.reset(); recorder.reset(); setMode("hold"); }}>重置本次记录</Button>
      <p role="status" className="wrap-anywhere text-sm text-muted-foreground">{recorder.notice}</p>
    </div>
    {recorder.clips.length ? <ul aria-label="本次访问的音频" className="flex min-w-0 flex-col gap-4">{recorder.clips.map((clip, index) => <AudioPreview key={clip.id} url={clip.url} index={index + 1} />)}</ul> : <p className="text-sm text-muted-foreground">暂无音频。完成录音后，可在此试听和保存。</p>}
    <p className="text-xs leading-6 text-muted-foreground">{onSave ? "明确保存时由宿主接收音频快照。重置或离开会清理本页音频，不会删除宿主已保存的数据。" : "音频仅保留在当前页面内存中。刷新、重置、离开或关闭页面后全部丢弃。"}</p>
  </div>;
}
