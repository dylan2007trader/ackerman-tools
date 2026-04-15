require("dotenv").config();

const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Stripe = require("stripe");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const {
  buildPremiumResume,
  buildStructuredCoverLetter,
  buildCoverLetterText,
} = require("./generator");

const app = express();
const PORT = Number(process.env.PORT || 4000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-env";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "";
const DATABASE_PATH =
  process.env.DATABASE_PATH || path.join(__dirname, "ackerman-tools.db");
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

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
}

function normalizeUsername(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function signToken(user) {
  return jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

function sanitizeUser(user, purchasedApps = []) {
  return {
    id: user.id,
    username: user.username,
    purchasedApps,
    createdAt: user.created_at,
  };
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

        if (userId && appId && session.payment_status === "paid") {
          await grantPurchase({
            userId,
            appId,
            checkoutSessionId: session.id || "",
            paymentIntentId: String(session.payment_intent || ""),
            subscriptionId: String(session.subscription || ""),
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
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password || "").trim();

    if (username.length < 3) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Username must be at least 3 characters.",
        });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({
          ok: false,
          message: "Password must be at least 6 characters.",
        });
    }

    const existing = await getUserByUsername(username);
    if (existing) {
      return res
        .status(409)
        .json({ ok: false, message: "That username already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      `INSERT INTO users (username, password_hash) VALUES (?, ?)`,
      username,
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
    const username = normalizeUsername(req.body?.username);
    const password = String(req.body?.password || "").trim();
    const user = await getUserByUsername(username);

    if (!user) {
      return res
        .status(401)
        .json({ ok: false, message: "Username or password did not match." });
    }

    const matches = await bcrypt.compare(password, user.password_hash);
    if (!matches) {
      return res
        .status(401)
        .json({ ok: false, message: "Username or password did not match." });
    }

    const auth = await buildAuthResponse(user);
    return res.json({ ok: true, message: "Signed in.", ...auth });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Could not sign in." });
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

app.post("/api/dev/grant-app", requireAuth, async (req, res) => {
  try {
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ALLOW_DEV_GRANT !== "true"
    ) {
      return res
        .status(403)
        .json({ ok: false, message: "Dev grant is disabled in production." });
    }

    const appId = req.body?.appId || APP_IDS.RESUME_SUITE;
    await grantPurchase({ userId: req.auth.userId, appId, provider: "demo" });
    const user = await getUserById(req.auth.userId);
    const purchasedApps = await getPurchasedApps(req.auth.userId);
    return res.json({
      ok: true,
      message: "Premium access granted in demo mode.",
      user: sanitizeUser(user, purchasedApps),
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ ok: false, message: "Could not grant premium in demo mode." });
  }
});

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
      await grantPurchase({ userId: user.id, appId, provider: "demo" });
      const purchasedApps = await getPurchasedApps(user.id);
      return res.json({
        ok: true,
        demoGranted: true,
        message: "Demo premium granted because Stripe is not configured yet.",
        user: sanitizeUser(user, purchasedApps),
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

      const result = buildPremiumResume({ resumeText, targetRole });
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

      const letter = buildStructuredCoverLetter({
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
