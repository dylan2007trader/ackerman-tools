const Anthropic = require("@anthropic-ai/sdk");

// ─── Anthropic client ────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";
const MOCK_AI = process.env.MOCK_AI === "true";

// Strip any markdown Claude sneaks in so the PDF parser gets clean plain text
function stripMarkdown(text) {
  return text
    .replace(/^#{1,4}\s+/gm, "")          // ## Section Header → Section Header
    .replace(/\*\*(.*?)\*\*/g, "$1")       // **bold** → bold
    .replace(/\*(.*?)\*/g, "$1")           // *italic* → italic
    .replace(/^---+\s*$/gm, "")           // horizontal rules
    .replace(/^___+\s*$/gm, "")
    .replace(/^- /gm, "• ")               // - bullet → • bullet
    .replace(/^\* /gm, "• ")              // * bullet → • bullet
    .replace(/\n{3,}/g, "\n\n")           // collapse excess blank lines
    .trim();
}

// ─── Shared helpers ──────────────────────────────────────────────────────────

const ACTION_VERBS = [
  "built", "developed", "designed", "created", "implemented", "led",
  "managed", "wrote", "optimized", "delivered", "analyzed", "engineered",
  "launched", "improved", "co-founded", "resolved", "supported",
  "automated", "maintained",
];

const COMMON_SKILLS = [
  "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express",
  "SQL", "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Git", "GitHub", "REST",
  "APIs", "backend", "frontend", "full-stack", "data structures", "algorithms",
  "object-oriented programming", "testing", "automation", "AWS", "Docker",
  "Linux", "Pandas", "NumPy", "ETL", "databases", "cloud", "Agile",
  ".NET", ".NET Core", "Angular", "HTML", "CSS",
];

function normalizeWhitespace(value = "") {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanLine(value = "") {
  return normalizeWhitespace(String(value || "").replace(/^[-*•\u2022\s]+/, ""));
}

function extractLines(text = "") {
  return String(text || "")
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function extractSkills(text = "") {
  const lower = normalizeWhitespace(text).toLowerCase();
  return unique(COMMON_SKILLS.filter((skill) => lower.includes(skill.toLowerCase())));
}

function detectBullets(lines = []) {
  return lines.filter((line) =>
    ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
  );
}

function titleCase(text = "") {
  return String(text || "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (/^[A-Z0-9.+#/-]+$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

function extractContact(text = "") {
  const lines = extractLines(text);
  const header = lines.slice(0, 6);

  const name =
    header.find((line) => {
      if (line.length < 5 || line.length > 40) return false;
      if (/\d|@|linkedin|github|http/i.test(line)) return false;
      return /^[A-Za-z .'-]+$/.test(line);
    }) || "Applicant";

  // Flatten all header lines into individual tokens by splitting on bullet separators
  // This handles both "City, ST • phone • email" on one line and multi-line layouts
  const tokens = header.flatMap((line) =>
    line.split(/\s*[•·|]\s*/).map((t) => t.trim()).filter(Boolean)
  );
  const tokenText = tokens.join(" ");

  const email = tokenText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = tokenText.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[0] || "";

  // Find location: a token with ", ST" pattern or "Remote"
  const location = tokens.find((t) => /^[A-Za-z\s]+,\s*[A-Z]{2}$/.test(t) || /^remote$/i.test(t)) || "";

  // Find LinkedIn: a token containing linkedin.com — strip protocol prefix
  const linkedInRaw = tokens.find((t) => /linkedin\.com/i.test(t)) || "";
  const linkedIn = linkedInRaw
    .replace(/^https?:\/\/(?:www\.)?/i, "")
    .replace(/^linkedin\.com\/in\/https?:\/\/(?:www\.)?linkedin\.com\/in\//i, "linkedin.com/in/");

  // Build a clean, deduped contact string from individual tokens
  const contactStr = [location, phone, email, linkedIn].filter(Boolean).join(" • ");

  return {
    name: titleCase(name),
    email,
    phone,
    location,
    linkedIn,
    contactStr,
    headerLine: contactStr,
  };
}

// ─── Resume grader (still rule-based — no LLM needed for scoring) ────────────

function analyzeResumeText(text = "", targetRole = "") {
  const resumeText = normalizeWhitespace(text);
  const lines = extractLines(text);
  const words = resumeText.split(/\s+/).filter(Boolean);
  const bullets = detectBullets(lines);
  const skills = extractSkills(resumeText);
  const metricMatches = resumeText.match(/\b\d+(?:\.\d+)?%|\$\d+|\b\d+\b/g) || [];
  const sectionMatches = lines.filter((line) =>
    /summary|education|experience|projects|skills|technical|leadership/i.test(line)
  );
  const actionVerbCount = bullets.filter((line) =>
    ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
  ).length;

  const metricsScore = Math.min(100, metricMatches.length * 18 + 20);
  const skillScore = Math.min(100, skills.length * 12 + 20);
  const bulletScore = Math.min(100, actionVerbCount * 14 + 10);
  const structureScore = Math.min(100, sectionMatches.length * 18 + 20);
  const completenessScore = Math.min(100, Math.round((words.length / 220) * 100));

  const overall = Math.round(
    metricsScore * 0.22 +
    skillScore * 0.28 +
    bulletScore * 0.22 +
    structureScore * 0.18 +
    completenessScore * 0.1
  );

  const targetSignals = extractSkills(targetRole);
  const matchedSignals = unique(
    skills.filter((skill) =>
      targetSignals.length === 0
        ? true
        : targetSignals.some((signal) => signal.toLowerCase() === skill.toLowerCase())
    )
  );
  const missingSignals = targetSignals.filter(
    (signal) => !matchedSignals.find((match) => match.toLowerCase() === signal.toLowerCase())
  );

  return { overall, words: words.length, bullets: bullets.length, skills, metricsCount: metricMatches.length, matchedSignals, missingSignals };
}

// ─── Premium resume (Claude-powered) ─────────────────────────────────────────

async function buildPremiumResume({ resumeText = "", targetRole = "" }) {
  const analysis = analyzeResumeText(resumeText, targetRole);

  if (MOCK_AI) {
    return {
      analysis,
      premiumResume: `[MOCK] ${resumeText}\n\n— Mock mode active (MOCK_AI=true). No tokens used.`,
    };
  }

  // Detect sparse resumes so Claude knows to expand content
  const wordCount = resumeText.trim().split(/\s+/).length;
  const sparseNote = wordCount < 300
    ? "\n\nNOTE: This resume is short and has whitespace. Expand bullets and project descriptions to fill the page — but only by elaborating on what is already written. Describe what the existing work involved, how it was done, or why it mattered. Do NOT add new tools, technologies, or skills that aren't already listed. Do NOT invent responsibilities. Only deepen the explanation of what is already there."
    : "";

  const userMessage = targetRole
    ? `TARGET ROLE: ${targetRole}\n\nRESUME:\n${resumeText}${sparseNote}`
    : `RESUME:\n${resumeText}${sparseNote}`;

  // Extract contact from original so we can guarantee it survives Claude's rewrite
  const contact = extractContact(resumeText);
  const contactStr = contact.contactStr;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: `You are a professional resume writer. Rewrite the provided resume with stronger action verbs and more impactful bullet points. Keep all facts 100% accurate — do NOT invent or add any numbers, percentages, dollar amounts, or metrics that are not explicitly present in the original resume.

FORMATTING RULES — follow exactly, no exceptions:
- Plain text only. No markdown, no #, ##, **, *, ---, underscores, or any markdown symbols.
- Do NOT output a name, contact line, email, phone, or location — the header is added separately. Start your response with the first section header.
- Section order: SUMMARY (only if present in original), EDUCATION, EXPERIENCE, PROJECTS (if present), TECHNICAL SKILLS
- Section headers in ALL CAPS on their own line
- If the original has a SUMMARY section, preserve and improve it — do not drop it
- EDUCATION must come before EXPERIENCE
- Job/entry header on one line: "Job Title | Company, Location | Month Year – Month Year"
- Bullet points start with "• " (bullet character). 1-2 lines max per bullet.
- One blank line between sections, no blank lines between bullets within a job
- TECHNICAL SKILLS: always output skills as labeled subcategories tailored to this specific person (e.g. "Languages:", "ML Frameworks:", "Data Pipelines:", "Cloud:", "DevOps:", "Databases:" — whatever fits their actual skill set). If the original already has labeled sections, preserve those exact labels and their contents unchanged. If the original is a flat unlabeled list, invent logical subcategory names that reflect what they actually know — do not use generic buckets like "Frameworks & Tools". Never merge separate categories. Never duplicate a skill across categories.`,
    messages: [{ role: "user", content: userMessage }],
  });

  const bodyText = stripMarkdown(
    message.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim()
  );

  // Strip any header Claude generated anyway — scan ALL lines for first section keyword
  // (Claude sometimes emits blank lines or a contact line before the first section)
  const bodyLines = bodyText.split("\n");
  let startLine = 0;
  for (let idx = 0; idx < bodyLines.length; idx++) {
    const trimmed = bodyLines[idx].trim();
    if (/^(EDUCATION|EXPERIENCE|PROFESSIONAL|RELEVANT|WORK HISTORY|PROJECTS?|TECHNICAL|SKILLS?|CERTIFICATIONS?|LEADERSHIP|SUMMARY|OBJECTIVE)/i.test(trimmed) && trimmed.length < 55) {
      startLine = idx;
      break;
    }
  }

  const nameAllCaps = contact.name.toUpperCase();
  const rawResume = [
    nameAllCaps,
    contactStr,
    "",
    ...bodyLines.slice(startLine),
  ].join("\n");

  const premiumResume = postProcessResume(rawResume, resumeText);

  return { analysis, premiumResume };
}

// ─── Post-processing: auto-fix common output issues ──────────────────────────

const VAGUE_ENDINGS = [
  /,?\s*expanding market reach\.?$/i,
  /,?\s*demonstrating (?:strong )?capabilities\.?$/i,
  /,?\s*showcasing (?:technical )?skills\.?$/i,
  /,?\s*driving (?:business )?(?:value|growth|results)\.?$/i,
  /,?\s*leveraging best practices\.?$/i,
  /,?\s*improving overall performance\.?$/i,
  /,?\s*(?:to )?support (?:business )?(?:objectives|goals)\.?$/i,
  /,?\s*(?:to )?meet (?:business|project|team) (?:needs|requirements|demands)\.?$/i,
  /,?\s*enabling (?:the team|business|stakeholders) to (?:make|achieve|deliver) .{0,40}\.?$/i,
  /,?\s*(?:further )?enhancing overall (?:user )?experience\.?$/i,
  /,?\s*(?:while )?(?:contributing to|supporting) (?:the )?(?:team|company|organization)\.?$/i,
  /,?\s*(?:to )?(?:improve|enhance|optimize) (?:the )?(?:overall )?(?:workflow|process|pipeline)\.?$/i,
];

// Section header regex — same definition as resumeUpgrader SECTION_RE
const SECTION_HEADER_RE = /^(EDUCATION|EXPERIENCE|PROFESSIONAL EXPERIENCE|RELEVANT EXPERIENCE|PROJECTS?|TECHNICAL SKILLS?|SKILLS?|SOFT SKILLS?|CERTIFICATIONS?|AWARDS?|LEADERSHIP|ACTIVITIES|VOLUNTEER|WORK HISTORY|SUMMARY|OBJECTIVE)$/i;

// Extract all sections from a plain-text resume as { heading, lines[] }
function extractSections(text) {
  const rawLines = text.split("\n").map((l) => l.trim());
  const sections = [];
  let current = null;
  for (const line of rawLines) {
    if (SECTION_HEADER_RE.test(line) && line.length < 55) {
      current = { heading: line.toUpperCase(), lines: [] };
      sections.push(current);
    } else if (current && line) {
      current.lines.push(line);
    }
  }
  return sections;
}

// Sections that Claude should rewrite — don't transplant verbatim from original
const REWRITE_SECTIONS = new Set(["EXPERIENCE", "PROFESSIONAL EXPERIENCE", "RELEVANT EXPERIENCE", "WORK HISTORY", "PROJECTS", "PROJECT", "SUMMARY", "PROFESSIONAL SUMMARY", "OBJECTIVE"]);

function postProcessResume(resumeText, originalText) {
  const lines = resumeText.split("\n");
  const fixed = [];

  // Track if we've passed the header (name + contact line)
  let headerDone = false;
  let blankAfterHeader = false;
  const nameLine = lines[0] || "";

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Fix double colons anywhere
    line = line.replace(/::/g, ":");

    // Fix broken LinkedIn/GitHub URLs (strip https://www.)
    line = line
      .replace(/https?:\/\/(?:www\.)?(linkedin\.com\/[^\s]+)/gi, "$1")
      .replace(/https?:\/\/(?:www\.)?(github\.com\/[^\s]+)/gi, "$1");

    // Detect end of header block (first blank line after line 0)
    if (i === 0) { fixed.push(line); continue; }
    if (!headerDone && !blankAfterHeader && line === "") {
      blankAfterHeader = true;
      fixed.push(line);
      continue;
    }
    if (blankAfterHeader && !headerDone) {
      headerDone = true;
    }

    // Remove duplicate contact/name lines that Claude snuck into the body
    if (headerDone) {
      if (line.toUpperCase() === nameLine.toUpperCase()) { continue; }
      if (/\S+@\S+\.\S+/.test(line) && i < 6) { continue; }
    }

    // Remove vague filler endings from bullet points
    if (line.startsWith("•")) {
      for (const pattern of VAGUE_ENDINGS) {
        line = line.replace(pattern, ".");
      }
      line = line.replace(/\.\.$/, ".").replace(/,\.$/, ".");
    }

    fixed.push(line);
  }

  // Collapse 3+ consecutive blank lines to max 1
  const collapsed = [];
  let blankCount = 0;
  for (const line of fixed) {
    if (line === "") {
      blankCount++;
      if (blankCount <= 1) collapsed.push(line);
    } else {
      blankCount = 0;
      collapsed.push(line);
    }
  }

  let result = collapsed.join("\n");

  // ── Section completeness: transplant sections Claude dropped ──────────────
  if (originalText) {
    const originalSections = extractSections(originalText);
    const outputSections = extractSections(result);
    const outputHeadings = new Set(outputSections.map((s) => s.heading));

    for (const sec of originalSections) {
      const heading = sec.heading;
      // Skip sections Claude should rewrite, skip ones already present
      if (REWRITE_SECTIONS.has(heading)) continue;
      if (outputHeadings.has(heading)) continue;
      // Also skip if output has a close variant (e.g. TECHNICAL SKILLS vs SKILLS)
      const hasVariant = [...outputHeadings].some(
        (h) => h.includes(heading.replace(/S$/, "")) || heading.includes(h.replace(/S$/, ""))
      );
      if (hasVariant) continue;

      // Append missing section verbatim from original
      result += `\n\n${heading}\n${sec.lines.join("\n")}`;
    }

    // Always transplant TECHNICAL SKILLS verbatim from original (Claude mangles it)
    const origSkills = originalSections.find((s) =>
      /TECHNICAL\s+SKILLS?|SKILLS?/.test(s.heading)
    );
    const outSkills = outputSections.find((s) =>
      /TECHNICAL\s+SKILLS?|SKILLS?/.test(s.heading)
    );
    if (origSkills && outSkills) {
      // Replace Claude's skills block with the original, preserving the heading Claude used
      const skillsHeading = outSkills.heading;
      const origBlock = `${skillsHeading}\n${origSkills.lines.join("\n")}`;
      const claudeBlock = `${outSkills.heading}\n${outSkills.lines.join("\n")}`;
      result = result.replace(claudeBlock, origBlock);
    }
  }

  return result;
}

// ─── Cover letter (Claude-powered) ───────────────────────────────────────────

async function buildStructuredCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
}) {
  const contact = extractContact(resumeText);

  if (MOCK_AI) {
    return {
      headerName: contact.name,
      headerLine: contact.headerLine,
      linkedIn: contact.linkedIn,
      dateLine: new Date().toLocaleDateString("en-US"),
      companyLine: "Hiring Team",
      companyName: "",
      companyLocation: "",
      greeting: "Dear Hiring Team,",
      bodyParagraphs: [
        "[MOCK] This is a mock cover letter body paragraph. No tokens were used.",
        `[MOCK] Target role: ${targetRole || "not specified"}. Job description length: ${jobDescription.length} chars.`,
        "[MOCK] Disable MOCK_AI in backend/.env to generate real cover letters.",
      ],
      closing: "Thank you for your consideration.",
      signature: contact.name,
    };
  }

  const userMessage = [
    `RESUME:\n${resumeText}`,
    targetRole ? `TARGET ROLE: ${targetRole}` : "",
    jobDescription ? `JOB DESCRIPTION:\n${jobDescription}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "You are a professional cover letter writer. Using the provided resume and job details, write a compelling one-page cover letter. Open with a strong hook, highlight 2-3 relevant achievements from the resume, connect them to the company's needs, and close with a confident call to action. Match the tone to the job seniority level. Return plain text only — no greetings like 'Dear Claude', no markdown, just the cover letter body paragraphs starting from the opening sentence.",
    messages: [{ role: "user", content: userMessage }],
  });

  const bodyText = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  // Split Claude's output into paragraphs for the structured letter format
  const bodyParagraphs = bodyText
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);

  return {
    headerName: contact.name,
    headerLine: [contact.location, contact.phone, contact.email].filter(Boolean).join(" • "),
    linkedIn: contact.linkedIn,
    dateLine: new Date().toLocaleDateString("en-US"),
    companyLine: "Hiring Team",
    companyName: "",
    companyLocation: "",
    greeting: "Dear Hiring Team,",
    bodyParagraphs,
    closing: "Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to your team.",
    signature: contact.name,
  };
}

// ─── Cover letter plain-text formatter ───────────────────────────────────────

function buildCoverLetterText(letter) {
  const lines = [];
  lines.push(letter.headerName || "Applicant");
  if (letter.headerLine) lines.push(letter.headerLine);
  if (letter.linkedIn) lines.push(letter.linkedIn);
  if (letter.dateLine) lines.push(letter.dateLine);
  lines.push("");
  lines.push(letter.companyLine || "Hiring Team");
  if (letter.companyName) lines.push(letter.companyName);
  if (letter.companyLocation) lines.push(letter.companyLocation);
  lines.push("");
  lines.push(letter.greeting || "Dear Hiring Team,");
  lines.push("");
  (letter.bodyParagraphs || []).forEach((paragraph) => {
    lines.push(paragraph);
    lines.push("");
  });
  lines.push(letter.closing || "");
  lines.push("");
  lines.push("Sincerely,");
  lines.push(letter.signature || "Applicant");
  return lines.join("\n").trim();
}

module.exports = {
  analyzeResumeText,
  buildPremiumResume,
  buildStructuredCoverLetter,
  buildCoverLetterText,
};
