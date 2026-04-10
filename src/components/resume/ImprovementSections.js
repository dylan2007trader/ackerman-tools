import React from "react";

function priorityColors(priority) {
  const value = String(priority || "").toLowerCase();

  if (value === "high") {
    return {
      bg: "rgba(239, 68, 68, 0.14)",
      border: "rgba(239, 68, 68, 0.35)",
      text: "#fecaca",
    };
  }

  if (value === "medium") {
    return {
      bg: "rgba(245, 158, 11, 0.14)",
      border: "rgba(245, 158, 11, 0.35)",
      text: "#fde68a",
    };
  }

  return {
    bg: "rgba(34, 197, 94, 0.14)",
    border: "rgba(34, 197, 94, 0.35)",
    text: "#bbf7d0",
  };
}

function sectionAccent(label, index) {
  const lower = String(label || "").toLowerCase();

  if (lower.includes("keyword")) {
    return {
      border: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.18)",
      chip: "rgba(139, 92, 246, 0.12)",
      chipText: "#ddd6fe",
    };
  }

  if (lower.includes("bullet")) {
    return {
      border: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.18)",
      chip: "rgba(6, 182, 212, 0.12)",
      chipText: "#a5f3fc",
    };
  }

  if (lower.includes("structure")) {
    return {
      border: "#22c55e",
      glow: "rgba(34, 197, 94, 0.18)",
      chip: "rgba(34, 197, 94, 0.12)",
      chipText: "#bbf7d0",
    };
  }

  const accents = [
    {
      border: "#8b5cf6",
      glow: "rgba(139, 92, 246, 0.18)",
      chip: "rgba(139, 92, 246, 0.12)",
      chipText: "#ddd6fe",
    },
    {
      border: "#06b6d4",
      glow: "rgba(6, 182, 212, 0.18)",
      chip: "rgba(6, 182, 212, 0.12)",
      chipText: "#a5f3fc",
    },
    {
      border: "#22c55e",
      glow: "rgba(34, 197, 94, 0.18)",
      chip: "rgba(34, 197, 94, 0.12)",
      chipText: "#bbf7d0",
    },
  ];

  return accents[index % accents.length];
}

function safeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeIncomingSections(sections) {
  return safeArray(sections).map((section, index) => ({
    id: section.id || `section-${index}`,
    label: section.label || `Section ${index + 1}`,
    title: section.title || "Improve this area",
    priority: section.priority || "medium",
    description:
      section.description ||
      section.summary ||
      "This area needs stronger execution to make the resume more competitive.",
    bullets: safeArray(section.bullets || section.items || section.points),
  }));
}

function buildFallbackSections(analysis) {
  const missingSections = safeArray(analysis?.missingSections);
  const weakBullets = safeArray(analysis?.weakBullets);
  const keywordGaps = safeArray(
    analysis?.missingKeywords || analysis?.keywordGaps
  );

  const keywordMatch =
    analysis?.keywordMatchScore ??
    analysis?.keywordScore ??
    analysis?.atsKeywordScore ??
    0;

  const actionVerbRate =
    analysis?.actionVerbRate ??
    analysis?.bulletStats?.actionVerbRate ??
    analysis?.actionVerbPercentage ??
    0;

  const metricRate =
    analysis?.metricRate ??
    analysis?.bulletStats?.metricRate ??
    analysis?.metricsPercentage ??
    0;

  const hasProjects =
    analysis?.hasProjects ??
    analysis?.sectionsFound?.projects ??
    !missingSections.includes("Projects");

  const keywordBullets = [];
  if (keywordMatch < 70) {
    keywordBullets.push(
      "Add more role-specific terms from the target job description in your skills, projects, and experience bullets."
    );
  }
  if (keywordGaps.length > 0) {
    keywordBullets.push(
      `Work in missing keywords like: ${keywordGaps.slice(0, 8).join(", ")}.`
    );
  }
  if (keywordBullets.length === 0) {
    keywordBullets.push(
      "Your keyword targeting is decent, but it can still be more tailored to the exact job posting."
    );
    keywordBullets.push(
      "Mirror the language used in the job description where it honestly matches your background."
    );
  }

  const bulletBullets = [];
  if (actionVerbRate < 70) {
    bulletBullets.push(
      "Start more bullets with strong action verbs like built, designed, led, automated, analyzed, or improved."
    );
  }
  if (metricRate < 50) {
    bulletBullets.push(
      "Add numbers, percentages, time savings, scale, users, revenue, accuracy, or performance improvements wherever possible."
    );
  }
  if (weakBullets.length > 0) {
    bulletBullets.push(
      `Rewrite weaker bullets like: ${weakBullets.slice(0, 3).join(" • ")}`
    );
  }
  if (bulletBullets.length === 0) {
    bulletBullets.push(
      "Your bullets are readable, but they still need stronger outcomes and sharper wording."
    );
    bulletBullets.push(
      "Try making each bullet: action + task + measurable result."
    );
  }

  const structureBullets = [];
  if (missingSections.length > 0) {
    structureBullets.push(
      `Add or improve these sections: ${missingSections.join(", ")}.`
    );
  }
  if (!hasProjects) {
    structureBullets.push(
      "For technical roles, a Projects section usually helps a lot, especially if your work experience is limited."
    );
  }
  structureBullets.push(
    "Keep formatting clean and ATS-friendly by using clear headings, consistent dates, and simple layouts."
  );

  return [
    {
      id: "keywords",
      label: "Keyword Coverage",
      title: "Target the role more directly",
      priority: keywordMatch < 55 ? "high" : keywordMatch < 75 ? "medium" : "low",
      description:
        keywordMatch < 70
          ? "Your resume is not using enough of the language recruiters and ATS systems expect for this role."
          : "Your keyword alignment is decent, but it still has room to become more role-specific.",
      bullets: keywordBullets,
    },
    {
      id: "bullets",
      label: "Bullet Strength",
      title: "Make your experience sound stronger",
      priority: actionVerbRate < 60 || metricRate < 40 ? "high" : "medium",
      description:
        "Your bullet points should show clearer action, stronger impact, and more measurable results.",
      bullets: bulletBullets,
    },
    {
      id: "structure",
      label: "Structure & Sections",
      title: "Make the resume easier to trust",
      priority: missingSections.length > 1 ? "high" : "medium",
      description:
        "A stronger structure helps recruiters scan faster and makes your experience feel more complete.",
      bullets: structureBullets,
    },
  ];
}

function getSectionsFromProps(sections, analysis) {
  const directSections = normalizeIncomingSections(sections);
  if (directSections.length > 0) {
    return directSections;
  }

  const analysisSections = normalizeIncomingSections(
    analysis?.improvementSections
  );
  if (analysisSections.length > 0) {
    return analysisSections;
  }

  return buildFallbackSections(analysis);
}

function normalizePairs(pairs) {
  return safeArray(pairs).map((pair, index) => ({
    id: pair.id || `pair-${index}`,
    before: pair.before || "",
    after: pair.after || "",
  }));
}

export default function ImprovementSections({
  sections,
  analysis,
  title = "Top improvement areas",
  subtitle = "These are the biggest fixes that would improve your resume score fastest.",
}) {
  const finalSections = getSectionsFromProps(sections, analysis);
  const rewritePairs = normalizePairs(analysis?.beforeAfterPairs);

  return (
    <div style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <div style={styles.eyebrow}>resume fixes</div>
          <h2 style={styles.title}>{title}</h2>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>
      </div>

      <div style={styles.grid}>
        {finalSections.map((section, index) => {
          const accent = sectionAccent(section.label, index);
          const priority = priorityColors(section.priority);

          return (
            <div
              key={section.id}
              style={{
                ...styles.card,
                borderColor: accent.border,
                boxShadow: `0 0 0 1px ${accent.glow} inset`,
              }}
            >
              <div style={styles.cardTop}>
                <div
                  style={{
                    ...styles.labelChip,
                    background: accent.chip,
                    color: accent.chipText,
                    borderColor: accent.glow,
                  }}
                >
                  {section.label}
                </div>

                <div
                  style={{
                    ...styles.priorityChip,
                    background: priority.bg,
                    color: priority.text,
                    borderColor: priority.border,
                  }}
                >
                  {String(section.priority || "medium").toUpperCase()} PRIORITY
                </div>
              </div>

              <h3 style={styles.cardTitle}>{section.title}</h3>
              <p style={styles.cardDescription}>{section.description}</p>

              <div style={styles.divider} />

              <ul style={styles.list}>
                {safeArray(section.bullets).map((bullet, bulletIndex) => (
                  <li key={bulletIndex} style={styles.listItem}>
                    <span
                      style={{
                        ...styles.bulletDot,
                        background: accent.border,
                      }}
                    />
                    <span style={styles.listText}>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {rewritePairs.length > 0 ? (
        <div style={styles.rewriteWrapper}>
          <div style={styles.rewriteHeader}>
            <div style={styles.eyebrow}>reword suggestions</div>
            <h3 style={styles.rewriteTitle}>Better ways to phrase weak bullets</h3>
            <p style={styles.rewriteSubtitle}>
              These are example rewrites based on the wording currently in your resume.
            </p>
          </div>

          <div style={styles.rewriteGrid}>
            {rewritePairs.map((pair) => (
              <div key={pair.id} style={styles.rewriteCard}>
                <div style={styles.beforeLabel}>Before</div>
                <div style={styles.beforeText}>{pair.before}</div>

                <div style={styles.arrow}>→</div>

                <div style={styles.afterLabel}>Stronger version</div>
                <div style={styles.afterText}>{pair.after}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    marginTop: "28px",
    marginBottom: "28px",
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "18px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#f8fafc",
  },
  subtitle: {
    margin: "8px 0 0 0",
    fontSize: "15px",
    lineHeight: 1.6,
    color: "#94a3b8",
    maxWidth: "760px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  card: {
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,15,27,0.98) 100%)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "20px",
    padding: "18px",
    minHeight: "100%",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  labelChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "12px",
    fontWeight: 700,
  },
  priorityChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,0.08)",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    lineHeight: 1.25,
    fontWeight: 800,
    color: "#f8fafc",
  },
  cardDescription: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#cbd5e1",
  },
  divider: {
    height: "1px",
    background: "rgba(148,163,184,0.14)",
    margin: "16px 0",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "grid",
    gap: "12px",
  },
  listItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "10px",
  },
  bulletDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    marginTop: "8px",
    flexShrink: 0,
  },
  listText: {
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#e2e8f0",
  },
  rewriteWrapper: {
    marginTop: "22px",
  },
  rewriteHeader: {
    marginBottom: "14px",
  },
  rewriteTitle: {
    margin: 0,
    fontSize: "24px",
    lineHeight: 1.2,
    fontWeight: 800,
    color: "#f8fafc",
  },
  rewriteSubtitle: {
    margin: "8px 0 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#94a3b8",
  },
  rewriteGrid: {
    display: "grid",
    gap: "14px",
  },
  rewriteCard: {
    borderRadius: "18px",
    padding: "16px",
    border: "1px solid rgba(6,182,212,0.22)",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,15,27,0.98) 100%)",
    boxShadow: "0 0 0 1px rgba(6,182,212,0.12) inset",
  },
  beforeLabel: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  beforeText: {
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#fecaca",
  },
  arrow: {
    fontSize: "22px",
    lineHeight: 1,
    color: "#67e8f9",
    margin: "12px 0",
    fontWeight: 900,
  },
  afterLabel: {
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  afterText: {
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#cffafe",
    fontWeight: 600,
  },
};