// Cover letter builder
// All three paragraphs are built directly from the job description and resume text.

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function lines(text = "") {
  return normalize(text)
    .split("\n")
    .map((l) => l.trim().replace(/^[-*•\u2022]\s*/, "").trim())
    .filter(Boolean);
}

function sentence(text = "") {
  const s = normalize(text);
  if (!s) return "";
  const capped = s.charAt(0).toUpperCase() + s.slice(1);
  return /[.!?]$/.test(capped) ? capped : capped + ".";
}

function listPhrase(items = []) {
  const u = [...new Set(items.filter(Boolean))];
  if (!u.length) return "";
  if (u.length === 1) return u[0];
  if (u.length === 2) return `${u[0]} and ${u[1]}`;
  return `${u.slice(0, -1).join(", ")}, and ${u[u.length - 1]}`;
}

// ─── Job description parsing ─────────────────────────────────────────────────

function extractJobTitle(jobDesc = "", fallback = "") {
  if (fallback) return fallback.charAt(0).toUpperCase() + fallback.slice(1);

  const allLines = lines(jobDesc);
  // First short line that looks like a job title
  const candidate = allLines.find((l) => {
    if (l.length > 90 || l.length < 4) return false;
    return /engineer|developer|analyst|scientist|intern|designer|manager|lead|architect|specialist/i.test(l);
  });

  return candidate ? candidate.replace(/^(job title|position|role)\s*[:\-]\s*/i, "").trim() : "this role";
}

function extractCompanyName(jobDesc = "") {
  const allLines = lines(jobDesc);

  // "Company: Acme" or "at Acme" or "join Acme"
  const labeled = allLines.find((l) => /^company\s*[:\-]/i.test(l));
  if (labeled) return labeled.replace(/^company\s*[:\-]\s*/i, "").trim();

  const atMatch = normalize(jobDesc).match(/\b(?:at|join|joining|with)\s+([A-Z][A-Za-z0-9&., ]{2,40}?)(?:\.|,|\s+to\s|\s+and\s|$)/);
  if (atMatch?.[1]) return atMatch[1].trim().replace(/[,.]$/, "");

  return "";
}

/**
 * Pull the most meaningful requirement sentences from the job description.
 * Looks for lines that describe what the candidate will do or must have.
 */
function extractRequirements(jobDesc = "") {
  if (!jobDesc.trim()) return [];

  const allLines = lines(jobDesc);

  const SKIP = /benefits|equal opportunity|salary|compensation|perks|pto|vacation|insurance|disability|401k|eeo|applicants will|we are an|about us|our mission|our culture/i;
  const WANT = /you will|you'll|responsible for|build|develop|design|support|create|maintain|implement|collaborate|work with|analyze|deliver|own|lead|manage|write|test|improve|architect|deploy|optimize/i;

  const requirement = allLines.filter((l) => {
    if (l.length < 20 || l.length > 220) return false;
    if (SKIP.test(l)) return false;
    return WANT.test(l);
  });

  // Also grab "required" / "must have" qualifications
  const qualifications = allLines.filter((l) => {
    if (l.length < 15 || l.length > 180) return false;
    if (SKIP.test(l)) return false;
    return /required|must have|minimum|strong|proficient|experience (in|with)|knowledge of|familiar with|background in|\d\+\s*years/i.test(l);
  });

  return [...new Set([...requirement, ...qualifications])].slice(0, 6);
}

/**
 * Extract a short phrase describing what the role focuses on.
 * Used in paragraph 1 opening.
 */
function extractRoleFocus(jobDesc = "") {
  const reqs = extractRequirements(jobDesc);
  if (!reqs.length) return "";

  // Take the first clean short requirement and trim it into a phrase
  const first = reqs[0];
  return first
    .replace(/^you will\s+/i, "")
    .replace(/^you'll\s+/i, "")
    .replace(/^responsible for\s+/i, "")
    .replace(/[.!?]+$/, "")
    .trim()
    .toLowerCase();
}

// ─── Resume parsing ──────────────────────────────────────────────────────────

function extractContact(resumeText = "") {
  const headerLines = lines(resumeText).slice(0, 7);
  const full = headerLines.join(" ");

  const name =
    headerLines.find((l) => {
      if (l.length < 4 || l.length > 44) return false;
      if (/\d|@|linkedin|github|http/i.test(l)) return false;
      return /^[A-Za-z .'-]+$/.test(l);
    }) || "Applicant";

  const email = full.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || "";
  const phone = full.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[0] || "";
  const location = headerLines.find((l) => /,\s*[A-Z]{2}\b/.test(l) || /remote/i.test(l)) || "";
  const linkedIn = headerLines.find((l) => /linkedin\.com/i.test(l)) || "";

  return {
    name: name.charAt(0).toUpperCase() + name.slice(1),
    email,
    phone,
    location,
    linkedIn,
    headerLine: [location, phone, email].filter(Boolean).join(" • "),
  };
}

function extractEducation(resumeText = "") {
  const allLines = lines(resumeText);
  const edu = allLines.find((l) =>
    /university|college|bachelor|master|degree|b\.s\.|b\.a\.|gpa/i.test(l)
  );
  if (!edu) return "a computer science background";
  return edu
    .replace(/education/i, "")
    .replace(/gpa[^,.;]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();
}

function extractResumeEvidence(resumeText = "") {
  const allLines = lines(resumeText);
  const STRONG = /^(built|developed|designed|created|implemented|led|managed|optimized|delivered|analyzed|engineered|launched|improved|automated|resolved|deployed|maintained|increased|reduced|shipped|integrated|refactored|migrated|established|wrote|tested)/i;

  const bullets = allLines
    .filter((l) => STRONG.test(l))
    .map((l) => sentence(l))
    .filter(Boolean);

  const projectish = allLines
    .filter((l) => /project|platform|database|application|software|api|tool|system|pipeline/i.test(l) && !STRONG.test(l))
    .map((l) => sentence(l))
    .filter(Boolean);

  return [...new Set([...bullets, ...projectish])].slice(0, 5);
}

function extractResumeSkills(resumeText = "") {
  const SKILL_LIST = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Git", "GitHub", "REST",
    "APIs", "backend", "frontend", "full-stack", "data structures", "algorithms",
    "object-oriented programming", "testing", "automation", "AWS", "Docker",
    "Linux", "Pandas", "NumPy", "ETL", "cloud", "Agile", "HTML", "CSS", "Angular",
    ".NET", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "TensorFlow", "PyTorch",
  ];
  const lower = resumeText.toLowerCase();
  return [...new Set(SKILL_LIST.filter((s) => lower.includes(s.toLowerCase())))];
}

// ─── Paragraph builders ──────────────────────────────────────────────────────

/**
 * Paragraph 1: Acknowledge the role, the company, and the specific skills/
 * responsibilities listed in the job description.
 */
function buildParagraphOne({ jobTitle, companyName, requirements, education }) {
  const companyPhrase = companyName ? ` at ${companyName}` : "";

  // Summarize what the role involves using the first 2 requirements
  let roleFocus = "";
  if (requirements.length >= 2) {
    const a = requirements[0]
      .replace(/^you will\s+/i, "")
      .replace(/^responsible for\s+/i, "")
      .replace(/[.!?]+$/, "")
      .toLowerCase();
    const b = requirements[1]
      .replace(/^you will\s+/i, "")
      .replace(/^responsible for\s+/i, "")
      .replace(/[.!?]+$/, "")
      .toLowerCase();
    roleFocus = `The position involves ${a} and ${b}, which directly aligns with the work I have been building toward.`;
  } else if (requirements.length === 1) {
    const a = requirements[0]
      .replace(/^you will\s+/i, "")
      .replace(/^responsible for\s+/i, "")
      .replace(/[.!?]+$/, "")
      .toLowerCase();
    roleFocus = `The position involves ${a}, which is exactly the kind of work I have been preparing for.`;
  } else {
    roleFocus = "The scope of the role and the type of technical work involved stands out as an excellent fit for my background.";
  }

  return [
    sentence(`I am writing to apply for the ${jobTitle}${companyPhrase}`),
    roleFocus,
    sentence(`My background in ${education} has prepared me to contribute meaningfully from day one, and I am excited about the opportunity to bring that foundation to ${companyName || "your team"}`),
  ].join(" ");
}

/**
 * Paragraph 2: What the candidate has actually done, pulled from their resume.
 */
function buildParagraphTwo({ education, evidence, resumeSkills }) {
  const skillsPhrase = listPhrase(resumeSkills.slice(0, 5));

  const evidenceLines = [...evidence];
  while (evidenceLines.length < 2) {
    evidenceLines.push("I have continued building my technical foundation through coursework, side projects, and hands-on problem solving.");
  }

  const evidencePart = evidenceLines.slice(0, 3).join(" ");

  return [
    sentence(`My experience reflects the kind of work this role requires, combining ${education} with real technical projects`),
    evidencePart,
    skillsPhrase
      ? sentence(`Across that work, I have built strong proficiency in ${skillsPhrase}`)
      : "Across that work, I have consistently written clean, maintainable code and delivered results that teammates and stakeholders can rely on.",
  ].join(" ");
}

/**
 * Paragraph 3: Connect the candidate's skills directly to the job's requirements
 * and explain why that benefits the company.
 */
function buildParagraphThree({ companyName, requirements, resumeSkills, jobTitle }) {
  // Find skills that overlap with what the job asks for
  const jobText = requirements.join(" ").toLowerCase();
  const matched = resumeSkills.filter((s) => jobText.includes(s.toLowerCase()));
  const bridgeSkills = matched.length >= 2 ? matched : resumeSkills;
  const skillsBridge = listPhrase(bridgeSkills.slice(0, 5));

  // Pull a specific requirement to call out
  const specificReq = requirements.find((r) => r.length > 25) || "";
  const specificLine = specificReq
    ? sentence(
        `Specifically, the requirement to ${specificReq
          .replace(/^you will\s+/i, "")
          .replace(/^responsible for\s+/i, "")
          .replace(/[.!?]+$/, "")
          .toLowerCase()} is something I am well prepared to deliver on`
      )
    : "";

  return [
    sentence(`That background maps directly to what ${companyName || "your team"} is looking for in this ${jobTitle}`),
    skillsBridge
      ? sentence(`I would bring ${skillsBridge} alongside the ability to ramp quickly, communicate clearly, and take ownership of work end-to-end`)
      : "I would bring technical depth, fast learning, and a commitment to producing work that is reliable and ready to build on.",
    specificLine,
    sentence(`I am confident I would add real value to ${companyName || "your team"} from the start and keep growing into larger ownership as the role expands`),
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a full cover letter object from the resume and job description.
 *
 * @param {{ resumeText: string, jobDescription: string, targetRole: string }} params
 * @returns {object} cover letter data
 */
export function buildCoverLetter({ resumeText = "", jobDescription = "", targetRole = "" }) {
  const contact = extractContact(resumeText);
  const jobTitle = extractJobTitle(jobDescription, targetRole);
  const companyName = extractCompanyName(jobDescription);
  const education = extractEducation(resumeText);
  const requirements = extractRequirements(jobDescription);
  const evidence = extractResumeEvidence(resumeText);
  const resumeSkills = extractResumeSkills(resumeText);

  const bodyParagraphs = [
    buildParagraphOne({ jobTitle, companyName, requirements, education }),
    buildParagraphTwo({ education, evidence, resumeSkills }),
    buildParagraphThree({ companyName, requirements, resumeSkills, jobTitle }),
  ];

  return {
    headerName: contact.name,
    headerLine: contact.headerLine,
    linkedIn: contact.linkedIn,
    dateLine: new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    greeting: "Dear Hiring Team,",
    bodyParagraphs,
    closing:
      "Thank you for taking the time to review my application. I would welcome the opportunity to discuss how my background fits what you are building and how I can contribute to the team.",
    signature: contact.name,
  };
}

/** Render the cover letter as a plain text string */
export function buildCoverLetterText(letter) {
  const out = [];
  if (letter.headerName) out.push(letter.headerName);
  if (letter.headerLine) out.push(letter.headerLine);
  if (letter.linkedIn) out.push(letter.linkedIn);
  if (letter.dateLine) out.push(letter.dateLine);
  out.push("");
  out.push("Hiring Team");
  out.push("");
  out.push(letter.greeting || "Dear Hiring Team,");
  out.push("");
  (letter.bodyParagraphs || []).forEach((p) => {
    out.push(p);
    out.push("");
  });
  out.push(letter.closing || "");
  out.push("");
  out.push("Sincerely,");
  out.push(letter.signature || "Applicant");
  return out.join("\n").trim();
}

/** Download cover letter as a .txt file */
export function downloadCoverLetterText(letter, filename = "cover_letter.txt") {
  const content = buildCoverLetterText(letter);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Open a print dialog so the user can save as PDF */
export function printCoverLetterPdf(letter) {
  const text = buildCoverLetterText(letter);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Cover Letter</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 48px 56px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 12pt;
      color: #111;
      line-height: 1.6;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>${escaped}</body>
</html>`;

  const win = window.open("", "_blank", "width=860,height=1000");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}
