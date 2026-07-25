/**
 * Audio Chime and Desktop Push Notification Utilities for Admin Dashboard
 */

/**
 * Plays a pleasant, two-tone notification chime using standard Web Audio API.
 * Requires zero external audio files.
 */
export function playChimeNotification() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    // First tone (E5 - 659.25 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second tone (A5 - 880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.6);
  } catch {
    // Web Audio API unavailable or suppressed by browser policy
  }
}

/**
 * Requests desktop notification permission from the browser.
 */
export async function requestDesktopNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

/**
 * Displays a desktop push notification.
 */
export function showDesktopNotification(title: string, body: string, icon = "/logo.png") {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    try {
      new Notification(title, {
        body,
        icon,
        dir: "rtl",
        lang: "ar",
      });
    } catch {
      // Fallback if ServiceWorker notification registration is required on mobile
    }
  }
}
