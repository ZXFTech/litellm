export type CapturePhase = "idle" | "requesting" | "recording" | "stopping";

export type RecordingSignal = Readonly<{ rmsDbfs: number }>;

export interface RecordingEnvironment {
  getStream: () => Promise<MediaStream>;
  createRecorder: (stream: MediaStream) => MediaRecorder;
  startMeter: (stream: MediaStream, onLevels: (levels: number[], signal?: RecordingSignal) => void, onUnavailable?: () => void) => () => void;
}

interface RecordingCallbacks {
  onPhase: (phase: CapturePhase) => void;
  onClip: (audio: Blob) => void;
  onError: (error: Error) => void;
  onLevels: (levels: number[], signal?: RecordingSignal) => void;
  onMeterUnavailable?: () => void;
}

/** Owns a single microphone request, including cancellation before permission arrives. */
export class RecorderEngine {
  private environment: RecordingEnvironment;
  private callbacks: RecordingCallbacks;
  private generation = 0;
  private disposed = false;
  private phase: CapturePhase = "idle";
  private recorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private stopMeter: (() => void) | null = null;

  constructor(environment: RecordingEnvironment, callbacks: RecordingCallbacks) {
    this.environment = environment;
    this.callbacks = callbacks;
  }

  private setPhase(phase: CapturePhase) {
    this.phase = phase;
    if (!this.disposed) this.callbacks.onPhase(phase);
  }

  private releaseResources() {
    this.stopMeter?.();
    this.stopMeter = null;
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
    this.callbacks.onLevels([0, 0, 0, 0, 0, 0, 0]);
  }

  async start() {
    if (this.disposed || this.phase !== "idle") return;
    const generation = ++this.generation;
    this.setPhase("requesting");
    try {
      const stream = await this.environment.getStream();
      if (this.disposed || generation !== this.generation) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      this.stream = stream;
      const recorder = this.environment.createRecorder(stream);
      const chunks: Blob[] = [];
      this.recorder = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      recorder.onstop = () => {
        // The final dataavailable event precedes stop. Never publish a partial block.
        const audio = new Blob(chunks, { type: recorder.mimeType || chunks[0]?.type || "audio/webm" });
        this.releaseResources();
        this.recorder = null;
        if (audio.size > 0) this.callbacks.onClip(audio);
        else if (!this.disposed) this.callbacks.onError(new Error("没有采集到音频，请再试一次。"));
        this.setPhase("idle");
      };
      recorder.onerror = (event) => {
        const error = (event as Event & { error?: DOMException }).error;
        this.callbacks.onError(error ?? new Error("录音被中断，已采集的内容会尝试保留。"));
        this.stop();
      };
      stream.getAudioTracks().forEach((track) => track.addEventListener("ended", () => this.stop(), { once: true }));
      recorder.start(1000);
      this.setPhase("recording");
      try {
        this.stopMeter = this.environment.startMeter(stream, this.callbacks.onLevels, this.callbacks.onMeterUnavailable);
      } catch {
        // Visual feedback must never prevent the original audio from being recorded.
        this.callbacks.onMeterUnavailable?.();
      }
    } catch (error) {
      if (this.disposed || generation !== this.generation) return;
      this.releaseResources();
      this.recorder = null;
      this.setPhase("idle");
      this.callbacks.onError(error instanceof Error ? error : new Error("暂时无法使用麦克风，请重试。"));
    }
  }

  stop() {
    ++this.generation;
    if (this.phase === "requesting") {
      this.setPhase("idle");
      return;
    }
    if (this.phase !== "recording" || !this.recorder) return;
    this.setPhase("stopping");
    if (this.recorder.state !== "inactive") this.recorder.stop();
    this.releaseResources();
  }

  dispose() {
    this.stop();
    this.disposed = true;
  }
}

export function createBrowserRecordingEnvironment(): RecordingEnvironment {
  return {
    async getStream() {
      if (!globalThis.isSecureContext || !navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) {
        throw new DOMException("请使用 HTTPS 或本机浏览器打开，才能进行真实录音。", "NotSupportedError");
      }
      return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true }, video: false });
    },
    createRecorder(stream) {
      const mimeType = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((type) => MediaRecorder.isTypeSupported(type));
      return new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    },
    startMeter(stream, onLevels, onUnavailable) {
      const Context = globalThis.AudioContext ?? (globalThis as typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Context) throw new Error("Audio analyser unavailable");
      const context = new Context();
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      const source = context.createMediaStreamSource(stream);
      source.connect(analyser);
      const samples = new Float32Array(analyser.fftSize);
      const levels = Array<number>(7).fill(0);
      const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
      let frame = 0;
      let lastSample = 0;
      let stopped = false;
      let resumeFinished = false;
      let unavailableReported = false;
      const sample = (now: number) => {
        if (stopped) return;
        if (context.state !== "running") {
          if (resumeFinished && !unavailableReported) {
            unavailableReported = true;
            onLevels(levels.fill(0));
            onUnavailable?.();
          }
          frame = requestAnimationFrame(sample);
          return;
        }
        unavailableReported = false;
        if (now - lastSample >= (reducedMotion.matches ? 180 : 45)) {
          lastSample = now;
          analyser.getFloatTimeDomainData(samples);
          const width = Math.floor(samples.length / levels.length);
          for (let bar = 0; bar < levels.length; bar++) {
            let energy = 0;
            for (let index = bar * width; index < (bar + 1) * width; index++) {
              const amplitude = samples[index];
              energy += amplitude * amplitude;
            }
            const rms = Math.sqrt(energy / width);
            // Keep quiet signals visible without confusing display gain with recording volume.
            const dbfs = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
            const measured = Math.min(1, Math.max(0, (dbfs + 90) / 72));
            levels[bar] += (measured - levels[bar]) * (measured > levels[bar] ? 0.65 : 0.16);
          }
          const rms = Math.sqrt(samples.reduce((energy, value) => energy + value * value, 0) / samples.length);
          onLevels(levels, { rmsDbfs: rms > 0 ? 20 * Math.log10(rms) : -Infinity });
        }
        frame = requestAnimationFrame(sample);
      };
      void context.resume().then(() => { resumeFinished = true; }, () => { resumeFinished = true; });
      frame = requestAnimationFrame(sample);
      return () => {
        if (stopped) return;
        stopped = true;
        cancelAnimationFrame(frame);
        source.disconnect();
        analyser.disconnect();
        void context.close().catch(() => {});
      };
    },
  };
}
