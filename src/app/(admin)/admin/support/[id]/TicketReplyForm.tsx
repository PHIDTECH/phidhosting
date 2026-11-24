"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUSES = ["OPEN","IN_PROGRESS","AWAITING_CUSTOMER","RESOLVED","CLOSED"];

export function TicketReplyForm({
  ticketId,
  currentStatus,
}: {
  ticketId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isNote, setIsNote] = useState(false);
  const [newStatus, setNewStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/support/${ticketId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, isStaffNote: isNote, newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to send reply");
        return;
      }
      setMessage("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Send className="h-4 w-4" /> Reply
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isNote}
                onChange={e => setIsNote(e.target.checked)}
                className="rounded"
              />
              <Shield className="h-3.5 w-3.5 text-yellow-600" />
              Internal staff note (not visible to customer)
            </label>
            <div className="flex items-center gap-2 text-sm text-slate-600 ml-auto">
              <span>Set status:</span>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value)}
                className="input py-1 h-8 text-xs w-44"
              >
                {STATUSES.map(s => (
                  <option key={s} value={s}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder={isNote ? "Write an internal note..." : "Type your reply to the customer..."}
            className={`input w-full ${isNote ? "bg-yellow-50 border-yellow-200" : ""}`}
          />

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? "Sending…" : isNote ? "Save Note" : "Send Reply"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
