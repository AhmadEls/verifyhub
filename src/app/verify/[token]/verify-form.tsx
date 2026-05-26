"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Upload,
  User,
  Globe,
  MapPin,
  Calendar,
  FileText,
  Camera,
  BadgeCheck,
  Lock,
  AlertTriangle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

type UploadedFile = {
  url: string;
  key: string;
};

type DocSlot = "idFront" | "idBack" | "selfie";

const SLOT_CONFIG: Record<
  DocSlot,
  {
    title: string;
    description: string;
    icon: React.ReactNode;
  }
> = {
  idFront: {
    title: "Government ID Front",
    description: "Upload the front side of the applicant identity document.",
    icon: <FileText className="h-5 w-5 text-cyan-400" />,
  },
  idBack: {
    title: "Government ID Back",
    description: "Upload the back side of the applicant identity document.",
    icon: <FileText className="h-5 w-5 text-cyan-400" />,
  },
  selfie: {
    title: "Selfie Verification",
    description: "Upload a clear selfie for biometric verification review.",
    icon: <Camera className="h-5 w-5 text-cyan-400" />,
  },
};

export function VerifyForm({ token }: { token: string }) {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [addressLine, setAddressLine] = useState("");

  const [docs, setDocs] = useState<Record<DocSlot, UploadedFile | null>>({
    idFront: null,
    idBack: null,
    selfie: null,
  });

  const [uploadingSlot, setUploadingSlot] = useState<DocSlot | null>(null);
  const [preview, setPreview] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadedCount = Object.values(docs).filter(Boolean).length;

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

      setDocs((prev) => ({
        ...prev,
        [slot]: data,
      }));
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
      setError("Please upload all required verification documents.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/submit/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          dateOfBirth,
          country,
          city,
          addressLine,
          documents: docs,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);

      setTimeout(() => {
        router.refresh();
      }, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-white">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-300">
            <Shield className="h-4 w-4" />
            Secure Identity Verification Portal
          </div>

          <h1 className="text-5xl font-bold tracking-tight">
            Identity Verification
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            Secure identity onboarding and automated compliance screening for
            AML/KYC verification workflows.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-cyan-300">
              AML Screening
            </div>

            <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-emerald-300">
              Identity Verification
            </div>

            <div className="rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-purple-300">
              Fraud Prevention
            </div>
          </div>
        </div>

        {error && (
          <Alert
            variant="destructive"
            className="mb-6 border-red-500/30 bg-red-500/10 text-red-300"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            <AlertDescription>
              Verification submitted successfully. Compliance checks are now
              being processed.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Personal Information</CardTitle>
              <CardDescription className="text-slate-400">
                Applicant identity and onboarding details.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Full Name</Label>

                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 border-white/10 bg-black/20 pl-10 text-white"
                    placeholder="e.g. Daniel Weber"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Country</Label>

                  <div className="relative">
                    <Globe className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      required
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="h-12 border-white/10 bg-black/20 pl-10 text-white"
                      placeholder="e.g. Germany"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>City</Label>

                  <Input
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="h-12 border-white/10 bg-black/20 text-white"
                    placeholder="e.g. Berlin"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>

                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <Input
                      type="date"
                      required
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="h-12 border-white/10 bg-black/20 pl-10 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Street Address</Label>

                <div className="relative">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <Input
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="h-12 border-white/10 bg-black/20 pl-10 text-white"
                    placeholder="e.g. Unter den Linden 12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-white/10 bg-white/[0.03] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Verification Documents
              </CardTitle>

              <CardDescription className="text-slate-400">
                Upload identity documents and biometric selfie.
              </CardDescription>

              <p className="pt-2 text-xs text-slate-500">
                Accepted formats: JPG, PNG • Max size depends on configured
                upload limits
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-200">
                <div className="flex items-center justify-between">
                  <span>Required documents uploaded</span>
                  <span className="font-semibold">{uploadedCount}/3</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
                  <div
                    className="h-full bg-cyan-400 transition-all"
                    style={{ width: `${(uploadedCount / 3) * 100}%` }}
                  />
                </div>
              </div>

              {(Object.keys(SLOT_CONFIG) as DocSlot[]).map((slot) => {
                const config = SLOT_CONFIG[slot];
                const uploaded = docs[slot];

                return (
                  <div
                    key={slot}
                    className="rounded-2xl border border-white/10 bg-black/20 p-5"
                  >
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div className="flex gap-3">
                        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                          {config.icon}
                        </div>

                        <div>
                          <h3 className="font-semibold text-white">
                            {config.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-400">
                            {config.description}
                          </p>
                        </div>
                      </div>

                      {uploaded && (
                        <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
                          <BadgeCheck className="h-3 w-3" />
                          Uploaded
                        </div>
                      )}
                    </div>

                    <Input
                      type="file"
                      accept="image/*"
                      disabled={uploadingSlot !== null || submitting}
                      onChange={(e) => handleFile(slot, e.target.files?.[0])}
                      className="border-white/10 bg-black/30 text-white"
                    />

                    {uploadingSlot === slot && (
                      <p className="mt-3 text-sm text-cyan-400">
                        Uploading document...
                      </p>
                    )}

                    {uploaded && (
                      <>
                        <button
                          type="button"
                          onClick={() => setPreview(uploaded)}
                          className="relative mt-5 block w-full overflow-hidden rounded-xl border border-white/10 text-left transition hover:border-cyan-500/30"
                        >
                          <Image
                            src={uploaded.url}
                            alt={config.title}
                            width={1200}
                            height={700}
                            className="h-72 w-full object-cover"
                          />
                        </button>

                        <p className="mt-3 text-sm font-medium text-emerald-400">
                          ✓ Uploaded successfully
                        </p>
                      </>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            Submitted applications may require manual compliance review before
            approval.
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-cyan-400" />
              Automated compliance screening powered by configurable AML/KYC
              rules.
            </div>
          </div>

          <Button
            type="submit"
            disabled={submitting || uploadingSlot !== null}
            className="h-14 w-full rounded-xl bg-cyan-500 text-lg font-semibold text-black hover:bg-cyan-400"
          >
            {submitting ? (
              "Submitting verification..."
            ) : (
              <>
                <Upload className="mr-2 h-5 w-5" />
                Complete Verification
              </>
            )}
          </Button>
        </form>
      </div>

      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6"
          onClick={() => setPreview(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#0f172a] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreview(null)}
              className="mb-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
            >
              Close Preview
            </button>

            <Image
              src={preview.url}
              alt="Document preview"
              width={1600}
              height={1000}
              className="max-h-[75vh] w-full rounded-2xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}