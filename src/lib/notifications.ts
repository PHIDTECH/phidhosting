/**
 * In-system notification helpers
 * Creates Notification records in the database for a user.
 */
import { prisma } from "@/lib/prisma";

export type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "ERROR"
  | "BILLING"
  | "DOMAIN"
  | "HOSTING"
  | "EMAIL"
  | "SECURITY";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({
    data: { userId, type, title, message, link },
  });
}

export async function notifyWelcome(userId: string) {
  return createNotification(
    userId,
    "INFO",
    "Welcome to PHIDHOSTING!",
    "Your account has been created. Start by registering a domain or choosing a hosting plan.",
    "/dashboard"
  );
}

export async function notifyPasswordResetRequested(userId: string) {
  return createNotification(
    userId,
    "SECURITY",
    "Password reset requested",
    "A password reset link was sent. If you did not request this, please contact support immediately.",
    "/dashboard/support/new"
  );
}

export async function notifyPasswordChanged(userId: string) {
  return createNotification(
    userId,
    "SECURITY",
    "Password changed successfully",
    "Your account password was updated. If this was not you, contact support immediately.",
    "/dashboard/support/new"
  );
}

export async function notifyInvoiceCreated(userId: string, invoiceNumber: string) {
  return createNotification(
    userId,
    "BILLING",
    `Invoice ${invoiceNumber} issued`,
    `A new invoice (${invoiceNumber}) has been issued for your account.`,
    "/dashboard/invoices"
  );
}

export async function notifyPaymentReceived(userId: string, invoiceNumber: string, amount: number, currency: string) {
  return createNotification(
    userId,
    "BILLING",
    "Payment received",
    `Payment of ${currency} ${amount.toFixed(2)} received for invoice ${invoiceNumber}.`,
    "/dashboard/invoices"
  );
}

export async function notifyDomainExpiring(userId: string, domain: string, daysLeft: number) {
  return createNotification(
    userId,
    "DOMAIN",
    `Domain expiring soon: ${domain}`,
    `Your domain ${domain} expires in ${daysLeft} days. Renew now to avoid interruption.`,
    "/dashboard/domains"
  );
}

export async function notifyServiceSuspended(userId: string, serviceName: string) {
  return createNotification(
    userId,
    "WARNING",
    `Service suspended: ${serviceName}`,
    `Your service ${serviceName} has been suspended due to non-payment. Please settle your invoice.`,
    "/dashboard/invoices"
  );
}
