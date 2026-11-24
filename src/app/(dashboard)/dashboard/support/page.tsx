import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Ticket, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Support" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    OPEN: "badge-blue",
    IN_PROGRESS: "badge-orange",
    AWAITING_CUSTOMER: "badge-orange",
    RESOLVED: "badge-green",
    CLOSED: "badge-gray",
  };
  return map[status] ?? "badge-gray";
}

function priorityBadge(priority: string) {
  const map: Record<string, string> = {
    LOW: "badge-gray",
    MEDIUM: "badge-blue",
    HIGH: "badge-orange",
    URGENT: "badge-red",
  };
  return map[priority] ?? "badge-gray";
}

export default async function SupportPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tickets = await prisma.supportTicket.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      replies: { select: { id: true } },
    },
  });

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Support
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track and manage your support requests.
          </p>
        </div>
        <Link href="/dashboard/support/new">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {tickets.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Ticket className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No support tickets yet</p>
              <p className="text-sm mt-1 mb-6">
                Need help? Open a ticket and our team will assist you.
              </p>
              <Link href="/dashboard/support/new">
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                  Open a Ticket
                </Button>
              </Link>
            </div>
          ) : (
            <div className="table-container border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket #</th>
                    <th>Subject</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Replies</th>
                    <th>Created</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="font-medium text-slate-900 font-mono text-xs">
                        #{ticket.ticketNumber}
                      </td>
                      <td className="font-medium text-slate-900 max-w-xs truncate">
                        {ticket.subject}
                      </td>
                      <td className="text-slate-500">{ticket.category}</td>
                      <td>
                        <span className={priorityBadge(ticket.priority)}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td>{ticket.replies.length}</td>
                      <td>
                        {format(new Date(ticket.createdAt), "dd MMM yyyy")}
                      </td>
                      <td>
                        <span className={statusBadge(ticket.status)}>
                          {ticket.status.replace("_", " ")}
                        </span>
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
