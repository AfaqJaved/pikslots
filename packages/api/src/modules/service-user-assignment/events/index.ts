import { Provider } from '@nestjs/common';
import { AssignServiceToUsersEventImpl } from './assign.service.to.users.event.impl';

export const SERVICE_USER_ASSIGNMENT_EVENTS: Provider[] = [
  AssignServiceToUsersEventImpl,
];
