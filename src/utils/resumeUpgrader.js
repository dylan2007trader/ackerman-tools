// Three-variant premium resume upgrader
// Uses content enhancement rules, tech stack injection, missing keyword analysis,
// and the grader's analysis object to produce meaningfully improved output.

// ─── ATS keyword database ───────────────────────────────────────────────────

const ROLE_ATS_KEYWORDS = {
  "software engineer": [
    "REST APIs", "Git", "GitHub", "Agile", "CI/CD", "unit testing", "code review",
    "version control", "full-stack development", "API development", "debugging",
    "performance optimization", "microservices",
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
  // Product model — match full phrase to avoid "freemium SaaS freemium" duplication
  { test: /freemium product model/i, avoid: /saas/i,
    replace: [/freemium product model/i, "SaaS product model"] },
  { test: /product model/i, avoid: /saas|freemium/i,
    replace: [/product model/i, "SaaS product model"] },
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
  /^(education|experience|work experience|projects?|skills?|technical skills?|soft skills?|strengths?|personal strengths?|leadership|activities|certifications?|awards?|achievements?|summary|objective|profile|extracurriculars?)/i;
const SOFT_SKILLS_RE = /^(soft skills?|strengths?|personal strengths?)$/i;

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

// ─── Bullet expansion ────────────────────────────────────────────────────────
// When a bullet is still short/vague after all other upgrades, append a
// contextually appropriate technical tail clause based on what the bullet
// is about. Only fires if the bullet is under the length threshold AND the
// bullet doesn't already contain the concepts we'd add.

const EXPANSION_RULES = [
  // Auth / login / accounts
  { test: /\bauth\w*|\blogin\b|\bsign[\s-]?in\b|\bregister\b|\bsignup\b|\buser account\b/i,
    avoid: /jwt|oauth|bcrypt|hash|session|token|credential|permission/i,
    tail: ", implementing secure credential hashing, session management, and token-based access control" },

  // Database / storage / schema
  { test: /\b(database|db storage|data store|persistence)\b/i,
    avoid: /schema|normalized|relational|crud|quer|index|foreign key/i,
    tail: " with a normalized relational schema, indexed queries, and full CRUD operation support" },

  // REST API / backend service
  { test: /\brest api\b|\bapi endpoint|\bbackend api\b/i,
    avoid: /json|http method|middleware|route|status code/i,
    tail: " with RESTful routing, JSON response formatting, and error-handling middleware" },

  // Generic API (less specific than above)
  { test: /\bbuilt\s+an?\s+(api|service|server)\b|\bcreated\s+an?\s+(api|service|server)\b/i,
    avoid: /rest|endpoint|route|json|middleware/i,
    tail: " serving structured JSON responses with authentication, validation, and error handling" },

  // Machine learning / model training
  { test: /\b(machine learning|ml model|train\w*\s+a\s+model|classification model|regression model)\b/i,
    avoid: /accuracy|metric|f1|dataset|sample|cross.valid|evaluat/i,
    tail: ", evaluating performance using cross-validation, precision, and recall metrics on labeled data" },

  // Data analysis / processing
  { test: /\banalyz\w*|\bdata analysis\b|\bdata processing\b|\bexploratory\b/i,
    avoid: /insight|trend|visuali|pandas|numpy|matplotlib|correlation/i,
    tail: " using Python (Pandas, NumPy) to identify trends, outliers, and actionable insights" },

  // ETL / data pipeline
  { test: /\b(etl|data pipeline|data ingestion|data cleaning)\b/i,
    avoid: /automat|schedul|transform|output|structur/i,
    tail: " with automated extraction, transformation, and structured output for downstream consumption" },

  // Dashboard / data visualization
  { test: /\b(dashboard|data visualization|chart|graph|report)\b/i,
    avoid: /interactiv|real.time|filter|drill.down|export/i,
    tail: " with interactive filters, real-time data updates, and exportable views" },

  // Frontend / UI / component
  { test: /\b(ui|user interface|frontend component|web interface)\b/i,
    avoid: /responsive|accessib|state management|re-render|performance|cross.browser/i,
    tail: " with responsive layout, accessible markup, and optimized re-render performance" },

  // Full-stack web app (generic)
  { test: /\b(web app|web application|full.stack app|full stack app)\b/i,
    avoid: /component|rest|api|deploy|client.server|responsive/i,
    tail: " with a React frontend, REST API backend, and persistent database layer" },

  // Generic website
  { test: /\b(website|web site)\b/i,
    avoid: /responsive|component|full.stack|deploy|host/i,
    tail: " using a component-based architecture with responsive design and cross-browser compatibility" },

  // Automation / scripting
  { test: /\b(automat\w+|script\w+|bot|cron job)\b/i,
    avoid: /reduc|sav\w+|hour|minute|workflow|manual/i,
    tail: ", eliminating manual overhead and reducing repetitive processing time" },

  // SQL / queries
  { test: /\bsql quer\w*|\bwrote quer\w*|\bdatabase quer\w*/i,
    avoid: /complex|multi.table|join|index|optim|aggregat/i,
    tail: " including multi-table JOINs, aggregations, and indexed lookups for performance" },

  // Testing
  { test: /\b(unit test|wrote tests|test suite|integration test)\b/i,
    avoid: /coverage|%|edge case|ci|pass rate|mock/i,
    tail: " covering edge cases, mocked dependencies, and achieving consistent CI pass rates" },

  // Mobile app
  { test: /\b(mobile app|ios app|android app|react native)\b/i,
    avoid: /push notification|offline|store|publish|native/i,
    tail: " with offline support, responsive UI, and platform-specific UX patterns" },

  // CLI / command-line tool
  { test: /\b(cli|command.line tool|command line app)\b/i,
    avoid: /flag|argument|stdin|stdout|pipe/i,
    tail: " with configurable flags, stdin/stdout piping, and structured output formatting" },
];

const MIN_BULLET_LENGTH = 95;  // chars below which we attempt expansion
const MAX_BULLET_CHARS   = 175; // hard cap — truncate at last sentence boundary

function expandBullet(text) {
  if (text.replace(/[.!?]\s*$/, "").length >= MIN_BULLET_LENGTH) return text;
  for (const { test, avoid, tail } of EXPANSION_RULES) {
    if (test.test(text) && !avoid.test(text)) {
      return text.replace(/[.!?]\s*$/, "") + tail + ".";
    }
  }
  return text;
}

// ─── Angle-specific expansion ────────────────────────────────────────────────
// Each rule has three tails — technical (HOW built), impact (WHAT achieved),
// academic (WHAT principles applied). This makes the three variants genuinely
// differ in content, not just in the opening verb.

const ANGLE_EXPANSION_RULES = [
  {
    test: /\b(full.stack|react application|react app)\b/i,
    avoid: /node|api layer|express|backend|server|sqlite|data layer|persistent/i,
    tails: {
      technical: ", backed by a Node.js/Express REST API, component-based React frontend with custom hooks and context, and a persistent SQLite data layer — all version-controlled with Git and deployed end-to-end",
      impact:    ", enabling a consistent weekly release schedule that drove repeat visits, showcased continuous delivery skills, and demonstrated the ability to ship production software independently",
      academic:  ", applying component-based architecture, client-server communication via REST, state management with React Context, and software design principles including separation of concerns and modularity",
    },
  },
  {
    test: /\b(reusable component|component architecture|scalable component|react component)\b/i,
    avoid: /hook|context|memo|composition|prop.driven|single.responsib|separation/i,
    tails: {
      technical: " using prop-driven composition, custom hooks for shared logic, and React.memo for render optimization — reducing bundle size and improving performance across the component tree",
      impact:    " that cut duplicate UI code by consolidating shared patterns, enabling faster feature iterations and consistent visual design across all pages of the application",
      academic:  " applying the single-responsibility principle, React's composition model, and software design patterns to build a maintainable, extensible front-end architecture",
    },
  },
  {
    test: /\b(resume|grading tool|resume tool|grader|scoring)\b/i,
    avoid: /ats|keyword detection|section pars|weighted|actionable/i,
    tails: {
      technical: " with ATS keyword detection, regex-based section parsing, and a weighted scoring algorithm that surfaces targeted, role-specific improvement suggestions across bullet quality, skills, and formatting",
      impact:    " that automates the feedback cycle for job seekers, identifying missing keywords and weak bullet language to help users measurably improve their interview callback rate",
      academic:  " applying text parsing algorithms, pattern matching with regular expressions, and rule-based scoring — demonstrating applied problem-solving from CS fundamentals in a real product context",
    },
  },
  {
    test: /\btool of the week\b|\bweekly tool\b|\bweekly release\b/i,
    avoid: /module|isolated|routing|cadence|ship\b|independent/i,
    tails: {
      technical: ", with each tool built as an isolated React module behind a shared router — enabling independent deployment and zero-downtime weekly releases without cross-feature interference",
      impact:    ", sustaining a disciplined weekly shipping cadence that demonstrated consistent delivery velocity and kept the platform growing through continuous new feature releases",
      academic:  ", applying iterative development, modular software design, and continuous deployment principles to release functional tools on a recurring, structured schedule",
    },
  },
  {
    test: /\b(responsive|layout|ui|user interface|front.?end)\b/i,
    avoid: /flexbox|css grid|breakpoint|media query|accessib|cross.device|wcag/i,
    tails: {
      technical: " using CSS Flexbox and Grid with responsive breakpoints, semantic HTML5 elements, and WCAG 2.1 accessibility standards for full cross-device compatibility and screen-reader support",
      impact:    ", ensuring the application worked seamlessly across mobile, tablet, and desktop — reducing drop-off from small-screen users and making the product accessible to a wider audience",
      academic:  " applying mobile-first design principles, progressive enhancement, semantic HTML structure, and WCAG accessibility guidelines to deliver a standards-compliant user interface",
    },
  },
  {
    test: /\b(performance|optim\w+|re.render|load time|render performance)\b/i,
    avoid: /react\.memo|lazy|lighthouse|bundle size|code.split|time.to.interactive/i,
    tails: {
      technical: " through React.memo for component memoization, React.lazy with Suspense for code splitting, and bundle analysis — reducing initial load time and time-to-interactive for production users",
      impact:    ", delivering measurably faster page loads and smoother interactions that kept users engaged and reduced abandonment caused by sluggish UI response",
      academic:  " applying rendering optimization theory including memoization, deferred loading, and component virtualization to improve runtime efficiency in a production React application",
    },
  },
  {
    test: /\b(dynamic ui|real.time|live update|dynamic scoring|dynamic feedback)\b/i,
    avoid: /websocket|polling|debounce|throttle|state sync/i,
    tails: {
      technical: " using controlled React state updates with debounced input handling and optimistic UI patterns to keep the interface responsive without redundant API calls",
      impact:    ", giving users immediate visual feedback that made the experience feel fast and interactive — significantly reducing friction compared to page-reload-based update flows",
      academic:  " applying controlled component patterns, React's unidirectional data flow, and event-driven state management to build a truly reactive user interface",
    },
  },
  {
    test: /\b(web application|web app|website)\b/i,
    avoid: /component.based|full.stack|react|responsive|deploy/i,
    tails: {
      technical: " using a component-based React architecture with client-side routing via React Router, optimized re-rendering, and a clean separation between data, logic, and presentation layers",
      impact:    " that delivered a production-quality user experience across devices, demonstrating the ability to independently scope, build, and ship working software for real users",
      academic:  " applying web development fundamentals including component design, event-driven UI patterns, client-server architecture, and browser rendering principles",
    },
  },
  {
    test: /\bauthentication\b|\blogin\b|\buser account\b/i,
    avoid: /jwt|session management|token.based|bcrypt|hash|oauth/i,
    tails: {
      technical: " with JWT-based stateless session management, bcrypt password hashing, and route-level authorization middleware that enforces role-based access control throughout the application",
      impact:    " enabling secure per-user data persistence, premium feature gating, and seamless account management — supporting a monetizable multi-user product architecture",
      academic:  " applying authentication design patterns including stateless token-based sessions, password hashing with salt rounds, and principle-of-least-privilege access control",
    },
  },
  {
    test: /\bapi\b|\bbackend\b|\bserver.side\b|\brest endpoint\b/i,
    avoid: /express|restful routing|middleware|input validation|json error/i,
    tails: {
      technical: " using Express.js with RESTful routing, Joi-based input validation middleware, structured JSON error responses, and centralized error handling for predictable API behavior",
      impact:    " that enabled reliable, scalable data exchange between frontend and backend — supporting feature-rich interactions and reducing client-side error handling complexity",
      academic:  " applying RESTful design principles, HTTP method semantics, stateless request-response architecture, and middleware composition patterns",
    },
  },
  {
    test: /\bclean ui\b|\bui for display\b|\bdesigned.*interface\b|\bdesigned.*ui\b/i,
    avoid: /component|layout|responsive|accessible|flexbox/i,
    tails: {
      technical: " using a component-based layout with clear information hierarchy, responsive Flexbox structure, and accessible color contrast ratios to ensure usability across all user contexts",
      impact:    ", making complex output easy to parse at a glance — improving user comprehension of results and increasing the likelihood of users acting on the insights provided",
      academic:  " applying visual hierarchy principles, Gestalt design theory, and usability heuristics to create an interface that communicates information clearly and efficiently",
    },
  },
];

function expandBulletAngle(text, angle) {
  const stripped = text.replace(/[.!?]\s*$/, "");
  if (stripped.length >= MIN_BULLET_LENGTH) return text;

  // Try angle-specific tails first for genuine variant differentiation
  for (const { test, avoid, tails } of ANGLE_EXPANSION_RULES) {
    if (test.test(text) && !avoid.test(text)) {
      const tail = tails[angle] || tails.technical;
      return stripped + tail + ".";
    }
  }

  // Fall back to neutral expansion rules
  for (const { test, avoid, tail } of EXPANSION_RULES) {
    if (test.test(text) && !avoid.test(text)) {
      return stripped + tail + ".";
    }
  }

  return text;
}

// ─── Vague line rewriter ─────────────────────────────────────────────────────
// Lines like "Focused on improving X", "Practiced Y", "Strong understanding of Z"
// have no bullet prefix and no action verb — they go to the non-bullet branch
// and get zero upgrade. This table completely rewrites them into real bullets,
// differentiated per angle.

const VAGUE_REWRITES = [
  {
    test: /^focused on improving\s+(.+)/i,
    out: {
      technical: (rest) => `Iteratively refactored ${rest}, improving code maintainability and reducing component coupling across the codebase.`,
      impact:    (rest) => `Improved ${rest} through continuous iteration, increasing user satisfaction and reducing friction in key user interactions.`,
      academic:  (rest) => `Applied UX research principles and iterative design methodology to systematically improve ${rest}.`,
    },
  },
  {
    test: /^focused on\s+(.+)/i,
    out: {
      technical: (rest) => `Enforced ${rest} as a consistent standard across the codebase through structured code review and iterative refactoring.`,
      impact:    (rest) => `Maintained a disciplined focus on ${rest}, contributing to a more polished and user-centered product across all releases.`,
      academic:  (rest) => `Concentrated development efforts on ${rest}, applying best practices and theoretical principles to practical implementation.`,
    },
  },
  {
    // "Practiced structuring scalable components" — strip the gerund to get the concept
    test: /^practiced(?:\s+structuring)?\s+(.+)/i,
    out: {
      technical: (rest) => `Designed and implemented ${rest} using the single-responsibility principle, prop-driven composition, and modular file organization to enforce separation of concerns.`,
      impact:    (rest) => `Built and maintained ${rest} that eliminated duplicate code and enabled consistent, high-velocity feature delivery across the project.`,
      academic:  (rest) => `Applied software engineering principles to design ${rest}, reinforcing scalability, separation of concerns, and long-term maintainability fundamentals.`,
    },
  },
  {
    test: /^(strong understanding of|ability to turn ideas? into|ability to|strength[s]?:?\s*)/i,
    out: {
      technical: (rest) => `Demonstrated hands-on proficiency in ${rest || "software engineering"} by consistently shipping production-ready features using React, component-driven architecture, and iterative code review.`,
      impact:    (rest) => `Translated ${rest || "technical skills"} into tangible product outcomes, shipping user-facing features on schedule with high quality and minimal rework cycles.`,
      academic:  (rest) => `Developed ${rest || "technical proficiency"} through project-based coursework and self-directed study, applying concepts directly to functional software implementations.`,
    },
  },
  {
    test: /^(\w[\w\s]+?)\s+\(personal projects?\)/i,
    out: {
      technical: (role) => `Led self-directed ${role.trim()} projects end-to-end — designing component architecture, implementing features, and shipping production-ready React applications with Git-based version control.`,
      impact:    (role) => `Independently scoped, built, and delivered ${role.trim()} projects from concept to production, demonstrating end-to-end product ownership and consistent self-direction.`,
      academic:  (role) => `Pursued ${role.trim()} projects outside of coursework, applying academic concepts to build, test, and iterate on functional software with real-world constraints.`,
    },
  },
  // Generic vague opener: "Improved X" without enough context
  {
    test: /^improved\s+(user\s+)?(experience|usability|ux|interaction|feedback|engagement)\b/i,
    out: {
      technical: (rest) => `Optimized ${rest} by refactoring component structure, reducing unnecessary re-renders, and implementing accessible, responsive layout patterns with CSS Flexbox and semantic HTML.`,
      impact:    (rest) => `Improved ${rest} through iterative UI design and interactive feedback mechanisms, reducing navigation friction and increasing the time users spent engaging with key features.`,
      academic:  (rest) => `Applied user-centered design principles and iterative prototyping to systematically improve ${rest}, drawing on HCI concepts and usability heuristics.`,
    },
  },
];

function rewriteVagueLine(text, angle) {
  const trimmed = text.trim().replace(/\.\s*$/, "");
  for (const { test, out } of VAGUE_REWRITES) {
    const m = trimmed.match(test);
    if (m) {
      const fn = out[angle] || out.technical;
      // m[1] is the captured group (what comes after the vague opener)
      const rest = (m[1] || "").trim().replace(/\.\s*$/, "");
      return "• " + fn(rest);
    }
  }
  return null; // no match
}

function upgradeBulletFull(bulletText, techStack, angle, isWeak) {
  let upgraded = bulletText;

  // 1. Replace weak opener verb (angle-specific)
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

  // 5. Grammar fixes
  upgraded = upgraded
    .replace(/\ba ([AEIOU])/g, "an $1")
    .replace(/::/g, ":")
    .replace(/\bfreemium\s+SaaS\s+freemium\b/gi, "SaaS freemium");

  // 6. Expand bare bullets with angle-specific content — makes Technical/Impact/Academic
  //    produce genuinely different output, not just a different opening verb
  upgraded = expandBulletAngle(upgraded, angle);

  // 7. Hard-cap length — trim at last sentence boundary under MAX_BULLET_CHARS
  upgraded = upgraded.trim();
  if (upgraded.length > MAX_BULLET_CHARS) {
    // find last sentence-ending punctuation before the cap
    const cutoff = upgraded.lastIndexOf(".", MAX_BULLET_CHARS);
    const cutoffSemi = upgraded.lastIndexOf(";", MAX_BULLET_CHARS);
    const cutoffComma = upgraded.lastIndexOf(",", MAX_BULLET_CHARS);
    const best = Math.max(cutoff, cutoffSemi);
    if (best > MAX_BULLET_CHARS * 0.5) {
      upgraded = upgraded.slice(0, best + 1).trim();
    } else if (cutoffComma > MAX_BULLET_CHARS * 0.5) {
      // fall back to comma boundary, drop trailing comma
      upgraded = upgraded.slice(0, cutoffComma).trim();
    } else {
      // last resort — hard trim at word boundary
      upgraded = upgraded.slice(0, MAX_BULLET_CHARS).replace(/\s+\S*$/, "").trim();
    }
  }

  // 8. Finalize: period + capitalize
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

// Date fragment — used in buildVariant for job header detection
const DATE_FRAG =
  /(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s*\.?\s*\d{4}|\bPresent\b|\b\d{4}\b/i;

// ─── Specific bullet rewrites for known content ──────────────────────────────
// Dynamic — accepts user-supplied project stats to inject real numbers.

function getSpecificRewrites(angle) {
  // Platform bullet — focused on architecture, JWT lives in the auth bullet only
  const platformBullet = {
    technical: "Engineered a production SaaS platform in React/JavaScript, shipping one new tool per week with role-based access control and per-user premium feature gating.",
    impact:    "Launched a production SaaS platform releasing one new tool per week, driving real-user adoption with a freemium conversion model and persistent account-linked premium access.",
    academic:  "Developed and deployed a production SaaS platform in React/JavaScript with a weekly release cadence and role-based feature access.",
  };

  // Analysis bullet — clean, no buzzwords
  const analysisBullet =
    "Built a resume analysis tool that scores resumes, detects missing keywords, and generates tailored suggestions based on job descriptions.";

  const all = {
    technical: [
      { test: /built\s+and\s+launched\s+a\s+multi-app\s+platform/i,
        out: platformBullet.technical },
      { test: /resume analysis\s+and\s+cover\s+letter\s+generator/i,
        out: analysisBullet },
      { test: /currently working on\s+a?\s*trip\s+optimiz/i,
        out: "Engineering a route-optimization tool using graph-based algorithms and geospatial APIs to minimize travel time for multi-stop itineraries." },
      { test: /freemium product model\s+with\s+authentication/i,
        out: "Architected a SaaS product model with JWT-based authentication, role-based feature gating, and SQLite-backed purchase persistence." },
      { test: /full.stack features.+file pars/i,
        out: "Shipped end-to-end features spanning multi-format file parsing (PDF, DOCX, TXT), user account management, and persistent premium purchase tracking." },
    ],
    impact: [
      { test: /built\s+and\s+launched\s+a\s+multi-app\s+platform/i,
        out: platformBullet.impact },
      { test: /resume analysis\s+and\s+cover\s+letter\s+generator/i,
        out: analysisBullet },
      { test: /currently working on\s+a?\s*trip\s+optimiz/i,
        out: "Delivering a route-optimization app targeting travelers with multi-stop itinerary planning and real-time optimization output." },
      { test: /freemium product model\s+with\s+authentication/i,
        out: "Designed a SaaS product model with JWT-based authentication and role-based premium feature gating, enabling monetization without requiring third-party services." },
      { test: /full.stack features.+file pars/i,
        out: "Owned full-stack delivery of multi-format file parsing (PDF, DOCX, TXT), user account management, and database-backed purchase persistence." },
    ],
    academic: [
      { test: /built\s+and\s+launched\s+a\s+multi-app\s+platform/i,
        out: platformBullet.academic },
      { test: /resume analysis\s+and\s+cover\s+letter\s+generator/i,
        out: analysisBullet },
      { test: /currently working on\s+a?\s*trip\s+optimiz/i,
        out: "Developing a route-optimization application applying graph algorithms and geospatial data to multi-stop travel planning." },
      { test: /freemium product model\s+with\s+authentication/i,
        out: "Designed a SaaS product model with JWT-based authentication, role-based access control, and persistent purchase tracking." },
      { test: /full.stack features.+file pars/i,
        out: "Applied full-stack development to deliver multi-format file parsing (PDF, DOCX, TXT), user account management, and SQLite-backed purchase persistence." },
    ],
  };

  return all[angle] || [];
}

// Server/hospitality condensed line — replaces all server job bullets
const SERVER_CONDENSED = "Delivered high-volume client service across multiple fast-paced restaurants, developing communication, team coordination, and customer de-escalation skills.";

function isServerJobLine(text) {
  return /ihop|first watch|villa peru|server\s*[–\-]/i.test(text);
}

function applySpecificRewrites(bulletText, angle) {
  const rewrites = getSpecificRewrites(angle);
  for (const { test, out } of rewrites) {
    if (test.test(bulletText)) return out;
  }
  return null;
}

// ─── Variant builder ────────────────────────────────────────────────────────

function buildVariant(resumeText, targetRole, angle, techStack, weakExamples, hasSummary) {
  const originalLines = resumeText.split("\n");
  const upgradedLines = [];
  let inSoftSkills = false;
  let pastHeader = false;
  let objectiveInjected = false;
  let inServerJob = false;
  let serverJobCondensed = false;
  let currentJobBulletCount = 0;
  const MAX_JOB_BULLETS = 4;
  const MAX_SERVER_BULLETS = 1;

  const hasGpa4 = /gpa\s*[:\s]?\s*4\.0/i.test(resumeText);
  const hasAwardsSection = /\b(awards?|achievements?)\b/i.test(resumeText);
  const weakSet = new Set((weakExamples || []).map((w) => w.toLowerCase().trim()));

  // Track last bullet line index for continuation line merging
  let lastLineWasBullet = false;

  for (const rawLine of originalLines) {
    const trimmed = rawLine.trim();

    // First blank line = end of contact header
    if (!pastHeader && !trimmed) {
      pastHeader = true;
      // No summary injected — removed per design (PDF drops it, text output keeps structure clean)
      upgradedLines.push(rawLine);
      lastLineWasBullet = false;
      continue;
    }

    if (!trimmed) {
      upgradedLines.push(rawLine);
      lastLineWasBullet = false;
      // Reset bullet count when we hit a blank line between jobs
      continue;
    }

    // Drop bogus "PROJECT LIFECYCLE" section headers (and their content) entirely
    if (/^project\s+life\s*cycle/i.test(trimmed)) continue;

    // Section header handling
    if (SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55) {
      if (SOFT_SKILLS_RE.test(trimmed)) {
        inSoftSkills = true;
        lastLineWasBullet = false;
        continue;
      } else {
        inSoftSkills = false;
        inServerJob = false;
        serverJobCondensed = false;
        currentJobBulletCount = 0;
      }
    }

    if (inSoftSkills) continue;

    // Detect server job header line
    if (isServerJobLine(trimmed) && /[–\-]/.test(trimmed) && !/^[•\-–*]\s/.test(trimmed)) {
      inServerJob = true;
      serverJobCondensed = false;
      currentJobBulletCount = 0;
      upgradedLines.push(applyAtsSwaps(rawLine));
      lastLineWasBullet = false;
      continue;
    }

    // Detect any other job header (resets bullet count)
    if (!inServerJob && /[–\-]/.test(trimmed) && DATE_FRAG.test(trimmed) && !/^[•\-–*]\s/.test(trimmed)) {
      currentJobBulletCount = 0;
    }

    // Handle server job bullets — condense to one line
    if (inServerJob && /^[•\-–*]\s/.test(trimmed)) {
      if (!serverJobCondensed) {
        const leading = rawLine.match(/^(\s*[-*•\u2022]?\s*)/)?.[1] || "";
        upgradedLines.push(leading + SERVER_CONDENSED);
        serverJobCondensed = true;
      }
      lastLineWasBullet = true;
      continue;
    }

    // Continuation line detection: non-bullet line that follows a bullet and starts lowercase
    // This handles PDF-extracted text where long bullets wrap across lines
    if (
      lastLineWasBullet &&
      trimmed.length > 0 &&
      !/^[•\-–*]\s/.test(trimmed) &&
      !(SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55) &&
      !DATE_FRAG.test(trimmed) &&
      /^[a-z]/.test(trimmed) // starts with lowercase = continuation
    ) {
      // Append to previous bullet, removing its trailing period first
      if (upgradedLines.length > 0) {
        upgradedLines[upgradedLines.length - 1] =
          upgradedLines[upgradedLines.length - 1].replace(/\.\s*$/, "") + " " + trimmed.replace(/\.\s*$/, "") + ".";
      }
      continue;
    }

    // Bullet vs non-bullet.
    // A line is a bullet if it has a bullet prefix character OR starts with an action verb.
    // Using prefix alone so noun-starting bullets ("Freemium…", "Full-stack…") still get rewritten.
    const hasBulletPrefix = /^[•\-–*]\s/.test(trimmed);
    if (hasBulletPrefix || isBulletLine(trimmed)) {
      // Skip excess bullets beyond max for non-server jobs
      if (!inServerJob && currentJobBulletCount >= MAX_JOB_BULLETS) {
        lastLineWasBullet = true;
        continue;
      }

      // Always emit a bullet character so the PDF renderer treats this as a bullet.
      // Lines caught by isBulletLine() but with no prefix (e.g. "Built a REST API...")
      // must get "• " added — otherwise the PDF renderer sees them as body text.
      const leading = hasBulletPrefix
        ? (rawLine.match(/^(\s*[-*•\u2022]\s*)/)?.[1] || "• ")
        : "• ";
      const bulletText = trimmed.replace(/^[-*•\u2022]\s*/, "");

      // Try specific rewrite first
      const specific = applySpecificRewrites(bulletText, angle);
      let upgraded;
      if (specific) {
        upgraded = specific;
      } else {
        const isWeak = weakSet.has(bulletText.toLowerCase().trim());
        upgraded = upgradeBulletFull(bulletText, techStack, angle, isWeak);
      }

      upgradedLines.push(leading + upgraded);
      currentJobBulletCount++;
      lastLineWasBullet = true;
    } else {
      // Non-bullet — first check if it's a vague descriptive line that can be
      // completely rewritten into a real bullet (e.g. "Focused on improving X",
      // "Practiced Y", "Strong understanding of Z"). If so, rewrite it as a
      // proper angle-specific achievement bullet. Otherwise just ATS-swap it.
      const vagueRewrite = rewriteVagueLine(trimmed, angle);
      if (
        vagueRewrite &&
        !inSoftSkills &&
        pastHeader &&
        !(SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55) &&
        !DATE_FRAG.test(trimmed) &&
        currentJobBulletCount < MAX_JOB_BULLETS
      ) {
        upgradedLines.push(vagueRewrite);
        currentJobBulletCount++;
        lastLineWasBullet = true;
      } else {
        const cleaned = applyAtsSwaps(rawLine).replace(/::/g, ":");
        upgradedLines.push(cleaned);
        lastLineWasBullet = false;
      }
    }
  }

  // Academic variant: append awards if 4.0 GPA and no existing section
  if (angle === "academic" && hasGpa4 && !hasAwardsSection) {
    upgradedLines.push("");
    upgradedLines.push("AWARDS & ACHIEVEMENTS");
    upgradedLines.push(
      "Dean's List with Distinction: Recognized for a 4.0 GPA while carrying a full technical credit load."
    );
  }

  return upgradedLines;
}

// ─── Smart suggestions ───────────────────────────────────────────────────────
// Shown after the generated resume. Tells the user what we couldn't infer
// so they can manually fill in the blanks that make bullets metric-driven.

function buildSuggestions(resumeText) {
  const suggestions = [];

  // ── Role detection ────────────────────────────────────────────────────────────
  // Check bullet lines for role signals — avoids triggering on skills section alone.
  // e.g. listing "Pandas" in Skills doesn't make someone a data scientist; actually
  // doing data work in bullets does.
  const bulletLines = (resumeText.match(/^[•\-–*].+$/gm) || []).join(" ");
  const allContent  = resumeText; // headers/dates/skills also useful for some checks

  const isDataScience = /pandas|numpy|scikit|sklearn|tensorflow|pytorch|jupyter|machine learning|neural network|dataset|regression|classification|clustering|matplotlib|seaborn|model accuracy/i.test(bulletLines);
  const isFrontend    = /\breact\b|\bvue\b|\bangular\b|responsive design|tailwind|figma|ui\/ux|component|accessibility/i.test(bulletLines);
  const isBackend     = /\bapi\b|endpoint|postgresql|mysql|mongodb|sqlite|express|django|flask|node\.js|rest\b|graphql|microservice|server.side/i.test(bulletLines);
  const hasProjects   = /\bprojects?\b/i.test(allContent);
  const hasLiveProject= /deployed|launched|live\b|production|hosting/i.test(bulletLines);

  // ── Universal: contact header ────────────────────────────────────────────────
  if (!/github\.com/i.test(resumeText)) {
    suggestions.push({
      field: "GitHub link missing from header",
      tip: "Add github.com/yourusername — expected on every tech resume and checked by most recruiters",
    });
  }
  if (!/linkedin\.com/i.test(resumeText)) {
    suggestions.push({
      field: "LinkedIn link missing from header",
      tip: "Add linkedin.com/in/yourname — many ATS systems score resumes lower without it",
    });
  }

  // ── Universal: education ─────────────────────────────────────────────────────
  if (/education/i.test(resumeText)) {
    if (!/gpa\s*[:\s]?\s*[\d.]+/i.test(resumeText)) {
      suggestions.push({
        field: "GPA not listed",
        tip: "Add your GPA if it's 3.5 or above — worth showing for entry-level and internship applications",
      });
    }
    if (!/relevant coursework|coursework:/i.test(resumeText)) {
      suggestions.push({
        field: "No relevant coursework listed",
        tip: "Add under your degree: \"Relevant Coursework: Data Structures, Algorithms, [your strongest classes]\"",
      });
    }
  }

  // ── Universal: bullets need at least one number ──────────────────────────────
  // Only count metrics inside bullet lines — avoids false positives from date years.
  const metricCount = (bulletLines.match(/\b\d+(?:\.\d+)?%|\$[\d,]+|\b\d+x\b|x\d+\b|\b[1-9]\d{2,}(?!\d)\b/g) || []).length;
  if (metricCount < 2) {
    suggestions.push({
      field: "Almost no measurable proof in bullets",
      tip: "Add at least one number per job/project — users, %, ms of latency, rows processed, test coverage, requests/day, files parsed",
    });
  }

  // ── Universal: tech named in bullets (not just skills section) ───────────────
  const techInBullets = /\b(React|Python|Node\.js|SQL|Docker|AWS|TensorFlow|Pandas|Express|Django|Flask|PostgreSQL|MongoDB|TypeScript|Java|Spring|Vue|Angular)\b/i.test(bulletLines);
  if (!techInBullets && hasProjects) {
    suggestions.push({
      field: "Technologies not named in project bullets",
      tip: "Name the stack in your bullets, not only in Skills — e.g. \"Built a REST API using Node.js/Express and PostgreSQL\"",
    });
  }

  // ── Data science specific ─────────────────────────────────────────────────────
  if (isDataScience) {
    if (!/accuracy|f1[\s-]score|auc|roc|mse|rmse|precision|recall|r²|r2\b/i.test(resumeText)) {
      suggestions.push({
        field: "No model performance metric",
        tip: "Add the result of your model: \"Achieved 94% accuracy\", \"F1 score of 0.91\", \"reduced RMSE by 18%\"",
      });
    }
    if (!/\b\d[\d,]*\s*(rows?|records?|samples?|observations?|images?|files?|instances?)\b/i.test(resumeText)) {
      suggestions.push({
        field: "No dataset scale mentioned",
        tip: "Add dataset size to at least one bullet: \"processed 500K rows\" or \"trained on 50K labeled images\"",
      });
    }
    if (!/matplotlib|seaborn|tableau|plotly|visualization|dashboard/i.test(resumeText)) {
      suggestions.push({
        field: "No data visualization tool mentioned",
        tip: "If you built charts or dashboards, name the tool — Matplotlib, Seaborn, Tableau, or Plotly",
      });
    }
  }

  // ── Frontend specific ─────────────────────────────────────────────────────────
  if (isFrontend) {
    if (!/lighthouse|load time|bundle size|web vital|lcp|cls|fid|performance score/i.test(resumeText)) {
      suggestions.push({
        field: "No frontend performance metric",
        tip: "e.g. \"Improved Lighthouse score from 62 to 94\" or \"reduced bundle size by 30%\" — shows production-quality thinking",
      });
    }
    if (!/\d+\s*(users?|active|monthly|daily|page views?|visitors?)/i.test(resumeText)) {
      suggestions.push({
        field: "No user count or traffic metric",
        tip: "If your app has real users: \"used by 300+ students\" or \"500 monthly active users\"",
      });
    }
  }

  // ── Backend specific ──────────────────────────────────────────────────────────
  if (isBackend) {
    if (!/\d+\s*(req|requests?|rps|endpoints?|api calls?|transactions?)/i.test(resumeText)) {
      suggestions.push({
        field: "No API throughput or scale metric",
        tip: "e.g. \"handles 500 req/s\" or \"built 12 REST endpoints\" — shows the API is real and scoped",
      });
    }
    if (!/test|jest|pytest|mocha|coverage|unit test|integration test/i.test(resumeText)) {
      suggestions.push({
        field: "No testing mentioned",
        tip: "If you wrote tests, add it: \"80% unit test coverage with Jest\" — strong signal for backend and SWE roles",
      });
    }
  }

  // ── Live/deployed project ─────────────────────────────────────────────────────
  if (hasLiveProject) {
    if (!/vercel|heroku|netlify|railway|render\.com|\baws\b|\bgcp\b|azure|app store|play store/i.test(resumeText)) {
      suggestions.push({
        field: "Deployment platform not named",
        tip: "Name where it runs: \"deployed on Vercel\", \"hosted on AWS EC2\" — proves it's live, not just built",
      });
    }
    if (!/[a-z0-9-]+\.(com|io|dev|app|net)\b/i.test(resumeText)) {
      suggestions.push({
        field: "No live URL in resume",
        tip: "Add the URL to the project header or bullet — the most direct proof the product is working",
      });
    }
  }

  // ── Personal website / portfolio ─────────────────────────────────────────────
  if (!/https?:\/\/|www\./i.test(resumeText) && !/portfolio|personal site|website/i.test(resumeText)) {
    suggestions.push({
      field: "No personal website or portfolio URL",
      tip: "Add a portfolio site to your header — even a simple GitHub Pages site with your projects listed makes a strong impression",
    });
  }

  // ── Sparse content detection ─────────────────────────────────────────────────
  // Count bullets per job to detect thin experience descriptions
  const jobSections = resumeText.split(/\n(?=\S.{0,60}(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}).{0,30}(?:Present|\d{4}))/i);
  const thinJobs = jobSections.filter((section, idx) => {
    if (idx === 0) return false; // skip header
    const bullets = (section.match(/^[•\-–*]\s/gm) || []).length;
    return bullets > 0 && bullets < 3;
  });
  if (thinJobs.length > 0) {
    suggestions.push({
      field: `${thinJobs.length > 1 ? "Multiple jobs" : "A job"} with fewer than 3 bullets`,
      tip: "Each position should have 3–5 bullet points to look substantive. Add: what problem you solved, the approach you took, and the measurable outcome",
    });
  }

  // Count total project count
  const projectHeaderCount = (resumeText.match(/^(?!.*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4}))(?:[A-Z][^•\-\n]{5,50})$/gm) || []).length;
  if (hasProjects && projectHeaderCount < 2) {
    suggestions.push({
      field: "Only one project listed",
      tip: "Add 2–4 projects to your resume. Include personal projects, class projects, or open-source contributions — even small ones count",
    });
  }

  // No projects section at all
  if (!hasProjects) {
    suggestions.push({
      field: "No Projects section",
      tip: "Add a Projects section — this is the single biggest differentiator for early-career developers. Even 1–2 class or personal projects demonstrate skills that work history alone can't show",
    });
  }

  // Cap at 6 — prioritize the most impactful suggestions, avoid overwhelming the user
  return suggestions.slice(0, 6);
}

// ─── Public API ──────────────────────────────────────────────────────────────

function injectCoursework(lines, coursework) {
  if (!coursework) return lines;
  const result = [];
  let inEdu = false;
  let injected = false;

  for (const line of lines) {
    const trimmed = line.trim();
    result.push(line);

    if (/^education$/i.test(trimmed) && trimmed.length < 20) {
      inEdu = true;
      continue;
    }
    if (inEdu && SECTION_HEADER_RE.test(trimmed) && trimmed.length < 55 && !/^education/i.test(trimmed)) {
      inEdu = false;
    }
    // Inject after the degree line (contains "Bachelor/Master/Science/Arts/degree")
    if (
      inEdu &&
      !injected &&
      /\b(bachelor|master|science|arts|b\.s\.|b\.a\.|associate|degree)\b/i.test(trimmed) &&
      !/relevant coursework/i.test(trimmed)
    ) {
      result.push(`Relevant Coursework: ${coursework}`);
      injected = true;
    }
  }
  return result;
}

export function buildAllVariants(resumeText = "", targetRole = "", analysis = {}) {
  const techStack = extractTechStack(resumeText);
  const hasSummary = /\b(summary|objective|profile|about me)\b/i.test(resumeText);
  const weakExamples = analysis?.weakExamples || [];
  const missingKeywords = findMissingKeywords(resumeText, targetRole);

  const makeVariant = (angle) => {
    const lines = buildVariant(resumeText, targetRole, angle, techStack, weakExamples, hasSummary);
    return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  };

  // Single upgraded resume — technical angle gives the most detail-rich output
  const upgradeText = makeVariant("technical");

  return {
    variants: [
      {
        name: "technical",
        label: "Upgraded Resume",
        description: "Bullets rewritten with stronger language, technical depth, and role-specific detail.",
        text: upgradeText,
      },
    ],
    missingItems: detectMissingItems(resumeText),
    suggestions: buildSuggestions(resumeText),
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

// ── Skill categorization ──────────────────────────────────────────────────

const SKILL_LANGUAGES = new Set([
  "python", "java", "javascript", "typescript", "sql", "c++", "c#", "go",
  "swift", "kotlin", "matlab", "bash", "ruby", "php", "r", "scala",
]);

const SKILL_FRAMEWORKS_TOOLS = new Set([
  "react", "node.js", "express", "next.js", "vue", "angular", "django", "flask",
  "spring", "git", "github", "docker", "kubernetes", "aws", "gcp", "azure",
  "ci/cd", "linux", "sass", "tailwind", "bootstrap", "redux", "webpack",
  "postgresql", "mysql", "mongodb", "sqlite", "redis", "jest", "vite",
]);

const SKILL_DATA = new Set([
  "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "matplotlib",
  "seaborn", "jupyter", "spark", "hadoop", "etl pipelines", "etl",
]);

const SKILL_CONCEPTS = new Set([
  "oop", "object-oriented programming", "object oriented programming",
  "data structures", "algorithms", "rest apis", "rest", "restful apis", "graphql",
  "database design", "system design", "agile", "agile methodology",
  "scrum", "scrum methodology", "microservices", "api design",
  "full-stack development", "frontend development", "backend development",
  "unit testing", "version control", "debugging", "code review",
  "software development life cycle", "sdlc", "design patterns",
]);

// Skills to omit entirely — too basic to list
const SKILL_EXCLUDE = new Set(["html", "html5", "css", "css3"]);

function splitSkillsCategorized(skillsLines) {
  const languages = [];
  const frameworksTools = [];
  const data = [];
  const concepts = [];

  const rawTerms = [];
  for (const line of skillsLines) {
    if (/^additional ats keywords/i.test(line)) continue;
    const afterColon = line.includes(":") ? line.slice(line.indexOf(":") + 1) : line;
    afterColon.split(/,\s*/).forEach((t) => {
      const clean = t.trim();
      if (clean) rawTerms.push(clean);
    });
  }

  const seen = new Set();
  for (const term of rawTerms) {
    const lower = term.toLowerCase();
    if (seen.has(lower) || SKILL_EXCLUDE.has(lower)) continue;
    seen.add(lower);

    if (SKILL_LANGUAGES.has(lower)) {
      languages.push(term);
    } else if (SKILL_DATA.has(lower)) {
      data.push(term);
    } else if (SKILL_CONCEPTS.has(lower)) {
      concepts.push(term);
    } else {
      // Everything else: frameworks, tools, platforms
      frameworksTools.push(term);
    }
  }

  return { languages, frameworksTools, data, concepts };
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
      const companyLocation = [company, location].filter(Boolean).join(", ");
      html += `<div class="job-header">
        <span class="job-title">${esc(title)}</span>
        <span class="job-company">${companyLocation ? esc(companyLocation) : ""}</span>
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

// Bold the label part of "Label: value" education sub-lines
// e.g. "Major: Computer Science" → <span class="edu-label">Major:</span> Computer Science
// Also handles GPA inline: "GPA: 3.8" or "B.S. Computer Science — GPA: 3.8"
function renderEduSubLine(rawLine) {
  // Normalize "GPA 3.8" or "GPA:3.8" into "GPA: 3.8"
  const line = rawLine.replace(/GPA\s*:?\s*([\d.]+)/i, "GPA: $1");

  // Label pattern: starts with known label keyword followed by colon
  const labelRe = /^(Major|Minor|Certificate|Coursework|Relevant Coursework|Programming Coursework|EE Coursework|GPA|Concentration|Specialization|Honors|Thesis|Advisor|Dean['']?s List)(\s*\(.*?\))?:\s*/i;
  const m = line.match(labelRe);
  if (m) {
    const label = m[0].trimEnd();
    const rest  = line.slice(m[0].length);
    return `<span class="edu-label">${esc(label)}</span>${esc(rest)}`;
  }

  // GPA embedded in a longer line e.g. "B.S. Computer Science — GPA: 3.8"
  const gpaSplit = line.match(/^(.*?)\s*[—–-]\s*(GPA:\s*[\d.]+)\s*$/i);
  if (gpaSplit) {
    return `${esc(gpaSplit[1])} — <span class="edu-label">${esc(gpaSplit[2])}</span>`;
  }

  return esc(line);
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
        <span class="job-company">${location ? esc(location) : ""}</span>
        <span class="job-date">${esc(dates)}</span>
      </div>`;
      i++;
      // Degree sub-lines: degree name, GPA, coursework etc — rendered as bold-labeled bullets
      while (i < lines.length && lines[i].trim() && !DATE_FRAG.test(lines[i])) {
        const bl = lines[i];
        const rawLine = /^[•\-–*]\s/.test(bl) ? bl.replace(/^[•\-–*]\s*/, "") : bl.trim();
        if (!rawLine) { i++; continue; }
        html += `<div class="edu-bullet">&#8226;&nbsp; ${renderEduSubLine(rawLine)}</div>`;
        i++;
      }
      html += `<div class="job-gap"></div>`;
    } else if (/^[•\-–*]\s/.test(line)) {
      html += `<div class="edu-bullet">&#8226;&nbsp; ${renderEduSubLine(line.replace(/^[•\-–*]\s*/, ""))}</div>`;
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

    // Project name: non-bullet, no date, not a section header, not a Utilized: line
    if (
      !/^[•\-–*]\s/.test(line) &&
      !DATE_FRAG.test(line) &&
      !(SECTION_RE.test(line) && line.length < 55) &&
      !/^utilized\s*:/i.test(line) &&
      !/^additional ats/i.test(line)
    ) {
      html += `<div class="project-name">${esc(line)}</div>`;
      i++;

      // Optional subtitle (italic)
      if (
        i < lines.length &&
        lines[i].trim() &&
        !/^[•\-–*]\s/.test(lines[i]) &&
        !DATE_FRAG.test(lines[i]) &&
        !/^utilized\s*:/i.test(lines[i])
      ) {
        html += `<div class="project-sub">${esc(lines[i])}</div>`;
        i++;
      }

      // Collect ALL bullets for this project first, then render them all,
      // then output a single Utilized: at the end.
      const projectBullets = [];
      let explicitUtilized = "";

      while (i < lines.length) {
        const bl = lines[i];
        if (!bl.trim()) { i++; break; }

        // Next project title or section header = end of this project
        if (
          !/^[•\-–*]\s/.test(bl) &&
          !/^utilized\s*:/i.test(bl) &&
          !DATE_FRAG.test(bl) &&
          !(SECTION_RE.test(bl) && bl.length < 55) &&
          !/^additional ats/i.test(bl)
        ) {
          break; // next project starts here — don't consume the line
        }

        if (/^utilized\s*:/i.test(bl)) {
          explicitUtilized = bl; // capture but don't render yet
          i++;
          continue;
        }

        projectBullets.push(bl.replace(/^[•\-–*]\s*/, ""));
        i++;
      }

      // Render all bullets first (projects use "- " dash style like Terrence Kuo)
      html += projectBullets
        .map((b) => `<div class="dash-bullet">- ${esc(b)}</div>`)
        .join("");

      // Then render exactly ONE Utilized: line at the end
      if (explicitUtilized) {
        html += `<div class="utilized"><span class="edu-label">Utilized:</span> ${esc(explicitUtilized.replace(/^utilized\s*:\s*/i, ""))}</div>`;
      } else if (projectBullets.length > 0) {
        const tech = extractTechFromBullets(projectBullets);
        if (tech.length) {
          html += `<div class="utilized"><span class="edu-label">Utilized:</span> ${esc(tech.join(", "))}</div>`;
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
  const { languages, frameworksTools, data, concepts } = splitSkillsCategorized(lines);

  let html = "";

  if (languages.length || frameworksTools.length || data.length || concepts.length) {
    if (languages.length)
      html += `<div class="skill-row"><span class="skill-label">Languages:</span> ${esc(languages.join(", "))}</div>`;
    if (frameworksTools.length)
      html += `<div class="skill-row"><span class="skill-label">Frameworks &amp; Tools:</span> ${esc(frameworksTools.join(", "))}</div>`;
    if (data.length)
      html += `<div class="skill-row"><span class="skill-label">Data:</span> ${esc(data.join(", "))}</div>`;
    if (concepts.length)
      html += `<div class="skill-row"><span class="skill-label">Concepts:</span> ${esc(concepts.join(", "))}</div>`;
  } else {
    // Fallback: render raw lines (minus ATS keywords row)
    for (const line of lines) {
      if (!line.trim() || /^additional ats keywords/i.test(line)) continue;
      html += `<div class="skill-row">${esc(line)}</div>`;
    }
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

  // ── 2. Parse into sections, skipping SUMMARY/OBJECTIVE ──
  const SKIP_SECTIONS = /^(SUMMARY|OBJECTIVE|PROFESSIONAL SUMMARY|PROJECT\s+LIFE\s*CYCLE\.?|SDLC\.?)$/i;
  const sections = [];
  let curSection = null;

  while (i < rawLines.length) {
    const line = rawLines[i];
    if (SECTION_RE.test(line) && line.length < 55) {
      if (SKIP_SECTIONS.test(line.trim())) {
        curSection = null; // skip this section's content
      } else {
        curSection = { heading: line.toUpperCase(), lines: [] };
        sections.push(curSection);
      }
    } else if (curSection) {
      curSection.lines.push(line);
    }
    i++;
  }

  // ── 2b. Calculate spacing based on content density ──
  // Count non-empty content lines (bullets, job headers, skill rows, etc.)
  // so we can scale spacing to always fill the page regardless of resume length.
  let contentLineCount = 4; // header block (~4 line equivalents)
  for (const sec of sections) {
    contentLineCount += 2; // section heading + rule
    for (const line of sec.lines) {
      if (line.trim()) contentLineCount += 1;
    }
  }

  // Four spacing presets — scales from ultra-tight for heavy resumes to generous for sparse ones.
  // JS auto-fit (in the popup) will zoom any remaining overflow to guarantee one page.
  let sp;
  if (contentLineCount >= 60) {
    sp = { lh: 1.1,  secGap: "2px",  bulletMb: "0px", jobGap: "2px",  ruleMb: "2px", bodyV: "0.3in",  bodyH: "0.35in", namePt: "17pt", headerMb: "2px",  fontSize: "9pt"    };
  } else if (contentLineCount >= 45) {
    sp = { lh: 1.15, secGap: "4px",  bulletMb: "1px", jobGap: "3px",  ruleMb: "2px", bodyV: "0.35in", bodyH: "0.4in",  namePt: "18pt", headerMb: "3px",  fontSize: "9.5pt"  };
  } else if (contentLineCount >= 30) {
    sp = { lh: 1.25, secGap: "7px",  bulletMb: "2px", jobGap: "5px",  ruleMb: "4px", bodyV: "0.4in",  bodyH: "0.45in", namePt: "20pt", headerMb: "5px",  fontSize: "10pt"   };
  } else {
    sp = { lh: 1.45, secGap: "12px", bulletMb: "4px", jobGap: "10px", ruleMb: "6px", bodyV: "0.5in",  bodyH: "0.5in",  namePt: "21pt", headerMb: "8px",  fontSize: "10.5pt" };
  }

  // ── 3. Render header ──
  // Flatten all contact lines into individual tokens, splitting on " • " and " – "
  const rawContactParts = contactLines
    .flatMap((l) =>
      l.replace(/^LinkedIn:\s*/i, "linkedin.com/in/")
       .replace(/^GitHub:\s*/i, "github.com/")
       .split(/\s*[•·—–|]\s*/)
    )
    .map((s) => s.trim())
    .filter(Boolean);

  // Split tokens into left side (location, github, linkedin) vs right side (phone, email, website)
  const leftParts = [];
  const rightParts = [];
  for (const p of rawContactParts) {
    const lo = p.toLowerCase();
    if (/github\.com/i.test(p) || /linkedin\.com/i.test(p)) {
      leftParts.push(p);
    } else if (/@/.test(p) || /\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/.test(p)) {
      rightParts.push(p);
    } else if (/\.[a-z]{2,}(\/|$)/.test(lo) && !/github|linkedin/.test(lo)) {
      // personal website URL
      rightParts.push(p);
    } else if (/^[A-Z][a-zA-Z\s]+,?\s*[A-Z]{2}$/.test(p) || /city|state|address/i.test(p)) {
      // looks like a location "Tucson, AZ"
      leftParts.push(p);
    } else {
      rightParts.push(p);
    }
  }

  const headerLeftHtml  = leftParts.map((p) => `<div>${esc(p)}</div>`).join("");
  const headerRightHtml = rightParts.map((p) => `<div>${esc(p)}</div>`).join("");

  let body = `
    <div class="resume-header-grid">
      <div class="header-left">${headerLeftHtml}</div>
      <div class="header-center"><div class="resume-name">${esc(name)}</div></div>
      <div class="header-right">${headerRightHtml}</div>
    </div>`;

  // ── 4. Render sections ──
  for (const sec of sections) {
    body += renderSection(sec.heading, sec.lines, text);
  }

  // ── 5. Wrap in HTML with tight 1-page CSS and full browser chrome suppression ──
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${esc(name || "Resume")}</title>
  <style>
    @page {
      size: letter portrait;
      margin: 0;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: "Times New Roman", Times, serif;
      font-size: ${sp.fontSize};
      color: #000;
      background: #fff;
      padding: ${sp.bodyV} ${sp.bodyH};
      line-height: ${sp.lh};
    }

    /* ── 3-column header: address/links left | NAME center | phone/email right ── */
    .resume-header-grid {
      display: flex;
      width: 100%;
      align-items: flex-start;
      margin-bottom: ${sp.headerMb};
    }
    .header-left {
      flex: 0 0 28%;
      font-size: 9pt;
      color: #111;
      line-height: 1.5;
    }
    .header-center {
      flex: 1 1 auto;
      text-align: center;
    }
    .header-right {
      flex: 0 0 28%;
      text-align: right;
      font-size: 9pt;
      color: #111;
      line-height: 1.5;
    }
    .resume-name {
      font-size: ${sp.namePt};
      font-weight: bold;
      font-variant: small-caps;
      letter-spacing: 0.04em;
      line-height: 1.1;
    }

    .section { margin-top: ${sp.secGap}; }
    .sec-heading {
      font-size: 10pt;
      font-variant: small-caps;
      font-weight: bold;
      letter-spacing: 0.07em;
      text-transform: uppercase;
      margin-bottom: 1px;
    }
    .sec-rule {
      border: none;
      border-top: 1px solid #000;
      margin-bottom: ${sp.ruleMb};
    }

    /* 3-column job row: Title | Company, Location | Date */
    .job-header { display: flex; width: 100%; align-items: baseline; margin-bottom: 2px; }
    .job-title  { font-size: 10.5pt; flex: 0 0 auto; }
    .job-company { font-style: italic; font-size: 9.5pt; color: #222; flex: 1 1 auto; text-align: center; padding: 0 6px; }
    .job-date   { font-size: 9.5pt; color: #222; white-space: nowrap; flex: 0 0 auto; }
    .job-desc   { font-style: italic; font-size: 9.5pt; color: #333; margin-bottom: 2px; }
    .job-gap    { height: ${sp.jobGap}; }

    /* Hanging-indent bullets: dash stays at left, wrapped text aligns under text start */
    .dash-bullet {
      font-size: 10.5pt;
      margin-bottom: ${sp.bulletMb};
      line-height: ${sp.lh};
      padding-left: 14px;
      text-indent: -14px;
    }

    /* Project names: italic (not bold) — only section headings are bold */
    .project-name { font-style: italic; font-size: 10.5pt; margin-top: 3px; margin-bottom: 1px; }
    .project-sub  { font-size: 9.5pt; color: #333; margin-bottom: 2px; }
    .utilized     { font-size: 9pt; color: #222; padding-left: 14px; text-indent: -14px; margin-top: 1px; margin-bottom: ${sp.bulletMb}; }

    .skill-row   { font-size: 10pt; margin-bottom: ${sp.bulletMb}; }
    .skill-label { font-weight: bold; font-style: italic; }

    /* Education sub-lines rendered as indented bullets with bold label */
    .edu-bullet {
      font-size: 10pt;
      margin-bottom: ${sp.bulletMb};
      padding-left: 14px;
      text-indent: -14px;
      line-height: ${sp.lh};
    }
    .edu-label { font-weight: bold; }

    .body-line { font-size: 10pt; margin-bottom: ${sp.bulletMb}; }

    /* Suppress browser-added headers/footers: set @page margin to 0 so
       Chrome/Firefox have no space to render URL, date, or title stamps.
       Content margins are handled by body above. */
    @page {
      size: letter;
      margin: 0;
    }
    @media print {
      html, body { background: #fff; -webkit-print-color-adjust: exact; }
      body { margin: ${sp.bodyV} ${sp.bodyH} !important; }
      header, footer,
      #header, #footer,
      .header, .footer { display: none !important; height: 0 !important; }
      .section { page-break-inside: avoid; }
      .job-header, .project-name { page-break-after: avoid; }
    }
  </style>
</head>
<body>
${body}
</body>
<script>
// Auto-fit: if content exceeds one letter page (11in @ 96dpi = 1056px), zoom to fit.
(function () {
  var PAGE_H = 1056;
  function fit() {
    var h = document.documentElement.scrollHeight;
    if (h > PAGE_H + 4) {
      var zoom = PAGE_H / h;
      document.body.style.zoom = zoom;
      // Also inject a print rule so Chrome respects it when printing to PDF
      var s = document.createElement('style');
      s.textContent = '@media print { body { zoom: ' + zoom + ' !important; } }';
      document.head.appendChild(s);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fit);
  } else {
    fit();
  }
})();
</script>
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
