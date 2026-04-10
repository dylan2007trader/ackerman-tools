// Client-side premium resume upgrader
// Strategy: parse original resume, make targeted improvements, flag missing items for manual addition

const WEAK_VERB_PATTERNS = [
  { pattern: /^helped\s+/i, replacement: "Supported" },
  { pattern: /^assisted\s+/i, replacement: "Supported" },
  { pattern: /^worked on\s+/i, replacement: "Developed" },
  { pattern: /^was responsible for\s+/i, replacement: "Managed" },
  { pattern: /^participated in\s+/i, replacement: "Contributed to" },
  { pattern: /^involved in\s+/i, replacement: "Contributed to" },
  { pattern: /^part of\s+/i, replacement: "Contributed to" },
  { pattern: /^did\s+/i, replacement: "Completed" },
  { pattern: /^made\s+/i, replacement: "Built" },
  { pattern: /^tried to\s+/i, replacement: "Worked to" },
];

const STRONG_STARTERS = [
  "built", "developed", "designed", "created", "implemented", "led", "managed",
  "optimized", "delivered", "analyzed", "engineered", "launched", "improved",
  "automated", "resolved", "architected", "deployed", "maintained", "reduced",
  "increased", "streamlined", "integrated", "migrated", "refactored", "shipped",
  "established", "coordinated", "collaborated", "mentored", "contributed",
];

const ATS_UPGRADES = [
  { weak: /\bcode review/gi, strong: "code review process" },
  { weak: /\bteam player/gi, strong: "cross-functional collaboration" },
  { weak: /\bfast learner/gi, strong: "rapid technical onboarding" },
  { weak: /\bhard worker/gi, strong: "high-output contributor" },
  { weak: /\bpassionate about/gi, strong: "focused on" },
  { weak: /\bresponsible for/gi, strong: "owned" },
  { weak: /\bknowledge of/gi, strong: "proficiency in" },
  { weak: /\bexperience with/gi, strong: "hands-on experience with" },
  { weak: /\bfamiliar with/gi, strong: "proficient in" },
];

function normalizeWhitespace(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanLine(line = "") {
  return normalizeWhitespace(
    String(line || "").replace(/^[-*•\u2022\s]+/, "").trim()
  );
}

function ensureSentence(text = "") {
  const clean = normalizeWhitespace(text);
  if (!clean) return "";
  const first = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

function extractLines(text = "") {
  return String(text || "")
    .split("\n")
    .map((l) => cleanLine(l))
    .filter(Boolean);
}

function isBulletLine(line = "") {
  const lower = line.toLowerCase();
  return STRONG_STARTERS.some((v) => lower.startsWith(v)) ||
    WEAK_VERB_PATTERNS.some(({ pattern }) => pattern.test(line));
}

function upgradeBullet(line = "") {
  let upgraded = line;

  // Replace weak openers
  for (const { pattern, replacement } of WEAK_VERB_PATTERNS) {
    if (pattern.test(upgraded)) {
      upgraded = upgraded.replace(pattern, `${replacement} `).trim();
      break;
    }
  }

  // Apply ATS vocabulary upgrades
  for (const { weak, strong } of ATS_UPGRADES) {
    upgraded = upgraded.replace(weak, strong);
  }

  return ensureSentence(upgraded);
}

function detectMissingItems(resumeText = "", analysis = {}) {
  const missing = [];
  const lower = resumeText.toLowerCase();

  // Phone number
  const hasPhone = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(resumeText);
  if (!hasPhone) {
    missing.push({ field: "Phone number", reason: "Recruiters and ATS systems expect a phone number in the contact header." });
  }

  // Email
  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  if (!hasEmail) {
    missing.push({ field: "Email address", reason: "An email address is required for contact." });
  }

  // LinkedIn
  if (!lower.includes("linkedin")) {
    missing.push({ field: "LinkedIn URL", reason: "Most technical job applications expect a LinkedIn profile link." });
  }

  // GitHub
  if (!lower.includes("github")) {
    missing.push({ field: "GitHub URL", reason: "For technical roles, GitHub shows real code and initiative beyond the resume." });
  }

  // Professional summary
  const hasSummary = /summary|objective|profile|about me/i.test(resumeText);
  if (!hasSummary) {
    missing.push({ field: "Professional summary", reason: "A 2–3 sentence summary at the top lets recruiters immediately understand your fit." });
  }

  // Projects section
  const hasProjects = /project/i.test(resumeText);
  if (!hasProjects) {
    missing.push({ field: "Projects section", reason: "For technical roles, personal or academic projects show initiative and hands-on skills." });
  }

  // Quantified bullet (at least 2)
  const metricMatches = (resumeText.match(/\b\d+(?:\.\d+)?%|\$\d+|\b\d{2,}\b/g) || []).length;
  if (metricMatches < 2) {
    missing.push({ field: "Quantified achievements", reason: 'Add numbers to at least 2–3 bullets (e.g., "reduced load time by 40%", "served 500+ users").' });
  }

  return missing;
}

function buildSummary(resumeText = "", targetRole = "") {
  const lower = resumeText.toLowerCase();
  const lines = extractLines(resumeText);

  // Extract education line
  const eduLine = lines.find((l) =>
    /university|college|bachelor|master|degree|b\.s\.|b\.a\./i.test(l)
  ) || "";

  const eduPhrase = eduLine
    ? eduLine
        .replace(/education/i, "")
        .replace(/gpa[^,.;]*/gi, "")
        .replace(/\s{2,}/g, " ")
        .trim()
        .toLowerCase()
    : "a computer science background";

  // Detect top skills mentioned
  const SKILL_SIGNALS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "React", "Node.js",
    "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "REST", "APIs",
  ];
  const detectedSkills = SKILL_SIGNALS.filter((s) =>
    lower.includes(s.toLowerCase())
  ).slice(0, 4);

  const skillPhrase = detectedSkills.length
    ? detectedSkills.join(", ")
    : "software development fundamentals";

  const roleLabel = targetRole
    ? `${targetRole.charAt(0).toUpperCase()}${targetRole.slice(1)}`
    : "Software Engineer";

  return [
    `${roleLabel} with ${eduPhrase}, bringing hands-on experience in ${skillPhrase}.`,
    `Focused on writing clean, maintainable code and delivering reliable technical work.`,
    `Looking to contribute technical depth, fast learning, and consistent execution in a team environment.`,
  ].join(" ");
}

function parseResumeSections(resumeText = "") {
  const lines = resumeText.split("\n");
  const sections = [];
  let currentSection = { heading: null, lines: [] };

  const SECTION_HEADINGS = /^(education|experience|projects?|skills?|summary|objective|profile|work experience|technical skills?|leadership|activities|awards?|certifications?)/i;

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      currentSection.lines.push("");
      continue;
    }

    const isHeading =
      SECTION_HEADINGS.test(trimmed) &&
      trimmed.length < 40 &&
      !/[a-z]{3,}\s+[a-z]{3,}\s+[a-z]{3,}/i.test(trimmed); // not a sentence

    if (isHeading) {
      if (currentSection.heading !== null || currentSection.lines.some((l) => l.trim())) {
        sections.push({ ...currentSection });
      }
      currentSection = { heading: trimmed, lines: [] };
    } else {
      currentSection.lines.push(rawLine);
    }
  }

  if (currentSection.heading !== null || currentSection.lines.some((l) => l.trim())) {
    sections.push({ ...currentSection });
  }

  return sections;
}

function upgradeSection(section) {
  const upgradedLines = section.lines.map((rawLine) => {
    const trimmed = rawLine.trim();
    const cleaned = cleanLine(trimmed);

    if (!cleaned) return rawLine;

    if (isBulletLine(cleaned)) {
      const upgraded = upgradeBullet(cleaned);
      // Preserve original leading whitespace/bullet character
      const leadingBullet = rawLine.match(/^[\s]*[-*•\u2022]?\s*/)?.[0] || "";
      return `${leadingBullet}${upgraded}`;
    }

    // Apply ATS vocabulary upgrades to non-bullet lines too
    let upgraded = trimmed;
    for (const { weak, strong } of ATS_UPGRADES) {
      upgraded = upgraded.replace(weak, strong);
    }
    return rawLine === trimmed ? upgraded : rawLine.replace(trimmed, upgraded);
  });

  return { ...section, lines: upgradedLines };
}

function sectionsToText(sections) {
  return sections
    .map((section) => {
      const lines = [];
      if (section.heading) lines.push(section.heading);
      lines.push(...section.lines);
      return lines.join("\n");
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Build the premium upgraded resume.
 * Keeps the original structure, improves bullet language and ATS vocabulary,
 * adds a summary if missing, and returns a list of items to add manually.
 *
 * @param {string} resumeText - original resume text
 * @param {string} targetRole - e.g. "software engineer"
 * @param {object} analysis - from resumeAnalyzer.analyzeResume()
 * @returns {{ upgradedResume: string, missingItems: Array<{field: string, reason: string}> }}
 */
export function buildPremiumResume(resumeText = "", targetRole = "", analysis = {}) {
  const sections = parseResumeSections(resumeText);

  // Upgrade each section's bullet lines
  const upgradedSections = sections.map(upgradeSection);

  // Check if a summary section exists
  const hasSummary = upgradedSections.some((s) =>
    s.heading && /summary|objective|profile/i.test(s.heading)
  );

  // Build upgraded text
  let upgradedText = sectionsToText(upgradedSections);

  // If no summary, inject one after the contact header (first section with no heading)
  if (!hasSummary) {
    const summary = buildSummary(resumeText, targetRole);
    const contactSection = upgradedSections.find((s) => !s.heading);
    if (contactSection) {
      const contactText = [contactSection.heading, ...contactSection.lines]
        .filter((l) => l !== null)
        .join("\n")
        .trim();
      const rest = upgradedSections
        .slice(1)
        .map((s) => {
          const lines = [];
          if (s.heading) lines.push(s.heading);
          lines.push(...s.lines);
          return lines.join("\n");
        })
        .join("\n");

      upgradedText = `${contactText}\n\nSUMMARY\n${summary}\n\n${rest}`
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    } else {
      upgradedText = `SUMMARY\n${summary}\n\n${upgradedText}`;
    }
  }

  const missingItems = detectMissingItems(resumeText, analysis);

  return { upgradedResume: upgradedText, missingItems };
}

/**
 * Download a string as a plain text file.
 */
export function downloadResumeText(text = "", filename = "upgraded_resume.txt") {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download the upgraded resume as a DOCX file using the docx package.
 */
export async function downloadResumeDocx(text = "", filename = "upgraded_resume.docx") {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  const lines = text.split("\n");
  const children = [];

  const SECTION_HEADINGS_RE = /^(SUMMARY|EDUCATION|EXPERIENCE|PROJECTS?|SKILLS?|WORK EXPERIENCE|TECHNICAL SKILLS?|LEADERSHIP|ACTIVITIES|CERTIFICATIONS?)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    const isBullet = /^[•\-*]/.test(trimmed) || /^[A-Z][a-z]+(ed|d|led|ned|red|ted)\s/.test(trimmed);
    const isHeading = SECTION_HEADINGS_RE.test(trimmed) && trimmed.length < 40;

    if (isHeading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 26 })],
          spacing: { before: 200, after: 80 },
          border: { bottom: { style: "single", size: 6, color: "4353DF" } },
        })
      );
    } else if (isBullet) {
      const bulletText = trimmed.replace(/^[•\-*]\s*/, "");
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: bulletText, size: 22 })],
          spacing: { after: 60 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { after: 60 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
