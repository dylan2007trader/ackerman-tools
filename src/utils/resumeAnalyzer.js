const ROLE_KEYWORD_CONCEPTS = {
  "software engineer": [
    {
      label: "Programming",
      terms: [
        "programming",
        "programmed",
        "code",
        "coding",
        "coded",
        "software development",
        "development",
        "develop",
        "developed",
        "developing",
        "engineering",
        "engineered",
        "build",
        "built",
        "building",
      ],
      examples: ["development", "coding", "programming", "built"],
    },
    {
      label: "JavaScript / TypeScript",
      terms: ["javascript", "typescript", "js", "ts"],
      examples: ["javascript", "typescript"],
    },
    {
      label: "Python / Java / C++",
      terms: ["python", "java", "c++", "c#", "object-oriented", "oop"],
      examples: ["python", "java", "c++"],
    },
    {
      label: "Frontend / React",
      terms: ["react", "frontend", "front-end", "web", "html", "css"],
      examples: ["react", "frontend", "html/css"],
    },
    {
      label: "Backend / APIs",
      terms: [
        "node",
        "express",
        "backend",
        "back-end",
        "api",
        "apis",
        "rest",
        "rest api",
        "endpoint",
        "endpoints",
        "server",
      ],
      examples: ["api", "backend", "server", "rest api"],
    },
    {
      label: "Databases",
      terms: [
        "sql",
        "database",
        "databases",
        "postgres",
        "postgresql",
        "mysql",
        "sqlite",
        "mongodb",
      ],
      examples: ["sql", "database", "postgres", "mongodb"],
    },
    {
      label: "Algorithms / Data Structures",
      terms: [
        "algorithms",
        "algorithm",
        "data structures",
        "data structure",
        "system design",
      ],
      examples: ["algorithms", "data structures", "system design"],
    },
    {
      label: "Testing / Debugging",
      terms: ["testing", "tested", "debugging", "debugged", "qa"],
      examples: ["testing", "debugging"],
    },
    {
      label: "Version Control / Deployment",
      terms: [
        "git",
        "github",
        "deployment",
        "deploy",
        "deployed",
        "docker",
        "aws",
      ],
      examples: ["git", "github", "deployment", "docker"],
    },
  ],

  "data scientist": [
    {
      label: "Python / SQL",
      terms: ["python", "sql", "jupyter"],
      examples: ["python", "sql"],
    },
    {
      label: "Data Analysis",
      terms: [
        "data analysis",
        "analyze",
        "analyzed",
        "analytics",
        "insights",
        "visualization",
      ],
      examples: ["data analysis", "analytics", "insights"],
    },
    {
      label: "Pandas / NumPy",
      terms: ["pandas", "numpy"],
      examples: ["pandas", "numpy"],
    },
    {
      label: "Machine Learning",
      terms: [
        "machine learning",
        "ml",
        "model",
        "models",
        "modeling",
        "regression",
        "classification",
      ],
      examples: ["machine learning", "modeling", "regression"],
    },
    {
      label: "Statistics",
      terms: ["statistics", "statistical", "hypothesis", "a/b testing"],
      examples: ["statistics", "a/b testing"],
    },
    {
      label: "Data Cleaning / ETL",
      terms: [
        "etl",
        "cleaning",
        "cleaned",
        "dataset",
        "datasets",
        "transformed",
        "pipeline",
      ],
      examples: ["etl", "cleaning", "pipeline"],
    },
    {
      label: "Visualization Tools",
      terms: ["matplotlib", "tableau", "power bi", "dashboard"],
      examples: ["matplotlib", "tableau", "dashboard"],
    },
  ],

  "backend developer": [
    {
      label: "Backend Development",
      terms: [
        "backend",
        "back-end",
        "server",
        "service",
        "microservices",
        "node",
        "express",
        "java",
        "python",
      ],
      examples: ["backend", "server", "microservices"],
    },
    {
      label: "APIs",
      terms: [
        "api",
        "apis",
        "rest",
        "rest api",
        "graphql",
        "endpoint",
        "endpoints",
      ],
      examples: ["api", "rest api", "graphql", "endpoints"],
    },
    {
      label: "Databases",
      terms: [
        "sql",
        "postgres",
        "postgresql",
        "mongodb",
        "redis",
        "database",
        "databases",
      ],
      examples: ["sql", "postgres", "mongodb", "redis"],
    },
    {
      label: "Auth / Security",
      terms: [
        "authentication",
        "authorization",
        "secure",
        "security",
        "token",
        "jwt",
      ],
      examples: ["authentication", "authorization", "security"],
    },
    {
      label: "Deployment / Cloud",
      terms: ["docker", "aws", "deployment", "deployed", "scalability"],
      examples: ["docker", "aws", "deployment", "scalability"],
    },
  ],

  "frontend developer": [
    {
      label: "Frontend Development",
      terms: [
        "frontend",
        "front-end",
        "web",
        "responsive",
        "ui",
        "ux",
        "html",
        "css",
      ],
      examples: ["frontend", "responsive", "ui/ux", "html/css"],
    },
    {
      label: "JavaScript / TypeScript",
      terms: ["javascript", "typescript", "react", "next.js", "redux"],
      examples: ["javascript", "typescript", "react"],
    },
    {
      label: "Components / Design",
      terms: [
        "component",
        "components",
        "design system",
        "figma",
        "accessibility",
        "animation",
      ],
      examples: ["components", "design system", "accessibility"],
    },
    {
      label: "Performance / Testing",
      terms: ["performance", "web performance", "testing", "tested"],
      examples: ["performance", "testing"],
    },
    {
      label: "APIs / State",
      terms: ["api", "apis", "state management", "data fetching"],
      examples: ["api", "state management", "data fetching"],
    },
  ],

  "full stack developer": [
    {
      label: "Frontend",
      terms: ["frontend", "front-end", "react", "html", "css", "responsive"],
      examples: ["frontend", "react", "responsive"],
    },
    {
      label: "Backend",
      terms: [
        "backend",
        "back-end",
        "node",
        "express",
        "server",
        "api",
        "apis",
      ],
      examples: ["backend", "node", "server", "api"],
    },
    {
      label: "Databases",
      terms: [
        "sql",
        "postgres",
        "postgresql",
        "mongodb",
        "database",
        "databases",
      ],
      examples: ["sql", "postgres", "mongodb", "database"],
    },
    {
      label: "Auth / App Logic",
      terms: ["authentication", "authorization", "full stack", "full-stack"],
      examples: ["authentication", "authorization", "full stack"],
    },
    {
      label: "Deployment / Cloud",
      terms: ["deployment", "deployed", "docker", "aws", "git", "github"],
      examples: ["deployment", "docker", "aws", "git"],
    },
  ],
};

const TECHNICAL_SIGNALS = [
  "python",
  "java",
  "javascript",
  "typescript",
  "react",
  "next.js",
  "node",
  "express",
  "sql",
  "postgresql",
  "postgres",
  "mysql",
  "sqlite",
  "docker",
  "aws",
  "gcp",
  "azure",
  "git",
  "github",
  "api",
  "apis",
  "rest api",
  "fastapi",
  "flask",
  "django",
  "pandas",
  "numpy",
  "machine learning",
  "data structures",
  "algorithms",
  "system design",
  "linux",
  "mongodb",
  "firebase",
  "c++",
  "c#",
  "html",
  "css",
  "tailwind",
  "bootstrap",
  "etl",
  "database",
  "databases",
  "terraform",
  "kubernetes",
  "ci/cd",
  "github actions",
  "bash",
  "matlab",
];

const ACTION_VERBS = [
  "achieved",
  "analyzed",
  "architected",
  "automated",
  "built",
  "collaborated",
  "configured",
  "created",
  "deployed",
  "designed",
  "developed",
  "delivered",
  "drove",
  "engineered",
  "executed",
  "generated",
  "implemented",
  "improved",
  "increased",
  "integrated",
  "launched",
  "led",
  "maintained",
  "managed",
  "migrated",
  "modeled",
  "optimized",
  "organized",
  "performed",
  "processed",
  "produced",
  "reduced",
  "resolved",
  "scaled",
  "shipped",
  "streamlined",
  "tested",
  "wrote",
  "owned",
  "refactored",
];

const WEAK_STARTERS = [
  "helped",
  "assisted",
  "worked on",
  "responsible for",
  "duties included",
  "tasked with",
  "contributed to",
  "support",
  "supported",
  "learned",
  "familiar with",
  "participated in",
  "involved in",
  "was part of",
];

const IMPACT_WORDS = [
  "achieved",
  "automated",
  "built",
  "delivered",
  "deployed",
  "designed",
  "developed",
  "engineered",
  "generated",
  "implemented",
  "improved",
  "increased",
  "launched",
  "led",
  "optimized",
  "reduced",
  "resolved",
  "scaled",
  "shipped",
  "streamlined",
];

const SECTION_HEADER_KEYWORDS = [
  "summary",
  "professional summary",
  "profile",
  "objective",
  "education",
  "experience",
  "work experience",
  "professional experience",
  "employment",
  "projects",
  "selected projects",
  "project experience",
  "technical projects",
  "software projects",
  "skills",
  "technical skills",
  "leadership",
  "activities",
  "certifications",
  "coursework",
  "relevant coursework",
  "awards",
  "publications",
  "soft skills",
];

const SOFT_SKILL_TERMS = [
  "attention to detail",
  "time management",
  "hard working",
  "hardworking",
  "communication",
  "teamwork",
  "adaptability",
  "problem solving",
  "problem-solving",
  "collaboration",
  "leadership",
  "organization",
  "organized",
  "work ethic",
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function unique(arr) {
  return Array.from(new Set(arr));
}

function normalizeWhitespace(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/\u00A0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanLine(line) {
  return String(line || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[,;:]\s*/, "")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function normalizeImportedText(text) {
  return normalizeWhitespace(text)
    .replace(/\u2022|•/g, "\n• ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/^[,;:]\s*/gm, "")
    .replace(
      /\b(EDUCATION|EXPERIENCE|EMPLOYMENT|PROJECTS|SOFTWARE PROJECTS|TECHNICAL SKILLS|SKILLS|SUMMARY|OBJECTIVE|LEADERSHIP|CERTIFICATIONS|RELEVANT COURSEWORK|SOFT SKILLS)\b/g,
      "\n$1\n"
    )
    .replace(
      /\b(Education|Experience|Employment|Projects|Software Projects|Technical Skills|Skills|Summary|Objective|Leadership|Certifications|Relevant Coursework|Soft Skills)\b/g,
      "\n$1\n"
    )
    .replace(/([a-z])(\s•)/g, "$1\n• ")
    .replace(/(\.)(\s•)/g, "$1\n• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isLikelySectionHeader(line) {
  const clean = line.trim().toLowerCase().replace(/[:|]/g, "");
  if (!clean) return false;
  if (SECTION_HEADER_KEYWORDS.includes(clean)) return true;
  if (clean.length <= 34 && /^[A-Z\s&]+$/.test(line.trim())) return true;
  return false;
}

function isPlaceholderLine(line) {
  const clean = line.trim().toLowerCase();
  return (
    /^\[.*\]$/.test(clean) ||
    clean.includes("[phone") ||
    clean.includes("[e-mail") ||
    clean.includes("[email") ||
    clean.includes("[address") ||
    clean.includes("phone number") ||
    clean.includes("email address") ||
    clean.includes("e-mail address") ||
    clean.includes("home address")
  );
}

function isBullet(line) {
  return /^[•\-*·]\s*/.test(line);
}

function stripBullet(line) {
  return String(line || "").replace(/^[•\-*·]\s*/, "").trim();
}

function startsWithActionVerb(line) {
  const clean = stripBullet(line).toLowerCase();
  return ACTION_VERBS.some((verb) => clean.startsWith(verb));
}

function startsWithWeakPhrase(line) {
  const clean = stripBullet(line).toLowerCase();
  return WEAK_STARTERS.some(
    (phrase) => clean.startsWith(phrase) || clean.includes(phrase)
  );
}

function hasNumberOrMetric(line) {
  return (
    /\d/.test(line) ||
    /\b(percent|percentage|users|customers|clients|records|datasets|hours|minutes|days|weeks|months|years|gpa|latency|throughput|accuracy|revenue|traffic|downloads|requests)\b/i.test(
      line
    ) ||
    /%/.test(line) ||
    /\b\d+k\b/i.test(line) ||
    /\b\d+x\b/i.test(line)
  );
}

function hasImpactLanguage(line) {
  const lower = line.toLowerCase();
  return IMPACT_WORDS.some((word) => lower.includes(word));
}

function hasToolOrTech(line) {
  const lower = line.toLowerCase();
  return TECHNICAL_SIGNALS.some((signal) => lower.includes(signal));
}

function isSoftSkillOnlyLine(line) {
  const clean = cleanLine(line).toLowerCase().replace(/^[,: -]+/, "");
  if (!clean || /\d/.test(clean) || hasToolOrTech(clean)) return false;

  const parts = clean
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) return false;

  const matches = parts.filter((part) =>
    SOFT_SKILL_TERMS.some((term) => part.includes(term))
  );

  return matches.length >= Math.max(2, parts.length - 1);
}

function getParsedLines(text) {
  const baseLines = normalizeImportedText(normalizeWhitespace(text))
    .split("\n")
    .map((line) => cleanLine(line))
    .filter(Boolean);

  const expanded = [];

  baseLines.forEach((line) => {
    if (line.includes("•") && !line.startsWith("•")) {
      line
        .split("•")
        .map((chunk, index) => (index === 0 ? chunk : `• ${chunk}`))
        .map((chunk) => cleanLine(chunk))
        .filter(Boolean)
        .forEach((chunk) => expanded.push(chunk));
      return;
    }

    if (
      line.length > 220 &&
      /\. /.test(line) &&
      !isLikelySectionHeader(line) &&
      !line.startsWith("•")
    ) {
      line
        .split(/(?<=\.)\s+/)
        .map((chunk) => cleanLine(chunk))
        .filter(Boolean)
        .forEach((chunk) => expanded.push(chunk));
      return;
    }

    expanded.push(line);
  });

  return expanded;
}

function inferSections(lines) {
  const sections = {};
  let currentSection = "other";
  sections[currentSection] = [];

  lines.forEach((line) => {
    const clean = cleanLine(line);
    if (!clean) return;

    if (isLikelySectionHeader(clean)) {
      currentSection = clean.toLowerCase().replace(/[:|]/g, "");
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      if (!sections[currentSection]) sections[currentSection] = [];
      sections[currentSection].push(clean);
    }
  });

  return sections;
}

function flattenSectionLines(sections, names) {
  return names.flatMap((name) => sections[name] || []);
}

function isUsefulContentLine(line) {
  const lower = String(line || "").toLowerCase();
  if (!line) return false;
  if (line.length < 10) return false;
  if (isLikelySectionHeader(line)) return false;
  if (isPlaceholderLine(line)) return false;
  if (isSoftSkillOnlyLine(line)) return false;
  if (
    /^(education|experience|employment|projects|software projects|skills|technical skills|soft skills|relevant coursework|coursework|major|minor|gpa)$/i.test(
      lower
    )
  ) {
    return false;
  }
  return true;
}

function looksLikeDateRange(line) {
  return /(jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december|\d{4}|present)/i.test(
    line
  );
}

function looksLikeEntryHeading(line, type) {
  if (!line || isLikelySectionHeader(line) || isBullet(line)) return false;
  if (line.length > 160) return false;
  if (isSoftSkillOnlyLine(line)) return false;

  if (type === "experience") {
    return (
      /\b(intern|engineer|developer|server|associate|founder|co-founder|analyst|assistant|manager|specialist|consultant|research|coordinator|software)\b/i.test(
        line
      ) ||
      (looksLikeDateRange(line) && / - | – | — /.test(line)) ||
      / - | – | — /.test(line)
    );
  }

  if (type === "projects") {
    return (
      /\b(project|app|application|platform|dashboard|system|website|tool|model|database|pipeline|resume|sensor)\b/i.test(
        line
      ) || / - | – | — /.test(line)
    );
  }

  return false;
}

function groupEntries(lines, type) {
  const entries = [];
  let current = null;

  lines.forEach((rawLine) => {
    const line = cleanLine(rawLine);
    if (!line || isPlaceholderLine(line) || isSoftSkillOnlyLine(line)) return;

    if (isBullet(line)) {
      if (!current) current = { heading: "", meta: "", bullets: [] };
      current.bullets.push(stripBullet(line));
      return;
    }

    if (looksLikeEntryHeading(line, type)) {
      if (
        current &&
        (current.heading || current.meta || current.bullets.length)
      ) {
        entries.push(current);
      }
      current = { heading: line, meta: "", bullets: [] };
      return;
    }

    if (!current) {
      current = { heading: "", meta: "", bullets: [] };
    }

    if (
      !current.meta &&
      line.length <= 120 &&
      !hasImpactLanguage(line) &&
      !hasToolOrTech(line)
    ) {
      current.meta = line;
    } else {
      current.bullets.push(line);
    }
  });

  if (current && (current.heading || current.meta || current.bullets.length)) {
    entries.push(current);
  }

  return entries
    .map((entry) => ({
      heading: cleanLine(entry.heading),
      meta: cleanLine(entry.meta),
      bullets: unique(entry.bullets.map((b) => cleanLine(b)).filter(Boolean)),
    }))
    .filter(
      (entry) =>
        entry.heading ||
        entry.meta ||
        (entry.bullets && entry.bullets.length > 0)
    );
}

function percentFromCounts(found, total) {
  if (!total) return 0;
  return Math.round((found / total) * 100);
}

function getRoleConcepts(role) {
  return (
    ROLE_KEYWORD_CONCEPTS[role] || ROLE_KEYWORD_CONCEPTS["software engineer"]
  );
}

function conceptMatched(text, terms) {
  const lower = text.toLowerCase();
  return terms.some((term) => {
    const safe = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${safe}\\b`, "i");
    return regex.test(lower);
  });
}

function getMatchedExampleTerms(text, concept) {
  const lower = text.toLowerCase();
  return concept.terms.filter((term) => {
    const safe = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${safe}\\b`, "i");
    return regex.test(lower);
  });
}

function getMetricReason(line) {
  const reasons = [];
  const values = unique(
    (line.match(/\b\d+(?:\.\d+)?%?|\b\d+k\b|\b\d+x\b/gi) || []).slice(0, 5)
  );

  if (/%/.test(line) || /\bpercent|percentage\b/i.test(line)) {
    reasons.push("percentage");
  }
  if (
    /\busers|customers|clients|downloads|visitors|records|datasets|requests\b/i.test(
      line
    )
  ) {
    reasons.push("volume");
  }
  if (/\bhours|minutes|days|weeks|months|years\b/i.test(line)) {
    reasons.push("time");
  }
  if (/\baccuracy|latency|throughput|performance|speed\b/i.test(line)) {
    reasons.push("performance");
  }
  if (/\brevenue|sales|cost|saved\b/i.test(line)) {
    reasons.push("business");
  }
  if (values.length && reasons.length === 0) {
    reasons.push("numeric signal");
  }

  return {
    line,
    values,
    reasons,
  };
}

function tidySentence(text) {
  return cleanLine(
    String(text || "")
      .replace(/\s+([,.;:])/g, "$1")
      .replace(/\s{2,}/g, " ")
      .replace(/\s+\./g, ".")
      .replace(/\s+,/g, ",")
      .replace(/^,\s*/, "")
  )
    .replace(/^[a-z]/, (m) => m.toUpperCase())
    .replace(/([^.!?])$/, "$1.");
}

function rewriteLine(line) {
  const base = stripBullet(line);
  const lower = base.toLowerCase();

  const replacements = [
    ["helped", "Built"],
    ["assisted with", "Supported"],
    ["assisted", "Supported"],
    ["worked on", "Built"],
    ["responsible for", "Managed"],
    ["duties included", "Handled"],
    ["tasked with", "Executed"],
    ["contributed to", "Contributed to"],
    ["support", "Supported"],
    ["supported", "Supported"],
    ["made", "Built"],
    ["created", "Developed"],
    ["did", "Executed"],
    ["used", "Applied"],
    ["learned", "Applied"],
    ["participated in", "Contributed to"],
    ["was part of", "Collaborated on"],
    ["currently working on", "Building"],
    ["utilized", "Used"],
  ];

  let rewritten = base;

  for (const [from, to] of replacements) {
    if (lower.startsWith(from)) {
      const rest = base.slice(from.length).trim();
      rewritten = `${to} ${rest}`.trim();
      break;
    }
  }

  if (!startsWithActionVerb(`• ${rewritten}`)) {
    if (
      hasToolOrTech(rewritten) ||
      /project|platform|system|database|api|tool/i.test(rewritten)
    ) {
      rewritten = `Built ${rewritten.charAt(0).toLowerCase()}${rewritten.slice(
        1
      )}`;
    } else {
      rewritten = `Delivered ${rewritten
        .charAt(0)
        .toLowerCase()}${rewritten.slice(1)}`;
    }
  }

  if (
    !hasNumberOrMetric(rewritten) &&
    /develop|build|create|design|support|manage|implement/i.test(rewritten)
  ) {
    rewritten = `${rewritten.replace(
      /[.]+$/,
      ""
    )} that improved execution, clarity, or user value`;
  }

  return tidySentence(rewritten);
}

function buildBeforeAfterPairs(lines) {
  return lines
    .slice(0, 5)
    .map((line) => ({
      before: stripBullet(line),
      after: rewriteLine(line),
    }))
    .filter((pair) => pair.before && pair.after && pair.before !== pair.after);
}

export function analyzeResume(text, role, targetType) {
  const normalized = normalizeImportedText(normalizeWhitespace(text || ""));
  const lower = normalized.toLowerCase();

  const lines = getParsedLines(normalized);
  const words = normalized.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const sections = inferSections(lines);

  const summaryLines = flattenSectionLines(sections, [
    "summary",
    "professional summary",
    "profile",
    "objective",
  ]).filter(isUsefulContentLine);

  const educationLines = flattenSectionLines(sections, [
    "education",
    "relevant coursework",
    "coursework",
  ]).filter(isUsefulContentLine);

  const rawExperienceLines = flattenSectionLines(sections, [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "leadership",
  ]).filter(isUsefulContentLine);

  const rawProjectLines = flattenSectionLines(sections, [
    "projects",
    "selected projects",
    "project experience",
    "technical projects",
    "software projects",
  ]).filter(isUsefulContentLine);

  const rawSkillsLines = flattenSectionLines(sections, [
    "skills",
    "technical skills",
    "soft skills",
  ])
    .map((line) => stripBullet(line))
    .filter(Boolean)
    .filter((line) => !isSoftSkillOnlyLine(line));

  const experienceEntries = groupEntries(rawExperienceLines, "experience");
  const projectEntries = groupEntries(rawProjectLines, "projects");

  let achievementLines = [
    ...experienceEntries.flatMap((entry) => entry.bullets),
    ...projectEntries.flatMap((entry) => entry.bullets),
  ].filter(isUsefulContentLine);

  if (achievementLines.length < 4) {
    achievementLines = [
      ...achievementLines,
      ...lines
        .filter((line) => isUsefulContentLine(stripBullet(line)))
        .map((line) => stripBullet(line)),
    ];
  }

  achievementLines = unique(achievementLines).slice(0, 24);

  const explicitBullets = lines.filter((line) => isBullet(line));
  const bulletCount = explicitBullets.length || achievementLines.length;

  const linesWithMetrics = achievementLines.filter((line) =>
    hasNumberOrMetric(line)
  );
  const metricEvidenceDetails = linesWithMetrics
    .slice(0, 5)
    .map((line) => getMetricReason(line));

  const strongActionLines = achievementLines.filter((line) =>
    startsWithActionVerb(`• ${line}`)
  );
  const weakLines = achievementLines.filter((line) =>
    startsWithWeakPhrase(line)
  );
  const impactLineCount = achievementLines.filter((line) =>
    hasImpactLanguage(line)
  ).length;

  const roleConcepts = getRoleConcepts(role);
  const matchedConcepts = roleConcepts.filter((concept) =>
    conceptMatched(lower, concept.terms)
  );
  const missingConcepts = roleConcepts.filter(
    (concept) => !conceptMatched(lower, concept.terms)
  );

  const matchedKeywords = unique(
    matchedConcepts.flatMap((concept) => getMatchedExampleTerms(lower, concept).slice(0, 2))
  );
  const missingKeywords = missingConcepts.flatMap((concept) => concept.examples).slice(0, 10);

  const keywordMatchScore = percentFromCounts(
    matchedConcepts.length,
    roleConcepts.length
  );

  const technicalMatches = unique(
    TECHNICAL_SIGNALS.filter((signal) => lower.includes(signal))
  );

  const actionVerbRate = percentFromCounts(
    strongActionLines.length,
    achievementLines.length || bulletCount || 1
  );
  const metricRate = percentFromCounts(
    linesWithMetrics.length,
    achievementLines.length || bulletCount || 1
  );

  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(normalized);
  const linkedIn = /linkedin\.com/i.test(lower);
  const github = /github\.com/i.test(lower);
  const phone = /(\+?\d[\d\s().-]{7,}\d)/.test(normalized);

  const hasEducation =
    educationLines.length > 0 ||
    /education|university|college|school|bachelor|gpa|major|minor/i.test(
      normalized
    );
  const hasExperience =
    experienceEntries.length > 0 ||
    /experience|employment|internship|co-founder|founder/i.test(normalized);
  const hasProjects =
    projectEntries.length > 0 ||
    /projects|project experience/i.test(normalized);
  const hasSkills =
    rawSkillsLines.length > 0 || /skills|technical skills/i.test(normalized);
  const hasSummary =
    summaryLines.length > 0 ||
    /summary|professional summary|profile|objective/i.test(normalized);
  const hasSoftSkillsSection = /soft skills/i.test(normalized);

  const missingSections = [];
  if (!hasEducation) missingSections.push("Education");
  if (!hasExperience) missingSections.push("Experience");
  if (!hasSkills) missingSections.push("Skills");
  if (!hasProjects) missingSections.push("Projects");

  const namedSectionCount = [
    hasEducation,
    hasExperience,
    hasProjects,
    hasSkills,
    hasSummary,
  ].filter(Boolean).length;

  const structureEvidence = [];
  if (email) structureEvidence.push("Email detected");
  if (phone) structureEvidence.push("Phone detected");
  if (linkedIn) structureEvidence.push("LinkedIn detected");
  if (github) structureEvidence.push("GitHub detected");
  if (hasEducation) structureEvidence.push("Education section detected");
  if (hasExperience) structureEvidence.push("Experience section detected");
  if (hasProjects) structureEvidence.push("Projects section detected");
  if (hasSkills) structureEvidence.push("Skills section detected");
  if (hasSummary) structureEvidence.push("Summary detected");

  let structureScore = 0;
  if (email) structureScore += 2.5;
  if (phone) structureScore += 1.5;
  if (linkedIn) structureScore += 1;
  if (github || linkedIn) structureScore += 1;
  if (hasEducation) structureScore += 1.5;
  if (hasExperience) structureScore += 1.5;
  if (hasProjects) structureScore += 1.5;
  if (hasSkills) structureScore += 1.5;
  if (hasSummary) structureScore += 0.5;

  if (wordCount >= 180 && wordCount <= 650) structureScore += 1;
  else if (wordCount >= 140 && wordCount < 180) structureScore += 0.65;
  else if (wordCount > 650 && wordCount <= 850) structureScore += 0.45;

  structureScore = clamp(structureScore, 0, 10);

  let keywordScore = 0;
  keywordScore += Math.min(matchedConcepts.length * 0.95, 6.0);
  keywordScore += Math.min(technicalMatches.length * 0.15, 1.8);
  if (linkedIn) keywordScore += 0.2;
  if (github) keywordScore += 0.4;
  keywordScore = clamp(keywordScore, 0, 10);

  let projectScore = 0;
  if (hasProjects) projectScore += 4;
  if (technicalMatches.length >= 4) projectScore += 2;
  if (impactLineCount >= 2) projectScore += 1.2;
  if (linesWithMetrics.length >= 1) projectScore += 0.8;
  if (
    /\b(database|api|application|platform|system|model|dashboard|etl|pipeline|cloud|infrastructure|website|app)\b/i.test(
      normalized
    )
  ) {
    projectScore += 1.2;
  }
  projectScore = clamp(projectScore, 0, 10);

  let experienceImpactScore = 0;
  if (hasExperience) experienceImpactScore += 2.8;
  experienceImpactScore += Math.min(impactLineCount * 0.8, 2.8);
  experienceImpactScore += Math.min(strongActionLines.length * 0.4, 1.8);
  if (weakLines.length >= 2) experienceImpactScore -= 1.8;
  experienceImpactScore = clamp(experienceImpactScore, 0, 10);

  let metricsScore = 0;
  const metricRatio = achievementLines.length
    ? linesWithMetrics.length / achievementLines.length
    : 0;

  if (linesWithMetrics.length >= 6 || metricRatio >= 0.8) metricsScore = 10;
  else if (linesWithMetrics.length >= 4 || metricRatio >= 0.6)
    metricsScore = 7.8;
  else if (linesWithMetrics.length >= 3 || metricRatio >= 0.45)
    metricsScore = 6.2;
  else if (linesWithMetrics.length >= 2 || metricRatio >= 0.3)
    metricsScore = 4.8;
  else if (linesWithMetrics.length >= 1) metricsScore = 3.0;
  else metricsScore = achievementLines.length === 0 ? 1.5 : 1.8;

  metricsScore = clamp(metricsScore, 0, 10);

  let achievementStrength = 0;
  if (achievementLines.length >= 8) achievementStrength += 2.8;
  else if (achievementLines.length >= 5) achievementStrength += 2.1;
  else if (achievementLines.length >= 3) achievementStrength += 1.4;
  else if (achievementLines.length >= 1) achievementStrength += 0.8;

  achievementStrength += Math.min(strongActionLines.length * 0.5, 2.0);
  achievementStrength += Math.min(linesWithMetrics.length * 0.3, 1.5);
  achievementStrength += Math.min(technicalMatches.length * 0.1, 1.2);

  if (weakLines.length === 0) achievementStrength += 0.5;
  if (weakLines.length >= 3) achievementStrength -= 2.2;

  achievementStrength = clamp(achievementStrength, 0, 10);

  const atsScore = Math.round(
    clamp(
      structureScore * 3.4 +
        keywordScore * 2.9 +
        metricsScore * 1.5 +
        (email || phone || linkedIn || github ? 4 : 0) +
        (hasProjects ? 2 : 0),
      0,
      100
    )
  );

  const recruiterScore = Math.round(
    clamp(
      experienceImpactScore * 3.4 +
        achievementStrength * 2.8 +
        projectScore * 2.0 +
        (impactLineCount >= 3 ? 5 : impactLineCount * 1.5) +
        (weakLines.length === 0 ? 3 : 0),
      0,
      100
    )
  );

  let overallScore =
    atsScore * 0.48 +
    recruiterScore * 0.52 +
    Math.min(matchedConcepts.length, 3);

  if (!hasSummary) overallScore -= 2;
  if (wordCount < 120) overallScore -= 12;
  else if (wordCount < 160) overallScore -= 7;
  if (wordCount > 950) overallScore -= 6;
  if (namedSectionCount < 3) overallScore -= 8;
  if (achievementLines.length === 0) overallScore -= 10;
  if (!email && !phone && !linkedIn && !github) overallScore -= 10;
  if (hasSoftSkillsSection) overallScore -= 3;
  if (bulletCount < 5) overallScore -= 6;
  if (actionVerbRate < 45) overallScore -= 4;
  if (metricRate < 20) overallScore -= 4;
  if (keywordMatchScore < 45) overallScore -= 5;
  if (targetType === "internship" && !hasProjects) overallScore -= 4;

  const score = Math.round(clamp(overallScore, 18, 92));
  const beforeAfterPairs = buildBeforeAfterPairs(
    weakLines.length ? weakLines : achievementLines
  );

  const scoreDrivers = [
    `${matchedConcepts.length} role concept groups matched.`,
    `${technicalMatches.length} technical signals detected.`,
    `${linesWithMetrics.length} metric-backed bullets detected.`,
    `${strongActionLines.length} strong action bullets detected.`,
    `${missingSections.length} major section gaps detected.`,
  ];

  const sectionScores = {
    header: Math.round(
      clamp(
        (email ? 4 : 0) +
          (phone ? 2 : 0) +
          (linkedIn || github ? 3 : 0),
        0,
        10
      )
    ),
    education: Math.round(clamp(hasEducation ? 8 : 2, 0, 10)),
    experience: Math.round(clamp(experienceImpactScore, 0, 10)),
    projects: Math.round(clamp(projectScore, 0, 10)),
    skills: Math.round(
      clamp((hasSkills ? 4 : 0) + Math.min(technicalMatches.length * 0.4, 6), 0, 10)
    ),
  };

  const improvementSections = [
    {
      id: "keywords",
      label: "Keyword Coverage",
      title: "Target the role more directly",
      priority:
        keywordMatchScore < 50 ? "high" : keywordMatchScore < 72 ? "medium" : "low",
      description:
        keywordMatchScore < 70
          ? "Your resume is missing too much role-specific language, which can hurt both ATS matching and recruiter confidence."
          : "Your resume already has some useful role language, but it still can be more targeted.",
      bullets: [
        keywordMatchScore < 70
          ? "Add more role-specific language into your skills, projects, and experience bullets."
          : "Mirror the language of the target role more closely where it honestly matches your experience.",
        missingConcepts.length
          ? `Missing concept groups: ${missingConcepts
              .slice(0, 5)
              .map((c) => c.label)
              .join(", ")}.`
          : "Your concept coverage is fairly strong, but a few more direct matches would still help.",
        missingKeywords.length
          ? `Concrete examples to add where true: ${missingKeywords.slice(0, 8).join(", ")}.`
          : "Most of the important role terms are already represented.",
      ],
    },
    {
      id: "bullets",
      label: "Bullet Strength",
      title: "Make your experience sound stronger",
      priority:
        actionVerbRate < 60 || metricRate < 35 ? "high" : "medium",
      description:
        "Your bullets should show stronger ownership, clearer action, and more measurable outcomes.",
      bullets: [
        actionVerbRate < 70
          ? "Start more bullets with strong action verbs like built, designed, implemented, optimized, automated, or led."
          : "Your bullet openings are decent, but they can still be more consistently strong.",
        metricRate < 45
          ? "Add more numbers, scale, users, percentages, time savings, or measurable outcomes wherever possible."
          : "You already use some measurable proof, but more would make the resume stronger.",
        beforeAfterPairs.length
          ? `Example rewrite idea: ${beforeAfterPairs[0].before} → ${beforeAfterPairs[0].after}`
          : "Try to make each bullet follow: action + task + measurable result.",
      ],
    },
    {
      id: "structure",
      label: "Structure & Sections",
      title: "Make the resume easier to trust",
      priority: missingSections.length > 1 ? "high" : "medium",
      description:
        "A stronger structure helps recruiters scan faster and makes your experience feel more complete.",
      bullets: [
        missingSections.length
          ? `Add or improve these sections: ${missingSections.join(", ")}.`
          : "Your core sections exist, but they can still be formatted more clearly.",
        !hasProjects
          ? "For technical roles, a Projects section usually helps a lot, especially if your experience is still growing."
          : "Keep projects focused on tools used, outcomes, and technical depth.",
        "Keep formatting ATS-friendly with clear headings, consistent dates, and simple layout choices.",
      ],
    },
  ];

  return {
    rawText: normalized,
    role,
    targetType,

    score,
    overallScore: score,
    resumeScore: score,
    atsScore,
    recruiterScore,

    keywordMatchScore,
    keywordScore: keywordMatchScore,
    atsKeywordScore: keywordMatchScore,

    actionVerbRate,
    metricRate,
    bulletCount,
    totalBullets: bulletCount,
    bulletStats: {
      totalBullets: bulletCount,
      actionVerbRate,
      metricRate,
    },

    matchedKeywords,
    missingKeywords,
    matchedConcepts: matchedConcepts.map((concept) => concept.label),
    missingConcepts: missingConcepts.map((concept) => concept.label),
    keywordGaps: missingKeywords,
    weakBullets: weakLines.slice(0, 5),

    missingSections,
    hasProjects,
    sectionsFound: {
      education: hasEducation,
      experience: hasExperience,
      skills: hasSkills,
      projects: hasProjects,
      summary: hasSummary,
    },

    contactChecks: {
      hasEmail: email,
      hasLinkedIn: linkedIn,
      hasGitHub: github,
      hasPhone: phone,
    },

    wordCount,
    technicalMatches,
    linesWithMetricsCount: linesWithMetrics.length,
    achievementLineCount: achievementLines.length,
    metricCoveragePercent: metricRate,
    strongVerbCoveragePercent: actionVerbRate,
    beforeAfterPairs,
    metricEvidenceDetails,
    strongExamples: strongActionLines.slice(0, 4),
    weakExamples: weakLines.slice(0, 4),
    structureEvidence,
    scoreDrivers,

    breakdown: {
      structure: Math.round(structureScore),
      keywords: Math.round(keywordScore),
      projects: Math.round(projectScore),
      experienceImpact: Math.round(experienceImpactScore),
      metrics: Math.round(metricsScore),
      achievementStrength: Math.round(achievementStrength),
    },

    sectionScores,
    improvementSections,

    debug: {
      lines,
      achievementLines,
      explicitBullets,
    },
  };
}