"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCheck } from "lucide-react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    await fetch("/api/notifications/read-all", { method: "POST" });
    router.refresh();
    setLoading(false);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} loading={loading}>
      <CheckCheck className="h-4 w-4" />
      Mark all read
    </Button>
  );
}
