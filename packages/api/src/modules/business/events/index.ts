import { Provider } from '@nestjs/common';
import { BusinessRegistrationInvite } from './business.registration.invite';

export const BUSINESS_EVENTS: Provider[] = [BusinessRegistrationInvite];
