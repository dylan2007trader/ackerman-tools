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
  "MongoDB",
  "Git",
  "GitHub",
  "REST",
  "APIs",
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

const ACTION_VERBS = [
  "built",
  "developed",
  "designed",
  "created",
  "implemented",
  "led",
  "managed",
  "wrote",
  "optimized",
  "delivered",
  "analyzed",
  "engineered",
  "launched",
  "improved",
  "co-founded",
  "resolved",
  "supported",
  "automated",
  "maintained",
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
    String(value || "").replace(/^[-*•\u2022\s]+/, "")
  );
}

function ensureSentence(value = "") {
  const clean = normalizeWhitespace(value);
  if (!clean) return "";
  const first = clean.charAt(0).toUpperCase() + clean.slice(1);
  return /[.!?]$/.test(first) ? first : `${first}.`;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function extractLines(text = "") {
  return String(text || "")
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean);
}

function listToPhrase(items = []) {
  const clean = unique(items);
  if (clean.length === 0) return "technical fundamentals";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
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

function extractSkills(text = "") {
  const lower = normalizeWhitespace(text).toLowerCase();
  return unique(
    COMMON_SKILLS.filter((skill) => lower.includes(skill.toLowerCase()))
  );
}

function detectBullets(lines = []) {
  return lines.filter((line) =>
    ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
  );
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
  const email =
    headerText.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone =
    headerText.match(
      /(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/
    )?.[0] || "";
  const location =
    header.find(
      (line) => /,\s*[A-Z]{2}\b/.test(line) || /remote/i.test(line)
    ) || "";
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

function extractEducation(text = "") {
  const lines = extractLines(text);
  return (
    lines.find((line) =>
      /university|college|bachelor|master|degree|minor|gpa/i.test(line)
    ) || "computer science student with a practical, project-based foundation"
  );
}

function rewriteBullet(line = "") {
  return ensureSentence(
    cleanLine(line)
      .replace(/^built co-founded/i, "Co-founded and built")
      .replace(/^built contributed to to/i, "Contributed to")
      .replace(/^built supported with/i, "Supported")
      .replace(/with emphasis on [^.]+/i, "")
      .replace(/including /i, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}

function extractEvidence(text = "") {
  const lines = extractLines(text);
  const bullets = detectBullets(lines).map(rewriteBullet);
  const projectish = lines
    .filter((line) =>
      /project|platform|database|application|software|api|tool|etl|analysis|system/i.test(
        line
      )
    )
    .map((line) => ensureSentence(line));
  return unique([...bullets, ...projectish]).slice(0, 8);
}

function groupSkills(skills = []) {
  const languages = skills.filter((skill) =>
    [
      "python",
      "java",
      "javascript",
      "typescript",
      "sql",
      "html",
      "css",
    ].includes(skill.toLowerCase())
  );
  const frameworks = skills.filter((skill) =>
    [
      "react",
      "node.js",
      "express",
      "apis",
      "rest",
      "backend",
      "frontend",
      "pandas",
      "numpy",
    ].includes(skill.toLowerCase())
  );
  const systems = skills.filter((skill) =>
    [
      "git",
      "databases",
      "aws",
      "docker",
      "linux",
      "etl",
      "sqlite",
      "postgresql",
      "mysql",
    ].includes(skill.toLowerCase())
  );
  const concepts = skills.filter((skill) =>
    [
      "data structures",
      "algorithms",
      "object-oriented programming",
      "automation",
      "testing",
      "cloud",
      "agile",
    ].includes(skill.toLowerCase())
  );

  return [
    { label: "Languages", value: languages },
    { label: "Frameworks and Tools", value: frameworks },
    { label: "Systems and Data", value: systems },
    { label: "Core Concepts", value: concepts },
  ].filter((group) => group.value.length > 0);
}

function analyzeResumeText(text = "", targetRole = "") {
  const resumeText = normalizeWhitespace(text);
  const lines = extractLines(text);
  const words = resumeText.split(/\s+/).filter(Boolean);
  const bullets = detectBullets(lines);
  const skills = extractSkills(resumeText);
  const metricMatches =
    resumeText.match(/\b\d+(?:\.\d+)?%|\$\d+|\b\d+\b/g) || [];
  const sectionMatches = lines.filter((line) =>
    /summary|education|experience|projects|skills|technical|leadership/i.test(
      line
    )
  );
  const actionVerbCount = bullets.filter((line) =>
    ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
  ).length;

  const metricsScore = Math.min(100, metricMatches.length * 18 + 20);
  const skillScore = Math.min(100, skills.length * 12 + 20);
  const bulletScore = Math.min(100, actionVerbCount * 14 + 10);
  const structureScore = Math.min(100, sectionMatches.length * 18 + 20);
  const completenessScore = Math.min(
    100,
    Math.round((words.length / 220) * 100)
  );

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
        : targetSignals.some(
            (signal) => signal.toLowerCase() === skill.toLowerCase()
          )
    )
  );

  const missingSignals = targetSignals.filter(
    (signal) =>
      !matchedSignals.find(
        (match) => match.toLowerCase() === signal.toLowerCase()
      )
  );

  return {
    overall,
    words: words.length,
    bullets: bullets.length,
    skills,
    metricsCount: metricMatches.length,
    matchedSignals,
    missingSignals,
  };
}

function buildPremiumResume({ resumeText = "", targetRole = "" }) {
  const analysis = analyzeResumeText(resumeText, targetRole);
  const lines = extractLines(resumeText);
  const contact = extractContact(resumeText);
  const education = extractEducation(resumeText);
  const skills = analysis.skills.length
    ? analysis.skills
    : extractSkills(resumeText);
  const groupedSkills = groupSkills(skills);
  const bullets = detectBullets(lines)
    .slice(0, 8)
    .map((line) => rewriteBullet(line));
  const projectLines = lines
    .filter((line) =>
      /project|database|platform|application|tool|etl|api|analysis|system/i.test(
        line
      )
    )
    .slice(0, 4)
    .map((line) => ensureSentence(line));

  const roleLine =
    targetRole ||
    "technical roles in software, data, backend, and web development";
  const summary = [
    ensureSentence(
      `Candidate targeting ${roleLine} and bringing a practical foundation from ${education.replace(
        /\.$/,
        ""
      )}`
    ),
    ensureSentence(
      `Core technical strengths include ${listToPhrase(skills.slice(0, 6))}`
    ),
    ensureSentence(
      "Best positioned for teams that want a coachable builder who can write cleaner code, contribute early, and grow into larger ownership"
    ),
  ];

  const output = [];
  output.push(contact.name);
  if (contact.headerLine) output.push(contact.headerLine);
  if (contact.linkedIn) output.push(contact.linkedIn);
  output.push("");
  output.push("PROFESSIONAL SUMMARY");
  summary.forEach((line) => output.push(line));
  output.push("");
  output.push("TECHNICALLY RELEVANT SKILLS");
  if (groupedSkills.length) {
    groupedSkills.forEach((group) =>
      output.push(`${group.label}: ${group.value.join(", ")}`)
    );
  } else {
    output.push(
      "Languages and Tools: Add clearer technical stack wording to strengthen this section."
    );
  }
  output.push("");
  output.push("EDUCATION");
  output.push(education);
  output.push("");
  output.push("EXPERIENCE HIGHLIGHTS");
  if (bullets.length) {
    bullets.forEach((bullet) => output.push(`• ${bullet}`));
  } else {
    output.push(
      "• Add stronger project or work bullets here so the upgraded version can sell your impact faster."
    );
  }
  if (projectLines.length) {
    output.push("");
    output.push("PROJECT SIGNALS");
    projectLines.forEach((line) => output.push(`• ${line}`));
  }
  if (analysis.missingSignals.length) {
    output.push("");
    output.push("KEYWORDS TO WEAVE IN FOR TARGET ROLES");
    output.push(analysis.missingSignals.join(", "));
  }

  return {
    analysis,
    premiumResume: output
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  };
}

function extractJobTitle(jobDescription = "", fallbackRole = "") {
  const lines = extractLines(jobDescription);
  if (fallbackRole) return titleCase(fallbackRole);
  const firstGoodLine =
    lines.find((line) =>
      /engineer|developer|analyst|intern|scientist|specialist|manager/i.test(
        line
      )
    ) || "";
  if (firstGoodLine && firstGoodLine.length < 90) return firstGoodLine;
  return "Software engineering role";
}

function extractCompanyName(jobDescription = "") {
  const lines = extractLines(jobDescription);
  const labeled = lines.find((line) => /^company\s*:/i.test(line));
  if (labeled) return labeled.replace(/^company\s*:/i, "").trim();
  const atMatch = normalizeWhitespace(jobDescription).match(
    /\bat\s+([A-Z][A-Za-z0-9& .-]{2,50})/
  );
  return atMatch?.[1]?.trim() || "";
}

function extractJobFocus(jobDescription = "") {
  const lines = extractLines(jobDescription);
  return (
    lines.find((line) => {
      if (line.length < 35 || line.length > 180) return false;
      if (/benefits|salary|compensation|equal opportunity|perks/i.test(line))
        return false;
      return /build|develop|design|support|improve|maintain|power|workflow|platform|service|software|application|system/i.test(
        line
      );
    }) || ""
  );
}

function extractRequestedSkills(jobDescription = "", targetRole = "") {
  return unique([
    ...extractSkills(jobDescription),
    ...extractSkills(targetRole),
  ]).slice(0, 8);
}

function sentencePoolForRole(
  role,
  company,
  focusSentence,
  requestedSkills,
  education
) {
  const skillPhrase = listToPhrase(requestedSkills.slice(0, 5));
  const companyText = company ? ` at ${company}` : "";
  return [
    ensureSentence(`I am excited to apply for the ${role}${companyText}`),
    ensureSentence(
      focusSentence
        ? `What stands out to me about this opportunity is the chance to ${focusSentence
            .replace(/^you will\s+/i, "")
            .replace(/[.:]+$/g, "")}`
        : "What stands out to me about this opportunity is the combination of meaningful technical work and room to keep growing as an engineer"
    ),
    ensureSentence(
      `From the description, it is clear that your team values ${skillPhrase}`
    ),
    ensureSentence(
      `My background in ${education.replace(
        /\.$/,
        ""
      )} has prepared me to contribute in a role where strong fundamentals and steady execution both matter`
    ),
    ensureSentence(
      "It is the kind of role where I can bring curiosity, coachability, and consistent effort from day one"
    ),
  ];
}

function sentencePoolForExperience(education, evidence, resumeSkills) {
  const cleanEvidence = evidence.slice(0, 3);
  while (cleanEvidence.length < 3) {
    cleanEvidence.push(
      "I have continued strengthening my technical foundation through coursework, projects, and hands-on problem solving."
    );
  }

  return [
    ensureSentence(
      `My resume reflects the kind of work I would bring into this position, combining ${education.replace(
        /\.$/,
        ""
      )} with hands-on technical projects`
    ),
    cleanEvidence[0],
    cleanEvidence[1],
    cleanEvidence[2],
    ensureSentence(
      `Across that work, I have kept building around ${listToPhrase(
        resumeSkills.slice(0, 5)
      )}`
    ),
  ];
}

function sentencePoolForValue(requestedSkills, resumeSkills, company) {
  const matched = unique(
    resumeSkills.filter((skill) =>
      requestedSkills.some(
        (wanted) => wanted.toLowerCase() === skill.toLowerCase()
      )
    )
  );
  const finalSkills = matched.length ? matched : resumeSkills.slice(0, 5);
  const companyText = company || "your team";

  return [
    ensureSentence(
      `That background would let me contribute in the areas ${companyText} cares about most, especially ${listToPhrase(
        requestedSkills.slice(0, 5)
      )}`
    ),
    ensureSentence(
      `I would bring ${listToPhrase(
        finalSkills.slice(0, 5)
      )}, along with strong communication, follow-through, and a willingness to learn quickly`
    ),
    ensureSentence(
      "Just as important, I know how to turn technical work into output that feels clear, dependable, and easier for a team to trust and build on"
    ),
    ensureSentence(
      "I would approach the role with a bias toward listening well, contributing early, and steadily taking on more ownership as I grow"
    ),
    ensureSentence(
      `I would be excited to bring that value to ${companyText} while supporting work that is practical, thoughtful, and ready to scale`
    ),
  ];
}

function buildStructuredCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
}) {
  const contact = extractContact(resumeText);
  const education = extractEducation(resumeText);
  const evidence = extractEvidence(resumeText);
  const resumeSkills = extractSkills(resumeText);
  const requestedSkills = extractRequestedSkills(jobDescription, targetRole);
  const role = extractJobTitle(
    jobDescription,
    targetRole || "Software Engineer"
  );
  const company = extractCompanyName(jobDescription);
  const focusSentence = extractJobFocus(jobDescription);

  const bodyParagraphs = [
    sentencePoolForRole(
      role,
      company,
      focusSentence,
      requestedSkills,
      education
    ).join(" "),
    sentencePoolForExperience(education, evidence, resumeSkills).join(" "),
    sentencePoolForValue(requestedSkills, resumeSkills, company).join(" "),
  ];

  return {
    headerName: contact.name,
    headerLine: [contact.location, contact.phone, contact.email]
      .filter(Boolean)
      .join(" • "),
    linkedIn: contact.linkedIn,
    dateLine: new Date().toLocaleDateString("en-US"),
    companyLine: "Hiring Team",
    companyName: company,
    companyLocation: "",
    greeting: "Dear Hiring Team,",
    bodyParagraphs,
    closing:
      "Thank you for considering my application. I would welcome the opportunity to discuss how I can contribute to your team.",
    signature: contact.name,
  };
}

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
