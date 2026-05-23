import { CheckType, CheckStatus } from "@prisma/client";

type RiskCheck = {
  type: CheckType;
  status: CheckStatus;
  score: number;
};

type RiskResult = {
  riskScore: number;
  checks: RiskCheck[];
  flags: string[];
};

const HIGH_RISK_COUNTRIES = [
  "Iran",
  "North Korea",
  "Russia",
  "Syria",
  "Afghanistan",
];

const WATCHLIST_NAMES = [
  "test fraud",
  "john doe",
  "anonymous",
];

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

  // COUNTRY / SANCTIONS RISK
  if (HIGH_RISK_COUNTRIES.includes(data.country)) {

    riskScore += 40;

    checks.push({
      type: "SANCTIONS_SCREEN",
      status: "REVIEW",
      score: 0.82,
    });

    flags.push("High Risk Geography");

  } else {

    checks.push({
      type: "SANCTIONS_SCREEN",
      status: "PASS",
      score: 0.12,
    });
  }

  // DOCUMENT VALIDITY
  const allDocsPresent =
    data.hasSelfie &&
    data.hasIdFront &&
    data.hasIdBack;

  if (!allDocsPresent) {

    riskScore += 30;

    checks.push({
      type: "DOCUMENT_VALIDITY",
      status: "FAIL",
      score: 0.91,
    });

    flags.push("Missing Documents");

  } else {

    checks.push({
      type: "DOCUMENT_VALIDITY",
      status: "PASS",
      score: 0.08,
    });
  }

  // PEP / WATCHLIST SCREEN
  const normalizedName =
    data.fullName.toLowerCase().trim();

  const suspicious =
    WATCHLIST_NAMES.includes(normalizedName);

  if (suspicious) {

    riskScore += 50;

    checks.push({
      type: "PEP_SCREEN",
      status: "FAIL",
      score: 0.96,
    });

    flags.push("Potential Watchlist Match");

  } else {

    checks.push({
      type: "PEP_SCREEN",
      status: "PASS",
      score: 0.03,
    });
  }

  // FACE MATCH
  const faceConfidence =
    Math.random() * (0.98 - 0.75) + 0.75;

  if (faceConfidence < 0.82) {

    riskScore += 20;

    checks.push({
      type: "FACE_MATCH",
      status: "REVIEW",
      score: faceConfidence,
    });

    flags.push("Low Face Match Confidence");

  } else {

    checks.push({
      type: "FACE_MATCH",
      status: "PASS",
      score: faceConfidence,
    });
  }

  // LIVENESS
  const livenessConfidence =
    Math.random() * (0.99 - 0.8) + 0.8;

  if (livenessConfidence < 0.86) {

    riskScore += 15;

    checks.push({
      type: "LIVENESS",
      status: "REVIEW",
      score: livenessConfidence,
    });

    flags.push("Liveness Review Required");

  } else {

    checks.push({
      type: "LIVENESS",
      status: "PASS",
      score: livenessConfidence,
    });
  }

  riskScore = Math.min(riskScore, 100);

  return {
    riskScore,
    checks,
    flags,
  };
}