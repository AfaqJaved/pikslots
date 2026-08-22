import { Onboarding } from '@pikslots/domain';

// Onboarding runs exactly once when the platform is being set up, so the
// fake repository starts empty and this array records every registration
// performed during a test run.
export const ONBOARDING_TEST_DATA: Onboarding[] = [];
