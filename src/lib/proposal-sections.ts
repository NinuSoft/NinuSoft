export type ProposalSection = {
  id: string;
  title: string;
  content: string;
};

/**
 * Parses markdown string into discrete sections.
 * Supports explicit `<!-- section: Title -->` markers,
 * or splits by top-level `# Title` headings if multiple exist.
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
      const title = match[1].trim() || `القسم ${i + 1}`;
      const startIndex = match.index! + match[0].length;
      const endIndex = i < matches.length - 1 ? matches[i + 1].index! : normalized.length;
      const content = normalized.slice(startIndex, endIndex).trim();
      sections.push({
        id: `sec-${i + 1}`,
        title,
        content,
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
 */
export function serializeProposalSections(sections: ProposalSection[]): string {
  if (!sections || sections.length === 0) return "";
  if (sections.length === 1 && sections[0].title === "محتوى العرض") {
    return sections[0].content.trim();
  }
  return sections
    .map((sec) => `<!-- section: ${sec.title.trim()} -->\n${sec.content.trim()}`)
    .join("\n\n");
}
