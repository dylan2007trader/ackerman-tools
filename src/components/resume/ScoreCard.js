import React from "react";

function getScoreValue(score, analysis) {
  const raw =
    score ??
    analysis?.overallScore ??
    analysis?.score ??
    analysis?.resumeScore ??
    0;

  const numeric = Number(raw);

  if (Number.isNaN(numeric)) {
    return 0;
  }

  if (numeric < 0) return 0;
  if (numeric > 100) return 100;
  return Math.round(numeric);
}

function getScoreTone(score) {
  if (score >= 85) {
    return {
      label: "Strong",
      accent: "#22c55e",
      glow: "rgba(34, 197, 94, 0.18)",
      subtext:
        "This resume is in a strong spot, but it can still be sharpened.",
    };
  }

  if (score >= 70) {
    return {
      label: "Decent",
      accent: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.18)",
      subtext:
        "This resume has potential, but there are noticeable weaknesses holding it back.",
    };
  }

  if (score >= 55) {
    return {
      label: "Needs Work",
      accent: "#fb7185",
      glow: "rgba(251, 113, 133, 0.18)",
      subtext:
        "This resume needs stronger wording, better targeting, and cleaner structure.",
    };
  }

  return {
    label: "Weak",
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.18)",
    subtext:
      "This resume is likely to struggle in ATS screens and quick recruiter reviews.",
  };
}

export default function ScoreCard({
  score,
  analysis,
  title = "Overall resume score",
  caption = "A harsh score based on ATS keywords, structure, bullet quality, and impact.",
}) {
  const finalScore = getScoreValue(score, analysis);
  const tone = getScoreTone(finalScore);

  const atsScore = analysis?.atsScore ?? 0;
  const recruiterScore = analysis?.recruiterScore ?? 0;
  const drivers = Array.isArray(analysis?.scoreDrivers)
    ? analysis.scoreDrivers.slice(0, 3)
    : [];

  return (
    <div
      style={{
        ...styles.card,
        borderColor: tone.accent,
        boxShadow: `0 0 0 1px ${tone.glow} inset`,
      }}
    >
      <div style={styles.left}>
        <div style={styles.eyebrow}>resume grade</div>
        <h2 style={styles.title}>{title}</h2>
        <p style={styles.caption}>{caption}</p>

        <div
          style={{
            ...styles.badge,
            background: tone.glow,
            color: tone.accent,
            borderColor: tone.accent,
          }}
        >
          {tone.label}
        </div>

        <p style={styles.subtext}>{tone.subtext}</p>

        <div style={styles.subscores}>
          <div style={styles.subscoreCard}>
            <span style={styles.subscoreLabel}>ATS Score</span>
            <strong style={styles.subscoreValue}>{atsScore}</strong>
          </div>
          <div style={styles.subscoreCard}>
            <span style={styles.subscoreLabel}>Recruiter Score</span>
            <strong style={styles.subscoreValue}>{recruiterScore}</strong>
          </div>
        </div>

        {drivers.length > 0 ? (
          <div style={styles.driverList}>
            {drivers.map((driver, index) => (
              <div key={index} style={styles.driverItem}>
                {driver}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div style={styles.right}>
        <div
          style={{
            ...styles.scoreRing,
            borderColor: tone.accent,
            boxShadow: `0 0 30px ${tone.glow}`,
          }}
        >
          <div style={styles.scoreNumber}>{finalScore}</div>
          <div style={styles.scoreOutOf}>/100</div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1.4fr 0.9fr",
    gap: "24px",
    alignItems: "center",
    padding: "24px",
    borderRadius: "24px",
    border: "1px solid rgba(148,163,184,0.18)",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(10,15,27,0.99) 100%)",
    marginBottom: "24px",
  },
  left: {
    minWidth: 0,
  },
  right: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 800,
    color: "#f8fafc",
  },
  caption: {
    margin: "10px 0 14px 0",
    fontSize: "15px",
    lineHeight: 1.65,
    color: "#cbd5e1",
    maxWidth: "640px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  },
  subtext: {
    margin: "14px 0 0 0",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#94a3b8",
    maxWidth: "620px",
  },
  subscores: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "16px",
  },
  subscoreCard: {
    minWidth: "130px",
    borderRadius: "14px",
    padding: "12px 14px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.12)",
  },
  subscoreLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: "6px",
  },
  subscoreValue: {
    fontSize: "24px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#f8fafc",
  },
  driverList: {
    marginTop: "16px",
    display: "grid",
    gap: "8px",
  },
  driverItem: {
    fontSize: "13px",
    lineHeight: 1.55,
    color: "#cbd5e1",
    padding: "8px 10px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(148,163,184,0.1)",
  },
  scoreRing: {
    width: "180px",
    height: "180px",
    borderRadius: "999px",
    border: "8px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.02)",
  },
  scoreNumber: {
    fontSize: "56px",
    lineHeight: 1,
    fontWeight: 900,
    color: "#f8fafc",
  },
  scoreOutOf: {
    marginTop: "4px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#94a3b8",
  },
};