import React from "react";

function safeNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

function percent(value) {
  return `${Math.round(safeNumber(value, 0))}%`;
}

function buildFallbackStats(analysis) {
  const bulletCount =
    analysis?.bulletCount ??
    analysis?.bulletStats?.totalBullets ??
    analysis?.totalBullets ??
    0;

  const metricRate =
    analysis?.metricRate ??
    analysis?.bulletStats?.metricRate ??
    analysis?.metricsPercentage ??
    0;

  const actionVerbRate =
    analysis?.actionVerbRate ??
    analysis?.bulletStats?.actionVerbRate ??
    analysis?.actionVerbPercentage ??
    0;

  const keywordMatch =
    analysis?.keywordMatchScore ??
    analysis?.keywordScore ??
    analysis?.atsKeywordScore ??
    0;

  const atsScore = analysis?.atsScore ?? 0;
  const recruiterScore = analysis?.recruiterScore ?? 0;

  const missingSectionsCount = Array.isArray(analysis?.missingSections)
    ? analysis.missingSections.length
    : 0;

  const missingConceptsCount = Array.isArray(analysis?.missingConcepts)
    ? analysis.missingConcepts.length
    : 0;

  const rewriteCount = Array.isArray(analysis?.beforeAfterPairs)
    ? analysis.beforeAfterPairs.length
    : 0;

  return [
    {
      label: "ATS Score",
      value: String(atsScore),
      help: "How well your resume is positioned for automated screening and keyword alignment.",
    },
    {
      label: "Recruiter Score",
      value: String(recruiterScore),
      help: "How strong your resume feels to a person scanning quickly for impact and credibility.",
    },
    {
      label: "Keyword Match",
      value: percent(keywordMatch),
      help: "How well your resume covers important role concept groups and role language.",
    },
    {
      label: "Action Verbs",
      value: percent(actionVerbRate),
      help: "How many bullets start with stronger action-oriented wording.",
    },
    {
      label: "Metrics Used",
      value: percent(metricRate),
      help: "How often your bullets include numbers, scale, or measurable impact.",
    },
    {
      label: "Bullet Count",
      value: String(bulletCount),
      help: "The number of bullets found across your experience and project sections.",
    },
    {
      label: "Missing Sections",
      value: String(missingSectionsCount),
      help: "Core sections the resume likely needs or should improve.",
    },
    {
      label: "Concept Gaps",
      value: String(missingConceptsCount),
      help: "Important role concept groups that are still weak or missing.",
    },
    {
      label: "Rewrite Ideas",
      value: String(rewriteCount),
      help: "Example stronger rewrites generated from weak or passive bullet language.",
    },
  ];
}

function normalizeStats(stats) {
  if (!Array.isArray(stats)) {
    return [];
  }

  return stats
    .filter(Boolean)
    .map((item, index) => ({
      id: item.id || `stat-${index}`,
      label: item.label || `Stat ${index + 1}`,
      value: item.value ?? "—",
      help: item.help || "",
    }));
}

function getStatAccent(label) {
  const lower = String(label || "").toLowerCase();

  if (lower.includes("ats")) {
    return {
      border: "rgba(245, 158, 11, 0.35)",
      glow: "rgba(245, 158, 11, 0.18)",
      value: "#fde68a",
    };
  }

  if (lower.includes("recruiter")) {
    return {
      border: "rgba(251, 113, 133, 0.35)",
      glow: "rgba(251, 113, 133, 0.18)",
      value: "#fecdd3",
    };
  }

  if (lower.includes("keyword") || lower.includes("concept")) {
    return {
      border: "rgba(139, 92, 246, 0.35)",
      glow: "rgba(139, 92, 246, 0.18)",
      value: "#ddd6fe",
    };
  }

  if (lower.includes("action") || lower.includes("rewrite")) {
    return {
      border: "rgba(6, 182, 212, 0.35)",
      glow: "rgba(6, 182, 212, 0.18)",
      value: "#a5f3fc",
    };
  }

  if (lower.includes("metric")) {
    return {
      border: "rgba(34, 197, 94, 0.35)",
      glow: "rgba(34, 197, 94, 0.18)",
      value: "#bbf7d0",
    };
  }

  return {
    border: "rgba(148, 163, 184, 0.24)",
    glow: "rgba(148, 163, 184, 0.12)",
    value: "#f8fafc",
  };
}

export default function StatsGrid({
  stats,
  analysis,
  title = "Resume breakdown",
  subtitle = "A few quick signals recruiters and ATS systems care about.",
}) {
  const finalStats = normalizeStats(stats).length
    ? normalizeStats(stats)
    : buildFallbackStats(analysis);

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.eyebrow}>quick stats</div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>

      <div style={styles.grid}>
        {finalStats.map((stat) => {
          const accent = getStatAccent(stat.label);

          return (
            <div
              key={stat.id}
              style={{
                ...styles.card,
                borderColor: accent.border,
                boxShadow: `0 0 0 1px ${accent.glow} inset`,
              }}
            >
              <div style={styles.label}>{stat.label}</div>
              <div style={{ ...styles.value, color: accent.value }}>
                {stat.value}
              </div>
              <p style={styles.help}>{stat.help}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    marginTop: "24px",
    marginBottom: "28px",
  },
  header: {
    marginBottom: "18px",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "26px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
  },
  card: {
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "20px",
    padding: "18px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(10,15,27,0.98) 100%)",
  },
  label: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "12px",
  },
  value: {
    fontSize: "34px",
    lineHeight: 1,
    fontWeight: 900,
    marginBottom: "12px",
  },
  help: {
    margin: 0,
    fontSize: "13px",
    lineHeight: 1.6,
    color: "#cbd5e1",
  },
};