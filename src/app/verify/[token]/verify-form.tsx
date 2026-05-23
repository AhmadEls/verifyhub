"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type UploadedFile = { url: string; key: string };
type DocSlot = "idFront" | "idBack" | "selfie";

const SLOT_LABELS: Record<DocSlot, string> = {
  idFront: "ID Front",
  idBack: "ID Back",
  selfie: "Selfie",
};

export function VerifyForm({ token }: { token: string }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");

  const [docs, setDocs] = useState<Record<DocSlot, UploadedFile | null>>({
    idFront: null,
    idBack: null,
    selfie: null,
  });
  const [uploadingSlot, setUploadingSlot] = useState<DocSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(slot: DocSlot, file: File | undefined) {
    if (!file) return;
    setError(null);
    setUploadingSlot(slot);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("sessionToken", token);

    try {
      const res = await fetch("/api/uploadthing/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }
      const data = (await res.json()) as UploadedFile;
      setDocs((d) => ({ ...d, [slot]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!docs.idFront || !docs.idBack || !docs.selfie) {
      setError("Please upload all three documents before submitting.");
      return;
    }

    setSubmitting(true);
    const res = await fetch(`/api/submit/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName,
        dateOfBirth,
        addressLine,
        city,
        country,
        documents: docs,
      }),
    });
    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Submission failed");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" required value={addressLine} onChange={(e) => setAddressLine(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" required value={country} onChange={(e) => setCountry(e.target.value)} placeholder="e.g. LB, US, FR" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Documents</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {(Object.keys(SLOT_LABELS) as DocSlot[]).map((slot) => (
            <div key={slot} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{SLOT_LABELS[slot]}</p>
                  <p className="text-xs text-slate-500">
                    {docs[slot] ? "✓ Uploaded" : "Image (PNG, JPG) up to 8MB"}
                  </p>
                </div>
                <Input
                  type="file"
                  accept="image/*"
                  disabled={uploadingSlot !== null}
                  className="w-auto"
                  onChange={(e) => handleFile(slot, e.target.files?.[0])}
                />
              </div>
              {uploadingSlot === slot && (
                <p className="text-xs text-slate-500 mt-2">Uploading...</p>
              )}
              {docs[slot] && (
                <img src={docs[slot]!.url} alt={SLOT_LABELS[slot]} className="mt-3 h-32 object-cover rounded border" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full" size="lg" disabled={submitting || uploadingSlot !== null}>
        {submitting ? "Submitting..." : "Submit Verification"}
      </Button>
    </form>
  );
}