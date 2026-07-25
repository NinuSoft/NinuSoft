/**
 * Utility to navigate and temporarily highlight quoted text snippets in the DOM (Telegram-style quote jump).
 */
export function jumpToQuotedText(selectedText: string): boolean {
  if (!selectedText || !selectedText.trim()) return false;
  const needle = selectedText.trim().toLowerCase();

  // Search within proposal main content area first, fallback to article/main or body
  const container =
    document.querySelector(".proposal-content") ||
    document.querySelector("article") ||
    document.body;

  const elements = Array.from(
    container.querySelectorAll("p, li, h1, h2, h3, h4, h5, h6, blockquote, tr, td, span, code"),
  );

  // Find shortest matching element containing the quoted text to target exact line/paragraph
  let bestMatch: HTMLElement | null = null;
  let minLength = Infinity;

  for (const el of elements) {
    const text = (el.textContent || "").toLowerCase();
    if (text.includes(needle)) {
      if (text.length < minLength) {
        minLength = text.length;
        bestMatch = el as HTMLElement;
      }
    }
  }

  if (bestMatch) {
    bestMatch.scrollIntoView({ behavior: "smooth", block: "center" });

    // Apply temporary pulse highlight animation
    const originalTransition = bestMatch.style.transition;
    const originalBackground = bestMatch.style.backgroundColor;
    const originalBoxShadow = bestMatch.style.boxShadow;
    const originalBorderRadius = bestMatch.style.borderRadius;

    bestMatch.style.transition = "all 0.4s ease-in-out";
    bestMatch.style.backgroundColor = "rgba(245, 158, 11, 0.35)"; // Amber highlight
    bestMatch.style.boxShadow = "0 0 0 4px rgba(245, 158, 11, 0.4)";
    bestMatch.style.borderRadius = "6px";

    // Flash pulse effect
    setTimeout(() => {
      bestMatch!.style.backgroundColor = "rgba(245, 158, 11, 0.55)";
    }, 400);

    setTimeout(() => {
      bestMatch!.style.backgroundColor = originalBackground;
      bestMatch!.style.boxShadow = originalBoxShadow;
      bestMatch!.style.borderRadius = originalBorderRadius;
      setTimeout(() => {
        bestMatch!.style.transition = originalTransition;
      }, 400);
    }, 1800);

    return true;
  }

  return false;
}
