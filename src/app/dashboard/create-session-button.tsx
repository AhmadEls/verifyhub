"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CreateSessionButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);

    const res = await fetch("/api/sessions", {
      method: "POST",
    });

    setLoading(false);

    if (!res.ok) {
      alert("Failed to create verification session");
      return;
    }

    const data = await res.json();

    router.push(data.url);
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
    >
      {loading ? "Creating..." : "+ New Verification"}
    </Button>
  );
}