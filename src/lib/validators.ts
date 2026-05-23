import { z } from "zod";

export const verificationSubmissionSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  addressLine: z.string().min(3, "Address is required"),
  city: z.string().min(2, "City is required"),
  country: z.string().min(2, "Country is required"),
  documents: z.object({
    idFront: z.object({ url: z.string().url(), key: z.string() }),
    idBack: z.object({ url: z.string().url(), key: z.string() }),
    selfie: z.object({ url: z.string().url(), key: z.string() }),
  }),
});

export type VerificationSubmission = z.infer<typeof verificationSubmissionSchema>;