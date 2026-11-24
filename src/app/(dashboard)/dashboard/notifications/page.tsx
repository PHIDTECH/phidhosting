import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { Metadata } from "next";
import { MarkAllReadButton } from "./MarkAllReadButton";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-slate-900">
            Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
              : "All caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      <Card>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-25" />
              <p className="font-medium text-slate-600">No notifications yet</p>
              <p className="text-sm mt-1">
                Important updates about your services will appear here.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className={`flex gap-4 px-5 py-4 ${
                    !notif.isRead ? "bg-brand-50/40" : ""
                  }`}
                >
                  <div className="mt-1.5 shrink-0">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        notif.isRead ? "bg-slate-300" : "bg-brand-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">
                      {notif.title}
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {format(new Date(notif.createdAt), "dd MMM yyyy, HH:mm")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
