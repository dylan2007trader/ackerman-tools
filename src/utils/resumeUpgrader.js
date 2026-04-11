// Three-variant premium resume upgrader
// Variant 1 — Technical Depth: implementation-forward, tools and architecture
// Variant 2 — Impact & Scope: delivery-forward, outcomes and scale
// Variant 3 — Clean Academic: formal structure, credential-forward, Alyssa-style

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

// Each angle has its own verb replacement table. Order matters — more specific first.
const VERB_REPLACEMENTS = {
  technical: [
    { pattern: /^currently working on\s+/i, replacement: "Engineering " },
    { pattern: /^built\s+and\s+launched\s+/i, replacement: "Engineered and deployed " },
    { pattern: /^built\s+and\s+/i, replacement: "Engineered and " },
    { pattern: /^helped\s+/i, replacement: "Supported " },
    { pattern: /^assisted\s+(with\s+)?/i, replacement: "Supported " },
    { pattern: /^worked on\s+/i, replacement: "Engineered " },
    { pattern: /^was responsible for\s+/i, replacement: "Owned " },
    { pattern: /^participated in\s+/i, replacement: "Contributed to " },
    { pattern: /^involved in\s+/i, replacement: "Contributed to " },
    { pattern: /^part of\s+/i, replacement: "Contributed to " },
    { pattern: /^did\s+/i, replacement: "Executed " },
    { pattern: /^made\s+/i, replacement: "Constructed " },
    { pattern: /^tried to\s+/i, replacement: "Worked to " },
    { pattern: /^tasked with\s+/i, replacement: "Engineered " },
    { pattern: /^in charge of\s+/i, replacement: "Architected " },
    { pattern: /^built\s+/i, replacement: "Engineered " },
    { pattern: /^developed\s+/i, replacement: "Architected " },
    { pattern: /^launched\s+/i, replacement: "Deployed " },
    { pattern: /^designed\s+and\s+implemented\s+/i, replacement: "Engineered and implemented " },
    { pattern: /^designed\s+/i, replacement: "Implemented " },
    { pattern: /^created\s+/i, replacement: "Constructed " },
    { pattern: /^implemented\s+/i, replacement: "Engineered " },
    { pattern: /^performed\s+/i, replacement: "Executed " },
    { pattern: /^wrote\s+/i, replacement: "Authored " },
    { pattern: /^managed\s+and\s+processed\s+/i, replacement: "Administered and processed " },
    { pattern: /^managed\s+/i, replacement: "Administered " },
    { pattern: /^used\s+/i, replacement: "Leveraged " },
    { pattern: /^delivered\s+/i, replacement: "Provided " },
    { pattern: /^resolved\s+/i, replacement: "Resolved " },
    { pattern: /^conducted\s+/i, replacement: "Executed " },
    { pattern: /^modeled\s+/i, replacement: "Engineered " },
    { pattern: /^served\s+as\s+/i, replacement: "Acted as " },
  ],
  impact: [
    { pattern: /^currently working on\s+/i, replacement: "Delivering " },
    { pattern: /^built\s+and\s+launched\s+/i, replacement: "Launched and shipped " },
    { pattern: /^built\s+and\s+/i, replacement: "Launched and " },
    { pattern: /^helped\s+/i, replacement: "Enabled " },
    { pattern: /^assisted\s+(with\s+)?/i, replacement: "Supported " },
    { pattern: /^worked on\s+/i, replacement: "Delivered " },
    { pattern: /^was responsible for\s+/i, replacement: "Owned " },
    { pattern: /^participated in\s+/i, replacement: "Contributed to " },
    { pattern: /^involved in\s+/i, replacement: "Drove " },
    { pattern: /^part of\s+/i, replacement: "Contributed to " },
    { pattern: /^did\s+/i, replacement: "Completed " },
    { pattern: /^made\s+/i, replacement: "Shipped " },
    { pattern: /^tried to\s+/i, replacement: "Worked to " },
    { pattern: /^tasked with\s+/i, replacement: "Delivered " },
    { pattern: /^in charge of\s+/i, replacement: "Owned " },
    { pattern: /^built\s+/i, replacement: "Launched " },
    { pattern: /^developed\s+/i, replacement: "Shipped " },
    { pattern: /^launched\s+/i, replacement: "Released " },
    { pattern: /^designed\s+and\s+implemented\s+/i, replacement: "Delivered a fully implemented " },
    { pattern: /^designed\s+/i, replacement: "Delivered " },
    { pattern: /^created\s+/i, replacement: "Produced " },
    { pattern: /^implemented\s+/i, replacement: "Deployed " },
    { pattern: /^performed\s+/i, replacement: "Executed " },
    { pattern: /^wrote\s+/i, replacement: "Produced " },
    { pattern: /^managed\s+and\s+processed\s+/i, replacement: "Owned and processed " },
    { pattern: /^managed\s+/i, replacement: "Owned " },
    { pattern: /^used\s+/i, replacement: "Leveraged " },
    { pattern: /^delivered\s+/i, replacement: "Consistently delivered " },
    { pattern: /^resolved\s+/i, replacement: "Resolved " },
    { pattern: /^conducted\s+/i, replacement: "Executed " },
    { pattern: /^modeled\s+/i, replacement: "Delivered " },
    { pattern: /^served\s+as\s+/i, replacement: "Operated as " },
  ],
  academic: [
    { pattern: /^currently working on\s+/i, replacement: "Developing " },
    { pattern: /^built\s+and\s+launched\s+/i, replacement: "Developed and deployed " },
    { pattern: /^built\s+and\s+/i, replacement: "Developed and " },
    { pattern: /^helped\s+/i, replacement: "Supported " },
    { pattern: /^assisted\s+(with\s+)?/i, replacement: "Assisted in " },
    { pattern: /^worked on\s+/i, replacement: "Developed " },
    { pattern: /^was responsible for\s+/i, replacement: "Managed " },
    { pattern: /^participated in\s+/i, replacement: "Participated in " },
    { pattern: /^involved in\s+/i, replacement: "Contributed to " },
    { pattern: /^part of\s+/i, replacement: "Contributed to " },
    { pattern: /^did\s+/i, replacement: "Completed " },
    { pattern: /^made\s+/i, replacement: "Developed " },
    { pattern: /^tried to\s+/i, replacement: "Pursued " },
    { pattern: /^tasked with\s+/i, replacement: "Executed " },
    { pattern: /^in charge of\s+/i, replacement: "Managed " },
    { pattern: /^built\s+/i, replacement: "Developed " },
    { pattern: /^developed\s+/i, replacement: "Implemented " },
    { pattern: /^launched\s+/i, replacement: "Deployed " },
    { pattern: /^designed\s+and\s+implemented\s+/i, replacement: "Designed and implemented " },
    { pattern: /^designed\s+/i, replacement: "Designed " },
    { pattern: /^created\s+/i, replacement: "Produced " },
    { pattern: /^implemented\s+/i, replacement: "Applied " },
    { pattern: /^performed\s+/i, replacement: "Conducted " },
    { pattern: /^wrote\s+/i, replacement: "Authored " },
    { pattern: /^managed\s+and\s+processed\s+/i, replacement: "Managed and processed " },
    { pattern: /^managed\s+/i, replacement: "Administered " },
    { pattern: /^used\s+/i, replacement: "Utilized " },
    { pattern: /^delivered\s+/i, replacement: "Provided " },
    { pattern: /^resolved\s+/i, replacement: "Addressed " },
    { pattern: /^conducted\s+/i, replacement: "Conducted " },
    { pattern: /^modeled\s+/i, replacement: "Modeled " },
    { pattern: /^served\s+as\s+/i, replacement: "Served as " },
  ],
};

const ALL_KNOWN_VERB_PATTERNS = [
  ...VERB_REPLACEMENTS.technical,
  ...VERB_REPLACEMENTS.impact,
  ...VERB_REPLACEMENTS.academic,
];

const STRONG_VERB_STARTS = [
  "engineered", "architected", "deployed", "constructed", "owned", "drove",
  "launched", "shipped", "released", "produced", "applied", "conducted",
  "built", "developed", "designed", "created", "implemented", "led", "managed",
  "optimized", "delivered", "analyzed", "improved", "automated", "resolved",
  "maintained", "reduced", "increased", "streamlined", "integrated", "migrated",
  "refactored", "established", "coordinated", "collaborated", "mentored",
  "contributed", "wrote", "tested", "debugged", "configured", "monitored",
  "scaled", "performed", "modeled", "utilized", "leveraged", "administered",
  "authored", "executed", "constructed",
];

const SECTION_HEADER_RE = /^(education|experience|work experience|projects?|skills?|technical skills?|soft skills?|leadership|activities|certifications?|awards?|achievements?|summary|objective|profile|extracurriculars?)/i;

const SOFT_SKILLS_RE = /^soft skills?$/i;

function isBulletLine(trimmed) {
  const noBullet = trimmed.replace(/^[-*•\u2022]\s*/, "").trim();
  const lower = noBullet.toLowerCase();
  if (STRONG_VERB_STARTS.some((v) => lower.startsWith(v + " ") || lower.startsWith(v + "."))) return true;
  if (ALL_KNOWN_VERB_PATTERNS.some(({ pattern }) => pattern.test(noBullet))) return true;
  return false;
}

function applyAtsSwaps(text) {
  let result = text;
  for (const { from, to } of ATS_SWAPS) {
    result = result.replace(from, to);
  }
  return result;
}

function upgradeBulletForAngle(bulletText, angle) {
  let upgraded = bulletText;
  const replacements = VERB_REPLACEMENTS[angle] || VERB_REPLACEMENTS.technical;

  for (const { pattern, replacement } of replacements) {
    if (pattern.test(upgraded)) {
      upgraded = upgraded.replace(pattern, replacement).trim();
      break;
    }
  }

  upgraded = applyAtsSwaps(upgraded).trim();

  if (upgraded && !/[.!?]$/.test(upgraded)) {
    upgraded += ".";
  }

  if (upgraded.length > 0) {
    upgraded = upgraded.charAt(0).toUpperCase() + upgraded.slice(1);
  }

  return upgraded;
}

function buildObjective(resumeText, targetRole) {
  const lower = resumeText.toLowerCase();
  const roleLabel = targetRole
    ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
    : "Software Engineer";

  const SKILLS = ["Python", "JavaScript", "TypeScript", "Java", "React", "Node.js", "SQL", "AWS", "Docker", "Git"];
  const found = SKILLS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 4);
  const skillPhrase = found.length ? found.join(", ") : "software engineering";

  return (
    `Seeking a ${roleLabel} internship or position where I can apply my hands-on experience in ${skillPhrase} ` +
    `to solve real engineering problems, contribute to a high-performing team, and continue developing as a technical professional.`
  );
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
    missing.push({ field: "Email address", reason: "An email address is required for contact." });
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
      field: "Professional summary or objective",
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
      reason: 'Add numbers to at least 2 bullets — e.g., "reduced load time by 40%" or "served 500+ users".',
    });
  }

  return missing;
}

function buildVariant(resumeText, targetRole, angle) {
  const originalLines = resumeText.split("\n");
  const upgradedLines = [];
  let inSoftSkills = false;
  let pastHeader = false;
  let objectiveInjected = false;

  const hasSummary = /\b(summary|objective|profile)\b/i.test(resumeText);
  const hasGpa4 = /gpa\s*[:\s]?\s*4\.0/i.test(resumeText);
  const hasAwardsSection = /\b(awards?|achievements?)\b/i.test(resumeText);

  for (const rawLine of originalLines) {
    const trimmed = rawLine.trim();

    // First blank line signals end of contact header block
    if (!pastHeader && !trimmed) {
      pastHeader = true;

      // Academic: inject objective right after header block
      if (angle === "academic" && !hasSummary && !objectiveInjected) {
        upgradedLines.push(rawLine); // blank line
        upgradedLines.push("OBJECTIVE");
        upgradedLines.push(buildObjective(resumeText, targetRole));
        upgradedLines.push("");
        objectiveInjected = true;
        continue;
      }
    }

    if (!trimmed) {
      upgradedLines.push(rawLine);
      continue;
    }

    // Section header detection: short line matching known section names
    if (SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55) {
      if (SOFT_SKILLS_RE.test(trimmed)) {
        inSoftSkills = true;
        continue; // drop the soft skills header
      } else {
        inSoftSkills = false;
      }
    }

    // Skip all content inside the soft skills section
    if (inSoftSkills) {
      continue;
    }

    // Process bullet lines vs non-bullet lines
    if (isBulletLine(trimmed)) {
      const leadingMatch = rawLine.match(/^(\s*[-*•\u2022]?\s*)/);
      const leading = leadingMatch ? leadingMatch[1] : "";
      const bulletText = trimmed.replace(/^[-*•\u2022]\s*/, "");
      const upgraded = upgradeBulletForAngle(bulletText, angle);
      upgradedLines.push(leading + upgraded);
    } else {
      upgradedLines.push(applyAtsSwaps(rawLine));
    }
  }

  // Academic variant: append AWARDS & ACHIEVEMENTS if 4.0 GPA found and no existing section
  if (angle === "academic" && hasGpa4 && !hasAwardsSection) {
    upgradedLines.push("");
    upgradedLines.push("AWARDS & ACHIEVEMENTS");
    upgradedLines.push(
      "Dean's List with Distinction: Recognized for a 4.0 GPA while carrying a full technical credit load."
    );
  }

  return upgradedLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * Generate all three resume variants.
 * @param {string} resumeText
 * @param {string} targetRole
 * @returns {{ variants: Array<{name, label, description, text}>, missingItems: Array }}
 */
export function buildAllVariants(resumeText = "", targetRole = "") {
  return {
    variants: [
      {
        name: "technical",
        label: "Technical Depth",
        description: "Implementation-forward: tools, architecture, and engineering detail.",
        text: buildVariant(resumeText, targetRole, "technical"),
      },
      {
        name: "impact",
        label: "Impact & Scope",
        description: "Delivery-forward: what shipped, outcomes, and end-to-end ownership.",
        text: buildVariant(resumeText, targetRole, "impact"),
      },
      {
        name: "academic",
        label: "Clean Academic",
        description: "Formal structure, objective statement, credential-forward, no soft skills.",
        text: buildVariant(resumeText, targetRole, "academic"),
      },
    ],
    missingItems: detectMissingItems(resumeText),
  };
}

// Kept for backward compat
export function buildPremiumResume(resumeText = "", targetRole = "") {
  const { variants, missingItems } = buildAllVariants(resumeText, targetRole);
  return { upgradedResume: variants[0].text, missingItems };
}

// ─── Download helpers ────────────────────────────────────────────────────────

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

export async function downloadResumeDocx(text = "", filename = "upgraded_resume.docx") {
  const { Document, Packer, Paragraph, TextRun } = await import("docx");

  const HEADING_RE =
    /^(SUMMARY|OBJECTIVE|EDUCATION|EXPERIENCE|PROJECTS?|SKILLS?|WORK EXPERIENCE|TECHNICAL SKILLS?|LEADERSHIP|ACTIVITIES|CERTIFICATIONS?|PROFESSIONAL SUMMARY|AWARDS?|ACHIEVEMENTS?|EXTRACURRICULARS?)/i;

  const lines = text.split("\n");
  const children = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ children: [new TextRun("")] }));
      continue;
    }

    const isHeading = HEADING_RE.test(trimmed) && trimmed.length < 55;
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

function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function downloadResumePdf(text = "", filename = "upgraded_resume.pdf") {
  const HEADING_RE =
    /^(SUMMARY|OBJECTIVE|EDUCATION|EXPERIENCE|PROJECTS?|SKILLS?|WORK EXPERIENCE|TECHNICAL SKILLS?|LEADERSHIP|ACTIVITIES|CERTIFICATIONS?|PROFESSIONAL SUMMARY|AWARDS?|ACHIEVEMENTS?|EXTRACURRICULARS?)/i;

  const lines = text.split("\n");
  let body = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      body += '<div class="gap"></div>';
      continue;
    }

    if (HEADING_RE.test(trimmed) && trimmed.length < 55) {
      body += `<div class="heading">${escapeHtml(trimmed)}</div>`;
    } else if (/^[-*•\u2022]/.test(trimmed)) {
      body += `<div class="bullet">&#8226; ${escapeHtml(trimmed.replace(/^[-*•\u2022]\s*/, ""))}</div>`;
    } else {
      body += `<div class="line">${escapeHtml(trimmed)}</div>`;
    }
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${escapeHtml(filename.replace(".pdf", ""))}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{
      font-family:Arial,Helvetica,sans-serif;
      font-size:11pt;color:#111;
      margin:40px 52px;line-height:1.55;
    }
    .heading{
      font-size:11pt;font-weight:bold;
      text-transform:uppercase;letter-spacing:.05em;
      border-bottom:1.5px solid #222;
      padding-bottom:2px;margin-top:14px;margin-bottom:5px;
    }
    .bullet{margin-left:14px;margin-bottom:3px;font-size:10.5pt}
    .line{margin-bottom:3px;font-size:10.5pt}
    .gap{height:5px}
    @media print{body{margin:30px 40px}}
  </style>
</head>
<body>${body}</body>
</html>`;

  const win = window.open("", "_blank", "width=860,height=1060");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 350);
}
