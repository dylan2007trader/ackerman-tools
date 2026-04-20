require("dotenv").config({ path: require("path").join(__dirname, ".env"), override: true });

const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const { Resend } = require("resend");
const {
  buildPremiumResume,
  buildStructuredCoverLetter,
  buildCoverLetterText,
} = require("./generator");
const { gradeResume } = require("./grader");

const GRADER_DAILY_LIMIT = 10;

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, "ackerman-tools.db");
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
const RESET_FROM_EMAIL =
  process.env.RESET_FROM_EMAIL || "onboarding@resend.dev";
const RESET_TOKEN_TTL_MINUTES = 60;

const APP_IDS = {
  RESUME_SUITE: "resume-suite",
};

const APP_PRICE_IDS = {
  [APP_IDS.RESUME_SUITE]: process.env.STRIPE_RESUME_SUITE_PRICE_ID || "",
};

let db;

async function initDb() {
  const dbDir = path.dirname(DATABASE_PATH);
  if (dbDir && dbDir !== ".") {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = await open({
    filename: DATABASE_PATH,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      app_id TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'stripe',
      checkout_session_id TEXT,
      payment_intent_id TEXT,
      status TEXT NOT NULL DEFAULT 'paid',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, app_id),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Add subscription_id column if it doesn't exist (idempotent migration)
  try {
    await db.exec(`ALTER TABLE purchases ADD COLUMN subscription_id TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Add email column to users (idempotent migration)
  try {
    await db.exec(`ALTER TABLE users ADD COLUMN email TEXT`);
  } catch (err) {
    // Column already exists, ignore
  }

  // Unique index on email (allows multiple NULL during transition, unique non-NULL)
  await db.exec(
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL`
  );

  // Backfill the original onlyfor user (id=1) with their Stripe email so they
  // can sign in with email after this change. One-time, no-op once set.
  try {
    await db.run(
      `UPDATE users SET email = ? WHERE id = 1 AND (email IS NULL OR email = '')`,
      "dackerm2007@gmail.com"
    );
  } catch (err) {
    console.error("Backfill onlyfor email failed (non-fatal):", err.message);
  }

  // Password reset tokens (sha256-hashed; raw token only ever exists in the email link)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Grader usage tracking — one row per call, used for daily rate limiting
  await db.exec(`
    CREATE TABLE IF NOT EXISTS grader_usage (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
    CREATE INDEX IF NOT EXISTS idx_grader_usage_user_created
      ON grader_usage(user_id, created_at);
  `);
}

function normalizeUsername(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeEmail(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email || null, username: user.username },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function sanitizeUser(user, purchasedApps = []) {
  return {
    id: user.id,
    username: user.username,
    email: user.email || null,
    purchasedApps,
    createdAt: user.created_at,
  };
}

function hashResetToken(rawToken) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

async function sendPasswordResetEmail({ toEmail, resetUrl }) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return { skipped: true };
  }
  return resend.emails.send({
    from: RESET_FROM_EMAIL,
    to: toEmail,
    subject: "Reset your Ackerman Tools password",
    html: `
      <div style="font-family: Inter, Arial, sans-serif; color: #0f172a; max-width: 480px;">
        <h2 style="margin-bottom: 12px;">Reset your password</h2>
        <p>Someone (hopefully you) requested a password reset for your Ackerman Tools account.</p>
        <p>Click the button below to set a new password. This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Reset password</a>
        </p>
        <p style="color:#64748b;font-size:13px;">If you didn't request this, you can safely ignore this email — your password won't change.</p>
        <p style="color:#94a3b8;font-size:12px;">Reset URL: <a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  });
}

async function getPurchasedApps(userId) {
  const rows = await db.all(
    `SELECT app_id FROM purchases WHERE user_id = ? AND status = 'paid' ORDER BY id ASC`,
    userId
  );
  return rows.map((row) => row.app_id);
}

async function getUserById(userId) {
  return db.get(`SELECT * FROM users WHERE id = ?`, userId);
}

async function getUserByUsername(username) {
  return db.get(`SELECT * FROM users WHERE username = ?`, username);
}

async function getUserByEmail(email) {
  return db.get(`SELECT * FROM users WHERE email = ?`, email);
}

async function buildAuthResponse(user) {
  const purchasedApps = await getPurchasedApps(user.id);
  return {
    token: signToken(user),
    user: sanitizeUser(user, purchasedApps),
  };
}

async function grantPurchase({
  userId,
  appId,
  checkoutSessionId = "",
  paymentIntentId = "",
  subscriptionId = "",
  provider = "stripe",
}) {
  await db.run(
    `
      INSERT INTO purchases (user_id, app_id, provider, checkout_session_id, payment_intent_id, subscription_id, status, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, 'paid', CURRENT_TIMESTAMP)
      ON CONFLICT(user_id, app_id)
      DO UPDATE SET
        provider = excluded.provider,
        checkout_session_id = CASE WHEN excluded.checkout_session_id != '' THEN excluded.checkout_session_id ELSE purchases.checkout_session_id END,
        payment_intent_id = CASE WHEN excluded.payment_intent_id != '' THEN excluded.payment_intent_id ELSE purchases.payment_intent_id END,
        subscription_id = CASE WHEN excluded.subscription_id != '' THEN excluded.subscription_id ELSE purchases.subscription_id END,
        status = 'paid',
        updated_at = CURRENT_TIMESTAMP
    `,
    userId,
    appId,
    provider,
    checkoutSessionId,
    paymentIntentId,
    subscriptionId
  );
}

async function revokePurchaseBySubscription(subscriptionId) {
  if (!subscriptionId) return;
  await db.run(
    `UPDATE purchases SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE subscription_id = ?`,
    subscriptionId
  );
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return res.status(401).json({ ok: false, message: "Missing auth token." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload;
    return next();
  } catch (error) {
    return res
      .status(401)
      .json({ ok: false, message: "Session expired. Please sign in again." });
  }
}

async function requirePurchase(req, res, next) {
  const appId = req.body?.appId || APP_IDS.RESUME_SUITE;
  const purchasedApps = await getPurchasedApps(req.auth.userId);
  if (!purchasedApps.includes(appId)) {
    return res
      .status(403)
      .json({ ok: false, message: "Premium is not active for this account." });
  }
  req.purchasedApps = purchasedApps;
  next();
}

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).send("Stripe webhook is not configured.");
    }

    const signature = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      return res.status(400).send(`Webhook error: ${error.message}`);
    }

    try {
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const userId = Number(session.metadata?.userId || 0);
        const appId = session.metadata?.appId || APP_IDS.RESUME_SUITE;
        const subscriptionId = String(session.subscription || "");

        if (userId && appId && session.payment_status === "paid") {
          await grantPurchase({
            userId,
            appId,
            checkoutSessionId: session.id || "",
            paymentIntentId: String(session.payment_intent || ""),
            subscriptionId,
            provider: "stripe",
          });
        }
      } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object;
        await revokePurchaseBySubscription(subscription.id);
      }

      return res.json({ received: true });
    } catch (error) {
      console.error("Webhook handler failed", error);
      return res
        .status(500)
        .json({ ok: false, message: "Webhook handler failed." });
    }
  }
);

const ALLOWED_ORIGINS = FRONTEND_ORIGIN.split(",")
  .map((value) => value.trim())
  .filter(Boolean);

// Allow vercel.app preview deploys of this project. Safer than "*" — only
// Vercel-issued subdomains of the configured project can connect.
const VERCEL_PREVIEW_RE = /^https:\/\/ackerman-tools[a-z0-9-]*\.vercel\.app$/i;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!ALLOWED_ORIGINS.length || ALLOWED_ORIGINS.includes("*")) {
        return callback(null, true);
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      // Accept branch/preview deploys from Vercel under this project.
      if (VERCEL_PREVIEW_RE.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Ackerman Tools API is running." });
});

app.post("/api/auth/signup", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "").trim();

    if (!isValidEmail(email)) {
      return res
        .status(400)
        .json({ ok: false, message: "Enter a valid email address." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Password must be at least 6 characters.",
        });
    }

    const existing = await getUserByEmail(email);
    if (existing) {
      return res
        .status(409)
        .json({ ok: false, message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // username column is NOT NULL UNIQUE — set it to email so old code paths still work
    const result = await db.run(
      `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`,
      email,
      email,
      passwordHash
    );
    const user = await getUserById(result.lastID);
    const auth = await buildAuthResponse(user);
    return res.json({ ok: true, message: "Account created.", ...auth });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not create account." });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || "").trim();
    const user = await getUserByEmail(email);

    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Email or password did not match." });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res
        .status(401)
        .json({ ok: false, message: "Email or password did not match." });
    }

    const auth = await buildAuthResponse(user);
    return res.json({ ok: true, message: "Signed in.", ...auth });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Could not sign in." });
  }
});

app.post("/api/auth/forgot-password", async (req, res) => {
  // Always return success — never leak whether an email is registered
  const genericResponse = {
    ok: true,
    message:
      "If an account exists for that email, a reset link is on its way.",
  };

  try {
    const email = normalizeEmail(req.body?.email);
    if (!isValidEmail(email)) return res.json(genericResponse);

    const user = await getUserByEmail(email);
    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(
      Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000
    ).toISOString();

    await db.run(
      `INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, ?)`,
      user.id,
      tokenHash,
      expiresAt
    );

    const frontendOrigin = (FRONTEND_ORIGIN.split(",")[0] || "").trim();
    const resetUrl = `${frontendOrigin}/reset-password?token=${rawToken}`;

    try {
      await sendPasswordResetEmail({ toEmail: email, resetUrl });
    } catch (sendErr) {
      console.error("Resend send failed:", sendErr.message || sendErr);
      // Still return generic success — don't leak failure either
    }

    return res.json(genericResponse);
  } catch (error) {
    console.error("forgot-password error:", error);
    return res.json(genericResponse);
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "").trim();

    if (!token) {
      return res
        .status(400)
        .json({ ok: false, message: "Reset link is missing or invalid." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Password must be at least 6 characters.",
        });
    }

    const tokenHash = hashResetToken(token);
    const row = await db.get(
      `SELECT * FROM password_resets WHERE token_hash = ?`,
      tokenHash
    );

    if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Reset link is expired or already used. Request a new one.",
        });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.run(
      `UPDATE users SET password_hash = ? WHERE id = ?`,
      passwordHash,
      row.user_id
    );
    await db.run(
      `UPDATE password_resets SET used_at = CURRENT_TIMESTAMP WHERE id = ?`,
      row.id
    );

    return res.json({
      ok: true,
      message: "Password updated. You can sign in now.",
    });
  } catch (error) {
    console.error("reset-password error:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not reset password." });
  }
});

app.get("/api/auth/me", requireAuth, async (req, res) => {
  try {
    const user = await getUserById(req.auth.userId);
    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }
    const purchasedApps = await getPurchasedApps(user.id);
    return res.json({ ok: true, user: sanitizeUser(user, purchasedApps) });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not load account." });
  }
});

app.get("/api/purchases", requireAuth, async (req, res) => {
  try {
    const purchasedApps = await getPurchasedApps(req.auth.userId);
    return res.json({ ok: true, purchasedApps });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not load purchases." });
  }
});

// Dev grant endpoint removed — premium requires Stripe payment only.

app.post("/api/checkout/create-session", requireAuth, async (req, res) => {
  try {
    const appId = req.body?.appId || APP_IDS.RESUME_SUITE;
    const returnUrl =
      req.body?.returnUrl || `${FRONTEND_ORIGIN}/resume-builder`;
    const user = await getUserById(req.auth.userId);

    if (!user) {
      return res.status(404).json({ ok: false, message: "User not found." });
    }

    const alreadyPurchased = await getPurchasedApps(user.id);
    if (alreadyPurchased.includes(appId)) {
      return res.json({
        ok: true,
        message: "Premium is already active for this account.",
        user: sanitizeUser(user, alreadyPurchased),
      });
    }

    const priceId = APP_PRICE_IDS[appId];
    if (!stripe || !priceId) {
      return res.status(503).json({
        ok: false,
        message: "Payments are not configured yet. Please try again later.",
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${returnUrl}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${returnUrl}?checkout=cancelled`,
      client_reference_id: String(user.id),
      metadata: {
        userId: String(user.id),
        username: user.username,
        appId,
      },
      subscription_data: { metadata: { userId: String(user.id), appId } },
    });

    return res.json({ ok: true, url: session.url });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not start checkout." });
  }
});

app.post("/api/checkout/confirm", requireAuth, async (req, res) => {
  try {
    const sessionId = String(req.body?.sessionId || "").trim();
    if (!sessionId) {
      return res
        .status(400)
        .json({ ok: false, message: "Missing checkout session id." });
    }

    if (!stripe) {
      const user = await getUserById(req.auth.userId);
      const purchasedApps = await getPurchasedApps(req.auth.userId);
      return res.json({
        ok: true,
        message: "Demo mode already handled premium locally on the server.",
        user: sanitizeUser(user, purchasedApps),
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const metadataUserId = Number(session.metadata?.userId || 0);
    const appId = session.metadata?.appId || APP_IDS.RESUME_SUITE;

    if (metadataUserId !== req.auth.userId) {
      return res
        .status(403)
        .json({
          ok: false,
          message: "This checkout session belongs to a different account.",
        });
    }

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ ok: false, message: "Payment is not complete yet." });
    }

    await grantPurchase({
      userId: req.auth.userId,
      appId,
      checkoutSessionId: session.id || "",
      paymentIntentId: String(session.payment_intent || ""),
      subscriptionId: String(session.subscription || ""),
      provider: "stripe",
    });

    const user = await getUserById(req.auth.userId);
    const purchasedApps = await getPurchasedApps(req.auth.userId);
    return res.json({
      ok: true,
      message: "Premium access confirmed.",
      user: sanitizeUser(user, purchasedApps),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not confirm checkout." });
  }
});

// Free AI-powered grader. Sign-in required + 10/day per account rate limit.
app.post("/api/grader/analyze", requireAuth, async (req, res) => {
  try {
    const resumeText = String(req.body?.resumeText || "").trim();
    const targetRole = String(req.body?.targetRole || "").trim();
    const targetType = String(req.body?.targetType || "job").trim();

    if (!resumeText) {
      return res
        .status(400)
        .json({ ok: false, message: "Paste a resume first." });
    }
    if (!targetRole) {
      return res
        .status(400)
        .json({ ok: false, message: "Pick a target role first." });
    }

    // Rate limit: count requests from this user in the last 24h
    const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const usageRow = await db.get(
      `SELECT COUNT(*) AS count FROM grader_usage WHERE user_id = ? AND created_at >= ?`,
      req.auth.userId,
      sinceIso
    );
    const usedToday = Number(usageRow?.count || 0);
    if (usedToday >= GRADER_DAILY_LIMIT) {
      return res.status(429).json({
        ok: false,
        message: `Daily limit reached (${GRADER_DAILY_LIMIT} grades per 24 hours). Try again tomorrow.`,
        limit: GRADER_DAILY_LIMIT,
        used: usedToday,
      });
    }

    const analysis = await gradeResume({ resumeText, targetRole, targetType });

    // Record usage AFTER successful grade so failures don't count against the limit
    await db.run(
      `INSERT INTO grader_usage (user_id) VALUES (?)`,
      req.auth.userId
    );

    return res.json({
      ok: true,
      analysis,
      usage: { limit: GRADER_DAILY_LIMIT, used: usedToday + 1 },
    });
  } catch (error) {
    console.error("Grader error:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not grade resume right now." });
  }
});

app.post(
  "/api/premium/resume",
  requireAuth,
  requirePurchase,
  async (req, res) => {
    try {
      const resumeText = String(req.body?.resumeText || "").trim();
      const targetRole = String(req.body?.targetRole || "").trim();

      if (!resumeText) {
        return res
          .status(400)
          .json({ ok: false, message: "Paste a resume first." });
      }

      const result = await buildPremiumResume({ resumeText, targetRole });
      return res.json({
        ok: true,
        premiumResume: result.premiumResume,
        analysis: result.analysis,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ ok: false, message: "Could not generate premium resume." });
    }
  }
);

app.post(
  "/api/premium/cover-letter",
  requireAuth,
  requirePurchase,
  async (req, res) => {
    try {
      const resumeText = String(req.body?.resumeText || "").trim();
      const targetRole = String(req.body?.targetRole || "").trim();
      const jobDescription = String(req.body?.jobDescription || "").trim();

      if (!resumeText) {
        return res
          .status(400)
          .json({ ok: false, message: "Paste a resume first." });
      }
      if (!jobDescription) {
        return res
          .status(400)
          .json({
            ok: false,
            message: "Paste a related job description first.",
          });
      }

      const letter = await buildStructuredCoverLetter({
        resumeText,
        targetRole,
        jobDescription,
      });
      return res.json({
        ok: true,
        letter,
        coverLetterText: buildCoverLetterText(letter),
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ ok: false, message: "Could not generate cover letter." });
    }
  }
);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Ackerman Tools API listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
