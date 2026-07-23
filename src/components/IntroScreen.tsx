import { useEffect } from "react";

interface IntroScreenProps {
  onComplete?: () => void;
}

declare global {
  interface Window {
    __nsReactMounted?: () => void;
    __nsReactReady?: () => void;
  }
}

/**
 * Zero-render bridge component.
 *
 * The visible intro overlay lives in index.html as pure HTML/CSS/JS so it
 * appears instantly before the React bundle loads.
 *
 * This component does three things on mount:
 *  1. Signals to the HTML intro that React bundle has loaded via window.__nsReactMounted().
 *  2. Preloads the large homepage images (hero-gate and cta-gate) and signals
 *     readiness via window.__nsReactReady() once they have fully loaded.
 *  3. Watches for the HTML overlay to be removed from the DOM, then calls
 *     onComplete() so the React app knows to display itself.
 */
export default function IntroScreen({ onComplete }: IntroScreenProps) {
  useEffect(() => {
    const introEl = document.getElementById("ns-intro");

    // Overlay already gone (bundle was very slow or already seen in session)
    if (!introEl) {
      document.body.classList.remove("ns-loading");
      onComplete?.();
      return;
    }

    // Watch for the overlay to be removed from the DOM
    const observer = new MutationObserver(() => {
      if (!document.getElementById("ns-intro")) {
        observer.disconnect();
        onComplete?.();
      }
    });
    observer.observe(document.body, { childList: true, subtree: false });

    // 1. Signal that React JS is mounted and is now loading images
    if (typeof window.__nsReactMounted === "function") {
      window.__nsReactMounted();
    }

    // 2. Preload critical above-the-fold homepage images in the background
    const imagesToLoad = ["/hero-gate.webp"];
    let loadedCount = 0;
    let signalled = false;

    const signalReady = () => {
      if (signalled) return;
      signalled = true;
      if (typeof window.__nsReactReady === "function") {
        window.__nsReactReady();
      }
    };

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === imagesToLoad.length) {
        signalReady();
      }
    };

    // Safety fallback: if images take too long to load on very slow network,
    // signal ready anyway at 6 seconds so the user isn't stuck forever.
    const fallbackTimer = setTimeout(signalReady, 6000);

    imagesToLoad.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded; // don't get stuck on broken image links
      }
    });

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
