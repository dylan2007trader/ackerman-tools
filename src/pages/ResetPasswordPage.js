import React, { useEffect, useState } from "react";
import { resetPassword } from "../services/accountStore";

export default function ResetPasswordPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Reset link is missing or invalid.");
      return;
    }
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setMessage("Passwords don't match.");
      return;
    }

    setIsLoading(true);
    const result = await resetPassword({ token, password });
    setIsLoading(false);

    if (!result?.ok) {
      setMessage(result?.message || "Could not reset password.");
      return;
    }

    setSuccess(true);
    setMessage(result.message || "Password updated. You can sign in now.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.eyebrow}>ACKERMAN TOOLS</div>
        <h1 style={styles.title}>Reset password</h1>

        {success ? (
          <>
            <p style={styles.subtitle}>{message}</p>
            <a href="/" style={styles.linkButton}>
              Go back to home
            </a>
          </>
        ) : (
          <>
            <p style={styles.subtitle}>
              Enter a new password for your account. The link is valid for 60
              minutes.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>
                New password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  style={styles.input}
                  autoComplete="new-password"
                  required
                />
              </label>

              <label style={styles.label}>
                Confirm new password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Type it again"
                  style={styles.input}
                  autoComplete="new-password"
                  required
                />
              </label>

              {message ? <div style={styles.message}>{message}</div> : null}

              <button
                type="submit"
                disabled={isLoading || !token}
                style={{
                  ...styles.submitButton,
                  opacity: isLoading || !token ? 0.7 : 1,
                  cursor: isLoading || !token ? "not-allowed" : "pointer",
                }}
              >
                {isLoading ? "Updating..." : "Set new password"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0f1c",
    color: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "480px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,1) 100%)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "32px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
  },
  eyebrow: {
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#94a3b8",
    marginBottom: "8px",
  },
  title: {
    margin: "0 0 12px 0",
    fontSize: "30px",
    lineHeight: 1.1,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "0 0 20px 0",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#cbd5e1",
  },
  form: {
    display: "grid",
    gap: "14px",
  },
  label: {
    display: "grid",
    gap: "8px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#e2e8f0",
  },
  input: {
    width: "100%",
    height: "48px",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(2,6,23,0.72)",
    color: "#f8fafc",
    padding: "0 14px",
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  },
  message: {
    padding: "12px 14px",
    borderRadius: "14px",
    background: "rgba(59,130,246,0.10)",
    border: "1px solid rgba(59,130,246,0.22)",
    color: "#bfdbfe",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  submitButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 18px",
    fontSize: "15px",
    fontWeight: 800,
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    color: "#ffffff",
    boxShadow: "0 10px 24px rgba(37,99,235,0.24)",
  },
  linkButton: {
    display: "inline-block",
    marginTop: "16px",
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    color: "#fff",
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "12px",
    fontWeight: 700,
    fontSize: "14px",
  },
};
