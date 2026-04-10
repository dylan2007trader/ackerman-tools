import React from "react";

/*
 * PremiumUpsell.js
 * Premium CTA for resume upgrade + cover letter generator
 * Supports either:
 * 1) paymentLink prop
 * 2) onUpgrade callback
 * 3) locked state text
 */

export default function PremiumUpsell({
  paymentLink,
  onUpgrade,
  isPremium = false,
  title = "Get the upgraded resume + tailored cover letter",
  subtitle = "Premium unlocks unlimited resume upgrades, stronger rewrites that keep your style, and targeted cover letters based on the job description.",
  priceText = "$9 one-time",
  buttonText = "Unlock Premium",
}) {
  if (isPremium) {
    return (
      <div style={styles.card}>
        <div style={styles.badge}>premium active</div>
        <h2 style={styles.title}>You already have Premium</h2>
        <p style={styles.subtitle}>
          Unlimited resume upgrades and tailored cover letters are unlocked on
          your account.
        </p>
      </div>
    );
  }

  function handleClick() {
    if (typeof onUpgrade === "function") {
      onUpgrade();
      return;
    }

    if (paymentLink) {
      window.open(paymentLink, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div style={styles.card}>
      <div style={styles.topRow}>
        <div style={styles.badge}>premium</div>
        <div style={styles.price}>{priceText}</div>
      </div>

      <h2 style={styles.title}>{title}</h2>
      <p style={styles.subtitle}>{subtitle}</p>

      <div style={styles.featureGrid}>
        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>Resume upgrade</div>
          <p style={styles.featureText}>
            Get a better version of your resume that keeps your voice but fixes
            weak wording, impact, and clarity.
          </p>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>Tailored cover letter</div>
          <p style={styles.featureText}>
            Paste a job description and generate a strong, focused cover letter
            tied to your resume and that role.
          </p>
        </div>

        <div style={styles.featureCard}>
          <div style={styles.featureTitle}>Unlimited use</div>
          <p style={styles.featureText}>
            Use it across sign-ins for as many resume rewrites and cover letters
            as you want.
          </p>
        </div>
      </div>

      <button type="button" onClick={handleClick} style={styles.button}>
        {buttonText}
      </button>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    marginTop: "28px",
    marginBottom: "28px",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(251, 191, 36, 0.35)",
    background:
      "linear-gradient(180deg, rgba(41, 26, 6, 0.98) 0%, rgba(19, 14, 7, 0.99) 100%)",
    boxShadow: "0 0 0 1px rgba(251, 191, 36, 0.12) inset",
  },
  topRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(251, 191, 36, 0.4)",
    background: "rgba(251, 191, 36, 0.12)",
    color: "#fde68a",
    fontSize: "12px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  price: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#f8fafc",
  },
  title: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.15,
    fontWeight: 900,
    color: "#fff7ed",
    maxWidth: "820px",
  },
  subtitle: {
    margin: "10px 0 20px 0",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#fde68a",
    maxWidth: "860px",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "14px",
    marginBottom: "20px",
  },
  featureCard: {
    borderRadius: "18px",
    padding: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(251, 191, 36, 0.16)",
  },
  featureTitle: {
    fontSize: "15px",
    fontWeight: 800,
    color: "#fff7ed",
    marginBottom: "8px",
  },
  featureText: {
    margin: 0,
    fontSize: "14px",
    lineHeight: 1.65,
    color: "#fde68a",
  },
  button: {
    border: "none",
    borderRadius: "14px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 800,
    cursor: "pointer",
    background: "linear-gradient(135deg, #f59e0b 0%, #facc15 100%)",
    color: "#1f2937",
  },
};