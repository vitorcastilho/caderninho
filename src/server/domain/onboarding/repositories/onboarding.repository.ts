export interface OnboardingRepository {
  getOnboardingStatus(organizationId: string): Promise<boolean | null>;
  completeOnboarding(organizationId: string): Promise<void>;
}
