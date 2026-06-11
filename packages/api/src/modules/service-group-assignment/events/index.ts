import { Provider } from '@nestjs/common';
import { AssignServiceGroupToServicesEventImpl } from './assign.service.group.to.services.event.impl';
import { AssignServiceToServiceGroupsEventImp } from './assign.service.to.service.groups.event.impl';

export const SERVICE_GROUP_ASSIGNMENT_EVENTS: Provider[] = [
  AssignServiceGroupToServicesEventImpl,
  AssignServiceToServiceGroupsEventImp,
];
