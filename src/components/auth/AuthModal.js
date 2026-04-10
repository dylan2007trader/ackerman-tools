import React, { useEffect, useState } from "react";
import { createAccount, loginUser } from "../../services/accountStore";

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  defaultMode = "login",
}) {
  const [mode, setMode] = useState(defaultMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
  setMode(defaultMode);
}, [defaultMode, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(event) {
  event.preventDefault();
  setIsLoading(true);
  setMessage("");

  try {
    const action = mode === "signup" ? createAccount : loginUser;
    const result = await action({ username, password });

    console.log("AUTH RESULT:", result);

    if (!result?.ok) {
      setMessage(result?.message || "Something went wrong.");
      setIsLoading(false);
      return;
    }

    setMessage(result.message || "Success.");
    setPassword("");

    try {
      if (onAuthSuccess) {
        onAuthSuccess(result.user || null);
      }
    } catch (callbackError) {
      console.error("onAuthSuccess error:", callbackError);
      setMessage(
        callbackError?.message || "Signed in, but UI refresh failed."
      );
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      onClose?.();
      setMessage("");
    }, 250);
  } catch (error) {
    console.error("AUTH MODAL ERROR:", error);
    setMessage(error?.message || "Could not complete that request.");
  } finally {
    setIsLoading(false);
  }
}

  function handleBackdropClick(event) {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  }

  return (
    <div style={styles.overlay} onClick={handleBackdropClick}>
      <div style={styles.modal}>
        <div style={styles.headerRow}>
          <div>
            <div style={styles.eyebrow}>ACKERMAN TOOLS ACCOUNT</div>
            <h2 style={styles.title}>
              {mode === "signup" ? "Create your account" : "Sign in"}
            </h2>
            <p style={styles.subtitle}>
              Use one account across Ackerman Tools so premium access follows
              you across future apps.
            </p>
          </div>

          <button type="button" onClick={onClose} style={styles.closeButton}>
            Close
          </button>
        </div>

        <div style={styles.tabRow}>
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            style={{
              ...styles.tabButton,
              ...(mode === "login" ? styles.tabButtonActive : {}),
            }}
          >
            Sign in
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            style={{
              ...styles.tabButton,
              ...(mode === "signup" ? styles.tabButtonActive : {}),
            }}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Username
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              style={styles.input}
              autoComplete="username"
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              style={styles.input}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </label>

          {message ? <div style={styles.message}>{message}</div> : null}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              ...styles.submitButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading
              ? mode === "signup"
                ? "Creating account..."
                : "Signing in..."
              : mode === "signup"
              ? "Create account"
              : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(2, 6, 23, 0.78)",
    backdropFilter: "blur(7px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 2000,
  },
  modal: {
    width: "100%",
    maxWidth: "560px",
    background:
      "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,1) 100%)",
    border: "1px solid rgba(148,163,184,0.18)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
    color: "#f8fafc",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "20px",
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
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.05,
    fontWeight: 900,
    letterSpacing: "-0.03em",
  },
  subtitle: {
    margin: "10px 0 0 0",
    fontSize: "14px",
    lineHeight: 1.7,
    color: "#cbd5e1",
    maxWidth: "420px",
  },
  closeButton: {
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "#f8fafc",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "18px",
  },
  tabButton: {
    border: "1px solid rgba(148,163,184,0.18)",
    background: "rgba(255,255,255,0.03)",
    color: "#cbd5e1",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)",
    color: "#ffffff",
    border: "none",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
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
};