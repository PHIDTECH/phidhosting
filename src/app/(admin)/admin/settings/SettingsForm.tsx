"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Setting = {
  id: string;
  key: string;
  value: string;
  type: string;
  label: string | null;
  description: string | null;
  isPublic: boolean;
};

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(settings.map(s => [s.key, s.value]))
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: values }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {settings.map((s) => (
        <div key={s.key} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          <div className="sm:text-right">
            <label className="text-sm font-medium text-slate-700">{s.label ?? s.key}</label>
            {s.description && <p className="text-xs text-slate-400 mt-0.5">{s.description}</p>}
            {s.isPublic && <span className="text-xs text-green-600">Public</span>}
          </div>
          <div className="sm:col-span-2">
            {s.type === "boolean" ? (
              <select
                value={values[s.key]}
                onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                className="input w-32"
              >
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            ) : s.type === "text" ? (
              <textarea
                value={values[s.key]}
                onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                rows={3}
                className="input w-full font-mono text-xs"
              />
            ) : (
              <input
                type="text"
                value={values[s.key]}
                onChange={e => setValues(v => ({ ...v, [s.key]: e.target.value }))}
                className="input w-full"
              />
            )}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving…" : "Save Changes"}
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ Saved</span>}
      </div>
    </form>
  );
}
