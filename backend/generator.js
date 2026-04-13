const Anthropic = require("@anthropic-ai/sdk");

// ─── Anthropic client ────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";

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

  const headerText = header.join(" ");
  const email = headerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = headerText.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[0] || "";
  const location = header.find((line) => /,\s*[A-Z]{2}\b/.test(line) || /remote/i.test(line)) || "";
  const linkedIn = header.find((line) => /linkedin\.com/i.test(line)) || "";

  return {
    name: titleCase(name),
    email,
    phone,
    location,
    linkedIn,
    headerLine: [location, phone, email].filter(Boolean).join(" • "),
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

  const userMessage = targetRole
    ? `TARGET ROLE: ${targetRole}\n\nRESUME:\n${resumeText}`
    : `RESUME:\n${resumeText}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "You are a professional resume writer. Rewrite the provided resume with stronger action verbs, expanded bullet points with measurable metrics, and enough detail to fill a full page. Keep all facts accurate — only expand and improve what is already there. Return the result as plain structured text with clear section headers.",
    messages: [{ role: "user", content: userMessage }],
  });

  const premiumResume = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  return { analysis, premiumResume };
}

// ─── Cover letter (Claude-powered) ───────────────────────────────────────────

async function buildStructuredCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
}) {
  const contact = extractContact(resumeText);

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
