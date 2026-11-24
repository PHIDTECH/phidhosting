"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, CheckCircle2 } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "", phone: "", companyName: "", city: "", country: "TZ",
  });
  const [passwords, setPasswords] = useState({
    current: "", next: "", confirm: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard/profile")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setProfile({
            name: d.user.name ?? "",
            phone: d.user.phone ?? "",
            companyName: d.user.profile?.companyName ?? "",
            city: d.user.profile?.city ?? "",
            country: d.user.profile?.country ?? "TZ",
          });
        }
      });
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileMsg(null);
    const res = await fetch("/api/dashboard/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const d = await res.json();
    setProfileMsg(res.ok ? { ok: true, text: "Profile updated." } : { ok: false, text: d.error });
    setProfileLoading(false);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.next !== passwords.confirm) {
      setPasswordMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    setPasswordLoading(true);
    setPasswordMsg(null);
    const res = await fetch("/api/dashboard/profile/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
    });
    const d = await res.json();
    setPasswordMsg(res.ok ? { ok: true, text: "Password changed." } : { ok: false, text: d.error });
    if (res.ok) setPasswords({ current: "", next: "", confirm: "" });
    setPasswordLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your account information.</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-brand-600" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {profileMsg && (
            <div className={`mb-4 rounded-lg p-3 text-sm flex items-center gap-2 ${profileMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {profileMsg.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {profileMsg.text}
            </div>
          )}
          <form onSubmit={saveProfile} className="space-y-4">
            <Input label="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Phone number" type="tel" placeholder="+255 XXX XXX XXX" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <Input label="Company name (optional)" value={profile.companyName} onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="City" value={profile.city} onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))} />
              <div>
                <label className="label">Country</label>
                <select className="input" value={profile.country} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))}>
                  <option value="TZ">Tanzania</option>
                  <option value="KE">Kenya</option>
                  <option value="UG">Uganda</option>
                  <option value="RW">Rwanda</option>
                  <option value="ET">Ethiopia</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
            <Button type="submit" loading={profileLoading}>Save Changes</Button>
          </form>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-4 w-4 text-brand-600" /> Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {passwordMsg && (
            <div className={`mb-4 rounded-lg p-3 text-sm flex items-center gap-2 ${passwordMsg.ok ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {passwordMsg.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
              {passwordMsg.text}
            </div>
          )}
          <form onSubmit={changePassword} className="space-y-4">
            <Input label="Current password" type="password" value={passwords.current} onChange={(e) => setPasswords((p) => ({ ...p, current: e.target.value }))} required />
            <Input label="New password" type="password" placeholder="Min. 8 chars, uppercase & number" value={passwords.next} onChange={(e) => setPasswords((p) => ({ ...p, next: e.target.value }))} required />
            <Input label="Confirm new password" type="password" value={passwords.confirm} onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))} required />
            <Button type="submit" loading={passwordLoading}>Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
