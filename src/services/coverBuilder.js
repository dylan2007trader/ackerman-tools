const COMMON_SKILLS = [
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Express",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "SQLite",
  "Git",
  "GitHub",
  "APIs",
  "REST",
  "backend",
  "frontend",
  "full-stack",
  "data structures",
  "algorithms",
  "object-oriented programming",
  "testing",
  "automation",
  "AWS",
  "Docker",
  "Linux",
  "Pandas",
  "NumPy",
  "ETL",
  "databases",
  "cloud",
  "Agile",
  ".NET",
  ".NET Core",
  "Angular",
  "HTML",
  "CSS",
];

function normalizeWhitespace(value = "") {
  return String(value || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanLine(value = "") {
  return normalizeWhitespace(
    String(value || "")
      .replace(/^[-*•\u2022\s]+/, "")
      .trim()
  );
}

function ensureSentence(value = "") {
  const clean = normalizeWhitespace(value);
  if (!clean) return "";
  const withCapital = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(withCapital) ? withCapital : `${withCapital}.`;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
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

function extractLines(text = "") {
  return String(text || "")
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function extractContactInfo(resumeText = "") {
  const lines = extractLines(resumeText);
  const header = lines.slice(0, 6);

  const email =
    header.join(" ").match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

  const phone =
    header
      .join(" ")
      .match(/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/)?.[0] || "";

  const linkedIn = header.find((line) => /linkedin\.com/i.test(line)) || "";
  const location =
    header.find(
      (line) =>
        /,\s*[A-Z]{2}\b/.test(line) ||
        /remote/i.test(line) ||
        /[A-Za-z]+,\s*[A-Za-z]+/.test(line)
    ) || "";

  const possibleName =
    header.find((line) => {
      if (line.length < 5 || line.length > 40) return false;
      if (/\d|@|linkedin|github|http/i.test(line)) return false;
      return /^[A-Za-z .'-]+$/.test(line);
    }) || "Applicant";

  const lineBits = [location, phone, email].filter(Boolean);
  if (linkedIn) lineBits.push(linkedIn);

  return {
    name: titleCase(possibleName),
    headerLine: lineBits.join(" • "),
    email,
    phone,
    linkedIn,
    location,
  };
}

function extractEducationSummary(resumeText = "") {
  const lines = extractLines(resumeText);
  const educationLine =
    lines.find((line) =>
      /university|college|bachelor|master|degree|minor|gpa/i.test(line)
    ) || "";

  if (!educationLine) {
    return "computer science student with a practical, project-driven foundation";
  }

  const cleaned = educationLine
    .replace(/education/i, "")
    .replace(/gpa[^,.;]*/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  return cleaned
    ? cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
    : "computer science student";
}

function extractSkillsFromText(text = "") {
  const lower = normalizeWhitespace(text).toLowerCase();
  return unique(
    COMMON_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()))
  );
}

function listToPhrase(items = []) {
  const clean = unique(items);
  if (clean.length === 0) return "software fundamentals";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function rewriteEvidenceLine(line = "") {
  const clean = cleanLine(line)
    .replace(/^built co-founded/i, "Co-founded and built")
    .replace(/^built contributed to to/i, "Contributed to")
    .replace(/^built supported with/i, "Supported")
    .replace(/^built\s+/i, "Built ")
    .replace(/^developed\s+/i, "Developed ")
    .replace(/^designed\s+/i, "Designed ")
    .replace(/^managed\s+/i, "Managed ")
    .replace(/^performed\s+/i, "Performed ")
    .replace(/\s{2,}/g, " ")
    .trim();

  return ensureSentence(clean);
}

function extractEvidence(resumeText = "") {
  const lines = extractLines(resumeText);

  const bulletLines = lines.filter((line) =>
    /^(built|developed|designed|created|implemented|led|managed|wrote|performed|delivered|analyzed|engineered|supported|co-founded|optimized|resolved)/i.test(
      line
    )
  );

  const experienceLike = lines.filter((line) =>
    /project|platform|database|resume|application|software|tool|api|analysis|etl|marketing|data/i.test(
      line
    )
  );

  return unique([...bulletLines, ...experienceLike])
    .map((line) => rewriteEvidenceLine(line))
    .filter(Boolean)
    .slice(0, 6);
}

function extractJobTitle(jobDescription = "", fallbackRole = "") {
  const lines = extractLines(jobDescription);
  const firstGoodLine =
    lines.find((line) =>
      /engineer|developer|analyst|intern|scientist|specialist/i.test(line)
    ) || "";

  if (fallbackRole) return titleCase(fallbackRole);
  if (firstGoodLine && firstGoodLine.length < 90) return firstGoodLine;
  return "Software Engineering role";
}

function extractCompanyName(jobDescription = "") {
  const lines = extractLines(jobDescription);
  const labeled = lines.find((line) => /^company\s*:/i.test(line));
  if (labeled) return labeled.replace(/^company\s*:/i, "").trim();

  const atMatch = normalizeWhitespace(jobDescription).match(
    /\bat\s+([A-Z][A-Za-z0-9& .-]{2,40})/
  );
  if (atMatch?.[1]) return atMatch[1].trim();

  return "";
}

function extractJobFocusSentence(jobDescription = "") {
  const lines = extractLines(jobDescription);
  const candidate = lines.find((line) => {
    if (line.length < 25 || line.length > 150) return false;
    if (/benefits|equal opportunity|salary|compensation/i.test(line))
      return false;
    return /build|develop|design|support|improve|maintain|power|workflow|platform|services?|software|applications?|systems?/i.test(
      line
    );
  });

  if (!candidate) {
    return "This opportunity stands out because it combines meaningful technical work with room to keep growing as an engineer.";
  }

  return ensureSentence(
    `This opportunity stands out because it focuses on ${candidate
      .replace(/^you will\s+/i, "")
      .replace(/^responsibilities include\s+/i, "")
      .replace(/^developing\s+/i, "building ")
      .replace(/^building\s+/i, "building ")
      .replace(/^designing\s+/i, "designing ")
      .replace(/^supporting\s+/i, "supporting ")
      .replace(/[.:]+$/g, "")}`
  );
}

function buildParagraphOne({
  jobTitle,
  companyName,
  requestedSkills,
  educationSummary,
}) {
  const skillPhrase = listToPhrase(requestedSkills.slice(0, 4));
  return [
    ensureSentence(
      `I am excited to apply for the ${jobTitle}${
        companyName ? ` at ${companyName}` : ""
      }`
    ),
    extractJobFocusSentence,
    ensureSentence(
      `From the description, I can see that your team values ${skillPhrase}`
    ),
    ensureSentence(
      `As someone with a background in ${educationSummary}, I am eager to contribute in a role where strong fundamentals and steady growth both matter`
    ),
    ensureSentence(
      "It is exactly the type of opportunity where I can bring energy, coachability, and practical execution from day one"
    ),
  ];
}

function buildParagraphTwo({ educationSummary, evidence, resumeSkills }) {
  const evidenceLines = evidence.slice(0, 3);
  while (evidenceLines.length < 3) {
    evidenceLines.push(
      "I have continued strengthening my technical foundation through coursework, projects, and hands-on problem solving."
    );
  }

  return [
    ensureSentence(
      `My experience already reflects the kind of work this role requires, combining ${educationSummary} with hands-on technical projects`
    ),
    evidenceLines[0],
    evidenceLines[1],
    evidenceLines[2],
    ensureSentence(
      `Across those experiences, I have strengthened ${listToPhrase(
        resumeSkills.slice(0, 5)
      )} while learning how to write cleaner code, solve problems methodically, and contribute consistently`
    ),
  ];
}

function buildParagraphThree({
  companyName,
  requestedSkills,
  resumeSkills,
  jobTitle,
}) {
  const mappedSkills = unique([...requestedSkills, ...resumeSkills]).slice(
    0,
    5
  );
  return [
    ensureSentence(
      "That background would let me add value quickly in the areas your team cares about most"
    ),
    ensureSentence(
      `I can bring ${listToPhrase(
        mappedSkills
      )} to work that supports the goals of this ${jobTitle}`
    ),
    ensureSentence(
      "Just as importantly, I bring clear communication, follow-through, and a willingness to keep improving when requirements change"
    ),
    ensureSentence(
      "I would approach the role with the goal of delivering reliable work, learning quickly, and making it easier for the team to move projects forward"
    ),
    ensureSentence(
      `I would be excited to contribute that value to ${
        companyName || "your team"
      }`
    ),
  ];
}

function htmlEscape(value = "") {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
  applicantName = "",
  applicantLocation = "",
  applicantPhone = "",
  applicantEmail = "",
  applicantLinkedIn = "",
}) {
  const contact = extractContactInfo(resumeText);
  const jobTitle = extractJobTitle(
    jobDescription,
    targetRole || "Software Engineer"
  );
  const companyName = extractCompanyName(jobDescription);
  const educationSummary = extractEducationSummary(resumeText);
  const requestedSkills = extractSkillsFromText(jobDescription);
  const resumeSkills = extractSkillsFromText(resumeText);
  const evidence = extractEvidence(resumeText);
  const jobFocusSentence = extractJobFocusSentence(jobDescription);

  const paragraphOne = [
    ensureSentence(
      `I am excited to apply for the ${jobTitle}${
        companyName ? ` at ${companyName}` : ""
      }`
    ),
    jobFocusSentence,
    ensureSentence(
      `From the description, I can see that your team values ${listToPhrase(
        requestedSkills.slice(0, 4)
      )}`
    ),
    ensureSentence(
      `As someone with a background in ${educationSummary}, I am eager to contribute in a role where strong fundamentals and steady growth both matter`
    ),
    ensureSentence(
      "It is exactly the type of opportunity where I can bring energy, coachability, and practical execution from day one"
    ),
  ];

  const paragraphTwo = buildParagraphTwo({
    educationSummary,
    evidence,
    resumeSkills,
  });

  const paragraphThree = buildParagraphThree({
    companyName,
    requestedSkills,
    resumeSkills,
    jobTitle,
  });

  return {
    headerName: applicantName || contact.name || "Applicant",
    headerLine:
      [
        applicantLocation || contact.location,
        applicantPhone || contact.phone,
        applicantEmail || contact.email,
        applicantLinkedIn || contact.linkedIn,
      ]
        .filter(Boolean)
        .join(" • ") || "",
    dateLine: new Date().toLocaleDateString(),
    companyLine: "Hiring Team",
    companyName,
    companyLocation: "",
    greeting: "Dear Hiring Team,",
    bodyParagraphs: [
      paragraphOne.join(" "),
      paragraphTwo.join(" "),
      paragraphThree.join(" "),
    ],
    closing:
      "Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to your team.",
    signature: applicantName || contact.name || "Applicant",
  };
}

export function buildCoverLetterText(letter) {
  const lines = [];
  if (letter.headerName) lines.push(letter.headerName);
  if (letter.headerLine) lines.push(letter.headerLine);
  if (letter.dateLine) lines.push(letter.dateLine);
  lines.push("");
  if (letter.companyLine) lines.push(letter.companyLine);
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

export function buildCoverLetterHtml(letter) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>${htmlEscape(letter.signature || "Cover Letter")}</title>
    <style>
      * { box-sizing: border-box; }
      body {
        margin: 42px;
        font-family: Arial, Helvetica, sans-serif;
        color: #111827;
        background: #ffffff;
        line-height: 1.55;
      }
      .header { margin-bottom: 28px; }
      .header-name { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
      .header-line, .date-line { font-size: 15px; }
      .para { margin: 0 0 18px; font-size: 16px; }
      .closing { margin-top: 18px; }
    </style>
  </head>
  <body>
    <div class="header">
      <div class="header-name">${htmlEscape(
        letter.headerName || "Applicant"
      )}</div>
      ${
        letter.headerLine
          ? `<div class="header-line">${htmlEscape(letter.headerLine)}</div>`
          : ""
      }
      ${
        letter.dateLine
          ? `<div class="date-line">${htmlEscape(letter.dateLine)}</div>`
          : ""
      }
    </div>

    <div class="para">${htmlEscape(letter.companyLine || "Hiring Team")}</div>
    ${
      letter.companyName
        ? `<div class="para">${htmlEscape(letter.companyName)}</div>`
        : ""
    }
    ${
      letter.companyLocation
        ? `<div class="para">${htmlEscape(letter.companyLocation)}</div>`
        : ""
    }

    <p class="para">${htmlEscape(letter.greeting || "Dear Hiring Team,")}</p>
    ${(letter.bodyParagraphs || [])
      .map((paragraph) => `<p class="para">${htmlEscape(paragraph)}</p>`)
      .join("")}
    <p class="para closing">${htmlEscape(letter.closing || "")}</p>
    <p class="para">Sincerely,<br />${htmlEscape(
      letter.signature || "Applicant"
    )}</p>
  </body>
</html>`;
}

function downloadBlob(filename, blob) {
  const href = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(href);
}

export function downloadCoverLetterText(
  letter,
  filename = "targeted_cover_letter.txt"
) {
  const content = buildCoverLetterText(letter);
  downloadBlob(
    filename,
    new Blob([content], { type: "text/plain;charset=utf-8" })
  );
}

export function downloadCoverLetterHtml(
  letter,
  filename = "targeted_cover_letter.html"
) {
  const content = buildCoverLetterHtml(letter);
  downloadBlob(
    filename,
    new Blob([content], { type: "text/html;charset=utf-8" })
  );
}

export function printCoverLetterPdf(letter) {
  const content = buildCoverLetterHtml(letter);
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) return;
  win.document.open();
  win.document.write(content);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 250);
}
