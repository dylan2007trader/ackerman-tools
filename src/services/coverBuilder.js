// Cover letter builder
// Architecture:
//   1. Parse  — extract structured data from resume + JD
//   2. Rank   — score evidence bullets by relevance to the JD
//   3. Synthesize — turn ranked evidence into coherent prose (not bullet dumps)
//   4. Assemble — build 3 varied, specific paragraphs + render HTML/DOCX/TXT

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

function esc(s = "") {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function splitIntoSegments(text = "") {
  const norm = normalize(text);
  const byNewline = norm.split("\n").map((s) => s.trim()).filter(Boolean);
  if (byNewline.length > 4) return byNewline;
  return norm
    .split(/(?<=[.!?])\s+(?=[A-Z"'])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8);
}

// Pick a random item from an array — gives variety across generations
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
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
  const labelMatch = norm.match(/\bcompany\s*[:\-]\s*([A-Z][A-Za-z0-9&.,\s]{2,40}?)(?:\n|,|\s{2}|$)/);
  if (labelMatch?.[1]) return labelMatch[1].trim().replace(/[,.]$/, "");
  const atMatch = norm.match(
    /\b(?:at|join|joining|with)\s+([A-Z][A-Za-z0-9&. ]{2,35}?)(?:\.|,|\s{2}|\s+to\s|\s+and\s|$)/
  );
  if (atMatch?.[1]) {
    const candidate = atMatch[1].trim().replace(/[,.]$/, "");
    const TECH_NOISE =
      /^(the|a|an|our|your|rest|api|apis|sql|git|aws|docker|agile|linux|python|java|react|node|angular|vue|typescript|javascript|html|css|cloud|data|software|systems?|services?|platforms?|solutions?|applications?|tools?|code|project|team|company|organization|role|position|us|you|they|we)\b/i;
    if (!TECH_NOISE.test(candidate) && candidate.length > 2) return candidate;
  }
  return "";
}

function extractJobTechs(jobDesc = "") {
  const TECH_LIST = [
    "Java", "Python", "React", "SQL", "Node.js", "Spring Boot", "Spring",
    "JavaScript", "TypeScript", "Angular", "Vue", "PostgreSQL", "MySQL",
    "MongoDB", "Docker", "AWS", "Azure", "Kubernetes", "Git", "REST",
    "GraphQL", "C++", "C#", ".NET", "Go", "Kotlin", "Swift", "Redis",
    "Kafka", "Spark", "TensorFlow", "PyTorch", "Pandas", "NumPy", "ETL",
    "HTML", "CSS", "Linux", "Agile", "Scrum", "CI/CD", "Express", "SQLite",
    "Flask", "Django", "FastAPI", "Next.js", "Tailwind",
  ];
  const lower = jobDesc.toLowerCase();
  return TECH_LIST.filter((t) => lower.includes(t.toLowerCase()));
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
  const req = segs.filter((l) => l.length >= 20 && l.length <= 220 && !SKIP.test(l) && WANT.test(l));
  const qual = segs.filter((l) => l.length >= 15 && l.length <= 180 && !SKIP.test(l) && QUAL.test(l));
  return [...new Set([...req, ...qual])].slice(0, 6);
}

/**
 * Detect the type of role from the JD and title.
 * Returns: "internship" | "new-grad" | "full-time"
 */
function extractRoleType(jobTitle = "", jobDesc = "") {
  const text = (jobTitle + " " + jobDesc).toLowerCase();
  if (/intern|internship|co.?op/i.test(text)) return "internship";
  if (/new.?grad|new graduate|entry.?level|junior|0.?[\-–]?1.?year/i.test(text)) return "new-grad";
  return "full-time";
}

/**
 * Extract high-level themes the JD is signaling — used to write
 * a more specific paragraph 1 without quoting requirements verbatim.
 */
function extractRoleThemes(jobDesc = "", jobTechs = [], requirements = []) {
  const all = (jobDesc + " " + requirements.join(" ")).toLowerCase();
  const themes = [];

  if (/web app|frontend|ui|user interface|component|browser/i.test(all)) themes.push("web application development");
  if (/backend|api|rest|endpoint|service|microservice/i.test(all)) themes.push("backend services and APIs");
  if (/database|sql|schema|query|relational|data model/i.test(all)) themes.push("database design and data modeling");
  if (/data|pipeline|etl|analytics|reporting|dashbo/i.test(all)) themes.push("data engineering and analytics");
  if (/machine learning|ml|model|training|inference|ai/i.test(all)) themes.push("machine learning and AI");
  if (/mobile|ios|android|flutter|react native/i.test(all)) themes.push("mobile development");
  if (/cloud|aws|azure|gcp|deploy|infrastructure|devops/i.test(all)) themes.push("cloud infrastructure and deployment");
  if (/test|qa|quality|coverage|unit test|integration test/i.test(all)) themes.push("software testing and quality assurance");
  if (/full.?stack|end.?to.?end|frontend.+backend/i.test(all)) themes.push("full-stack development");
  if (/maintain|debug|bug|legacy|refactor/i.test(all)) themes.push("codebase maintenance and debugging");
  if (/collaborate|cross.functional|team|agile|scrum|sprint/i.test(all)) themes.push("collaborative agile development");

  // Also infer from tech stack when themes are sparse
  if (!themes.length && jobTechs.length) {
    const techStr = jobTechs.join(" ").toLowerCase();
    if (/react|angular|vue|html|css/.test(techStr)) themes.push("frontend development");
    if (/node|spring|django|flask|express/.test(techStr)) themes.push("backend development");
    if (/pandas|numpy|spark|sql/.test(techStr)) themes.push("data processing and analysis");
  }

  return themes.slice(0, 3);
}

// ─── Resume parsing ──────────────────────────────────────────────────────────

function extractNameFromText(resumeText = "") {
  const lines = resumeText
    .trim()
    .split("\n")
    .slice(0, 12)
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (/@|\.com|linkedin|github/i.test(line)) continue;
    if (/[,]\s*[A-Z]{2}\b/.test(line)) continue;
    if (/^\+?1?[\s.\-]?\(?\d{3}/.test(line)) continue;
    if (/^\d/.test(line)) continue;
    if (line.length > 45 || line.length < 3) continue;

    const match = line.match(/^([A-Z][a-z'-]+(?:\s[A-Z][a-z'-]+){1,3})$/);
    if (match) {
      const candidate = match[1].trim();
      if (
        /^(education|experience|skills?|projects?|summary|objective|profile|work|leadership|certifications?|activities|contact|technical|languages?|frameworks?|data|concepts?|about)/i.test(
          candidate
        )
      )
        continue;
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
  const locationMatch = text.match(/([A-Z][a-zA-Z ]{1,20},\s*[A-Z]{2})\b/);
  const location = locationMatch?.[1]?.trim() || "";

  const linkedInRaw = text.match(/linkedin\.com\/in\/[A-Za-z0-9_%-]+/i)?.[0] || "";
  const linkedIn = linkedInRaw.replace(
    /linkedin\.com\/in\/https?:\/\/(?:www\.)?linkedin\.com\/in\//i,
    "linkedin.com/in/"
  );

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
  const degreeMatch =
    text.match(/Bachelor of (?:Science|Arts|Engineering|Applied Science)[^,•\n\r]{0,80}/i) ||
    text.match(/Master of (?:Science|Arts|Engineering|Business)[^,•\n\r]{0,80}/i) ||
    text.match(/B\.S\.?\s+(?:in\s+)?[A-Z][A-Za-z &]{4,50}/i) ||
    text.match(/B\.A\.?\s+(?:in\s+)?[A-Z][A-Za-z &]{4,50}/i) ||
    text.match(/Associate(?:'s)? (?:of|in) [A-Z][A-Za-z &]{4,50}/i);
  if (degreeMatch)
    return degreeMatch[0].replace(/gpa[^,.;\n]*/gi, "").replace(/\s{2,}/g, " ").trim().toLowerCase();
  const uniMatch =
    text.match(/University of [A-Z][a-zA-Z\s]{3,30}/i) ||
    text.match(/[A-Z][a-zA-Z\s]{2,25}\s+University/i) ||
    text.match(/[A-Z][a-zA-Z\s]{2,25}\s+College/i);
  if (uniMatch) return uniMatch[0].trim().toLowerCase();
  return "a computer science background";
}

/**
 * Extract the employer name from the resume (most recent non-service job).
 * Used to refer to real work context in paragraph 2.
 */
function extractEmployer(resumeText = "") {
  const NONTECHNICAL = /ihop|first watch|villa peru|waiter|waitress|server|restaurant|cashier|retail/i;
  const segs = splitIntoSegments(resumeText);
  for (const seg of segs) {
    // "Founder   Ackerman Tools, Tucson" or "Software Engineer   Google"
    const m = seg.match(/^(?:Founder|CEO|Engineer|Developer|Intern|Analyst|Lead|Manager)\s+([A-Z][A-Za-z0-9 .,&]{3,40}?)(?:,|\s{2}|$)/);
    if (m && !NONTECHNICAL.test(m[1])) return m[1].trim().replace(/,\s*$/, "");
  }
  return "";
}

/**
 * Extract strong achievement bullets from the resume.
 * Cleans fragmented PDF text and filters non-technical content.
 */
function extractResumeEvidence(resumeText = "") {
  const text = normalize(resumeText);
  const STRONG =
    /^(built|developed|designed|created|implemented|led|managed|optimized|delivered|analyzed|engineered|launched|improved|automated|resolved|deployed|maintained|increased|reduced|shipped|integrated|refactored|migrated|established|wrote|tested|architected|executed)/i;
  const NONTECHNICAL =
    /server|waiter|waitress|restaurant|cashier|barista|cook|kitchen|ihop|first watch|villa peru|retail|customer service|client service|high.volume/i;
  const JOB_HEADER = /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|present)\b.*\d{4}/i;

  const found = new Set();

  const bulletMatches = text.match(/[•\u2022]\s*([A-Z][^•\u2022]{15,250}?)(?=[•\u2022]|$)/g) || [];
  for (const b of bulletMatches) {
    const clean = b.replace(/^[•\u2022]\s*/, "").replace(/\n+/g, " ").trim();
    if (STRONG.test(clean) && !NONTECHNICAL.test(clean) && !JOB_HEADER.test(clean))
      found.add(sentence(clean));
  }

  const segs = splitIntoSegments(resumeText);
  for (const seg of segs) {
    const clean = seg.replace(/^[-–*•\u2022]\s*/, "").replace(/\n+/g, " ").trim();
    if (
      STRONG.test(clean) &&
      clean.length > 25 &&
      clean.length < 280 &&
      !NONTECHNICAL.test(clean) &&
      !JOB_HEADER.test(clean)
    )
      found.add(sentence(clean));
  }

  return [...found].filter(Boolean);
}

function extractResumeSkills(resumeText = "") {
  const SKILL_LIST = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Git", "GitHub", "REST",
    "APIs", "backend", "frontend", "full-stack", "data structures", "algorithms",
    "object-oriented programming", "testing", "automation", "AWS", "Docker",
    "Linux", "Pandas", "NumPy", "ETL", "cloud", "Agile", "HTML", "CSS", "Angular",
    ".NET", "C++", "C#", "Go", "Rust", "Kotlin", "Swift", "TensorFlow", "PyTorch",
    "Spring Boot", "Spring", "GraphQL", "SQLite", "Flask", "Django",
  ];
  const lower = resumeText.toLowerCase();
  return [...new Set(SKILL_LIST.filter((s) => lower.includes(s.toLowerCase())))];
}

// ─── Relevance ranking ───────────────────────────────────────────────────────

/**
 * Semantic concept clusters — a bullet scores points if it and the JD
 * share the same cluster, even without exact keyword overlap.
 */
const CONCEPT_CLUSTERS = [
  ["api", "rest", "endpoint", "service", "backend", "server", "microservice"],
  ["database", "sql", "schema", "query", "postgres", "mysql", "sqlite", "relational"],
  ["frontend", "react", "ui", "interface", "component", "browser", "html", "css"],
  ["deploy", "ship", "release", "production", "launch", "ci", "cd", "pipeline"],
  ["test", "qa", "quality", "coverage", "unit test", "integration"],
  ["data", "etl", "pipeline", "analytics", "pandas", "numpy", "dataset", "cleaning"],
  ["auth", "security", "jwt", "permission", "access", "token", "session"],
  ["scale", "performance", "optimize", "latency", "throughput", "efficiency"],
  ["mobile", "ios", "android", "flutter", "native"],
  ["cloud", "aws", "azure", "gcp", "infrastructure", "kubernetes", "docker"],
  ["machine learning", "ml", "model", "training", "tensorflow", "pytorch"],
];

function scoreBulletRelevance(bullet, jobDesc, jobTechs) {
  const b = bullet.toLowerCase();
  const j = jobDesc.toLowerCase();
  let score = 0;

  // Direct technology overlap — strongest signal
  for (const tech of jobTechs) {
    if (b.includes(tech.toLowerCase())) score += 18;
  }

  // Semantic concept cluster overlap
  for (const cluster of CONCEPT_CLUSTERS) {
    const bulletHas = cluster.some((k) => b.includes(k));
    const jdHas = cluster.some((k) => j.includes(k));
    if (bulletHas && jdHas) score += 10;
  }

  // Quality bonuses
  if (/^(engineered|architected|built|designed|shipped|deployed)/i.test(bullet.trim())) score += 6;
  if (bullet.length > 80) score += 4;
  if (bullet.length > 140) score += 4;

  return score;
}

/**
 * Return the top N evidence bullets ranked by relevance to the job description.
 * Falls back to all evidence if fewer than N are available.
 */
function selectTopEvidence(evidence, jobDesc, jobTechs, n = 3) {
  if (!evidence.length) return [];
  const scored = evidence.map((e) => ({
    text: e,
    score: scoreBulletRelevance(e, jobDesc, jobTechs),
  }));
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((e) => e.text);
}

// ─── Prose synthesis ─────────────────────────────────────────────────────────

/**
 * Convert a resume bullet into natural prose by stripping leading markers.
 * Does NOT paraphrase — keeps the candidate's own language.
 */
function bulletToProse(bullet = "") {
  return sentence(bullet.replace(/^[-–•*\u2022]\s*/, "").replace(/\n+/g, " ").trim());
}

/**
 * Build a multi-sentence prose block from 1–3 evidence bullets using varied
 * connective phrases. Never joins them with a bare space.
 *
 * Patterns vary based on how many bullets are available so output
 * doesn't sound identical across different resumes.
 */
function synthesizeEvidence(topEvidence, employer = "") {
  const contextPrefix = employer ? `At ${employer}, ` : "In one project, ";

  if (!topEvidence.length) {
    return "Through coursework and independent projects, I have applied core software engineering principles to build reliable, maintainable systems.";
  }

  if (topEvidence.length === 1) {
    return bulletToProse(topEvidence[0]) + " I have continued building on this through additional coursework and independent problem solving.";
  }

  if (topEvidence.length === 2) {
    const connectors = [
      `${bulletToProse(topEvidence[0])} Building on this, I have also ${bulletToProse(topEvidence[1]).charAt(0).toLowerCase() + bulletToProse(topEvidence[1]).slice(1)}`,
      `${bulletToProse(topEvidence[0])} More recently, I ${bulletToProse(topEvidence[1]).charAt(0).toLowerCase() + bulletToProse(topEvidence[1]).slice(1)}`,
      `${contextPrefix}${bulletToProse(topEvidence[0]).charAt(0).toLowerCase() + bulletToProse(topEvidence[0]).slice(1)} I have also ${bulletToProse(topEvidence[1]).charAt(0).toLowerCase() + bulletToProse(topEvidence[1]).slice(1)}`,
    ];
    return pick(connectors);
  }

  // 3 bullets — two-sentence structure so it reads like a paragraph, not a list
  const e1 = bulletToProse(topEvidence[0]);
  const e2 = bulletToProse(topEvidence[1]);
  const e3 = bulletToProse(topEvidence[2]);

  const bridge12 = pick(["Building on this,", "I have also", "More recently,"]);
  const bridge23 = pick(["Beyond that,", "Additionally,", "I have also"]);

  const joined2 = e2.charAt(0).toLowerCase() + e2.slice(1);
  const joined3 = e3.charAt(0).toLowerCase() + e3.slice(1);

  const patterns = [
    `${e1} ${bridge12} ${joined2} ${bridge23} ${joined3}`,
    `${contextPrefix}${e1.charAt(0).toLowerCase() + e1.slice(1)} ${bridge12} ${joined2} ${bridge23} ${joined3}`,
  ];
  return pick(patterns);
}

// ─── Paragraph builders ──────────────────────────────────────────────────────

/**
 * Paragraph 1 — opening.
 * Varies the opener based on role type and available context.
 * Describes what the role does using JD themes, not verbatim requirements.
 */
function buildParagraphOne({ jobTitle, companyName, roleType, themes, jobTechs, jobDescription }) {
  const co = companyName || "your organization";
  const companyPhrase = companyName ? ` at ${companyName}` : "";

  // Pick a varied opening sentence based on available context
  const openers = [];
  if (roleType === "internship") {
    openers.push(
      `I am writing to apply for the ${jobTitle}${companyPhrase}, which stands out to me as an opportunity to contribute real work while deepening my technical foundation.`,
      `The ${jobTitle}${companyPhrase} is exactly the kind of hands-on opportunity I have been looking for — one where I can learn from experienced engineers while delivering meaningful technical contributions.`,
      companyName
        ? `When I came across the ${jobTitle} internship at ${companyName}, it immediately aligned with both my current skill set and where I want to grow as an engineer.`
        : `I am excited to apply for this internship, which offers a clear opportunity to contribute technical work while growing alongside an experienced team.`
    );
  } else {
    openers.push(
      `I am writing to express my interest in the ${jobTitle}${companyPhrase}.`,
      `The ${jobTitle}${companyPhrase} is a strong match for where I am right now — technically grounded, motivated to own hard problems, and ready to ship.`,
      companyName
        ? `When I came across the ${jobTitle} role at ${companyName}, it was an immediate fit for the kind of engineering work I have been building toward.`
        : `I am excited to apply for the ${jobTitle} position and believe my background is a strong match for what the role requires.`
    );
  }
  const opener = pick(openers);

  // Describe the role using themes, not raw JD requirements
  let roleDesc = "";
  if (themes.length >= 2) {
    roleDesc = `The role centers on ${listPhrase(themes.slice(0, 2))}, with an emphasis on delivering clean, reliable work within a collaborative team.`;
  } else if (themes.length === 1) {
    roleDesc = `The role focuses on ${themes[0]}, which is an area I have invested significant time developing through real project work.`;
  } else if (jobTechs.length >= 2) {
    roleDesc = `The technical scope — centered on ${listPhrase(jobTechs.slice(0, 3))} — maps directly to tools I have used in production.`;
  } else {
    roleDesc = `The scope of the role aligns directly with the technical work I have been doing, and I am confident I can contribute from day one.`;
  }

  // Fit statement varies by role type
  const fitStatements = roleType === "internship"
    ? [
        `These are areas I have actively developed through coursework and independent projects, and ${co} represents the kind of team I want to grow with.`,
        `I have spent the past several months building toward exactly this type of contribution, and I am confident I would bring genuine value to the team.`,
      ]
    : [
        `These are areas I have worked in directly, and this role represents the kind of environment where I perform at my best.`,
        `I have built practical experience across all of these areas, and I am confident I can step in and contribute without an extended ramp-up.`,
      ];
  const fit = pick(fitStatements);

  return `${opener} ${roleDesc} ${fit}`;
}

/**
 * Paragraph 2 — candidate background.
 * Uses relevance-ranked evidence and synthesizes it into prose.
 * Never joins bullets directly — always uses connective language.
 * Skills are mentioned in context, not as a disconnected list.
 */
function buildParagraphTwo({ education, topEvidence, resumeSkills, jobTechs, employer, roleType }) {
  // Only mention skills that are relevant to the JD
  const jdSkills = resumeSkills.filter((s) =>
    jobTechs.some(
      (t) => t.toLowerCase() === s.toLowerCase() || s.toLowerCase().includes(t.toLowerCase())
    )
  );
  const skillsToMention = jdSkills.length >= 2 ? jdSkills : resumeSkills;
  const skillsPhrase = listPhrase(skillsToMention.slice(0, 5));

  // Intro varies by role type
  const intros = roleType === "internship"
    ? [
        `My background in ${education} has given me a foundation I have been deliberately strengthening through hands-on project work.`,
        `Studying ${education} has taught me more than theory — I have applied what I have learned in real projects that shipped and had to hold up under real conditions.`,
      ]
    : [
        `My background in ${education} has given me a strong technical foundation that I have consistently applied through shipped, production-facing work.`,
        `Through my studies in ${education} and independent engineering work, I have built a track record of taking on hard technical problems and delivering working solutions.`,
      ];
  const intro = pick(intros);

  // Synthesize ranked evidence into connected prose
  const evidenceProse = synthesizeEvidence(topEvidence, employer);

  // Skill context — mention skills in relation to what was built, not as a detached list
  let skillsLine = "";
  if (skillsPhrase) {
    const skillContexts = [
      `Across this work, I have leaned heavily on ${skillsPhrase}, applying them in ways that go beyond coursework and into production contexts.`,
      `The tools I reached for most often — ${skillsPhrase} — are the same ones this role requires, which means I am not learning them here; I am refining them.`,
      `My primary technical stack includes ${skillsPhrase}, all of which I have used on real projects with real constraints.`,
    ];
    skillsLine = pick(skillContexts);
  } else {
    skillsLine = "I focus on writing clean, well-tested code and delivering work that holds up under real conditions.";
  }

  return [intro, evidenceProse, skillsLine].join(" ");
}

/**
 * Paragraph 3 — fit and closing argument.
 * Specific to the company/role. References JD signals, not generic phrases.
 * Ends with a genuine, non-formulaic expression of interest.
 */
function buildParagraphThree({ companyName, themes, resumeSkills, jobTechs, jobTitle, roleType, jobDescription }) {
  const co = companyName || "your team";

  // Identify the strongest skill overlap between resume and JD
  const allJobTerms = [
    ...jobTechs.map((t) => t.toLowerCase()),
    ...themes.join(" ").toLowerCase().split(/\W+/),
  ];
  const matched = resumeSkills.filter((s) =>
    allJobTerms.some((t) => t.length > 2 && (t.includes(s.toLowerCase()) || s.toLowerCase().includes(t)))
  );
  const bridgeSkills = matched.length >= 2 ? matched : resumeSkills;
  const skillsBridge = listPhrase(bridgeSkills.slice(0, 3));

  // Opening line varies — avoids the "combination of X and Y" cliché
  const openings = [
    companyName
      ? `What draws me to ${companyName} specifically is ${themes.length ? themes[0] : "the engineering culture and technical challenges described in the posting"}.`
      : `What draws me to this role specifically is the emphasis on ${themes.length ? themes[0] : "meaningful, production-facing technical work"}.`,
    `This is not a generic application — the technical scope of this role matches exactly what I have been building toward.`,
    companyName
      ? `I have thought carefully about whether this role at ${companyName} is the right fit, and I believe it genuinely is.`
      : `The scope of this role aligns closely with the work I have already done and the direction I want to continue growing in.`,
  ];
  const opening = pick(openings);

  // Technical bridge — specific, not boilerplate
  let techBridge = "";
  if (skillsBridge) {
    const bridgeLines = [
      `My hands-on experience with ${skillsBridge} means I can meet the core technical requirements without a long ramp-up, and I am ready to start contributing in the first week.`,
      `The overlap between my experience with ${skillsBridge} and what this role requires means I can contribute immediately while continuing to deepen my expertise.`,
      `Because I have already used ${skillsBridge} in production contexts, I can step into the technical expectations of the ${jobTitle} from day one.`,
    ];
    techBridge = pick(bridgeLines);
  } else {
    techBridge = `I am confident I can meet the technical expectations of this role and contribute meaningfully from day one.`;
  }

  // Soft skills / collaboration — one sentence, not boilerplate
  const softLines = [
    `I also bring a consistent work ethic, clear written communication, and a habit of flagging problems early — qualities that matter as much as technical skill in any engineering team.`,
    `Beyond code, I bring follow-through, the ability to explain technical decisions clearly, and a collaborative instinct that makes cross-team work easier.`,
    `I work well independently and in teams, communicate clearly about progress and blockers, and take feedback seriously — all of which I know matter as much as the technical fundamentals.`,
  ];
  const soft = pick(softLines);

  // Closing — genuine interest, not a form letter cliché
  const closings = roleType === "internship"
    ? [
        companyName
          ? `I would be thrilled to bring this energy to ${companyName} this summer and would welcome any chance to discuss the role further.`
          : `I am eager to bring this energy to a team where I can make real contributions and grow alongside experienced engineers.`,
        `This is exactly the kind of internship that would accelerate my development as an engineer, and I would welcome the chance to discuss how I can contribute.`,
      ]
    : [
        companyName
          ? `I am genuinely interested in what ${companyName} is building, and I am confident I would be a strong, low-friction addition to the team.`
          : `I am genuinely excited about this role and confident I would add real value to the team.`,
        `I am not looking for any engineering job — I am looking for this one, and I would welcome the opportunity to make the case in person.`,
      ];
  const closing = pick(closings);

  return [opening, techBridge, soft, closing].join(" ");
}

// ─── HTML renderer ──────────────────────────────────────────────────────────

function buildCoverLetterHtml(letter) {
  const paras = (letter.bodyParagraphs || [])
    .map((p) => `<p class="para">${esc(p)}</p>`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Cover Letter</title>
<style>
  @page { size: letter portrait; margin: 0; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Calibri", Arial, sans-serif;
    font-size: 11pt;
    color: #111;
    line-height: 1.55;
    padding: 0.85in 1.05in 0.85in 1.05in;
    background: #fff;
  }
  .name { font-size: 13.5pt; font-weight: 700; margin-bottom: 3pt; }
  .contact { font-size: 10pt; color: #333; margin-bottom: 2pt; }
  .date { margin-top: 18pt; margin-bottom: 18pt; }
  .greeting { margin-bottom: 14pt; }
  .para { margin-bottom: 13pt; text-align: justify; }
  .closing { margin-top: 13pt; text-align: justify; }
  .sign-gap { height: 28pt; }
  @media print { body { -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>
  <div class="name">${esc(letter.headerName)}</div>
  ${letter.headerLine ? `<div class="contact">${esc(letter.headerLine)}</div>` : ""}
  ${letter.linkedIn ? `<div class="contact">${esc(letter.linkedIn)}</div>` : ""}
  <div class="date">${esc(letter.dateLine)}</div>
  <div class="greeting">${esc(letter.greeting || "Dear Hiring Team,")}</div>
  ${paras}
  <p class="closing">${esc(letter.closing || "")}</p>
  <div class="sign-gap"></div>
  <p>Sincerely,</p>
  <div class="sign-gap"></div>
  <p>${esc(letter.signature)}</p>
</body>
</html>`;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Build a full cover letter object from the resume and job description.
 *
 * Pipeline:
 *   parse → rank evidence by JD relevance → synthesize → assemble paragraphs
 */
export function buildCoverLetter({
  resumeText = "",
  jobDescription = "",
  targetRole = "",
  companyName: explicitCompany = "",
  jobTitle: explicitTitle = "",
}) {
  // ── 1. Parse ──
  const contact     = extractContact(resumeText);
  const jobTitle    = explicitTitle.trim()  || extractJobTitleFromDesc(jobDescription, targetRole);
  const companyName = explicitCompany.trim() || extractCompanyNameFromDesc(jobDescription);
  const education   = extractEducation(resumeText);
  const employer    = extractEmployer(resumeText);
  const roleType    = extractRoleType(jobTitle, jobDescription);
  const requirements = extractRequirements(jobDescription);
  const jobTechs    = extractJobTechs(jobDescription);
  const themes      = extractRoleThemes(jobDescription, jobTechs, requirements);
  const allEvidence = extractResumeEvidence(resumeText);
  const resumeSkills = extractResumeSkills(resumeText);

  // ── 2. Rank evidence by relevance to this specific job ──
  const topEvidence = selectTopEvidence(allEvidence, jobDescription, jobTechs, 3);

  // ── 3. Build paragraphs ──
  const bodyParagraphs = [
    buildParagraphOne({ jobTitle, companyName, roleType, themes, jobTechs, jobDescription }),
    buildParagraphTwo({ education, topEvidence, resumeSkills, jobTechs, employer, roleType }),
    buildParagraphThree({ companyName, themes, resumeSkills, jobTechs, jobTitle, roleType, jobDescription }),
  ];

  // ── 4. Closing line ──
  const closingLines = [
    "Thank you for taking the time to review my application. I would welcome the opportunity to discuss how my background fits what you are building.",
    "Thank you for your consideration — I look forward to the possibility of discussing this role further.",
    "I appreciate you taking the time to review my application and would welcome any opportunity to continue the conversation.",
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
    greeting: "Dear Hiring Manager,",
    bodyParagraphs,
    closing: pick(closingLines),
    signature: contact.name,
  };
}

/** Render the cover letter as plain text */
export function buildCoverLetterText(letter) {
  const out = [];
  if (letter.headerName) out.push(letter.headerName);
  if (letter.headerLine) out.push(letter.headerLine);
  if (letter.linkedIn) out.push(letter.linkedIn);
  if (letter.dateLine) out.push(letter.dateLine);
  out.push("");
  out.push(letter.greeting || "Dear Hiring Manager,");
  out.push("");
  (letter.bodyParagraphs || []).forEach((p) => { out.push(p); out.push(""); });
  out.push(letter.closing || "");
  out.push("");
  out.push("Sincerely,");
  out.push("");
  out.push(letter.signature || "Applicant");
  return out.join("\n").trim();
}

/** Download as .txt */
export function downloadCoverLetterText(letter, filename = "cover_letter.txt") {
  const content = buildCoverLetterText(letter);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/** Download as .docx Word document */
export async function downloadCoverLetterDocx(letter, filename = "cover_letter.docx") {
  const { Document, Packer, Paragraph, TextRun, AlignmentType } = await import("docx");
  const LINE = 240;
  const BODY_SIZE = 22;
  const paragraphs = [];

  if (letter.headerName)
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.headerName, bold: true, size: 28 })], spacing: { after: 60 } }));
  if (letter.headerLine)
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.headerLine, size: 20, color: "333333" })], spacing: { after: 40 } }));
  if (letter.linkedIn)
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.linkedIn, size: 20, color: "333333" })], spacing: { after: 40 } }));

  paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.dateLine || "", size: BODY_SIZE })], spacing: { before: LINE, after: LINE } }));
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.greeting || "Dear Hiring Manager,", size: BODY_SIZE })], spacing: { after: LINE } }));

  for (const para of letter.bodyParagraphs || [])
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: para, size: BODY_SIZE })], alignment: AlignmentType.JUSTIFIED, spacing: { after: LINE } }));

  if (letter.closing)
    paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.closing, size: BODY_SIZE })], alignment: AlignmentType.JUSTIFIED, spacing: { after: LINE * 2 } }));

  paragraphs.push(new Paragraph({ children: [new TextRun({ text: "Sincerely,", size: BODY_SIZE })], spacing: { after: LINE * 2 } }));
  paragraphs.push(new Paragraph({ children: [new TextRun({ text: letter.signature || "Applicant", size: BODY_SIZE })] }));

  const doc = new Document({
    sections: [{ properties: { page: { margin: { top: 1224, right: 1224, bottom: 1224, left: 1224 } } }, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

/** Open print dialog — saves as PDF, fits one page */
export function printCoverLetterPdf(letter) {
  const html = buildCoverLetterHtml(letter);
  const win = window.open("", "_blank", "width=860,height=1100");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
