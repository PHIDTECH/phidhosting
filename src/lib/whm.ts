/**
 * WHM/cPanel provisioning integration
 * Docs: https://api.docs.cpanel.net/whm/introduction/
 *
 * Required .env variables:
 *   WHM_HOST        — e.g. https://your-server-ip:2087
 *   WHM_USERNAME    — usually "root" or a reseller user
 *   WHM_API_TOKEN   — WHM API token (WHM » Development » Manage API Tokens)
 *   WHM_SANDBOX     — "true" to simulate provisioning locally, "false" for production
 */

export interface WhmResult {
  success: boolean;
  sandbox?: boolean;
  username?: string;
  loginUrl?: string;
  error?: string;
  raw?: unknown;
}

export interface WhmCreateAccountParams {
  domain: string;
  username: string;
  password: string;
  contactEmail: string;
  packageName?: string;
  quotaMB?: number;
  bandwidthMB?: number;
}

function getConfig() {
  const host = process.env.WHM_HOST?.replace(/\/$/, "");
  const username = process.env.WHM_USERNAME;
  const token = process.env.WHM_API_TOKEN;
  const sandbox = process.env.WHM_SANDBOX !== "false" || !host || !username || !token;
  return { host, username, token, sandbox };
}

async function whmCall<T = Record<string, unknown>>(
  func: string,
  params: Record<string, string | number> = {}
): Promise<{ ok: boolean; data?: T; reason?: string; raw?: unknown }> {
  const { host, username, token } = getConfig();

  const query = new URLSearchParams({ "api.version": "1" });
  for (const [k, v] of Object.entries(params)) query.set(k, String(v));

  try {
    const res = await fetch(`${host}/json-api/${func}?${query}`, {
      headers: { Authorization: `whm ${username}:${token}` },
    });

    const data = (await res.json()) as {
      metadata?: { result?: number; reason?: string };
      data?: T;
    };

    const ok = res.ok && data.metadata?.result === 1;
    if (!ok) {
      return { ok: false, reason: data.metadata?.reason || `WHM HTTP ${res.status}`, raw: data };
    }
    return { ok: true, data: data.data, raw: data };
  } catch (err) {
    console.error(`[WHM] ${func} network error:`, err);
    return { ok: false, reason: "WHM network error" };
  }
}

export async function createWhmAccount(params: WhmCreateAccountParams): Promise<WhmResult> {
  const { sandbox } = getConfig();

  if (sandbox) {
    console.info(`[WHM DEV] createacct user=${params.username} domain=${params.domain}`);
    return { success: true, sandbox: true, username: params.username };
  }

  const result = await whmCall("createacct", {
    username: params.username,
    domain: params.domain,
    password: params.password,
    contactemail: params.contactEmail,
    ...(params.packageName ? { plan: params.packageName } : {}),
    ...(params.quotaMB ? { quota: params.quotaMB } : {}),
    ...(params.bandwidthMB ? { bwlimit: params.bandwidthMB } : {}),
  });

  if (!result.ok) {
    console.error("[WHM] createacct failed:", result.reason);
    return { success: false, error: result.reason, raw: result.raw };
  }
  return { success: true, username: params.username, raw: result.raw };
}

export async function suspendWhmAccount(username: string, reason = ""): Promise<WhmResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[WHM DEV] suspendacct user=${username}`);
    return { success: true, sandbox: true, username };
  }
  const result = await whmCall("suspendacct", { user: username, reason });
  return result.ok
    ? { success: true, username, raw: result.raw }
    : { success: false, error: result.reason, raw: result.raw };
}

export async function unsuspendWhmAccount(username: string): Promise<WhmResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[WHM DEV] unsuspendacct user=${username}`);
    return { success: true, sandbox: true, username };
  }
  const result = await whmCall("unsuspendacct", { user: username });
  return result.ok
    ? { success: true, username, raw: result.raw }
    : { success: false, error: result.reason, raw: result.raw };
}

export async function terminateWhmAccount(username: string): Promise<WhmResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[WHM DEV] removeacct user=${username}`);
    return { success: true, sandbox: true, username };
  }
  const result = await whmCall("removeacct", { user: username });
  return result.ok
    ? { success: true, username, raw: result.raw }
    : { success: false, error: result.reason, raw: result.raw };
}

export async function changeWhmPassword(username: string, password: string): Promise<WhmResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[WHM DEV] passwd user=${username}`);
    return { success: true, sandbox: true, username };
  }
  const result = await whmCall("passwd", { user: username, password });
  return result.ok
    ? { success: true, username, raw: result.raw }
    : { success: false, error: result.reason, raw: result.raw };
}

/**
 * Create a one-time cPanel login session (SSO into cPanel without password).
 */
export async function createWhmSession(username: string): Promise<WhmResult> {
  const { sandbox, host } = getConfig();
  if (sandbox) {
    console.info(`[WHM DEV] create_user_session user=${username}`);
    return { success: true, sandbox: true, username, loginUrl: `${host || ""}/cpsess_sandbox` };
  }
  const result = await whmCall<{ url?: string }>("create_user_session", {
    user: username,
    service: "cpaneld",
  });
  if (!result.ok) {
    return { success: false, error: result.reason, raw: result.raw };
  }
  return { success: true, username, loginUrl: result.data?.url, raw: result.raw };
}
