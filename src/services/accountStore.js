const USERS_KEY = "ackerman_tools_users";
const SESSION_KEY = "ackerman_tools_session";
const TOKEN_KEY = "ackerman_tools_token";
const USER_CACHE_KEY = "ackerman_tools_user";

export const APP_IDS = {
  RESUME_SUITE: "resume-suite",
  // add future apps here
  // TRIP_PLANNER: "trip-planner",
  // STOCK_APP: "stock-app",
};

export const APP_META = {
  [APP_IDS.RESUME_SUITE]: {
    id: APP_IDS.RESUME_SUITE,
    title: "Resume Upgrade + Cover Letter Generator",
    shortTitle: "Resume + Cover Letter",
    priceLabel: "$9 one-time unlimited",
  },
};

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  ""
).replace(/\/$/, "");

/*
 * -----------------------------
 * Basic helpers
 * -----------------------------
 */

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}


function normalizeUsername(username = "") {
  return String(username || "").trim().toLowerCase();
}

function normalizePassword(password = "") {
  return String(password || "").trim();
}

function withoutPassword(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function nowIso() {
  return new Date().toISOString();
}

function buildUser(username, password) {
  return {
    username,
    password,
    purchasedApps: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
}

/*
 * -----------------------------
 * Local storage read / write
 * -----------------------------
 */

function readUsers() {
  if (typeof window === "undefined") return [];
  const parsed = safeParse(window.localStorage.getItem(USERS_KEY), []);
  return Array.isArray(parsed) ? parsed : [];
}

function writeUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(Array.isArray(users) ? users : []));
}

function readSession() {
  if (typeof window === "undefined") return null;
  const parsed = safeParse(window.localStorage.getItem(SESSION_KEY), null);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function writeSession(session) {
  if (typeof window === "undefined") return;

  if (!session) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function readToken() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(TOKEN_KEY) || "";
}

function writeToken(token) {
  if (typeof window === "undefined") return;

  if (!token) {
    window.localStorage.removeItem(TOKEN_KEY);
    return;
  }

  window.localStorage.setItem(TOKEN_KEY, token);
}

function readUserCache() {
  if (typeof window === "undefined") return null;
  const parsed = safeParse(window.localStorage.getItem(USER_CACHE_KEY), null);
  return parsed && typeof parsed === "object" ? parsed : null;
}

function writeUserCache(user) {
  if (typeof window === "undefined") return;

  if (!user) {
    window.localStorage.removeItem(USER_CACHE_KEY);
    return;
  }

  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

/*
 * -----------------------------
 * Local user helpers
 * -----------------------------
 */

function findUserByUsername(username) {
  const cleanUsername = normalizeUsername(username);
  const users = readUsers();
  return users.find((user) => user.username === cleanUsername) || null;
}

function currentLocalUser() {
  const session = readSession();
  if (!session?.username) return null;

  const match = findUserByUsername(session.username);
  return withoutPassword(match);
}

function replaceStoredUser(updatedUser) {
  const users = readUsers();
  const nextUsers = users.map((user) =>
    user.username === updatedUser.username ? updatedUser : user
  );

  writeUsers(nextUsers);
  writeSession({ username: updatedUser.username });
  writeUserCache(withoutPassword(updatedUser));
}

function createStoredUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
  writeSession({ username: user.username });
  writeUserCache(withoutPassword(user));
}

function ensurePurchasedAppsArray(user) {
  return {
    ...user,
    purchasedApps: Array.isArray(user.purchasedApps) ? user.purchasedApps : [],
  };
}

/*
 * -----------------------------
 * Local fallback auth
 * -----------------------------
 */

function localCreateAccount({ username, password }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = normalizePassword(password);

  if (cleanUsername.length < 3) {
    return {
      ok: false,
      message: "Username must be at least 3 characters.",
    };
  }

  if (cleanPassword.length < 4) {
    return {
      ok: false,
      message: "Password must be at least 4 characters.",
    };
  }

  const existing = findUserByUsername(cleanUsername);
  if (existing) {
    return {
      ok: false,
      message: "That username already exists.",
    };
  }

  const newUser = buildUser(cleanUsername, cleanPassword);
  createStoredUser(newUser);

  return {
    ok: true,
    message: "Account created.",
    user: withoutPassword(newUser),
  };
}

function localLoginUser({ username, password }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = normalizePassword(password);

  const match = findUserByUsername(cleanUsername);

  if (!match || match.password !== cleanPassword) {
    return {
      ok: false,
      message: "Username or password did not match.",
    };
  }

  writeSession({ username: match.username });
  writeUserCache(withoutPassword(match));

  return {
    ok: true,
    message: "Signed in.",
    user: withoutPassword(match),
  };
}

function localGrantPurchasedApp(appId) {
  const session = readSession();

  if (!session?.username) {
    return {
      ok: false,
      message: "Create an account or sign in first.",
    };
  }

  const match = findUserByUsername(session.username);

  if (!match) {
    return {
      ok: false,
      message: "Could not find the signed-in user.",
    };
  }

  const safeUser = ensurePurchasedAppsArray(match);

  if (!safeUser.purchasedApps.includes(appId)) {
    safeUser.purchasedApps = [...safeUser.purchasedApps, appId];
    safeUser.updatedAt = nowIso();
    replaceStoredUser(safeUser);
  } else {
    writeUserCache(withoutPassword(safeUser));
  }

  return {
    ok: true,
    message: `${appId} unlocked for this signed-in account.`,
    user: withoutPassword(safeUser),
  };
}

function localRemovePurchasedApp(appId) {
  const session = readSession();

  if (!session?.username) {
    return {
      ok: false,
      message: "No signed-in user found.",
    };
  }

  const match = findUserByUsername(session.username);

  if (!match) {
    return {
      ok: false,
      message: "Could not find the signed-in user.",
    };
  }

  const safeUser = ensurePurchasedAppsArray(match);

  safeUser.purchasedApps = safeUser.purchasedApps.filter((id) => id !== appId);
  safeUser.updatedAt = nowIso();

  replaceStoredUser(safeUser);

  return {
    ok: true,
    message: `${appId} removed from this signed-in account.`,
    user: withoutPassword(safeUser),
  };
}

/*
 * -----------------------------
 * API request helper
 * -----------------------------
 */

async function request(path, { method = "GET", body, auth = true } = {}) {
  if (!API_BASE) {
    throw new Error("API base URL missing.");
  }

  const headers = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = readToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), 60000); // 60s — Claude API can take 15-20s

  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    window.clearTimeout(timeoutId);
  }

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      writeToken("");
      writeSession(null);
      writeUserCache(null);
    }

    return {
      ok: false,
      message: data.message || "Request failed.",
    };
  }

  if (data.token) {
    writeToken(data.token);
  }

  if (data.user) {
    writeUserCache(data.user);
    if (data.user.username) {
      writeSession({ username: data.user.username });
    }
  }

  return {
    ok: true,
    ...data,
  };
}

/*
 * -----------------------------
 * Public account methods
 * -----------------------------
 */

export function getCurrentUser() {
  return readUserCache() || currentLocalUser();
}

export function isSignedIn() {
  return Boolean(getCurrentUser());
}

export function getPurchasedApps(username) {
  if (username) {
    const user = findUserByUsername(username);
    return user?.purchasedApps || [];
  }

  return getCurrentUser()?.purchasedApps || [];
}

export function hasPurchasedApp(appId, username) {
  return getPurchasedApps(username).includes(appId);
}

export function getAppMeta(appId) {
  return APP_META[appId] || null;
}

export function getAllAppMeta() {
  return Object.values(APP_META);
}

export async function refreshCurrentUser() {
  try {
    if (!readToken()) {
      const localUser = currentLocalUser();
      return localUser
        ? { ok: true, user: localUser, message: "Using local account." }
        : { ok: false, message: "Not signed in." };
    }

    return await request("/api/auth/me", { auth: true });
  } catch (error) {
    const localUser = currentLocalUser();

    return localUser
      ? { ok: true, user: localUser, message: "Using local fallback mode." }
      : { ok: false, message: "Not signed in." };
  }
}

export async function createAccount({ email, password }) {
  try {
    const result = await request("/api/auth/signup", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    return result;
  } catch (error) {
    return localCreateAccount({ username: email, password });
  }
}

export async function loginUser({ email, password }) {
  try {
    const result = await request("/api/auth/login", {
      method: "POST",
      body: { email, password },
      auth: false,
    });

    return result;
  } catch (error) {
    return localLoginUser({ username: email, password });
  }
}

export async function forgotPassword({ email }) {
  try {
    return await request("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Could not reach the server. Try again in a moment.",
    };
  }
}

export async function resetPassword({ token, password }) {
  try {
    return await request("/api/auth/reset-password", {
      method: "POST",
      body: { token, password },
      auth: false,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Could not reach the server. Try again in a moment.",
    };
  }
}

export function logoutUser() {
  writeToken("");
  writeSession(null);
  writeUserCache(null);
}

/*
 * -----------------------------
 * Purchase helpers
 * -----------------------------
 * Use grantPurchasedApp during testing.
 * Later, Stripe/backend should call the same ownership update.
 */

export async function grantPurchasedApp(appId) {
  try {
    const response = await request("/api/dev/grant-app", {
      method: "POST",
      body: { appId },
      auth: true,
    });

    if (response.ok) return response;

    return localGrantPurchasedApp(appId);
  } catch (error) {
    return localGrantPurchasedApp(appId);
  }
}

export async function purchaseAppForCurrentUser(appId) {
  return grantPurchasedApp(appId);
}

export async function removePurchasedApp(appId) {
  try {
    const response = await request("/api/dev/remove-app", {
      method: "POST",
      body: { appId },
      auth: true,
    });

    if (response.ok) return response;

    return localRemovePurchasedApp(appId);
  } catch (error) {
    return localRemovePurchasedApp(appId);
  }
}

/*
 * -----------------------------
 * Checkout / Stripe hooks
 * -----------------------------
 * Keep these for later when you connect real checkout.
 */

export async function startCheckout(appId, returnUrl) {
  try {
    return await request("/api/checkout/create-session", {
      method: "POST",
      body: { appId, returnUrl },
      auth: true,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Checkout API unavailable.",
    };
  }
}

export async function confirmCheckout(sessionId) {
  try {
    return await request("/api/checkout/confirm", {
      method: "POST",
      body: { sessionId },
      auth: true,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Checkout confirm API unavailable.",
    };
  }
}

/*
 * -----------------------------
 * Premium generation hooks
 * -----------------------------
 * These are optional API hooks if you later move
 * premium generation to the backend.
 */

export async function generatePremiumResume({ resumeText, targetRole, appId }) {
  try {
    return await request("/api/premium/resume", {
      method: "POST",
      body: { resumeText, targetRole, appId },
      auth: true,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Premium resume API unavailable.",
    };
  }
}

export async function generatePremiumCoverLetter({
  resumeText,
  targetRole,
  jobDescription,
  appId,
}) {
  try {
    return await request("/api/premium/cover-letter", {
      method: "POST",
      body: { resumeText, targetRole, jobDescription, appId },
      auth: true,
    });
  } catch (error) {
    return {
      ok: false,
      message: "Premium cover letter API unavailable.",
    };
  }
}

/*
 * -----------------------------
 * Debug / convenience helpers
 * -----------------------------
 */

export function getAllLocalUsers() {
  return readUsers().map((user) => withoutPassword(user));
}

export function clearAllLocalAccountData() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(USERS_KEY);
  window.localStorage.removeItem(SESSION_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_CACHE_KEY);
}

export function seedTestUser() {
  const existing = findUserByUsername("testuser");

  if (existing) {
    writeSession({ username: existing.username });
    writeUserCache(withoutPassword(existing));
    return {
      ok: true,
      message: "Test user already existed and is now signed in.",
      user: withoutPassword(existing),
    };
  }

  return localCreateAccount({
    username: "testuser",
    password: "test1234",
  });
}