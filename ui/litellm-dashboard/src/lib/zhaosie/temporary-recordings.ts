export type TemporaryAudioClip = Readonly<{ id: string; url: string; bytes: number }>;
export type RecordingClipForSave = Readonly<{ id: string; audio: Blob; mimeType: string; bytes: number }>;
export type RecordingSaveRequest = Readonly<{ recordId: string; saveId: string; clips: readonly RecordingClipForSave[] }>;
export type RecordingSaveHandler = (request: RecordingSaveRequest, context: Readonly<{ signal: AbortSignal }>) => Promise<void>;
export type RecordingSaveState = "idle" | "saving" | "saved" | "error";

/** Visit scoped audio. Clearing also invalidates results from an older capture. */
export class TemporaryRecordings {
  private generation = 0;
  private clips: TemporaryAudioClip[] = [];
  private audio = new Map<string, Blob>();
  private recordId: string | null = null;
  private request: RecordingSaveRequest | null = null;
  private operation: AbortController | null = null;
  private state: RecordingSaveState = "idle";

  get epoch() { return this.generation; }
  get saveState() { return this.state; }
  /** Start the client visit after mounting, without random values during SSR. */
  begin() { this.recordId ??= crypto.randomUUID(); }
  isCurrent(epoch: number) { return epoch === this.generation; }
  snapshot() { return [...this.clips]; }

  append(epoch: number, audio: Blob) {
    if (!this.isCurrent(epoch) || audio.size === 0) return null;
    const clip = Object.freeze({ id: crypto.randomUUID(), url: URL.createObjectURL(audio), bytes: audio.size });
    this.clips.push(clip);
    this.audio.set(clip.id, audio);
    this.invalidateSave();
    return clip;
  }

  clear() {
    this.generation++;
    this.invalidateSave();
    this.recordId = crypto.randomUUID();
    this.clips.forEach(({ url }) => URL.revokeObjectURL(url));
    this.clips = [];
    this.audio.clear();
  }

  private invalidateSave() {
    const pending = this.operation;
    this.operation = null;
    this.request = null;
    this.state = "idle";
    pending?.abort();
  }

  async save(handler?: RecordingSaveHandler, onState?: (state: RecordingSaveState) => void): Promise<"ignored" | "memory" | "host" | "error" | "stale"> {
    if (!this.clips.length || this.state === "saving") return "ignored";
    this.begin();
    this.request ??= Object.freeze({
      recordId: this.recordId!, saveId: crypto.randomUUID(),
      clips: Object.freeze(this.clips.map(clip => {
        const audio = this.audio.get(clip.id)!;
        return Object.freeze({ id: clip.id, audio, mimeType: audio.type, bytes: audio.size });
      })),
    });
    const request = this.request;
    const epoch = this.epoch;
    if (!handler) { this.state = "saved"; onState?.("saved"); return "memory"; }
    const operation = new AbortController();
    this.operation = operation;
    this.state = "saving";
    onState?.("saving");
    const current = () => this.isCurrent(epoch) && this.operation === operation && this.request === request;
    try {
      await handler(request, Object.freeze({ signal: operation.signal }));
      if (!current()) return "stale";
      this.state = "saved";
      this.operation = null;
      onState?.("saved");
      return "host";
    } catch {
      if (!current()) return "stale";
      this.state = "error";
      this.operation = null;
      onState?.("error");
      return "error";
    }
  }
}
