export interface AssignServicesToServiceGroupEvent {
  serviceGroupId: string;
  servicesIds: string[];
  businessId: string;
  assignedBy: string;
}
