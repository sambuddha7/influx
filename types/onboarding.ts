export interface FormData {
  companyName: string;
  companyWebsite: string;
  countryRegion: string;
  companyDescription: string;
  product: string;
  targetAudience: string;
  keywords: string; 
}

// Optional: Add validation types
export interface FormValidation {
  companyName: boolean;
  companyWebsite: boolean;
  countryRegion: boolean;
  companyDescription: boolean;
}

// Optional: Add page enum for type safety
export enum OnboardingPage {
  CompanyInfo = 1,
  AdditionalInfo = 2,
  Educational = 3
}
