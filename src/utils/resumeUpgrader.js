// Client-side premium resume upgrader
// Strategy: line-by-line improvements that fully preserve the original structure,
// formatting, dates, company names, and layout. We only touch bullet language and
// ATS vocabulary — nothing else moves.

const WEAK_VERB_REPLACEMENTS = [
  { pattern: /^helped\s+/i, replacement: "Supported " },
  { pattern: /^assisted\s+(with\s+)?/i, replacement: "Supported " },
  { pattern: /^worked on\s+/i, replacement: "Developed " },
  { pattern: /^was responsible for\s+/i, replacement: "Managed " },
  { pattern: /^participated in\s+/i, replacement: "Contributed to " },
  { pattern: /^involved in\s+/i, replacement: "Contributed to " },
  { pattern: /^part of\s+/i, replacement: "Contributed to " },
  { pattern: /^did\s+/i, replacement: "Completed " },
  { pattern: /^made\s+/i, replacement: "Built " },
  { pattern: /^tried to\s+/i, replacement: "Worked to " },
  { pattern: /^tasked with\s+/i, replacement: "Delivered " },
  { pattern: /^in charge of\s+/i, replacement: "Managed " },
];

const STRONG_VERB_STARTS = [
  "built", "developed", "designed", "created", "implemented", "led", "managed",
  "optimized", "delivered", "analyzed", "engineered", "launched", "improved",
  "automated", "resolved", "architected", "deployed", "maintained", "reduced",
  "increased", "streamlined", "integrated", "migrated", "refactored", "shipped",
  "established", "coordinated", "collaborated", "mentored", "contributed",
  "wrote", "tested", "debugged", "configured", "monitored", "scaled",
];

const ATS_SWAPS = [
  { from: /\bresponsible for\b/gi, to: "owned" },
  { from: /\bknowledge of\b/gi, to: "proficiency in" },
  { from: /\bfamiliar with\b/gi, to: "proficient in" },
  { from: /\bexperience with\b/gi, to: "hands-on experience with" },
  { from: /\bpassionate about\b/gi, to: "focused on" },
  { from: /\bteam player\b/gi, to: "collaborative contributor" },
  { from: /\bfast learner\b/gi, to: "quick to ramp on new technologies" },
  { from: /\bhard worker\b/gi, to: "high-output contributor" },
];

function isBulletLine(trimmed) {
  const noBullet = trimmed.replace(/^[-*•\u2022]\s*/, "").trim();
  const lower = noBullet.toLowerCase();
  if (STRONG_VERB_STARTS.some((v) => lower.startsWith(v + " ") || lower.startsWith(v + "."))) return true;
  if (WEAK_VERB_REPLACEMENTS.some(({ pattern }) => pattern.test(noBullet))) return true;
  return false;
}

function hasBulletChar(trimmed) {
  return /^[-*•\u2022]\s/.test(trimmed);
}

function upgradeBulletText(text) {
  let upgraded = text;

  // Replace weak openers
  for (const { pattern, replacement } of WEAK_VERB_REPLACEMENTS) {
    if (pattern.test(upgraded)) {
      upgraded = upgraded.replace(pattern, replacement).trim();
      break;
    }
  }

  // Apply ATS vocabulary swaps
  for (const { from, to } of ATS_SWAPS) {
    upgraded = upgraded.replace(from, to);
  }

  // Ensure ends with period
  upgraded = upgraded.trim();
  if (upgraded && !/[.!?]$/.test(upgraded)) {
    upgraded += ".";
  }

  // Capitalize first letter
  if (upgraded.length > 0) {
    upgraded = upgraded.charAt(0).toUpperCase() + upgraded.slice(1);
  }

  return upgraded;
}

function applyAtsSwapsOnly(text) {
  let result = text;
  for (const { from, to } of ATS_SWAPS) {
    result = result.replace(from, to);
  }
  return result;
}

function detectMissingItems(resumeText) {
  const missing = [];
  const lower = resumeText.toLowerCase();

  const hasPhone = /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(resumeText);
  if (!hasPhone) {
    missing.push({
      field: "Phone number",
      reason: "Add a phone number to your contact header. Recruiters and ATS systems expect it.",
    });
  }

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText);
  if (!hasEmail) {
    missing.push({
      field: "Email address",
      reason: "An email address is required for contact.",
    });
  }

  if (!lower.includes("linkedin")) {
    missing.push({
      field: "LinkedIn URL",
      reason: "Most technical applications expect a LinkedIn link in the header.",
    });
  }

  if (!lower.includes("github")) {
    missing.push({
      field: "GitHub URL",
      reason: "GitHub shows real code and initiative — add it to your header.",
    });
  }

  const hasSummary = /\b(summary|objective|profile|about me)\b/i.test(resumeText);
  if (!hasSummary) {
    missing.push({
      field: "Professional summary",
      reason: "A 2–3 sentence summary at the top lets recruiters immediately understand your fit.",
    });
  }

  const hasProjects = /\bprojects?\b/i.test(resumeText);
  if (!hasProjects) {
    missing.push({
      field: "Projects section",
      reason: "Personal or academic projects show initiative and hands-on skills for technical roles.",
    });
  }

  const metricCount = (resumeText.match(/\b\d+(?:\.\d+)?%|\$[\d,]+|\b[1-9]\d{1,}\b/g) || []).length;
  if (metricCount < 2) {
    missing.push({
      field: "Quantified achievements",
      reason: 'Add numbers to at least 2 bullets. Example: "reduced load time by 40%" or "served 500+ users".',
    });
  }

  return missing;
}

function buildSummary(resumeText, targetRole) {
  const lower = resumeText.toLowerCase();
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);

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

  const SKILL_SIGNALS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "React", "Node.js",
    "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "REST", "APIs",
  ];
  const found = SKILL_SIGNALS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 4);
  const skillPhrase = found.length ? found.join(", ") : "software development fundamentals";

  const roleLabel = targetRole
    ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
    : "Software Engineer";

  return (
    `${roleLabel} with ${eduPhrase}, bringing hands-on experience in ${skillPhrase}. ` +
    `Focused on writing clean, maintainable code and delivering reliable technical work. ` +
    `Looking to contribute technical depth, fast learning, and consistent execution in a team environment.`
  );
}

/**
 * Build the premium upgraded resume.
 *
 * Goes line-by-line through the original resume. Only changes:
 * - Bullet lines: upgrades weak verbs and ATS vocabulary
 * - Non-bullet lines: applies ATS vocabulary swaps only
 * - Injects a SUMMARY section after the contact header if missing
 *
 * Everything else — section order, dates, company names, indentation,
 * blank lines, formatting — is left exactly as-is.
 *
 * @param {string} resumeText  Original resume text
 * @param {string} targetRole  e.g. "software engineer"
 * @param {object} analysis    From resumeAnalyzer (unused but kept for API compat)
 * @returns {{ upgradedResume: string, missingItems: Array }}
 */
export function buildPremiumResume(resumeText = "", targetRole = "", analysis = {}) {
  const originalLines = resumeText.split("\n");
  const upgradedLines = [];

  for (const rawLine of originalLines) {
    const trimmed = rawLine.trim();

    if (!trimmed) {
      upgradedLines.push(rawLine);
      continue;
    }

    if (isBulletLine(trimmed)) {
      // Preserve the leading whitespace and bullet character, upgrade only the text
      const leadingMatch = rawLine.match(/^(\s*[-*•\u2022]?\s*)/);
      const leading = leadingMatch ? leadingMatch[1] : "";
      const bulletText = trimmed.replace(/^[-*•\u2022]\s*/, "");
      const upgraded = upgradeBulletText(bulletText);
      upgradedLines.push(leading + upgraded);
    } else {
      // Non-bullet line: apply ATS swaps only, preserve everything else
      upgradedLines.push(applyAtsSwapsOnly(rawLine));
    }
  }

  let upgradedText = upgradedLines.join("\n");

  // Inject a summary section after the first blank line (end of contact header)
  // if the resume doesn't already have one
  const hasSummary = /\b(summary|objective|profile|about me)\b/i.test(resumeText);
  if (!hasSummary) {
    const summary = buildSummary(resumeText, targetRole);
    const textLines = upgradedText.split("\n");
    // Find the first blank line (end of contact block)
    let insertAt = -1;
    for (let i = 0; i < textLines.length; i++) {
      if (!textLines[i].trim()) {
        insertAt = i + 1;
        break;
      }
    }
    if (insertAt === -1) insertAt = textLines.length;
    textLines.splice(insertAt, 0, "", "SUMMARY", summary, "");
    upgradedText = textLines.join("\n");
  }

  // Clean up excessive blank lines
  upgradedText = upgradedText.replace(/\n{3,}/g, "\n\n").trim();

  const missingItems = detectMissingItems(resumeText);

  return { upgradedResume: upgradedText, missingItems };
}

/** Download as plain text file */
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

/** Download as DOCX using the docx package */
export async function downloadResumeDocx(text = "", filename = "upgraded_resume.docx") {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const HEADING_RE = /^(SUMMARY|EDUCATION|EXPERIENCE|PROJECTS?|SKILLS?|WORK EXPERIENCE|TECHNICAL SKILLS?|LEADERSHIP|ACTIVITIES|CERTIFICATIONS?|PROFESSIONAL SUMMARY)/i;

  const lines = text.split("\n");
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    const isHeading = HEADING_RE.test(trimmed) && trimmed.length < 45;
    const isBullet = /^[-*•\u2022]/.test(trimmed);

    if (isHeading) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 26 })],
          spacing: { before: 180, after: 60 },
          border: { bottom: { style: "single", size: 6, color: "4353DF" } },
        })
      );
    } else if (isBullet) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: trimmed.replace(/^[-*•\u2022]\s*/, ""), size: 22 })],
          spacing: { after: 50 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22 })],
          spacing: { after: 50 },
        })
      );
    }
  }

  const doc = new Document({ sections: [{ properties: {}, children }] });
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
