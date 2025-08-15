export interface FormData {
  companyName: string;
  companyWebsite: string;
  companyDescription: string;
  product: string;
  targetAudience: string;
  keywords: string; 
  phrases: string;
  subreddits: string;

}

// Optional: Add validation types
export interface FormValidation {
  companyName: boolean;
  companyWebsite: boolean;
  companyDescription: boolean;
}

// Optional: Add page enum for type safety
export enum OnboardingPage {
  CompanyInfo = 1,
  AdditionalInfo = 2,
  Educational = 3
}
