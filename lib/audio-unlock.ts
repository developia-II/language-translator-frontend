// Utility to unlock audio playback on mobile browsers (iOS/Android)
// Call ensureAudioUnlocked() in a direct user gesture before any async work.

let unlocked = false;
let unlocking = false;

type WindowWithWebkitAC = Window & {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
};

export async function ensureAudioUnlocked(): Promise<void> {
  if (typeof window === "undefined") return;
  if (unlocked || unlocking) return;
  unlocking = true;
  try {
    // Try to resume a Web Audio context (iOS Safari requirement)
    const win = window as WindowWithWebkitAC;
    const AC: typeof AudioContext | undefined = win.AudioContext || win.webkitAudioContext;
    if (AC) {
      const ctx = new AC();
      if (ctx.state === "suspended") {
        try { await ctx.resume(); } catch { /* noop */ }
      }
      // Create and play a short silent buffer to fully unlock
      try {
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      } catch { /* noop */ }
      // Close if supported to avoid leaking contexts
      try { await ctx.close(); } catch { /* noop */ }
    }

    // Also try playing a silent HTMLAudioElement
    try {
      const a = new Audio();
      a.setAttribute("playsinline", "true");
      a.muted = true;
      // Minimal WAV data URI header signifying (near) silence
      a.src = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAAAB3AQACABAAZGF0YQAAAAA=";
      await a.play().catch(() => { /* ignore */ });
      a.pause();
      a.removeAttribute("src");
      a.load();
    } catch { /* noop */ }

    unlocked = true;
  } finally {
    unlocking = false;
  }
}
