import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Activity, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { RetryJobButton } from "./RetryJobButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Provisioning" };

function sBadge(s: string) {
  const m: Record<string, string> = { PENDING: "badge-blue", PROCESSING: "badge-orange", COMPLETED: "badge-green", FAILED: "badge-red", CANCELLED: "badge-gray" };
  return m[s] ?? "badge-gray";
}

export default async function AdminProvisioningPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { status, type } = await searchParams;

  const jobs = await prisma.provisioningJob.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(type ? { type } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      order: { select: { orderNumber: true, userId: true } },
      hostingAccount: { select: { domain: true } },
      emailService: { select: { domain: true } },
      logs: { orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  const summary = await prisma.provisioningJob.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const counts = Object.fromEntries(summary.map(s => [s.status, s._count.status]));

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Provisioning Jobs</h1>
        <p className="text-sm text-slate-500 mt-0.5">Infrastructure provisioning queue and history.</p>
      </div>

      {/* Status summary */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Pending", status: "PENDING", color: "border-blue-200 bg-blue-50 text-blue-700" },
          { label: "Processing", status: "PROCESSING", color: "border-orange-200 bg-orange-50 text-orange-700" },
          { label: "Completed", status: "COMPLETED", color: "border-green-200 bg-green-50 text-green-700" },
          { label: "Failed", status: "FAILED", color: "border-red-200 bg-red-50 text-red-700" },
        ].map(({ label, status: s, color }) => (
          <Link key={s} href={`/admin/provisioning?status=${s}`} className={`px-3 py-1.5 rounded-full border text-sm font-medium ${color} ${status === s ? "ring-2 ring-offset-1 ring-current" : ""}`}>
            {label} ({counts[s] ?? 0})
          </Link>
        ))}
        {status && <Link href="/admin/provisioning" className="px-3 py-1.5 rounded-full border border-slate-200 bg-white text-sm text-slate-500">Clear filter ×</Link>}
      </div>

      <Card>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Activity className="h-10 w-10 mx-auto mb-3 opacity-25" />
              <p className="text-sm">No jobs found.</p>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Service</th>
                    <th>Attempts</th>
                    <th>Last Attempt</th>
                    <th>Created</th>
                    <th>Error</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td>
                        <p className="font-medium text-xs">{job.type.replace(/_/g, " ")}</p>
                      </td>
                      <td className="text-xs">
                        {job.hostingAccount?.domain ?? job.emailService?.domain ?? job.order?.orderNumber ?? "—"}
                      </td>
                      <td className="text-center">{job.attempts}/{job.maxAttempts}</td>
                      <td className="text-xs">{job.lastAttemptAt ? format(new Date(job.lastAttemptAt), "dd MMM HH:mm") : "—"}</td>
                      <td className="text-xs">{format(new Date(job.createdAt), "dd MMM HH:mm")}</td>
                      <td className="text-xs text-red-600 max-w-[200px] truncate">
                        {job.errorMessage ?? "—"}
                      </td>
                      <td><span className={sBadge(job.status)}>{job.status}</span></td>
                      <td>
                        {job.status === "FAILED" && job.attempts < job.maxAttempts && (
                          <RetryJobButton jobId={job.id} />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
