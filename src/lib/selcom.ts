/**
 * Selcom Payment Gateway integration
 * Docs: https://docs.selcom.net/
 *
 * Required .env variables:
 *   SELCOM_API_KEY       — your Selcom API key
 *   SELCOM_API_SECRET    — your Selcom API secret
 *   SELCOM_VENDOR_ID     — your Selcom vendor ID
 *   SELCOM_SANDBOX       — "true" for sandbox, "false" for production
 */
import crypto from "crypto";

const BASE_URL = process.env.SELCOM_SANDBOX === "false"
  ? "https://apigw.selcom.net/c2b/v1"
  : "https://apigw.selcom.net/c2b/v1";

export interface SelcomOrderParams {
  amount: number;
  currency: string;
  merchantTransactionId: string;
  buyerPhone: string;
  buyerName: string;
  buyerEmail: string;
  invoiceId: string;
  cancelUrl: string;
  redirectUrl: string;
  webhookUrl: string;
  noOfItems?: number;
}

export interface SelcomOrderResult {
  success: boolean;
  reference?: string;
  paymentGatewayUrl?: string;
  error?: string;
  raw?: unknown;
}

function buildSignature(apiSecret: string, timestamp: string, nonce: string, body: Record<string, unknown>): string {
  const sortedKeys = Object.keys(body).sort();
  const paramStr = sortedKeys.map((k) => `${k}=${body[k]}`).join("&");
  const signingStr = `${timestamp}${nonce}${paramStr}`;
  return crypto.createHmac("sha256", apiSecret).update(signingStr).digest("base64");
}

function getHeaders(apiKey: string, apiSecret: string, body: Record<string, unknown>) {
  const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  const nonce = crypto.randomBytes(12).toString("hex");
  const signature = buildSignature(apiSecret, timestamp, nonce, body);

  return {
    "Content-Type": "application/json;charset=UTF-8",
    "Authorization": `SELCOM ${apiKey}`,
    "Digest-Method": "HS256",
    "Digest": signature,
    "Timestamp": timestamp,
    "Cache-Control": "no-cache",
  };
}

export async function createSelcomOrder(params: SelcomOrderParams): Promise<SelcomOrderResult> {
  const apiKey = process.env.SELCOM_API_KEY;
  const apiSecret = process.env.SELCOM_API_SECRET;
  const vendorId = process.env.SELCOM_VENDOR_ID;

  if (!apiKey || !apiSecret || !vendorId) {
    console.warn("[Selcom] SELCOM_API_KEY / SELCOM_API_SECRET / SELCOM_VENDOR_ID not set");
    return { success: false, error: "Payment gateway not configured. Please contact support." };
  }

  const body: Record<string, unknown> = {
    vendor: vendorId,
    order_id: params.merchantTransactionId,
    buyer_email: params.buyerEmail,
    buyer_name: params.buyerName,
    buyer_phone: params.buyerPhone.replace(/^0/, "255").replace(/^\+/, ""),
    amount: Math.round(params.amount),
    currency: params.currency,
    redirect_url: params.redirectUrl,
    cancel_url: params.cancelUrl,
    webhook: params.webhookUrl,
    billing_ref: params.invoiceId,
    no_of_items: params.noOfItems ?? 1,
  };

  try {
    const headers = getHeaders(apiKey, apiSecret, body);
    const res = await fetch(`${BASE_URL}/checkout/create-order-minimal-ext`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json() as {
      resultcode?: string;
      result?: string;
      message?: string;
      data?: { payment_gateway_url?: string; reference?: string };
    };

    if (data.resultcode === "000" || data.result === "SUCCESS") {
      return {
        success: true,
        reference: data.data?.reference,
        paymentGatewayUrl: data.data?.payment_gateway_url,
      };
    }

    console.error("[Selcom] Order creation failed:", data);
    return { success: false, error: data.message || "Payment order creation failed.", raw: data };
  } catch (err) {
    console.error("[Selcom] Network error:", err);
    return { success: false, error: "Payment gateway network error." };
  }
}

export async function querySelcomOrder(orderId: string): Promise<{ success: boolean; status?: string; error?: string }> {
  const apiKey = process.env.SELCOM_API_KEY;
  const apiSecret = process.env.SELCOM_API_SECRET;
  const vendorId = process.env.SELCOM_VENDOR_ID;

  if (!apiKey || !apiSecret || !vendorId) {
    return { success: false, error: "Payment gateway not configured." };
  }

  const body = { vendor: vendorId, order_id: orderId };

  try {
    const headers = getHeaders(apiKey, apiSecret, body);
    const res = await fetch(`${BASE_URL}/checkout/order-status`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json() as { resultcode?: string; data?: { payment_status?: string } };
    if (data.resultcode === "000") {
      return { success: true, status: data.data?.payment_status };
    }
    return { success: false, error: "Query failed." };
  } catch {
    return { success: false, error: "Network error." };
  }
}
