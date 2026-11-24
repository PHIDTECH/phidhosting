/**
 * Beem Africa SMS utility
 * Docs: https://apisms.beem.africa/
 * Set BEEM_API_KEY and BEEM_SECRET_KEY in your .env
 */

export interface SmsResult {
  success: boolean;
  error?: string;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return "255" + cleaned.slice(1);
  }
  if (cleaned.startsWith("255") && cleaned.length === 12) {
    return cleaned;
  }
  if (cleaned.startsWith("7") && cleaned.length === 9) {
    return "255" + cleaned;
  }
  return cleaned;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const apiKey = process.env.BEEM_API_KEY;
  const secretKey = process.env.BEEM_SECRET_KEY;
  const senderName = (process.env.BEEM_SENDER_NAME || "PHIDHOST").slice(0, 11);

  if (!apiKey || !secretKey) {
    console.warn("[SMS] BEEM_API_KEY / BEEM_SECRET_KEY not set — skipping send");
    console.info(`[SMS DEV] To: ${to} | Message: ${message}`);
    return { success: false, error: "SMS credentials not configured" };
  }

  const dest = normalizePhone(to);

  const payload = {
    source_addr: senderName,
    encoding: "0",
    schedule_time: "",
    message,
    recipients: [{ recipient_id: "1", dest_addr: dest }],
  };

  try {
    const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
    const res = await fetch("https://apisms.beem.africa/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as { code?: number; message?: string };
    if (!res.ok || (data.code !== undefined && data.code !== 100)) {
      console.error("[SMS] Beem Africa error:", data);
      return { success: false, error: data.message || "SMS send failed" };
    }

    return { success: true };
  } catch (err) {
    console.error("[SMS] Network error:", err);
    return { success: false, error: "SMS network error" };
  }
}

export async function sendBulkSms(
  recipients: { phone: string; recipientId?: string }[],
  message: string
): Promise<SmsResult> {
  const apiKey = process.env.BEEM_API_KEY;
  const secretKey = process.env.BEEM_SECRET_KEY;
  const senderName = (process.env.BEEM_SENDER_NAME || "PHIDHOST").slice(0, 11);

  if (!apiKey || !secretKey) {
    console.warn("[SMS] BEEM_API_KEY / BEEM_SECRET_KEY not set — skipping bulk send");
    return { success: false, error: "SMS credentials not configured" };
  }

  const payload = {
    source_addr: senderName,
    encoding: "0",
    schedule_time: "",
    message,
    recipients: recipients.map((r, i) => ({
      recipient_id: r.recipientId || String(i + 1),
      dest_addr: normalizePhone(r.phone),
    })),
  };

  try {
    const credentials = Buffer.from(`${apiKey}:${secretKey}`).toString("base64");
    const res = await fetch("https://apisms.beem.africa/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json() as { code?: number; message?: string };
    if (!res.ok) {
      return { success: false, error: data.message || "Bulk SMS failed" };
    }
    return { success: true };
  } catch (err) {
    console.error("[SMS] Bulk send error:", err);
    return { success: false, error: "SMS network error" };
  }
}
