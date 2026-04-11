// Cover letter builder
// Parsing is blob-tolerant: works whether resume text has newlines (DOCX/TXT)
// or is a space-joined blob (PDF via pdfjs-dist).

// ─── Helpers ────────────────────────────────────────────────────────────────

function normalize(text = "") {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function sentence(text = "") {
  const s = normalize(text).trim();
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

/**
 * Split text into meaningful segments.
 * Works whether the text has newlines (DOCX/TXT) or is a space-joined PDF blob.
 */
function splitIntoSegments(text = "") {
  const norm = normalize(text);
  const byNewline = norm.split("\n").map((s) => s.trim()).filter(Boolean);
  // If we have proper line structure, use it
  if (byNewline.length > 4) return byNewline;
  // Fall back to sentence splitting for PDF blobs
  return norm
    .split(/(?<=[.!?])\s+(?=[A-Z"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

// ─── Job description parsing ─────────────────────────────────────────────────

function extractJobTitleFromDesc(jobDesc = "", fallback = "") {
  if (fallback) return fallback.charAt(0).toUpperCase() + fallback.slice(1);

  const segs = splitIntoSegments(jobDesc);
  const candidate = segs.find((l) => {
    if (l.length > 90 || l.length < 4) return false;
    return /engineer|developer|analyst|scientist|intern|designer|manager|lead|architect|specialist/i.test(l);
  });

  return candidate
    ? candidate.replace(/^(job title|position|role)\s*[:\-]\s*/i, "").trim()
    : "this role";
}

function extractCompanyNameFromDesc(jobDesc = "") {
  const norm = normalize(jobDesc);

  // "Company: Acme" labeled
  const labelMatch = norm.match(/\bcompany\s*[:\-]\s*([A-Z][A-Za-z0-9&.,\s]{2,40}?)(?:\n|,|\s{2}|$)/);
  if (labelMatch?.[1]) return labelMatch[1].trim().replace(/[,.]$/, "");

  // "at Acme" / "join Acme"
  const atMatch = norm.match(
    /\b(?:at|join|joining|with)\s+([A-Z][A-Za-z0-9&. ]{2,35}?)(?:\.|,|\s{2}|\s+to\s|\s+and\s|$)/
  );
  if (atMatch?.[1]) {
    const candidate = atMatch[1].trim().replace(/[,.]$/, "");
    // Reject generic tech terms and common words that aren't company names
    const TECH_NOISE =
      /^(the|a|an|our|your|rest|api|apis|sql|git|aws|docker|agile|linux|python|java|react|node|angular|vue|typescript|javascript|html|css|cloud|data|software|systems?|services?|platforms?|solutions?|applications?|tools?|code|project|team|company|organization|role|position|us|you|they|we)\b/i;
    if (!TECH_NOISE.test(candidate) && candidate.length > 2) return candidate;
  }

  return "";
}

function extractRequirements(jobDesc = "") {
  if (!jobDesc.trim()) return [];

  const segs = splitIntoSegments(jobDesc);

  const SKIP =
    /benefits|equal opportunity|salary|compensation|perks|pto|vacation|insurance|disability|401k|eeo|applicants will|we are an|about us|our mission|our culture/i;
  const WANT =
    /you will|you'll|responsible for|build|develop|design|support|create|maintain|implement|collaborate|work with|analyze|deliver|own|lead|manage|write|test|improve|architect|deploy|optimize/i;
  const QUAL =
    /required|must have|minimum|strong|proficient|experience (in|with)|knowledge of|familiar with|background in|\d\+\s*years/i;

  const requirement = segs.filter((l) => {
    if (l.length < 20 || l.length > 220) return false;
    if (SKIP.test(l)) return false;
    return WANT.test(l);
  });

  const qualifications = segs.filter((l) => {
    if (l.length < 15 || l.length > 180) return false;
    if (SKIP.test(l)) return false;
    return QUAL.test(l);
  });

  return [...new Set([...requirement, ...qualifications])].slice(0, 6);
}

// ─── Resume parsing ──────────────────────────────────────────────────────────

/**
 * Extract candidate name from text.
 * Looks for 2-3 consecutive Title Case words at the very start of the text.
 * Works on both newline-structured text and PDF blobs.
 */
function extractNameFromText(resumeText = "") {
  const text = resumeText.trim();
  // First 2–3 consecutive Title Case words at the start (ignore section headers)
  const match = text.match(/^([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})/);
  if (match) {
    const candidate = match[1].trim();
    if (
      !/^(education|experience|skills?|projects?|summary|objective|profile|work|leadership|certifications?|activities|contact)/i.test(
        candidate
      )
    ) {
      return candidate;
    }
  }
  return "";
}

function extractContact(resumeText = "") {
  const text = normalize(resumeText);

  const name = extractNameFromText(resumeText) || "Applicant";
  const email = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i)?.[0] || "";
  const phone = text.match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[0] || "";

  // City, ST pattern (avoid false positives by requiring comma + 2-letter state code)
  const locationMatch = text.match(/([A-Z][a-zA-Z ]{1,20},\s*[A-Z]{2})\b/);
  const location = locationMatch?.[1]?.trim() || "";

  const linkedInMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);
  const linkedIn = linkedInMatch ? linkedInMatch[0] : "";

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
  const text = normalize(resumeText);

  // Specific degree patterns — match only the degree phrase, not the whole blob
  const degreeMatch =
    text.match(/Bachelor of (?:Science|Arts|Engineering|Applied Science)[^,•\n\r]{0,80}/i) ||
    text.match(/Master of (?:Science|Arts|Engineering|Business)[^,•\n\r]{0,80}/i) ||
    text.match(/B\.S\.?\s+(?:in\s+)?[A-Z][A-Za-z &]{4,50}/i) ||
    text.match(/B\.A\.?\s+(?:in\s+)?[A-Z][A-Za-z &]{4,50}/i) ||
    text.match(/Associate(?:'s)? (?:of|in) [A-Z][A-Za-z &]{4,50}/i);

  if (degreeMatch) {
    return degreeMatch[0]
      .replace(/gpa[^,.;\n]*/gi, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .toLowerCase();
  }

  // University name fallback
  const uniMatch =
    text.match(/University of [A-Z][a-zA-Z\s]{3,30}/i) ||
    text.match(/[A-Z][a-zA-Z\s]{2,25}\s+University/i) ||
    text.match(/[A-Z][a-zA-Z\s]{2,25}\s+College/i);

  if (uniMatch) {
    return uniMatch[0].trim().toLowerCase();
  }

  return "a computer science background";
}

function extractResumeEvidence(resumeText = "") {
  const text = normalize(resumeText);
  const STRONG =
    /^(built|developed|designed|created|implemented|led|managed|optimized|delivered|analyzed|engineered|launched|improved|automated|resolved|deployed|maintained|increased|reduced|shipped|integrated|refactored|migrated|established|wrote|tested)/i;

  const found = [];

  // Strategy 1: bullet points embedded in PDF blob (• char)
  const bulletMatches =
    text.match(/[•\u2022]\s*([A-Z][^•\u2022]{15,250}?)(?=[•\u2022]|$)/g) || [];
  for (const b of bulletMatches) {
    const clean = b.replace(/^[•\u2022]\s*/, "").trim();
    if (STRONG.test(clean)) found.push(sentence(clean));
  }

  // Strategy 2: newline-separated segments starting with strong verbs
  const segs = splitIntoSegments(resumeText);
  for (const seg of segs) {
    const clean = seg.replace(/^[-*•\u2022]\s*/, "").trim();
    if (STRONG.test(clean) && clean.length > 20) found.push(sentence(clean));
  }

  // Strategy 3: project-like descriptions
  const projectish = segs
    .filter(
      (l) =>
        /project|platform|database|application|software|api|tool|system|pipeline/i.test(l) &&
        !STRONG.test(l) &&
        l.length > 25
    )
    .map((l) => sentence(l.replace(/^[-*•\u2022]\s*/, "").trim()));

  return [...new Set([...found, ...projectish])].filter(Boolean).slice(0, 5);
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

function buildParagraphOne({ jobTitle, companyName, requirements }) {
  const companyPhrase = companyName ? ` at ${companyName}` : "";

  const cleanReqs = requirements
    .map((r) =>
      r
        .replace(/^you will\s+/i, "")
        .replace(/^you'll\s+/i, "")
        .replace(/^responsible for\s+/i, "")
        .replace(/^required\s*[:\-]?\s*/i, "")
        .replace(/^must have\s+/i, "")
        .replace(/[.!?]+$/, "")
        .trim()
        .toLowerCase()
    )
    .filter((r) => r.length > 10);

  let requirementsSummary = "";
  if (cleanReqs.length >= 3) {
    requirementsSummary =
      `The posting makes clear that ${companyName || "the team"} is looking for someone who can ${cleanReqs[0]}, ` +
      `${cleanReqs[1]}, and ${cleanReqs[2]}. ` +
      (cleanReqs[3]
        ? `Beyond those core responsibilities, the role also calls for the ability to ${cleanReqs[3]}. `
        : "") +
      `These are areas I have specifically focused on developing throughout my academic and project work, ` +
      `and they represent the kind of environment where I consistently perform well.`;
  } else if (cleanReqs.length === 2) {
    requirementsSummary =
      `The posting highlights a need to ${cleanReqs[0]} and ${cleanReqs[1]}. ` +
      `These responsibilities align directly with the work I have done and the skills I have built, ` +
      `making this role a strong match for where I am right now.`;
  } else if (cleanReqs.length === 1) {
    requirementsSummary =
      `The position centers on the ability to ${cleanReqs[0]}, which is something I have been actively developing ` +
      `and have demonstrated in real projects.`;
  } else {
    requirementsSummary =
      `The role${companyPhrase} requires a technically strong candidate who can contribute quickly, ` +
      `work well within a team, and take ownership of meaningful technical work. ` +
      `Those are exactly the qualities I have been building toward throughout my education and project experience.`;
  }

  return [
    sentence(`I am excited to apply for the ${jobTitle}${companyPhrase}`),
    requirementsSummary,
  ].join(" ");
}

function buildParagraphTwo({ education, evidence, resumeSkills }) {
  const skillsPhrase = listPhrase(resumeSkills.slice(0, 6));

  const evidenceLines = [...evidence];
  while (evidenceLines.length < 3) {
    evidenceLines.push(
      "I have continued strengthening my technical foundation through coursework, independent projects, and applied problem solving."
    );
  }

  const evidencePart = evidenceLines.slice(0, 4).join(" ");

  return [
    sentence(
      `My background in ${education} has given me a strong technical foundation that I have consistently applied to real projects`
    ),
    evidencePart,
    skillsPhrase
      ? sentence(
          `My core technical skills include ${skillsPhrase}, and I have used these tools to ship projects that are clean, well-structured, and built to last`
        )
      : "I have focused on writing clean, maintainable code and delivering technical work that teammates and stakeholders can rely on.",
    "I approach every project with attention to detail, a willingness to dig into problems until they are fully understood, and a commitment to producing work that holds up under real conditions.",
  ].join(" ");
}

function buildParagraphThree({ companyName, requirements, resumeSkills, jobTitle }) {
  const jobText = requirements.join(" ").toLowerCase();
  const matched = resumeSkills.filter((s) => jobText.includes(s.toLowerCase()));
  const bridgeSkills = matched.length >= 2 ? matched : resumeSkills;
  const skillsBridge = listPhrase(bridgeSkills.slice(0, 5));

  const specificReq = requirements.find((r) => r.length > 30) || "";
  const bridgeLine = specificReq
    ? sentence(
        `For example, the requirement to ${specificReq
          .replace(/^you will\s+/i, "")
          .replace(/^responsible for\s+/i, "")
          .replace(/[.!?]+$/, "")
          .toLowerCase()} maps directly to work I have already done and can deliver on immediately`
      )
    : "";

  return [
    sentence(
      `The combination of what ${companyName || "your team"} is looking for and what I bring makes this a strong fit from both sides`
    ),
    skillsBridge
      ? sentence(
          `My proficiency in ${skillsBridge} means I can step into the technical expectations of the ${jobTitle} without a long ramp-up period`
        )
      : sentence(
          `My technical background means I can step into the expectations of this role without a long ramp-up period`
        ),
    bridgeLine,
    "Beyond the technical side, I bring clear communication, strong follow-through, and a collaborative mindset that makes it easier for the team to move work forward.",
    sentence(
      `I am genuinely excited about what ${companyName || "your organization"} is building, and I am confident that I would contribute real value while continuing to grow as an engineer`
    ),
  ]
    .filter(Boolean)
    .join(" ");
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a full cover letter object from the resume and job description.
 *
 * @param {{ resumeText, jobDescription, targetRole, companyName, jobTitle }} params
 *   companyName and jobTitle are explicit overrides — skip extraction when provided.
 */
export function buildCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
  companyName: explicitCompany = "",
  jobTitle: explicitTitle = "",
}) {
  const contact = extractContact(resumeText);
  const jobTitle = explicitTitle.trim() || extractJobTitleFromDesc(jobDescription, targetRole);
  const companyName = explicitCompany.trim() || extractCompanyNameFromDesc(jobDescription);
  const education = extractEducation(resumeText);
  const requirements = extractRequirements(jobDescription);
  const evidence = extractResumeEvidence(resumeText);
  const resumeSkills = extractResumeSkills(resumeText);

  const bodyParagraphs = [
    buildParagraphOne({ jobTitle, companyName, requirements }),
    buildParagraphTwo({ education, evidence, resumeSkills }),
    buildParagraphThree({ companyName, requirements, resumeSkills, jobTitle }),
  ];

  return {
    headerName: contact.name,
    headerLine: contact.headerLine,
    linkedIn: contact.linkedIn,
    dateLine: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
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
