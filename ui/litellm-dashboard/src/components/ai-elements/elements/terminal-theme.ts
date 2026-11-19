const COLOR_ROLES = {
  background: "background",
  foreground: "foreground",
  cursor: "cursor",
  cursorAccent: "cursor-accent",
  selectionBackground: "selection-background",
  selectionForeground: "selection-foreground",
  selectionInactiveBackground: "selection-inactive-background",
  scrollbarSliderBackground: "scrollbar",
  scrollbarSliderHoverBackground: "scrollbar-hover",
  scrollbarSliderActiveBackground: "scrollbar-active",
  black: "ansi-black",
  red: "ansi-red",
  green: "ansi-green",
  yellow: "ansi-yellow",
  blue: "ansi-blue",
  magenta: "ansi-magenta",
  cyan: "ansi-cyan",
  white: "ansi-white",
  brightBlack: "ansi-bright-black",
  brightRed: "ansi-bright-red",
  brightGreen: "ansi-bright-green",
  brightYellow: "ansi-bright-yellow",
  brightBlue: "ansi-bright-blue",
  brightMagenta: "ansi-bright-magenta",
  brightCyan: "ansi-bright-cyan",
  brightWhite: "ansi-bright-white",
} as const;

export type TerminalColors = { [Role in keyof typeof COLOR_ROLES]: string };

export type TerminalThemeSnapshot = {
  colors: TerminalColors;
  fontFamily: string;
  /** CSS pixel size, including the current density and font overrides. */
  fontSize: number;
  /** Unitless CSS line-height / font-size ratio, suitable for terminal engines. */
  lineHeight: number;
  warning: string;
  error: string;
};

/** Resolve CSS colors through the browser, then convert to sRGB accepted by canvas engines. */
export function readTerminalTheme(element: HTMLElement): TerminalThemeSnapshot {
  const document = element.ownerDocument;
  const view = document.defaultView;
  if (!view) throw new Error("Terminal theme requires a browser document.");
  const probe = document.createElement("span");
  probe.className = "forai-terminal-theme";
  probe.setAttribute("aria-hidden", "true");
  // The probe is an ordinary hidden element, with no text selection or focus effects.
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  element.append(probe);
  try {
    const computed = view.getComputedStyle(probe);
    const fontFamily = computed.fontFamily;
    const fontSize = Number.parseFloat(computed.fontSize);
    const cssLineHeight = Number.parseFloat(computed.lineHeight);
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Terminal theme requires a 2D color conversion context.");
    const resolve = (role: string) => {
      probe.style.color = `var(--terminal-${role})`;
      const color = view.getComputedStyle(probe).color;
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      const [red, green, blue, alpha] = context.getImageData(0, 0, 1, 1).data;
      return `#${[red, green, blue, alpha].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
    };
    const colors = Object.fromEntries(
      Object.entries(COLOR_ROLES).map(([key, role]) => [key, resolve(role)]),
    ) as TerminalColors;
    return {
      colors,
      fontFamily,
      fontSize,
      lineHeight: Number.isFinite(cssLineHeight) ? cssLineHeight / fontSize : 1.2,
      warning: resolve("warning"),
      error: resolve("error"),
    };
  } finally {
    probe.remove();
  }
}

/**
 * Emits the initial snapshot synchronously, then emits only changed values.
 * Updating an engine's options in the callback preserves its viewport and session.
 */
export function observeTerminalTheme(
  element: HTMLElement,
  onChange: (theme: TerminalThemeSnapshot) => void,
): () => void {
  const document = element.ownerDocument;
  const view = document.defaultView;
  if (!view) throw new Error("Terminal theme requires a browser document.");
  let disposed = false;
  let scheduled = 0;
  let previous = "";
  const measure = () => {
    scheduled = 0;
    if (disposed) return;
    const snapshot = readTerminalTheme(element);
    const signature = JSON.stringify(snapshot);
    if (signature === previous) return;
    previous = signature;
    onChange(snapshot);
  };
  const schedule = () => {
    if (!disposed && !scheduled) scheduled = view.requestAnimationFrame(measure);
  };
  const mutations = new view.MutationObserver(schedule);
  const resize = new view.ResizeObserver(schedule);
  // Only ancestors matter for inheritance; terminal output mutations are ignored.
  for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
    mutations.observe(ancestor, {
      attributes: true,
      attributeFilter: ["style", "class", "data-theme", "data-design-theme", "data-theme-preset", "data-layout-density", "data-follow-appearance"],
    });
    resize.observe(ancestor);
  }
  // The existing token editor replaces its stylesheet text before updating CSSOM rules.
  // Observe stylesheets separately, without watching terminal output or selection nodes.
  if (document.head) mutations.observe(document.head, { childList: true, characterData: true, subtree: true });
  const appearance = view.matchMedia("(prefers-color-scheme: dark)");
  appearance.addEventListener("change", schedule);
  document.fonts.addEventListener("loadingdone", schedule);
  view.addEventListener("resize", schedule);
  measure();
  return () => {
    disposed = true;
    if (scheduled) view.cancelAnimationFrame(scheduled);
    mutations.disconnect();
    resize.disconnect();
    appearance.removeEventListener("change", schedule);
    document.fonts.removeEventListener("loadingdone", schedule);
    view.removeEventListener("resize", schedule);
  };
}
