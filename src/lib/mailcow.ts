/**
 * Mailcow email server integration
 * Docs: https://demo.mailcow.email/api/
 *
 * Required .env variables:
 *   MAILCOW_HOST      — e.g. https://mail.phidhosting.com
 *   MAILCOW_API_KEY   — Mailcow admin API key (Configuration » Access » API)
 *   MAILCOW_SANDBOX   — "true" to simulate provisioning locally, "false" for production
 */

export interface MailcowResult {
  success: boolean;
  sandbox?: boolean;
  error?: string;
  raw?: unknown;
}

export interface CreateMailboxParams {
  localPart: string;
  domain: string;
  displayName: string;
  password: string;
  quotaMB?: number;
}

function getConfig() {
  const host = process.env.MAILCOW_HOST?.replace(/\/$/, "");
  const apiKey = process.env.MAILCOW_API_KEY;
  const sandbox = process.env.MAILCOW_SANDBOX !== "false" || !host || !apiKey;
  return { host, apiKey, sandbox };
}

interface MailcowLogEntry {
  type?: string;
  msg?: string | string[];
}

async function mailcowCall(
  method: "GET" | "POST",
  path: string,
  body?: unknown
): Promise<{ ok: boolean; error?: string; raw?: unknown }> {
  const { host, apiKey } = getConfig();

  try {
    const res = await fetch(`${host}/api/v1/${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey!,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const data = (await res.json().catch(() => null)) as MailcowLogEntry[] | MailcowLogEntry | null;

    // Mailcow mutating endpoints return an array of log entries; any non-success is a failure.
    if (Array.isArray(data)) {
      const failed = data.find((e) => e.type === "danger" || e.type === "error");
      if (failed) {
        const msg = Array.isArray(failed.msg) ? failed.msg.join(", ") : failed.msg;
        return { ok: false, error: msg || "Mailcow API error", raw: data };
      }
      return res.ok ? { ok: true, raw: data } : { ok: false, error: `Mailcow HTTP ${res.status}`, raw: data };
    }

    return res.ok ? { ok: true, raw: data } : { ok: false, error: `Mailcow HTTP ${res.status}`, raw: data };
  } catch (err) {
    console.error(`[Mailcow] ${path} network error:`, err);
    return { ok: false, error: "Mailcow network error" };
  }
}

export async function addMailcowDomain(domain: string, description = ""): Promise<MailcowResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[Mailcow DEV] add domain=${domain}`);
    return { success: true, sandbox: true };
  }

  const result = await mailcowCall("POST", "add/domain", {
    domain,
    description,
    active: "1",
    restart_sogo: "1",
  });
  if (!result.ok) {
    console.error("[Mailcow] add/domain failed:", result.error);
    return { success: false, error: result.error, raw: result.raw };
  }
  return { success: true, raw: result.raw };
}

export async function deleteMailcowDomain(domain: string): Promise<MailcowResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[Mailcow DEV] delete domain=${domain}`);
    return { success: true, sandbox: true };
  }
  const result = await mailcowCall("POST", "delete/domain", [domain]);
  return result.ok
    ? { success: true, raw: result.raw }
    : { success: false, error: result.error, raw: result.raw };
}

export async function createMailbox(params: CreateMailboxParams): Promise<MailcowResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[Mailcow DEV] add mailbox=${params.localPart}@${params.domain}`);
    return { success: true, sandbox: true };
  }

  const result = await mailcowCall("POST", "add/mailbox", {
    local_part: params.localPart,
    domain: params.domain,
    name: params.displayName,
    quota: params.quotaMB ?? 1024,
    password: params.password,
    password2: params.password,
    active: "1",
    force_pw_update: "0",
    tls_enforce_in: "0",
    tls_enforce_out: "0",
  });
  if (!result.ok) {
    console.error("[Mailcow] add/mailbox failed:", result.error);
    return { success: false, error: result.error, raw: result.raw };
  }
  return { success: true, raw: result.raw };
}

export async function setMailboxActive(email: string, active: boolean): Promise<MailcowResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[Mailcow DEV] mailbox=${email} active=${active}`);
    return { success: true, sandbox: true };
  }
  const result = await mailcowCall("POST", "edit/mailbox", {
    items: [email],
    attr: { active: active ? "1" : "0" },
  });
  return result.ok
    ? { success: true, raw: result.raw }
    : { success: false, error: result.error, raw: result.raw };
}

export async function deleteMailbox(email: string): Promise<MailcowResult> {
  const { sandbox } = getConfig();
  if (sandbox) {
    console.info(`[Mailcow DEV] delete mailbox=${email}`);
    return { success: true, sandbox: true };
  }
  const result = await mailcowCall("POST", "delete/mailbox", [email]);
  return result.ok
    ? { success: true, raw: result.raw }
    : { success: false, error: result.error, raw: result.raw };
}
