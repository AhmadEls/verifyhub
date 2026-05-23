"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CreateSessionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const res = await fetch("/api/sessions", { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <Button onClick={handleClick} disabled={loading}>
      {loading ? "Creating..." : "+ New Session"}
    </Button>
  );
}