export interface OnboardingRepository {
  getOnboardingStatus(organizationId: string): Promise<boolean>;
  completeOnboarding(organizationId: string): Promise<void>;
}
