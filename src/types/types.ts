export const VERIFICATION_STANDARDS = [
  "Verra",
  "Gold Standard",
  "Plan Vivo",
  "Climate Action Reserve",
  "American Carbon Registry",
  "Verified Carbon Standard",
] as const;

export interface CarbonCredit {
  tokenId: string;
  metadata: {
    projectName: string;
    location: string;
    amount: number;
    vintage: number;
    verificationStandard: string;
    price: number;
    isVerified: boolean;
  };
  originalMetadataUrl: string;
}
