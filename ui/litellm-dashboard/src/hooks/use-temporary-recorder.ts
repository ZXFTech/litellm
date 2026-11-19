"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createBrowserRecordingEnvironment, RecorderEngine, type CapturePhase } from "@/lib/zhaosie/recorder-engine";
import { TemporaryRecordings, type TemporaryAudioClip, type RecordingSaveHandler, type RecordingSaveState } from "@/lib/zhaosie/temporary-recordings";
export type { RecordingClipForSave, RecordingSaveRequest, RecordingSaveHandler, RecordingSaveState } from "@/lib/zhaosie/temporary-recordings";

const quietLevels = [0, 0, 0, 0, 0, 0, 0];
const quietInputNotice = "录音输入音量极低，可能听不清。请检查浏览器麦克风选择和设备输入音量。";
const meterUnavailableNotice = "正在录音，当前浏览器无法提供声波反馈。";

export function useTemporaryRecorder(options: { onSave?: RecordingSaveHandler } = {}) {
  const [recordings] = useState(() => new TemporaryRecordings());
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [clips, setClips] = useState<TemporaryAudioClip[]>([]);
  const [levels, setLevels] = useState(quietLevels);
  const [notice, setNotice] = useState("尚未录音");
  const [saveState, setSaveState] = useState<RecordingSaveState>("idle");
  const phaseRef = useRef<CapturePhase>("idle");
  const engineRef = useRef<RecorderEngine | null>(null);
  const held = useRef(false);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasQuietClips = useRef(false);

  const createEngine = useCallback(() => {
    recordings.begin();
    const epoch = recordings.epoch;
    let peakRmsDbfs: number | null = null;
    let meterUnavailable = false;
    let signalIncomplete = false;
    engineRef.current = new RecorderEngine(createBrowserRecordingEnvironment(), {
      onPhase: (value) => {
        if (!recordings.isCurrent(epoch)) return;
        if (value === "requesting") { peakRmsDbfs = null; meterUnavailable = false; signalIncomplete = false; }
        setPhase(value);
        phaseRef.current = value;
      },
      onLevels: (value, signal) => {
        if (!recordings.isCurrent(epoch)) return;
        if (signal) {
          peakRmsDbfs = Math.max(peakRmsDbfs ?? -Infinity, signal.rmsDbfs);
          if (meterUnavailable) { meterUnavailable = false; setNotice(""); }
        }
        setLevels([...value]);
      },
      onClip: (audio) => {
        try {
          if (!recordings.append(epoch, audio)) return;
          setClips(recordings.snapshot());
          setSaveState("idle");
          const quiet = !signalIncomplete && peakRmsDbfs !== null && peakRmsDbfs < -55;
          hasQuietClips.current ||= quiet;
          setNotice(quiet ? `音频已暂存。${quietInputNotice}` : signalIncomplete ? "音频已暂存，声波采样未完整，请试听确认录音效果。" : "音频已暂存，仅在本次访问中有效。");
        } catch {
          setNotice("暂时无法保留这段音频，请重新录制。");
        }
      },
      onError: (error) => {
        if (!recordings.isCurrent(epoch)) return;
        setNotice(error.name === "NotAllowedError" ? "麦克风权限未开启，请允许后重试。" : error.message || "暂时无法录音，请重试。");
      },
      onMeterUnavailable: () => {
        if (!recordings.isCurrent(epoch)) return;
        meterUnavailable = true;
        signalIncomplete = true;
        setNotice(meterUnavailableNotice);
      },
    });
  }, [recordings]);

  const releaseHold = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = null;
    if (held.current) { held.current = false; engineRef.current?.stop(); }
  }, []);

  const discard = useCallback(() => {
    // Invalidate callbacks before dispose can deliver its final audio event.
    recordings.clear();
    phaseRef.current = "idle";
    hasQuietClips.current = false;
    releaseHold();
    engineRef.current?.dispose();
    engineRef.current = null;
  }, [recordings, releaseHold]);

  // Cache Components hides pages with Activity, preserving their React state.
  // Discard before hiding so a later visit cannot restore revoked audio or busy UI.
  useLayoutEffect(() => () => {
    discard();
    setClips([]);
    setLevels(quietLevels);
    setPhase("idle");
    setSaveState("idle");
    setNotice("尚未录音");
  }, [discard]);

  useEffect(() => {
    createEngine();
    const background = () => { if (document.hidden) { releaseHold(); engineRef.current?.stop(); } };
    const pageHide = () => { discard(); setClips([]); setLevels(quietLevels); setPhase("idle"); setSaveState("idle"); setNotice("本次访问的内容已丢弃。"); };
    const pageShow = (event: PageTransitionEvent) => { if (event.persisted && !engineRef.current) createEngine(); };
    window.addEventListener("blur", releaseHold);
    window.addEventListener("pagehide", pageHide);
    window.addEventListener("pageshow", pageShow);
    document.addEventListener("visibilitychange", background);
    return () => {
      window.removeEventListener("blur", releaseHold);
      window.removeEventListener("pagehide", pageHide);
      window.removeEventListener("pageshow", pageShow);
      document.removeEventListener("visibilitychange", background);
    };
  }, [createEngine, discard, releaseHold]);

  function start() { if (recordings.saveState === "saving" || phaseRef.current !== "idle") return; setNotice(""); void engineRef.current?.start(); }
  function armHold() {
    if (phaseRef.current !== "idle" || recordings.saveState === "saving" || held.current) return;
    held.current = true;
    holdTimer.current = setTimeout(() => { holdTimer.current = null; if (held.current) start(); }, 260);
  }
  function reset() {
    discard();
    setClips([]);
    setLevels(quietLevels);
    setPhase("idle");
    setSaveState("idle");
    setNotice("已重置，本次访问的音频已丢弃。");
    createEngine();
  }
  async function save() {
    if (phaseRef.current !== "idle" || recordings.saveState === "saving" || !recordings.snapshot().length) return false;
    const epoch = recordings.epoch;
    if (options.onSave) setNotice("正在保存，请等待宿主确认。");
    const result = await recordings.save(options.onSave, setSaveState);
    if (!recordings.isCurrent(epoch) || result === "stale" || result === "ignored") return false;
    setNotice(result === "host" ? "宿主已确认保存本次记录。" : result === "error"
      ? "保存未确认，音频仍可试听。请先核对宿主结果，再明确重试。"
      : `已保存 ${recordings.snapshot().length} 段音频，仅在本次访问中有效。${hasQuietClips.current ? quietInputNotice : ""}`);
    return result !== "error";
  }

  return { phase, clips, levels, notice, saved: saveState === "saved", saveState, start, armHold, releaseHold, stop: () => engineRef.current?.stop(), reset, save };
}
