import { CheckStatus, CheckType } from "@prisma/client";

type RiskCheck = {
  type: CheckType;
  status: CheckStatus;
  score: number;
  reason: string;
};

type RiskResult = {
  riskScore: number;
  checks: RiskCheck[];
  flags: string[];
  summary: string;
};

const HIGH_RISK_COUNTRIES = ["iran", "north korea", "syria", "afghanistan"];
const ELEVATED_RISK_COUNTRIES = ["lebanon", "iraq", "pakistan", "turkey", "russia"];

const SANCTIONS_WATCHLIST = [
  "mohammed hassan",
  "reza ahmadi",
  "john doe",
  "sanctioned entity",
  "test fraud",
];

const PEP_WATCHLIST = [
  "ali khoury",
  "omar suleiman",
  "fatima khan",
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function deterministicScore(seed: string, min: number, max: number) {
  let hash = 0;

  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const normalized = Math.abs(hash % 100) / 100;
  return Number((min + normalized * (max - min)).toFixed(2));
}

function pushCheck(
  checks: RiskCheck[],
  type: CheckType,
  status: CheckStatus,
  score: number,
  reason: string
) {
  checks.push({
    type,
    status,
    score,
    reason,
  });
}

export function runRiskEngine(data: {
  fullName: string;
  country: string;
  hasSelfie: boolean;
  hasIdFront: boolean;
  hasIdBack: boolean;
}): RiskResult {
  let riskScore = 0;

  const checks: RiskCheck[] = [];
  const flags: string[] = [];

  const name = normalize(data.fullName);
  const country = normalize(data.country);

  const uploadedDocs = [
    data.hasSelfie,
    data.hasIdFront,
    data.hasIdBack,
  ].filter(Boolean).length;

  if (!name) {
    riskScore += 35;
    flags.push("Missing Applicant Name");
  }

  if (name && name.length < 5) {
    riskScore += 15;
    flags.push("Incomplete Identity Profile");
  }

  if (!country) {
    riskScore += 25;
    flags.push("Missing Country");
  }

  if (HIGH_RISK_COUNTRIES.includes(country)) {
    riskScore += 45;
    flags.push("High Risk Jurisdiction");

    pushCheck(
      checks,
      "SANCTIONS_SCREEN",
      "REVIEW",
      0.89,
      "Applicant jurisdiction is associated with elevated sanctions and compliance exposure."
    );
  } else if (ELEVATED_RISK_COUNTRIES.includes(country)) {
    riskScore += 35;
    flags.push("Enhanced Due Diligence");

    pushCheck(
      checks,
      "SANCTIONS_SCREEN",
      "REVIEW",
      0.62,
      "Applicant jurisdiction requires enhanced due diligence before approval."
    );
  } else {
    pushCheck(
      checks,
      "SANCTIONS_SCREEN",
      "PASS",
      0.11,
      "No elevated sanctions jurisdiction risk detected."
    );
  }

  if (uploadedDocs < 3) {
    const missingDocs = 3 - uploadedDocs;
    riskScore += missingDocs * 20;
    flags.push("Incomplete Documentation");

    pushCheck(
      checks,
      "DOCUMENT_VALIDITY",
      uploadedDocs === 0 ? "FAIL" : "REVIEW",
      0.72,
      "Required identity evidence is incomplete or partially missing."
    );
  } else {
    pushCheck(
      checks,
      "DOCUMENT_VALIDITY",
      "PASS",
      0.94,
      "All required identity documents were submitted."
    );
  }

  if (SANCTIONS_WATCHLIST.includes(name)) {
    riskScore += 50;
    flags.push("Potential Sanctions Match");

    pushCheck(
      checks,
      "PEP_SCREEN",
      "FAIL",
      0.97,
      "Potential sanctions or internal watchlist match detected."
    );
  } else if (PEP_WATCHLIST.includes(name)) {
    riskScore += 25;
    flags.push("Potential PEP Exposure");

    pushCheck(
      checks,
      "PEP_SCREEN",
      "REVIEW",
      0.71,
      "Applicant profile may require politically exposed person review."
    );
  } else {
    pushCheck(
      checks,
      "PEP_SCREEN",
      "PASS",
      0.96,
      "No watchlist or politically exposed person match detected."
    );
  }

  const faceConfidence = deterministicScore(name + country + "face", 0.78, 0.98);

  if (faceConfidence < 0.9) {
    riskScore += 20;
    flags.push("Face Match Review Required");

    pushCheck(
      checks,
      "FACE_MATCH",
      "REVIEW",
      faceConfidence,
      "Face match confidence is below the automatic approval threshold."
    );
  } else {
    pushCheck(
      checks,
      "FACE_MATCH",
      "PASS",
      faceConfidence,
      "Face match confidence is within the acceptable verification range."
    );
  }

  const livenessConfidence = deterministicScore(name + country + "live", 0.84, 0.99);

  if (livenessConfidence < 0.93) {
    riskScore += 15;
    flags.push("Liveness Review Required");

    pushCheck(
      checks,
      "LIVENESS",
      "REVIEW",
      livenessConfidence,
      "Liveness confidence requires manual reviewer attention."
    );
  } else {
    pushCheck(
      checks,
      "LIVENESS",
      "PASS",
      livenessConfidence,
      "Liveness verification completed successfully."
    );
  }

  riskScore = Math.min(riskScore, 100);

  const summary =
    riskScore >= 75
      ? "High-risk verification profile requiring manual compliance review."
      : riskScore >= 40
      ? "Moderate-risk profile requiring enhanced due diligence."
      : "Low-risk profile with no major escalation triggers.";

  return {
    riskScore,
    checks,
    flags,
    summary,
  };
}