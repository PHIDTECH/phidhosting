import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Metadata } from "next";
import { SettingsForm } from "./SettingsForm";

export const metadata: Metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!["SUPER_ADMIN", "ADMIN"].includes(session.user.role)) {
    redirect("/admin");
  }

  const settings = await prisma.systemSetting.findMany({
    orderBy: [{ group: "asc" }, { key: "asc" }],
  });

  const groups = Array.from(new Set(settings.map(s => s.group)));

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">System Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          {settings.length} setting{settings.length !== 1 ? "s" : ""} across {groups.length} group{groups.length !== 1 ? "s" : ""}.
        </p>
      </div>

      {settings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-slate-400">
            <Settings className="h-10 w-10 mx-auto mb-3 opacity-25" />
            <p className="text-sm">No system settings found.</p>
            <p className="text-xs text-slate-400 mt-1">Run the seed script to populate default settings.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => {
            const groupSettings = settings.filter(s => s.group === group);
            return (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{group.replace(/_/g, " ")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <SettingsForm settings={groupSettings} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
