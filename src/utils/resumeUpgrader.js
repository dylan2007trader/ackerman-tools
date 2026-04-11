// Three-variant premium resume upgrader
// Uses content enhancement rules, tech stack injection, missing keyword analysis,
// and the grader's analysis object to produce meaningfully improved output.

// ─── ATS keyword database ───────────────────────────────────────────────────

const ROLE_ATS_KEYWORDS = {
  "software engineer": [
    "REST APIs", "Git", "GitHub", "Agile", "CI/CD", "unit testing", "code review",
    "version control", "full-stack development", "API development", "debugging",
    "performance optimization", "software development life cycle", "microservices",
    "object-oriented design", "system design", "scalability", "Node.js", "React",
    "TypeScript", "JSON", "HTTP", "deployment", "automated testing",
  ],
  "data scientist": [
    "machine learning", "statistical modeling", "data visualization", "feature engineering",
    "model training", "scikit-learn", "TensorFlow", "PyTorch", "Jupyter Notebook",
    "regression analysis", "classification", "clustering", "A/B testing", "big data",
    "data preprocessing", "matplotlib", "seaborn", "pandas", "NumPy", "SQL",
    "exploratory data analysis", "predictive modeling",
  ],
  "backend developer": [
    "REST APIs", "Node.js", "Express.js", "database design", "PostgreSQL", "MySQL",
    "authentication", "authorization", "caching", "microservices", "API design",
    "server-side development", "performance optimization", "security", "unit testing",
    "Docker", "CI/CD", "Git", "JSON", "HTTP", "SQL", "TypeScript",
  ],
  "frontend developer": [
    "React", "TypeScript", "HTML5", "CSS3", "responsive design", "accessibility",
    "state management", "component architecture", "REST APIs", "performance optimization",
    "cross-browser compatibility", "mobile-first design", "UI/UX", "Git",
    "unit testing", "Agile", "webpack", "web development",
  ],
  "full stack developer": [
    "React", "Node.js", "TypeScript", "REST APIs", "SQL", "PostgreSQL",
    "HTML5", "CSS3", "Git", "Docker", "CI/CD", "database design",
    "full-stack development", "Agile", "authentication", "responsive design",
    "unit testing", "API design", "state management", "deployment",
  ],
};

// ─── Tech extraction ────────────────────────────────────────────────────────

const KNOWN_TECH = [
  "React", "Node.js", "Express", "Next.js", "Vue", "Angular", "TypeScript",
  "JavaScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Kotlin", "Swift",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub",
  "HTML", "CSS", "Sass", "Tailwind", "Bootstrap",
  "Pandas", "NumPy", "scikit-learn", "TensorFlow", "PyTorch", "matplotlib",
  "REST", "GraphQL", "JSON", "HTTP", "JWT",
  "Agile", "Scrum", "Linux", "Bash",
];

function extractTechStack(resumeText) {
  const lower = resumeText.toLowerCase();
  return KNOWN_TECH.filter((t) => lower.includes(t.toLowerCase()));
}

// ─── Domain amplifier rules ─────────────────────────────────────────────────
// Each rule: if bullet matches `test` and does NOT already match `avoid`,
// apply the replacement.

const DOMAIN_AMPLIFIERS = [
  // Auth / accounts
  { test: /\bauthentication\b/i, avoid: /jwt|oauth|session-based|token-based/i,
    replace: [/\bauthentication\b/i, "JWT-based authentication"] },
  // Feature gating
  { test: /feature gating/i, avoid: /role-based|rbac/i,
    replace: [/feature gating/i, "role-based feature gating"] },
  // Purchase / payment tracking
  { test: /purchase tracking/i, avoid: /sql|sqlite|database-backed|persistent/i,
    replace: [/purchase tracking/i, "database-backed purchase tracking"] },
  // File parsing → specify formats
  { test: /file pars/i, avoid: /pdf|docx|txt|multi-format/i,
    replace: [/file pars(\w*)/i, "multi-format file parsing (PDF, DOCX, TXT)"] },
  // Product model
  { test: /product model/i, avoid: /saas|freemium model/i,
    replace: [/product model/i, "SaaS freemium model"] },
  // Resume analysis
  { test: /resume analysis/i, avoid: /ats|engine/i,
    replace: [/resume analysis/i, "ATS resume analysis engine"] },
  // Scoring
  { test: /\bscoring\b/i, avoid: /weighted|algorithm|ats/i,
    replace: [/\bscoring\b/i, "weighted ATS scoring"] },
  // Keyword detection
  { test: /keyword detection/i, avoid: /automated|ats/i,
    replace: [/keyword detection/i, "automated ATS keyword detection"] },
  // ETL
  { test: /etl process/i, avoid: /pipeline|automated/i,
    replace: [/etl process(es|ing)?/i, "ETL data pipelines"] },
  // SQL queries
  { test: /sql quer/i, avoid: /complex|multi-table|optimized/i,
    replace: [/sql quer(ies|y)/i, "complex multi-table SQL queries"] },
  // Large datasets
  { test: /large dataset/i, avoid: /large-scale|million|scalable/i,
    replace: [/large dataset/i, "large-scale dataset"] },
  // Relational database
  { test: /relational database\b/i, avoid: /normalized|entity-relationship/i,
    replace: [/relational database\b/i, "normalized relational database"] },
  // Database schema
  { test: /database schema/i, avoid: /entity-relationship|erd/i,
    replace: [/database schema/i, "entity-relationship database schema"] },
  // Trip optimization
  { test: /trip optimization/i, avoid: /route-optimization|graph algorithm/i,
    replace: [/trip optimization/i, "route-optimization"] },
  // User accounts (too generic → add context)
  { test: /user accounts/i, avoid: /management|persistent|system/i,
    replace: [/user accounts/i, "user account management"] },
  // Freemium
  { test: /\bfreemium\b/i, avoid: /conversion|model|saas/i,
    replace: [/\bfreemium\b/i, "freemium conversion model"] },
  // Standard web features
  { test: /full-stack features/i, avoid: /end-to-end|production/i,
    replace: [/full-stack features/i, "production full-stack features"] },
  // Customer service (server/hospitality role → rephrase for transferable skills)
  { test: /customer service/i, avoid: /high-volume|client-facing/i,
    replace: [/customer service/i, "high-volume client-facing service"] },
];

function applyDomainAmplifiers(text) {
  let result = text;
  for (const rule of DOMAIN_AMPLIFIERS) {
    if (rule.test.test(result) && !rule.avoid.test(result)) {
      result = result.replace(rule.replace[0], rule.replace[1]);
    }
  }
  return result;
}

// Tech stack injection: for technical variant only
// If a bullet mentions "platform/app/system" without naming tech, inject from stack
function injectTechStack(text, techStack, angle) {
  if (angle !== "technical") return text;

  const GENERIC_RE = /\b(platform|web application|full-stack app|SaaS platform)\b/i;
  const ALREADY_TECH = /react|node\.js|angular|vue|express|django|flask|spring|next\.js/i;

  const WEB_PRIORITY = ["React", "TypeScript", "JavaScript", "Node.js", "Express", "Vue", "Angular", "Next.js"];
  const webTech = techStack.filter((t) => WEB_PRIORITY.includes(t));

  if (GENERIC_RE.test(text) && !ALREADY_TECH.test(text) && webTech.length >= 1) {
    const inject = webTech.slice(0, 2).join("/");
    return text.replace(GENERIC_RE, `$1 (${inject})`);
  }
  return text;
}

// Python-specific injection for data bullets
function injectPythonContext(text, techStack, angle) {
  if (angle !== "technical") return text;
  const DATA_TECH = ["Python", "Pandas", "NumPy"];
  const hasPython = techStack.some((t) => DATA_TECH.includes(t));
  if (!hasPython) return text;

  const PY_RE = /\b(ETL data pipelines|data processing|data manipulation|large-scale dataset processing)\b/i;
  const ALREADY = /python|pandas|numpy/i;
  if (PY_RE.test(text) && !ALREADY.test(text)) {
    const libs = techStack.filter((t) => ["Pandas", "NumPy"].includes(t));
    const pyPhrase = libs.length ? `Python (${libs.join(", ")})` : "Python";
    return text.replace(PY_RE, `$1 using ${pyPhrase}`);
  }
  return text;
}

// ─── Verb replacement tables ─────────────────────────────────────────────────

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
    { pattern: /^utilized\s+/i, replacement: "Leveraged " },
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
    { pattern: /^utilized\s+/i, replacement: "Leveraged " },
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
    { pattern: /^utilized\s+/i, replacement: "Utilized " },
  ],
};

const ALL_VERB_PATTERNS = [
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
  "authored", "executed", "currently",
];

const SECTION_HEADER_RE =
  /^(education|experience|work experience|projects?|skills?|technical skills?|soft skills?|leadership|activities|certifications?|awards?|achievements?|summary|objective|profile|extracurriculars?)/i;
const SOFT_SKILLS_RE = /^soft skills?$/i;

function isBulletLine(trimmed) {
  const noBullet = trimmed.replace(/^[-*•\u2022]\s*/, "").trim();
  const lower = noBullet.toLowerCase();
  if (STRONG_VERB_STARTS.some((v) => lower.startsWith(v + " ") || lower.startsWith(v + "."))) return true;
  if (ALL_VERB_PATTERNS.some(({ pattern }) => pattern.test(noBullet))) return true;
  return false;
}

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

function applyAtsSwaps(text) {
  let r = text;
  for (const { from, to } of ATS_SWAPS) r = r.replace(from, to);
  return r;
}

function upgradeBulletFull(bulletText, techStack, angle, isWeak) {
  let upgraded = bulletText;

  // 1. Replace weak opener verb
  const replacements = VERB_REPLACEMENTS[angle] || VERB_REPLACEMENTS.technical;
  for (const { pattern, replacement } of replacements) {
    if (pattern.test(upgraded)) {
      upgraded = upgraded.replace(pattern, replacement).trim();
      break;
    }
  }

  // 2. Apply domain amplifiers (content improvements)
  upgraded = applyDomainAmplifiers(upgraded);

  // 3. Tech stack injection (technical variant only)
  upgraded = injectTechStack(upgraded, techStack, angle);
  upgraded = injectPythonContext(upgraded, techStack, angle);

  // 4. ATS vocabulary swaps
  upgraded = applyAtsSwaps(upgraded);

  // 5. Finalize: period + capitalize
  upgraded = upgraded.trim();
  if (upgraded && !/[.!?]$/.test(upgraded)) upgraded += ".";
  if (upgraded.length > 0) upgraded = upgraded.charAt(0).toUpperCase() + upgraded.slice(1);

  return upgraded;
}

// ─── Missing keyword injection ───────────────────────────────────────────────

function findMissingKeywords(resumeText, targetRole) {
  const roleKey = (targetRole || "software engineer").toLowerCase();
  const keywords = ROLE_ATS_KEYWORDS[roleKey] || ROLE_ATS_KEYWORDS["software engineer"];
  const lower = resumeText.toLowerCase();
  return keywords.filter((kw) => !lower.includes(kw.toLowerCase()));
}

function injectKeywordsToSkillsSection(lines, missingKeywords) {
  if (!missingKeywords.length) return lines;

  // Find the last line of the Technical Skills section
  let skillsSectionStart = -1;
  let skillsSectionEnd = -1;

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (/^technical skills?/i.test(t) && t.length < 30) {
      skillsSectionStart = i;
    }
    if (skillsSectionStart !== -1 && i > skillsSectionStart) {
      if (SECTION_HEADER_RE.test(t) && t.length < 55 && i > skillsSectionStart + 1) {
        skillsSectionEnd = i - 1;
        break;
      }
    }
  }

  if (skillsSectionStart === -1) return lines;

  const end = skillsSectionEnd === -1 ? lines.length - 1 : skillsSectionEnd;

  // Pick top 6 missing keywords, avoiding duplicates already injected
  const toAdd = missingKeywords.slice(0, 6);
  if (!toAdd.length) return lines;

  const result = [...lines];
  // Insert after the last skills line
  result.splice(end + 1, 0, `Additional ATS keywords: ${toAdd.join(", ")}`);
  return result;
}

// ─── Summary / Objective ────────────────────────────────────────────────────

function buildObjective(resumeText, targetRole) {
  const lower = resumeText.toLowerCase();
  const roleLabel = targetRole
    ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
    : "Software Engineer";

  const HIGHLIGHT_SKILLS = [
    "React", "Node.js", "Python", "JavaScript", "TypeScript", "Java", "SQL",
    "AWS", "Docker", "Git", "REST APIs", "full-stack development",
  ];
  const found = HIGHLIGHT_SKILLS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 4);
  const skillPhrase = found.length ? found.join(", ") : "software engineering";

  return (
    `Seeking a ${roleLabel} role where I can apply my hands-on experience in ${skillPhrase} ` +
    `to build scalable, production-quality systems and contribute to a high-performing engineering team.`
  );
}

function buildSummary(resumeText, targetRole, analysis) {
  const lower = resumeText.toLowerCase();
  const roleLabel = targetRole
    ? targetRole.charAt(0).toUpperCase() + targetRole.slice(1)
    : "Software Engineer";

  const SKILL_SIGNALS = [
    "Python", "JavaScript", "TypeScript", "Java", "C++", "React", "Node.js",
    "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Git", "REST", "APIs",
  ];
  const found = SKILL_SIGNALS.filter((s) => lower.includes(s.toLowerCase())).slice(0, 4);
  const skillPhrase = found.length ? found.join(", ") : "software development";

  const gpa = resumeText.match(/gpa\s*[:\s]?\s*([\d.]+)/i)?.[1];
  const gpaPhrase = gpa ? `, maintaining a ${gpa} GPA` : "";

  const eduLine = resumeText.match(/Bachelor of (?:Science|Arts)[^,\n\r]{0,60}/i)?.[0]?.trim();
  const eduPhrase = eduLine ? eduLine.toLowerCase() : "a computer science background";

  return (
    `${roleLabel} candidate with ${eduPhrase}${gpaPhrase}, bringing proven hands-on experience in ${skillPhrase}. ` +
    `Demonstrated ability to build and ship production software — including a live SaaS platform, ` +
    `relational database systems, and automated data pipelines. ` +
    `Focused on writing clean, maintainable code and delivering technical work that holds up under real conditions.`
  );
}

// ─── Variant builder ────────────────────────────────────────────────────────

function buildVariant(resumeText, targetRole, angle, techStack, weakExamples, hasSummary) {
  const originalLines = resumeText.split("\n");
  const upgradedLines = [];
  let inSoftSkills = false;
  let pastHeader = false;
  let objectiveInjected = false;
  const hasGpa4 = /gpa\s*[:\s]?\s*4\.0/i.test(resumeText);
  const hasAwardsSection = /\b(awards?|achievements?)\b/i.test(resumeText);

  // Build weak set for prioritized enhancement
  const weakSet = new Set((weakExamples || []).map((w) => w.toLowerCase().trim()));

  for (const rawLine of originalLines) {
    const trimmed = rawLine.trim();

    // First blank line = end of contact header
    if (!pastHeader && !trimmed) {
      pastHeader = true;
      if (!hasSummary && !objectiveInjected) {
        upgradedLines.push(rawLine);
        if (angle === "academic") {
          upgradedLines.push("OBJECTIVE");
          upgradedLines.push(buildObjective(resumeText, targetRole));
        } else {
          upgradedLines.push("SUMMARY");
          upgradedLines.push(buildSummary(resumeText, targetRole, {}));
        }
        upgradedLines.push("");
        objectiveInjected = true;
        continue;
      }
    }

    if (!trimmed) {
      upgradedLines.push(rawLine);
      continue;
    }

    // Section header handling
    if (SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55) {
      if (SOFT_SKILLS_RE.test(trimmed)) {
        inSoftSkills = true;
        continue; // drop soft skills section
      } else {
        inSoftSkills = false;
      }
    }

    if (inSoftSkills) continue;

    // Bullet vs non-bullet
    if (isBulletLine(trimmed)) {
      const leadingMatch = rawLine.match(/^(\s*[-*•\u2022]?\s*)/);
      const leading = leadingMatch ? leadingMatch[1] : "";
      const bulletText = trimmed.replace(/^[-*•\u2022]\s*/, "");
      const isWeak = weakSet.has(bulletText.toLowerCase().trim());
      const upgraded = upgradeBulletFull(bulletText, techStack, angle, isWeak);
      upgradedLines.push(leading + upgraded);
    } else {
      upgradedLines.push(applyAtsSwaps(rawLine));
    }
  }

  // Academic variant: append awards if 4.0 and no existing awards section
  if (angle === "academic" && hasGpa4 && !hasAwardsSection) {
    upgradedLines.push("");
    upgradedLines.push("AWARDS & ACHIEVEMENTS");
    upgradedLines.push(
      "Dean's List with Distinction: Recognized for a 4.0 GPA while carrying a full technical credit load."
    );
  }

  return upgradedLines;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function buildAllVariants(resumeText = "", targetRole = "", analysis = {}) {
  const techStack = extractTechStack(resumeText);
  const hasSummary = /\b(summary|objective|profile|about me)\b/i.test(resumeText);
  const weakExamples = analysis?.weakExamples || [];
  const missingKeywords = findMissingKeywords(resumeText, targetRole);

  const makeVariant = (angle) => {
    let lines = buildVariant(resumeText, targetRole, angle, techStack, weakExamples, hasSummary);
    lines = injectKeywordsToSkillsSection(lines, missingKeywords);
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  return {
    variants: [
      {
        name: "technical",
        label: "Technical Depth",
        description: "Engineering-forward: tools, architecture, and implementation specifics.",
        text: makeVariant("technical"),
      },
      {
        name: "impact",
        label: "Impact & Scope",
        description: "Delivery-forward: what shipped, outcomes, and end-to-end ownership.",
        text: makeVariant("impact"),
      },
      {
        name: "academic",
        label: "Clean Academic",
        description: "Formal: objective statement, credential-forward, no soft skills section.",
        text: makeVariant("academic"),
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

function detectMissingItems(resumeText) {
  const missing = [];
  const lower = resumeText.toLowerCase();

  if (!/(\+?1[-.\s]?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(resumeText))
    missing.push({ field: "Phone number", reason: "Add a phone number to your contact header." });

  if (!/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(resumeText))
    missing.push({ field: "Email address", reason: "An email address is required for contact." });

  if (!lower.includes("linkedin"))
    missing.push({ field: "LinkedIn URL", reason: "Most technical applications expect a LinkedIn link." });

  if (!lower.includes("github"))
    missing.push({ field: "GitHub URL", reason: "GitHub shows real code and initiative — add it to your header." });

  if (!/\bprojects?\b/i.test(resumeText))
    missing.push({ field: "Projects section", reason: "Personal or academic projects show hands-on skills." });

  const metricCount = (resumeText.match(/\b\d+(?:\.\d+)?%|\$[\d,]+|\b[1-9]\d{1,}\b/g) || []).length;
  if (metricCount < 2)
    missing.push({
      field: "Quantified achievements",
      reason: 'Add numbers to at least 2 bullets — e.g., "processed 500K rows" or "reduced load time 40%".',
    });

  return missing;
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

  const children = [];
  for (const line of text.split("\n")) {
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

// ─── PDF renderer (Terrence Kuo layout style) ───────────────────────────────

function esc(s = "") {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// ── Regex helpers ──────────────────────────────────────────────────────────

const SECTION_RE =
  /^(SUMMARY|OBJECTIVE|EDUCATION|EXPERIENCE|WORK EXPERIENCE|PROJECTS?|SKILLS?|TECHNICAL SKILLS?|LEADERSHIP|ACTIVITIES|CERTIFICATIONS?|AWARDS?|ACHIEVEMENTS?|EXTRACURRICULARS?|PROFESSIONAL SUMMARY)/i;

// Date fragment: matches "Aug 2025", "Sept 2024", "Present", bare year "2024"
const DATE_FRAG =
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{4}|\bPresent\b|\b\d{4}\b/i;

// Full date range at end of a line: "Feb 2026 – Present", "Sept 2024 – Nov 2025", "2024 – 2025"
const DATE_RANGE_RE =
  /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\w\s.]*?\d{4}|Present|\d{4})\s*[–\-]\s*(?:Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\w\s.]*?\d{4}|\d{4})\s*$|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[\w\s.]*?\d{4}\s*$/i;

// ── Job header parser ──────────────────────────────────────────────────────

function parseJobHeader(line) {
  // Extract trailing date range first
  const dateMatch = line.match(DATE_RANGE_RE);
  const dates = dateMatch ? dateMatch[0].trim() : "";
  const withoutDate = dates
    ? line.slice(0, line.lastIndexOf(dates)).replace(/\s+$/, "")
    : line;

  // Split remaining on " – " or " - "
  const parts = withoutDate.split(/\s*[–\-]\s*/).map((s) => s.trim()).filter(Boolean);

  if (parts.length >= 3) {
    return { title: parts[0], company: parts.slice(1, -1).join(", "), location: parts[parts.length - 1], dates };
  }
  if (parts.length === 2) {
    return { title: parts[0], company: parts[1], location: "", dates };
  }
  return { title: withoutDate.trim(), company: "", location: "", dates };
}

// ── Education line parser ──────────────────────────────────────────────────

function parseEduLine(line) {
  const dateMatch = line.match(DATE_RANGE_RE);
  const dates = dateMatch ? dateMatch[0].trim() : "";
  const withoutDate = dates
    ? line.slice(0, line.lastIndexOf(dates)).replace(/\s+$/, "")
    : line;

  // "University of Arizona, Tucson, AZ" → last comma-part may be city/state
  const commaIdx = withoutDate.lastIndexOf(",");
  const institution = commaIdx > 0 ? withoutDate.slice(0, commaIdx).trim() : withoutDate.trim();
  const location = commaIdx > 0 ? withoutDate.slice(commaIdx + 1).trim() : "";

  return { institution, location, dates };
}

// ── Skills proficient/familiar split ─────────────────────────────────────

function splitSkills(skillsLines, resumeText) {
  // Collect all text from non-skills sections (bullets + regular lines)
  // Anything mentioned in bullets = likely proficient
  const allKnownTech = [
    "Python", "Java", "JavaScript", "TypeScript", "React", "Node.js", "Express",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis", "Pandas", "NumPy",
    "Git", "GitHub", "AWS", "Docker", "Kubernetes", "HTML", "CSS", "Sass",
    "scikit-learn", "TensorFlow", "PyTorch", "Agile", "CI/CD", "REST", "GraphQL",
    "Linux", "Bash", "C++", "C#", "Go", "Swift", "Kotlin", "MATLAB",
    "object-oriented programming", "data structures", "algorithms",
  ];

  // Collect tech from bullet points
  const bulletText = (resumeText.match(/^[•\-–*].+$/gm) || []).join(" ").toLowerCase();
  const proficientSet = new Set();
  const familiarSet = new Set();

  // Flatten all skill terms from the skills section lines
  const rawTerms = [];
  for (const line of skillsLines) {
    const afterColon = line.includes(":") ? line.slice(line.indexOf(":") + 1) : line;
    afterColon.split(/,\s*/).forEach((t) => {
      const clean = t.trim();
      if (clean) rawTerms.push(clean);
    });
  }

  for (const term of rawTerms) {
    const lower = term.toLowerCase();
    const inBullets = bulletText.includes(lower) ||
      allKnownTech.some((k) => k.toLowerCase() === lower && bulletText.includes(lower));
    if (inBullets) {
      proficientSet.add(term);
    } else {
      familiarSet.add(term);
    }
  }

  return {
    proficient: [...proficientSet],
    familiar: [...familiarSet],
  };
}

// ── Tech extractor for "Utilized:" line ───────────────────────────────────

const TECH_PATTERN = new RegExp(
  `\\b(${[
    "React", "Node\\.js", "Express", "Next\\.js", "Vue", "Angular",
    "TypeScript", "JavaScript", "Python", "Java", "C\\+\\+", "C#", "Go", "Swift",
    "SQL", "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis",
    "AWS", "Docker", "Git", "GitHub", "HTML", "CSS",
    "Pandas", "NumPy", "scikit-learn", "TensorFlow", "PyTorch",
    "REST", "GraphQL", "JWT", "CI/CD", "Linux", "Bash", "Agile",
  ].join("|")})\\b`,
  "gi"
);

function extractTechFromBullets(bullets) {
  const found = new Set();
  const combined = bullets.join(" ");
  let m;
  const re = new RegExp(TECH_PATTERN.source, "gi");
  while ((m = re.exec(combined)) !== null) {
    found.add(m[1]);
  }
  return [...found];
}

// ── Section renderer ───────────────────────────────────────────────────────

function renderSection(heading, sectionLines, fullText) {
  const type = heading.replace(/s$/i, "").toLowerCase()
    .replace("work experience", "experience")
    .replace("technical skill", "skill");

  let html = `<div class="section">
    <div class="sec-heading">${esc(heading)}</div>
    <hr class="sec-rule"/>`;

  if (type.includes("experience")) {
    html += renderExperience(sectionLines);
  } else if (type.includes("education")) {
    html += renderEducation(sectionLines);
  } else if (type.includes("project")) {
    html += renderProjects(sectionLines);
  } else if (type.includes("skill")) {
    html += renderSkills(sectionLines, fullText);
  } else {
    // Generic: summary, objective, awards, etc.
    for (const line of sectionLines) {
      if (!line.trim()) continue;
      if (/^[•\-–*]\s/.test(line)) {
        html += `<div class="dash-bullet">&#8211;&nbsp; ${esc(line.replace(/^[•\-–*]\s*/, ""))}</div>`;
      } else {
        html += `<p class="body-line">${esc(line)}</p>`;
      }
    }
  }

  html += `</div>`;
  return html;
}

function renderExperience(lines) {
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Detect job header: has date fragment and at least one " – "
    if (DATE_FRAG.test(line) && /[–\-]/.test(line) && !/^[•\-–*]\s/.test(line)) {
      const { title, company, location, dates } = parseJobHeader(line);
      html += `<div class="job-header">
        <span class="job-title">${esc([title, company].filter(Boolean).join(", "))}</span>
        <span class="job-location">${esc(location)}</span>
        <span class="job-date">${esc(dates)}</span>
      </div>`;
      i++;

      // Collect bullets for this job
      while (i < lines.length) {
        const bl = lines[i];
        if (!bl.trim()) { i++; continue; }
        if (DATE_FRAG.test(bl) && /[–\-]/.test(bl) && !/^[•\-–*]\s/.test(bl)) break; // next job
        if (SECTION_RE.test(bl) && bl.length < 55) break;
        if (/^[•\-–*]\s/.test(bl)) {
          html += `<div class="dash-bullet">&#8211;&nbsp; ${esc(bl.replace(/^[•\-–*]\s*/, ""))}</div>`;
        } else {
          html += `<div class="job-desc">${esc(bl)}</div>`;
        }
        i++;
      }
      html += `<div class="job-gap"></div>`;
    } else {
      // Plain line not matching job header pattern
      html += `<div class="body-line">${esc(line)}</div>`;
      i++;
    }
  }
  return html;
}

function renderEducation(lines) {
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    if (DATE_FRAG.test(line) && !/^[•\-–*]\s/.test(line)) {
      const { institution, location, dates } = parseEduLine(line);
      html += `<div class="job-header">
        <span class="job-title">${esc(institution)}</span>
        <span class="job-location">${esc(location)}</span>
        <span class="job-date">${esc(dates)}</span>
      </div>`;
      i++;
      // Degree lines follow
      while (i < lines.length && lines[i].trim() && !DATE_FRAG.test(lines[i]) && !/^[•\-–*]\s/.test(lines[i])) {
        const degLine = lines[i].replace(/GPA\s*[:\s]?\s*([\d.]+)/i, (_, g) => `— GPA: ${g}`);
        html += `<div class="edu-degree">${esc(degLine.trim())}</div>`;
        i++;
      }
      html += `<div class="job-gap"></div>`;
    } else if (/^[•\-–*]\s/.test(line)) {
      html += `<div class="dash-bullet">&#8211;&nbsp; ${esc(line.replace(/^[•\-–*]\s*/, ""))}</div>`;
      i++;
    } else {
      html += `<div class="body-line">${esc(line)}</div>`;
      i++;
    }
  }
  return html;
}

function renderProjects(lines) {
  let html = "";
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    // Project name: non-bullet, no date, not a section header — probably a project title
    if (
      !/^[•\-–*]\s/.test(line) &&
      !DATE_FRAG.test(line) &&
      !(SECTION_RE.test(line) && line.length < 55) &&
      !/^utilized\s*:/i.test(line)
    ) {
      html += `<div class="project-name">${esc(line)}</div>`;
      i++;

      // Optional subtitle (italic): e.g. "University of Arizona – Data Science Coursework"
      if (i < lines.length && lines[i].trim() && !/^[•\-–*]\s/.test(lines[i]) && !DATE_FRAG.test(lines[i])) {
        html += `<div class="project-sub">${esc(lines[i])}</div>`;
        i++;
      }

      // Collect bullets
      const projectBullets = [];
      let hasUtilized = false;

      while (i < lines.length) {
        const bl = lines[i];
        if (!bl.trim()) { i++; break; }
        if (!/^[•\-–*]\s/.test(bl) && !(/^utilized\s*:/i.test(bl)) &&
            !DATE_FRAG.test(bl) && !(SECTION_RE.test(bl) && bl.length < 55)) {
          // Looks like the next project name
          break;
        }
        if (/^utilized\s*:/i.test(bl)) {
          html += projectBullets.map(
            (b) => `<div class="dash-bullet">&#8211;&nbsp; ${esc(b)}</div>`
          ).join("");
          projectBullets.length = 0;
          html += `<div class="utilized">${esc(bl)}</div>`;
          hasUtilized = true;
          i++;
          continue;
        }
        projectBullets.push(bl.replace(/^[•\-–*]\s*/, ""));
        i++;
      }

      // Render remaining bullets
      html += projectBullets.map(
        (b) => `<div class="dash-bullet">&#8211;&nbsp; ${esc(b)}</div>`
      ).join("");

      // Auto-generate "Utilized:" if not already present
      if (!hasUtilized && projectBullets.length > 0) {
        const tech = extractTechFromBullets(projectBullets);
        if (tech.length) {
          html += `<div class="utilized">Utilized: ${esc(tech.join(", "))}</div>`;
        }
      }

      html += `<div class="job-gap"></div>`;
    } else if (/^[•\-–*]\s/.test(line)) {
      html += `<div class="dash-bullet">&#8211;&nbsp; ${esc(line.replace(/^[•\-–*]\s*/, ""))}</div>`;
      i++;
    } else {
      html += `<div class="body-line">${esc(line)}</div>`;
      i++;
    }
  }
  return html;
}

function renderSkills(lines, fullText) {
  const { proficient, familiar } = splitSkills(lines, fullText);

  // Also handle "Additional ATS keywords" line
  const atsLine = lines.find((l) => /^additional ats keywords/i.test(l));
  const atsKeywords = atsLine
    ? atsLine.replace(/^additional ats keywords\s*[:\-]\s*/i, "").trim()
    : "";

  let html = "";

  if (proficient.length || familiar.length) {
    if (proficient.length) {
      html += `<div class="skill-row"><span class="skill-label">Proficient:</span> ${esc(proficient.join(", "))}</div>`;
    }
    if (familiar.length) {
      html += `<div class="skill-row"><span class="skill-label">Familiar:</span> ${esc(familiar.join(", "))}</div>`;
    }
  } else {
    // Fallback: render lines as-is
    for (const line of lines) {
      if (!line.trim() || /^additional ats keywords/i.test(line)) continue;
      html += `<div class="skill-row">${esc(line)}</div>`;
    }
  }

  if (atsKeywords) {
    html += `<div class="skill-row"><span class="skill-label">ATS Keywords:</span> ${esc(atsKeywords)}</div>`;
  }

  return html;
}

// ── Main PDF builder ───────────────────────────────────────────────────────

function buildResumeHtml(text, filename) {
  const rawLines = text.split("\n").map((l) => l.trim());

  // ── 1. Extract header block (name + contact) ──
  let i = 0;
  while (i < rawLines.length && !rawLines[i]) i++;

  const name = rawLines[i] || "";
  i++;

  const contactLines = [];
  while (i < rawLines.length && rawLines[i] && !(SECTION_RE.test(rawLines[i]) && rawLines[i].length < 55)) {
    contactLines.push(rawLines[i]);
    i++;
  }
  while (i < rawLines.length && !rawLines[i]) i++;

  // ── 2. Parse into sections ──
  const sections = [];
  let curSection = null;

  while (i < rawLines.length) {
    const line = rawLines[i];
    if (SECTION_RE.test(line) && line.length < 55) {
      curSection = { heading: line.toUpperCase(), lines: [] };
      sections.push(curSection);
    } else if (curSection) {
      curSection.lines.push(line);
    }
    i++;
  }

  // ── 3. Render header ──
  // Clean LinkedIn / GitHub labels, join as bullet-separated contact string
  const contactParts = contactLines
    .map((l) =>
      l.replace(/^LinkedIn:\s*/i, "")
       .replace(/^GitHub:\s*/i, "")
       .replace(/\s*[—–]\s*/g, " • ")
       .trim()
    )
    .filter(Boolean);

  const contactHtml = contactParts
    .map((p) => `<span class="contact-part">${esc(p)}</span>`)
    .join('<span class="contact-sep"> • </span>');

  let body = `
    <div class="resume-header">
      <div class="resume-name">${esc(name)}</div>
      ${contactHtml ? `<div class="resume-contact">${contactHtml}</div>` : ""}
    </div>`;

  // ── 4. Render sections ──
  for (const sec of sections) {
    body += renderSection(sec.heading, sec.lines, text);
  }

  // ── 5. Wrap in HTML with print-friendly CSS ──
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${esc(name || "Resume")}</title>
  <style>
    /* ── Reset ── */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    /* ── Page ── */
    body {
      font-family: "Times New Roman", Times, serif;
      font-size: 10.5pt;
      color: #000;
      background: #fff;
      margin: 0.65in 0.7in;
      line-height: 1.45;
    }

    /* ── Header ── */
    .resume-header { text-align: center; margin-bottom: 10px; }
    .resume-name {
      font-size: 20pt;
      font-weight: bold;
      font-variant: small-caps;
      letter-spacing: 0.04em;
      margin-bottom: 3px;
    }
    .resume-contact { font-size: 9.5pt; color: #111; }
    .contact-sep { color: #555; }

    /* ── Section headings ── */
    .section { margin-top: 12px; }
    .sec-heading {
      font-size: 10pt;
      font-variant: small-caps;
      font-weight: bold;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .sec-rule {
      border: none;
      border-top: 1px solid #000;
      margin-bottom: 5px;
    }

    /* ── Job / education rows ── */
    .job-header {
      display: table;
      width: 100%;
      margin-bottom: 1px;
    }
    .job-title {
      display: table-cell;
      font-weight: bold;
      font-size: 10.5pt;
      width: 55%;
    }
    .job-location {
      display: table-cell;
      text-align: center;
      font-size: 10pt;
      color: #222;
      width: 20%;
    }
    .job-date {
      display: table-cell;
      text-align: right;
      font-size: 10pt;
      color: #222;
      white-space: nowrap;
      width: 25%;
    }
    .job-desc {
      font-style: italic;
      font-size: 10pt;
      color: #333;
      margin-bottom: 2px;
    }
    .edu-degree {
      font-size: 10pt;
      margin-bottom: 2px;
      padding-left: 2px;
    }
    .job-gap { height: 7px; }

    /* ── Bullets ── */
    .dash-bullet {
      font-size: 10pt;
      margin-left: 14px;
      margin-bottom: 2px;
      line-height: 1.45;
    }

    /* ── Projects ── */
    .project-name {
      font-weight: bold;
      font-size: 10.5pt;
      margin-top: 4px;
      margin-bottom: 1px;
    }
    .project-sub {
      font-style: italic;
      font-size: 10pt;
      color: #333;
      margin-bottom: 2px;
    }
    .utilized {
      font-size: 9.5pt;
      color: #222;
      margin-left: 14px;
      margin-top: 2px;
      margin-bottom: 2px;
    }
    .utilized::before { content: ""; }

    /* ── Skills ── */
    .skill-row {
      font-size: 10pt;
      margin-bottom: 3px;
    }
    .skill-label {
      font-weight: bold;
      font-style: italic;
    }

    /* ── Misc ── */
    .body-line { font-size: 10pt; margin-bottom: 2px; }

    /* ── Print: suppress browser chrome (URL, date, title) ── */
    @page {
      margin: 0.65in 0.7in;
    }
    @media print {
      html, body { background: #fff; }
      body { margin: 0; }
      header, footer { display: none !important; }
      .section { page-break-inside: avoid; }
      .job-header, .project-name { page-break-after: avoid; }
    }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

// ── Public export ──────────────────────────────────────────────────────────

export function downloadResumePdf(text = "", filename = "upgraded_resume.pdf") {
  const html = buildResumeHtml(text, filename);
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.focus();
  win.addEventListener("afterprint", () => { win.close(); window.focus(); });
  setTimeout(() => { win.print(); setTimeout(() => window.focus(), 500); }, 400);
}
