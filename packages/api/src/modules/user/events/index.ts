import { Provider } from '@nestjs/common';
import { UserAssignedToBusinessEventImpl } from './user.assigned.to.business.event';

export const USER_EVENTS: Provider[] = [UserAssignedToBusinessEventImpl];
