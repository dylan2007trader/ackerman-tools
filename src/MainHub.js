import React, { useMemo, useState } from "react";
import "./mainhub.css";
import { BRAND_LOGO } from "./brandLogo";
import {
  APP_IDS,
  APP_META,
  createAccount,
  getCurrentUser,
  getPurchasedApps,
  loginUser,
  logoutUser,
} from "./accountStore";

const tools = [
  {
    week: "Week 1",
    title: "Resume Upgrade + Cover Letter Generator",
    badge: "Live Now",
    description:
      "Try the free resume grader first. Then unlock unlimited upgraded resumes and unlimited tailored cover letters after one payment.",
    href: "/resume-builder#grader",
    primary: "Open the live app",
    featured: true,
  },
  {
    week: "Week 2",
    title: "LinkedIn Optimizer",
    badge: "Coming Soon",
    description:
      "Tighten headline, summary, and profile wording so recruiters understand the value faster.",
  },
  {
    week: "Week 3",
    title: "Project Pitch Helper",
    badge: "Coming Soon",
    description:
      "Turn raw project notes into cleaner, stronger explanations for resumes, interviews, and portfolios.",
  },
  {
    week: "Week 4",
    title: "Technical Portfolio Reviewer",
    badge: "Coming Soon",
    description:
      "See what a recruiter or hiring manager notices first across projects, writing, and positioning.",
  },
];

export default function MainHub() {
  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [loading, setLoading] = useState(false);

  const purchasedApps = useMemo(() => getPurchasedApps(), [currentUser]);

  const handleAuth = async () => {
    setLoading(true);
    const action = authMode === "signup" ? createAccount : loginUser;
    const result = await action({ username, password });
    setMessage(result.message);
    if (result.ok) {
      setCurrentUser(getCurrentUser());
      setPassword("");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setMessage("Signed out.");
  };

  return (
    <div className="hub-page">
      <header className="hub-header">
        <nav className="hub-nav">
          <a className="hub-brand-wrap" href="/">
            <img
              className="hub-logo"
              src={BRAND_LOGO}
              alt="Ackerman Tools logo"
            />
            <div>
              <div className="hub-brand">Ackerman Tools</div>
              <div className="hub-subbrand">
                Clean tools for clearer technical applications
              </div>
            </div>
          </a>

          <div className="hub-nav-links">
            <a href="#live-app">Live App</a>
            <a href="#tools">Roadmap</a>
            <a href="#account">Account</a>
          </div>
        </nav>

        <section className="hub-hero">
          <div className="hub-hero-copy">
            <div className="hub-kicker">ACKERMANTOOLS.COM</div>
            <h1>Get an upgraded resume and tailored cover letters now.</h1>
            <p className="hub-hero-text">
              Start with the free resume grader. Then unlock unlimited upgraded
              resumes and unlimited tailored cover letters with one payment
              attached to one account.
            </p>

            <div className="hub-hero-actions">
              <a
                className="hub-btn hub-btn-primary hub-btn-big"
                href="/resume-builder#grader"
              >
                Try the free resume grader
              </a>
              <a className="hub-btn hub-btn-secondary" href="#account">
                Create account or sign in
              </a>
            </div>

            <div className="hub-proof-row">
              <div className="hub-proof-card">
                <div className="hub-proof-number">Free</div>
                <div className="hub-proof-label">Resume grader first</div>
              </div>
              <div className="hub-proof-card hub-proof-card-strong">
                <div className="hub-proof-number">$9</div>
                <div className="hub-proof-label">
                  One-time unlimited premium access
                </div>
              </div>
              <div className="hub-proof-card">
                <div className="hub-proof-number">1</div>
                <div className="hub-proof-label">
                  Account keeps access attached
                </div>
              </div>
            </div>
          </div>

          <div className="hub-feature-panel" id="live-app">
            <div className="hub-feature-label">LIVE APP</div>
            <h2>{APP_META[APP_IDS.RESUME_SUITE].title}</h2>
            <p>
              This is the first product on the hub. It is one reusable stronger
              resume plus unlimited tailored cover letters from related jobs
              after purchase.
            </p>

            <div className="hub-feature-list">
              <div className="hub-feature-pill">Free resume grader</div>
              <div className="hub-feature-pill">Unlimited premium resumes</div>
              <div className="hub-feature-pill">Unlimited cover letters</div>
            </div>

            <a
              className="hub-btn hub-btn-primary hub-btn-full"
              href="/resume-builder#grader"
            >
              Open the resume + cover letter app
            </a>
          </div>
        </section>
      </header>

      <main className="hub-main">
        <section className="hub-section hub-section-emphasis">
          <div className="hub-section-top">
            <div className="hub-kicker">WHAT PEOPLE SHOULD UNDERSTAND FAST</div>
            <h2>Straight to the point messaging</h2>
          </div>

          <div className="hub-value-grid">
            <div className="hub-value-card">
              <h3>1. Try the free grader first</h3>
              <p>
                Users see what is helping or hurting their current resume before
                paying for anything.
              </p>
            </div>
            <div className="hub-value-card">
              <h3>2. Upgrade once</h3>
              <p>
                Premium is a one-time unlock that gives the same signed-in user
                unlimited upgraded resumes.
              </p>
            </div>
            <div className="hub-value-card">
              <h3>3. Tailor fast</h3>
              <p>
                After purchase, the same user can generate unlimited cover
                letters from related job descriptions.
              </p>
            </div>
          </div>
        </section>

        <section className="hub-section" id="account">
          <div className="hub-section-top">
            <div className="hub-kicker">ACCOUNT AND ACCESS</div>
            <h2>Keep premium tied to the right person</h2>
            <p>
              The hub tracks the signed-in user and what they bought, so the
              first live app clearly shows up as a purchased product when
              premium is active.
            </p>
          </div>

          <div className="hub-account-grid">
            <div className="hub-account-card">
              <div className="hub-account-label">CURRENT STATUS</div>
              {currentUser ? (
                <>
                  <h3>Signed in as {currentUser.username}</h3>
                  <p>
                    Purchased apps:{" "}
                    {purchasedApps.length
                      ? purchasedApps.join(", ")
                      : "none yet"}
                  </p>
                  <button
                    className="hub-btn hub-btn-secondary"
                    type="button"
                    onClick={handleLogout}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <h3>Create account or sign in</h3>
                  <p>
                    Use one account so premium stays attached to the same user
                    later.
                  </p>
                </>
              )}
            </div>

            {!currentUser ? (
              <div className="hub-auth-card">
                <div className="hub-auth-tabs">
                  <button
                    className={
                      authMode === "login"
                        ? "hub-auth-tab hub-auth-tab-active"
                        : "hub-auth-tab"
                    }
                    type="button"
                    onClick={() => setAuthMode("login")}
                  >
                    Sign in
                  </button>
                  <button
                    className={
                      authMode === "signup"
                        ? "hub-auth-tab hub-auth-tab-active"
                        : "hub-auth-tab"
                    }
                    type="button"
                    onClick={() => setAuthMode("signup")}
                  >
                    Create account
                  </button>
                </div>

                <input
                  className="hub-input"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="username"
                />
                <input
                  className="hub-input"
                  value={password}
                  type="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="password"
                />
                <button
                  className="hub-btn hub-btn-primary"
                  type="button"
                  onClick={handleAuth}
                >
                  {loading
                    ? "Working..."
                    : authMode === "signup"
                    ? "Create account"
                    : "Sign in"}
                </button>
              </div>
            ) : null}
          </div>

          {message ? <div className="hub-message">{message}</div> : null}
        </section>

        <section className="hub-section" id="tools">
          <div className="hub-section-top">
            <div className="hub-kicker">WEEKLY BUILD TRACKER</div>
            <h2>One new practical app every week</h2>
            <p>
              The hub starts with the live resume and cover letter product, then
              expands into adjacent tools that help technical candidates market
              themselves more clearly.
            </p>
          </div>

          <div className="hub-tools-grid">
            {tools.map((tool) => (
              <article
                key={tool.title}
                className={
                  tool.featured
                    ? "hub-tool-card hub-tool-card-featured"
                    : "hub-tool-card"
                }
              >
                <div className="hub-tool-top">
                  <span className="hub-week">{tool.week}</span>
                  <span
                    className={
                      tool.badge === "Live Now"
                        ? "hub-badge hub-badge-live"
                        : "hub-badge hub-badge-soon"
                    }
                  >
                    {tool.badge}
                  </span>
                </div>

                <h3>{tool.title}</h3>
                <p>{tool.description}</p>

                {tool.href ? (
                  <a className="hub-btn hub-btn-primary" href={tool.href}>
                    {tool.primary}
                  </a>
                ) : (
                  <button className="hub-btn hub-btn-disabled" type="button">
                    Coming soon
                  </button>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
