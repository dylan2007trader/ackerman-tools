const USERS_KEY = "ackerman_tools_users";
const SESSION_KEY = "ackerman_tools_session";
const TOKEN_KEY = "ackerman_tools_token";
const USER_CACHE_KEY = "ackerman_tools_user";

export const APP_IDS = {
  RESUME_SUITE: "resume-suite",
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

function safeParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
}

function normalizeUsername(username = "") {
  return String(username || "")
    .trim()
    .toLowerCase();
}

function withoutPassword(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function readUsers() {
  if (typeof window === "undefined") return [];
  return safeParse(window.localStorage.getItem(USERS_KEY), []);
}

function writeUsers(users) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession() {
  if (typeof window === "undefined") return null;
  return safeParse(window.localStorage.getItem(SESSION_KEY), null);
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
  return safeParse(window.localStorage.getItem(USER_CACHE_KEY), null);
}

function writeUserCache(user) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(USER_CACHE_KEY);
    return;
  }
  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
}

function currentLocalUser() {
  const session = readSession();
  if (!session?.username) return null;
  const users = readUsers();
  const match = users.find((user) => user.username === session.username);
  return withoutPassword(match || null);
}

function updateStoredUser(updatedUser) {
  const users = readUsers();
  const nextUsers = users.map((user) =>
    user.username === updatedUser.username ? updatedUser : user
  );
  writeUsers(nextUsers);
  writeSession({ username: updatedUser.username });
  writeUserCache(withoutPassword(updatedUser));
}

function localCreateAccount({ username, password }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = String(password || "").trim();

  if (cleanUsername.length < 3) {
    return { ok: false, message: "Username must be at least 3 characters." };
  }

  if (cleanPassword.length < 4) {
    return { ok: false, message: "Password must be at least 4 characters." };
  }

  const users = readUsers();
  const existing = users.find((user) => user.username === cleanUsername);
  if (existing) {
    return { ok: false, message: "That username already exists." };
  }

  const newUser = {
    username: cleanUsername,
    password: cleanPassword,
    purchasedApps: [],
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);
  writeSession({ username: cleanUsername });
  writeUserCache(withoutPassword(newUser));

  return {
    ok: true,
    message:
      "Account created. Local fallback mode is active because the API is unavailable.",
    user: withoutPassword(newUser),
  };
}

function localLoginUser({ username, password }) {
  const cleanUsername = normalizeUsername(username);
  const cleanPassword = String(password || "").trim();
  const users = readUsers();
  const match = users.find(
    (user) => user.username === cleanUsername && user.password === cleanPassword
  );

  if (!match) {
    return { ok: false, message: "Username or password did not match." };
  }

  writeSession({ username: match.username });
  writeUserCache(withoutPassword(match));

  return {
    ok: true,
    message:
      "Signed in. Local fallback mode is active because the API is unavailable.",
    user: withoutPassword(match),
  };
}

function localGrantPurchasedApp(appId) {
  const session = readSession();
  if (!session?.username) {
    return { ok: false, message: "Create an account or sign in first." };
  }

  const users = readUsers();
  const match = users.find((user) => user.username === session.username);
  if (!match) {
    return { ok: false, message: "Could not find the signed-in user." };
  }

  if (!(match.purchasedApps || []).includes(appId)) {
    match.purchasedApps = [...(match.purchasedApps || []), appId];
    updateStoredUser(match);
  } else {
    writeUserCache(withoutPassword(match));
  }

  return {
    ok: true,
    message: "Premium access unlocked for this signed-in account.",
    user: withoutPassword(match),
  };
}

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
  const timeout = window.setTimeout(() => controller.abort(), 8000);

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (error) {
    window.clearTimeout(timeout);
    throw error;
  }

  window.clearTimeout(timeout);

  let data = {};
  try {
    data = await response.json();
  } catch (error) {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      writeToken("");
      writeUserCache(null);
      writeSession(null);
    }

    return {
      ok: false,
      message: data.message || "Request failed.",
    };
  }

  if (data.token) writeToken(data.token);
  if (data.user) writeUserCache(data.user);

  return {
    ok: true,
    ...data,
  };
}

export function getCurrentUser() {
  return readUserCache() || currentLocalUser();
}

export function getPurchasedApps() {
  return getCurrentUser()?.purchasedApps || [];
}

export function hasPurchasedApp(appId) {
  return getPurchasedApps().includes(appId);
}

export async function refreshCurrentUser() {
  try {
    if (!readToken()) {
      return { ok: false, message: "Not signed in." };
    }
    return await request("/api/auth/me", { auth: true });
  } catch (error) {
    const user = currentLocalUser();
    return user
      ? { ok: true, user, message: "Using local fallback mode." }
      : { ok: false, message: "Not signed in." };
  }
}

export async function createAccount({ username, password }) {
  try {
    const result = await request("/api/auth/signup", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    return result;
  } catch (error) {
    return localCreateAccount({ username, password });
  }
}

export async function loginUser({ username, password }) {
  try {
    const result = await request("/api/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    });
    return result;
  } catch (error) {
    return localLoginUser({ username, password });
  }
}

export function logoutUser() {
  writeToken("");
  writeSession(null);
  writeUserCache(null);
}

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

export async function startCheckout(appId, returnUrl) {
  try {
    return await request("/api/checkout/create-session", {
      method: "POST",
      body: { appId, returnUrl },
      auth: true,
    });
  } catch (error) {
    return { ok: false, message: "Checkout API unavailable." };
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
    return { ok: false, message: "Checkout confirm API unavailable." };
  }
}

export async function generatePremiumResume({ resumeText, targetRole, appId }) {
  try {
    return await request("/api/premium/resume", {
      method: "POST",
      body: { resumeText, targetRole, appId },
      auth: true,
    });
  } catch (error) {
    return { ok: false, message: "Premium resume API unavailable." };
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
    return { ok: false, message: "Premium cover letter API unavailable." };
  }
}
