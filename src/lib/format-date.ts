/**
 * Formats an ISO timestamp from the backend for display.
 *
 * Uses the `-u-nu-latn` extension so digits render 0-9 rather than Arabic-Indic,
 * matching the rest of the proposal UI. Returns the raw value unchanged if it
 * isn't parseable, so a bad timestamp shows something rather than "Invalid Date".
 */
export function formatProposalDate(
  value: string | null | undefined,
  style: "short" | "medium" | "long" = "short",
): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ar-IQ-u-nu-latn", {
    dateStyle: style,
    timeStyle: "short",
  }).format(date);
}
