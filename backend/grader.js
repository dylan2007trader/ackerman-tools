// AI-powered resume grader.
//
// Combines:
//   1. Rule-based objective metrics (word count, bullet count, action verb rate,
//      metric rate, section detection, contact checks) — these work for ANY major.
//   2. Claude Haiku 4.5 for role-specific keyword analysis + targeted improvement
//      suggestions for the user's chosen category/subcategory.
//
// Returns a single shape compatible with the existing ResumeToolPage UI.

const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = "claude-haiku-4-5-20251001";
const MOCK_AI = process.env.MOCK_AI === "true";

const ACTION_VERBS = [
  "built", "developed", "designed", "created", "implemented", "led",
  "managed", "wrote", "optimized", "delivered", "analyzed", "engineered",
  "launched", "improved", "co-founded", "resolved", "supported", "automated",
  "maintained", "directed", "coordinated", "researched", "trained", "taught",
  "presented", "negotiated", "treated", "diagnosed", "operated", "constructed",
  "installed", "repaired", "advised", "drafted", "negotiated", "audited",
  "investigated", "filed", "litigated", "edited", "produced", "marketed",
  "sold", "forecasted", "budgeted", "reviewed", "supervised", "mentored",
];

const METRIC_PATTERNS = [
  /\b\d+%/, /\$\d/, /\b\d{1,3}(?:,\d{3})+/, /\b\d+(?:\.\d+)?\s*(?:k|m|million|billion|thousand)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:hours?|hrs?|weeks?|months?|years?|days?)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:patients?|students?|clients?|customers?|users?|employees?|projects?|cases?)\b/i,
  /\b\d+(?:\.\d+)?\s*(?:wpm|gpa|sat|act)\b/i,
];

function normalizeWhitespace(value = "") {
  return String(value || "").replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function extractLines(text = "") {
  return String(text || "")
    .split("\n")
    .map((line) => line.replace(/^[-*•\u2022\s]+/, "").trim())
    .filter(Boolean);
}

function detectBullets(lines = []) {
  return lines.filter((line) =>
    ACTION_VERBS.some((verb) => line.toLowerCase().startsWith(verb))
  );
}

function detectMetricLines(lines = []) {
  return lines.filter((line) => METRIC_PATTERNS.some((p) => p.test(line)));
}

// Run the rule-based portion that doesn't depend on industry
function computeBaseMetrics(resumeText) {
  const normalized = normalizeWhitespace(resumeText);
  const lower = normalized.toLowerCase();
  const lines = extractLines(normalized);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;

  const actionLines = detectBullets(lines);
  const metricLines = detectMetricLines(lines);
  const bulletCount = lines.length;
  const actionVerbRate = bulletCount ? Math.round((actionLines.length / bulletCount) * 100) : 0;
  const metricRate = bulletCount ? Math.round((metricLines.length / bulletCount) * 100) : 0;

  const hasEmail = /\S+@\S+\.\S+/.test(normalized);
  const hasPhone = /(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/.test(normalized);
  const hasLinkedIn = /linkedin\.com\//i.test(normalized);
  const hasGitHub = /github\.com\//i.test(normalized);

  const hasEducation = /\beducation\b/.test(lower);
  const hasExperience = /\bexperience\b|\bwork history\b/.test(lower);
  const hasProjects = /\bprojects?\b/.test(lower);
  const hasSkills = /\bskills?\b/.test(lower);
  const hasSummary = /\bsummary\b|\bobjective\b/.test(lower);

  const missingSections = [];
  if (!hasEducation) missingSections.push("Education");
  if (!hasExperience) missingSections.push("Experience");
  if (!hasSkills) missingSections.push("Skills");

  return {
    wordCount,
    bulletCount,
    achievementLineCount: actionLines.length,
    linesWithMetricsCount: metricLines.length,
    actionVerbRate,
    metricRate,
    strongExamples: actionLines.slice(0, 4),
    weakExamples: lines.filter((l) => !actionLines.includes(l)).slice(0, 4),
    contactChecks: { hasEmail, hasPhone, hasLinkedIn, hasGitHub },
    sectionsFound: {
      education: hasEducation,
      experience: hasExperience,
      skills: hasSkills,
      projects: hasProjects,
      summary: hasSummary,
    },
    missingSections,
  };
}

// MAX truncate to keep token cost bounded
function truncateResume(text, maxChars = 4000) {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n[...truncated for grading]";
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (err) {
    // Try to extract a JSON object from a wrapped response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch (e) {}
    }
    return null;
  }
}

// Claude Haiku grader — tight token budget. Returns role-specific signals.
async function callClaudeGrader({ resumeText, targetRole, targetType }) {
  const truncated = truncateResume(resumeText);
  const role = targetRole || "general";
  const type = targetType || "job";

  const system = `You are a strict resume grader. Given a resume and a target role/career path, evaluate fit and return ONLY a single JSON object (no markdown, no commentary).

SCORING METHOD — count concrete signals, don't guess:

Start overallScore at 50. Adjust using this rubric (integer math, final value clamped 0-100):

Structure (contributes to structureScore and overallScore):
  +5 for each of {Education, Experience, Skills, Projects, Summary} section present (max +25)
  +3 if a summary/objective is present and role-oriented
  -10 if the layout is chaotic or hard to scan

Bullets & Impact (contributes to impactScore and overallScore):
  +2 for EACH bullet starting with a strong varied action verb (cap +20)
  +3 for EACH bullet containing a specific measurable outcome — number, %, dollars, scope words like "enterprise-scale", named audience/system (cap +25)
  -3 for EACH vague bullet containing filler like "responsible for", "worked on", "helped with", "tasked with" (cap -15)

Keywords (contributes to keywordMatchScore and overallScore):
  +3 for each role-specific technical/domain keyword present (cap +20)
  -3 for each clearly expected role keyword that is MISSING (cap -15)

Tailoring to target role:
  +8 if the resume clearly targets the specific role (terminology fits)
  -8 if the resume reads generic — could apply to any role in the category

Use the counts above to compute each sub-score independently. DO NOT anchor to 72 or any other "average" number — two similar-but-better resumes MUST produce clearly different scores (e.g. 64 vs 79). Score deltas of 10-20 points between original and improved versions are expected and correct. Scores above 85 should be rare; only resumes that check most boxes above earn them.

Schema (all fields required):
{
  "overallScore": 0-100,
  "keywordMatchScore": 0-100,
  "structureScore": 0-100,
  "impactScore": 0-100,
  "matchedKeywords": ["..."],   // skills/keywords from resume that fit the target role (max 12)
  "missingKeywords": ["..."],   // important keywords for this role that are MISSING (max 8)
  "technicalMatches": ["..."],  // technical/professional terms found that fit the role (max 12). For non-tech roles use domain knowledge, certifications, methodologies.
  "strengths": ["..."],         // 3 specific strengths you observed in the resume
  "improvements": [             // 3 actionable improvements specific to the target role
    {"title": "Short name", "body": "1-2 sentence specific suggestion"}
  ],
  "strongBullets": ["..."],     // 3 actual bullet-point lines from the resume that demonstrate strong writing (quote them verbatim, truncated to 120 chars max). Pick only lines that are EXPERIENCE BULLETS — do NOT include the person's name, contact info, URLs, section headers like "Education", or dates. If no strong bullets exist, return empty array.
  "weakBullets": ["..."],       // Up to 3 actual bullet-point lines that are weak, vague, or lack metrics (quote verbatim, truncated to 120 chars max). Same rule: only experience bullets. Do NOT include names, contact info, URLs, section headers, or education line items. If everything is strong, return empty array.
  "scoreReasoning": "1-2 sentences explaining how you arrived at the overall score."
}

Be specific to the target role. Be concise.`;

  const user = `TARGET ROLE: ${role}
TARGET TYPE: ${type}

RESUME:
${truncated}`;

  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const parsed = safeJsonParse(text);
  if (!parsed) {
    throw new Error("Grader returned unparseable response");
  }
  return parsed;
}

function mockGraderResponse({ targetRole }) {
  return {
    overallScore: 72,
    keywordMatchScore: 65,
    structureScore: 80,
    impactScore: 70,
    matchedKeywords: ["[mock] teamwork", "[mock] communication"],
    missingKeywords: ["[mock] leadership", "[mock] " + (targetRole || "domain expertise")],
    technicalMatches: ["[mock] tool A", "[mock] tool B"],
    strengths: [
      "[mock] Clear section structure",
      "[mock] Action verbs used in most bullets",
      "[mock] Contact info present",
    ],
    improvements: [
      { title: "[mock] Add metrics", body: "Quantify results in 3+ bullets." },
      { title: "[mock] Tailor to role", body: `Add keywords relevant to ${targetRole || "your target"}.` },
      { title: "[mock] Strengthen summary", body: "Open with a 2-line summary." },
    ],
    strongBullets: ["[mock] Built a full-stack app used by 40+ users"],
    weakBullets: ["[mock] Worked on team projects"],
    scoreReasoning: "[mock] Mock scoring — not a real evaluation.",
  };
}

// Clamp Claude output to sane integers 0-100 so bad responses don't crash UI
function clampScore(value, fallback = 60) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// Main entry point — combines base metrics with Claude insights
async function gradeResume({ resumeText, targetRole, targetType }) {
  const base = computeBaseMetrics(resumeText);
  const ai = MOCK_AI
    ? mockGraderResponse({ targetRole })
    : await callClaudeGrader({ resumeText, targetRole, targetType });

  // scoreDrivers is an array of plain strings in the UI (renders {item} directly).
  // Start with Claude's scoreReasoning so the user sees WHY their score is what it is,
  // then add the 3 improvements.
  const scoreDrivers = [];
  if (ai.scoreReasoning) {
    scoreDrivers.push(`Why this score: ${ai.scoreReasoning}`);
  }
  (ai.improvements || []).forEach((item) => {
    scoreDrivers.push(`${item.title}: ${item.body}`);
  });

  // Use Claude's scores as-is (clamped 0-100). Only the rule-based metrics
  // (metric rate, action verb rate) come from deterministic counting.
  const breakdown = {
    structure: clampScore(ai.structureScore),
    keywords: clampScore(ai.keywordMatchScore),
    projects: base.sectionsFound.projects ? 80 : 40,
    experienceImpact: clampScore(ai.impactScore),
    metrics: base.metricRate,
    achievementStrength: base.actionVerbRate,
  };

  const sectionScores = {
    header: base.contactChecks.hasEmail ? 85 : 40,
    education: base.sectionsFound.education ? 80 : 30,
    experience: base.sectionsFound.experience ? 80 : 30,
    projects: base.sectionsFound.projects ? 75 : 50,
    skills: base.sectionsFound.skills ? 80 : 40,
  };

  const structureEvidence = [];
  if (base.sectionsFound.education) structureEvidence.push("Education section present");
  if (base.sectionsFound.experience) structureEvidence.push("Experience section present");
  if (base.sectionsFound.skills) structureEvidence.push("Skills section present");
  if (base.sectionsFound.projects) structureEvidence.push("Projects section present");
  if (base.contactChecks.hasEmail) structureEvidence.push("Email present in header");
  if (base.contactChecks.hasLinkedIn) structureEvidence.push("LinkedIn link present");

  // Prefer Claude's curated bullets (only real experience bullets, no
  // headers/contact lines). Fall back to rule-based only if Claude returned nothing.
  const strongBullets =
    Array.isArray(ai.strongBullets) && ai.strongBullets.length > 0
      ? ai.strongBullets
      : [];
  const weakBullets =
    Array.isArray(ai.weakBullets) && ai.weakBullets.length > 0
      ? ai.weakBullets
      : [];

  return {
    role: targetRole,
    targetType,

    score: clampScore(ai.overallScore),
    overallScore: clampScore(ai.overallScore),
    resumeScore: clampScore(ai.overallScore),
    atsScore: clampScore(ai.keywordMatchScore),
    recruiterScore: clampScore(ai.impactScore),

    keywordMatchScore: clampScore(ai.keywordMatchScore),
    keywordScore: clampScore(ai.keywordMatchScore),
    atsKeywordScore: clampScore(ai.keywordMatchScore),

    actionVerbRate: base.actionVerbRate,
    metricRate: base.metricRate,
    bulletCount: base.bulletCount,
    totalBullets: base.bulletCount,
    bulletStats: {
      totalBullets: base.bulletCount,
      actionVerbRate: base.actionVerbRate,
      metricRate: base.metricRate,
    },

    matchedKeywords: ai.matchedKeywords || [],
    missingKeywords: ai.missingKeywords || [],
    matchedConcepts: ai.matchedKeywords || [],
    missingConcepts: ai.missingKeywords || [],
    keywordGaps: ai.missingKeywords || [],

    missingSections: base.missingSections,
    hasProjects: base.sectionsFound.projects,
    sectionsFound: base.sectionsFound,

    contactChecks: base.contactChecks,

    wordCount: base.wordCount,
    technicalMatches: ai.technicalMatches || [],
    linesWithMetricsCount: base.linesWithMetricsCount,
    achievementLineCount: base.achievementLineCount,
    metricCoveragePercent: base.metricRate,
    strongVerbCoveragePercent: base.actionVerbRate,
    strongExamples: strongBullets,
    weakExamples: weakBullets,
    weakBullets,
    structureEvidence,
    scoreDrivers,
    scoreReasoning: ai.scoreReasoning || "",
    strengths: ai.strengths || [],

    breakdown,
    sectionScores,

    improvementSections: (ai.improvements || []).map((item) => ({
      title: item.title,
      bullets: [item.body],
    })),
  };
}

module.exports = { gradeResume, computeBaseMetrics };
