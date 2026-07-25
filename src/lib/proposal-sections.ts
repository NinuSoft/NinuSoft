export type ProposalSection = {
  /** Position-derived key used for navigation and anchors. Not stable. */
  id: string;
  /**
   * Immutable identity written into the markdown marker. Signatures bind to
   * this, so it must survive renaming and reordering. Absent on legacy
   * proposals authored before per-section signing.
   */
  stableId?: string;
  title: string;
  content: string;
  hasSignature?: boolean;
};

/** Identity for a signature that predates per-section signing. */
export const DOCUMENT_SECTION_ID = "__document__";

/**
 * Mints an id for a new section. Random rather than derived from the title so
 * that renaming a section never silently detaches its signature.
 */
export function createSectionStableId(): string {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `s_${random}`;
}

/**
 * Assigns a stable id to every signable section that lacks one.
 *
 * Call this on editor state before serializing. Minting inside the serializer
 * alone would hand out a fresh id on each save, detaching existing signatures.
 */
export function ensureSectionStableIds(
  sections: ProposalSection[],
): ProposalSection[] {
  return sections.map((sec) =>
    sec.hasSignature && !sec.stableId
      ? { ...sec, stableId: createSectionStableId() }
      : sec,
  );
}

/** Reads `key: value` pairs from the part of a marker after the title. */
function parseMarkerMeta(metaParts: string[]): {
  hasSignature: boolean;
  stableId?: string;
} {
  const meta = metaParts.join("|");
  const lower = meta.toLowerCase();
  const idMatch = meta.match(/\bid:\s*([A-Za-z0-9_-]+)/i);
  // `signature` with no value is treated as enabled, matching the original
  // lenient behaviour, but an explicit `signature: false` must win.
  const hasSignature =
    /\bsignature:\s*false\b/i.test(lower) === false && lower.includes("signature");
  return { hasSignature, stableId: idMatch ? idMatch[1] : undefined };
}

/**
 * Parses markdown string into discrete sections.
 * Supports explicit `<!-- section: Title | id: s_xxx | signature: true -->`
 * markers, or splits by top-level `# Title` headings if multiple exist.
 */
export function parseProposalSections(markdown: string): ProposalSection[] {
  if (!markdown || !markdown.trim()) {
    return [{ id: "sec-1", title: "محتوى العرض", content: "" }];
  }

  const normalized = markdown.replace(/\r\n/g, "\n");

  // 1. Check for explicit section comments: <!-- section: Title -->
  const sectionCommentRegex = /<!--\s*section:\s*(.*?)\s*-->/gi;
  const matches = [...normalized.matchAll(sectionCommentRegex)];

  if (matches.length > 0) {
    const sections: ProposalSection[] = [];
    
    // Check preamble before first section marker
    const preamble = normalized.slice(0, matches[0].index!).trim();
    if (preamble) {
      sections.push({
        id: "sec-intro",
        title: "المقدمة",
        content: preamble,
      });
    }

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const rawTitle = match[1].trim();
      let title = rawTitle;
      let hasSignature = false;
      let stableId: string | undefined;

      if (rawTitle.includes("|")) {
        const parts = rawTitle.split("|");
        title = parts[0].trim();
        const meta = parseMarkerMeta(parts.slice(1));
        hasSignature = meta.hasSignature;
        stableId = meta.stableId;
      }
      if (!title) title = `القسم ${i + 1}`;

      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : normalized.length;
      const content = normalized.slice(startIndex, endIndex).trim();
      sections.push({
        id: `sec-${i + 1}`,
        stableId,
        title,
        content,
        hasSignature,
      });
    }
    
    if (sections.length > 0) return sections;
  }

  // 2. Fallback: Split by top-level `# Title` headings if multiple exist
  const h1Regex = /^#\s+(.+)$/gm;
  const h1Matches = [...normalized.matchAll(h1Regex)];

  if (h1Matches.length > 1) {
    const sections: ProposalSection[] = [];
    
    const preamble = normalized.slice(0, h1Matches[0].index!).trim();
    if (preamble) {
      sections.push({
        id: "sec-intro",
        title: "المقدمة",
        content: preamble,
      });
    }

    for (let i = 0; i < h1Matches.length; i++) {
      const match = h1Matches[i];
      const title = match[1].trim();
      const startIndex = match.index!;
      const endIndex = i < h1Matches.length - 1 ? h1Matches[i + 1].index! : normalized.length;
      const content = normalized.slice(startIndex, endIndex).trim();
      sections.push({
        id: `sec-${i + 1}`,
        title,
        content,
      });
    }

    if (sections.length > 0) return sections;
  }

  // 3. Single section fallback
  return [
    {
      id: "sec-main",
      title: "محتوى العرض",
      content: normalized.trim(),
    },
  ];
}

/**
 * Serializes array of sections back into a single markdown string with section markers.
 *
 * Sections that can be signed are given a stable id if they lack one, so a
 * signature keeps pointing at the same section after a rename or reorder.
 */
export function serializeProposalSections(sections: ProposalSection[]): string {
  if (!sections || sections.length === 0) return "";
  if (sections.length === 1 && sections[0].title === "محتوى العرض" && !sections[0].hasSignature) {
    return sections[0].content.trim();
  }
  return sections
    .map((sec) => {
      const stableId = sec.hasSignature
        ? sec.stableId || createSectionStableId()
        : sec.stableId;
      const idMeta = stableId ? ` | id: ${stableId}` : "";
      const sigMeta = sec.hasSignature ? " | signature: true" : "";
      return `<!-- section: ${sec.title.trim()}${idMeta}${sigMeta} -->\n${sec.content.trim()}`;
    })
    .join("\n\n");
}
