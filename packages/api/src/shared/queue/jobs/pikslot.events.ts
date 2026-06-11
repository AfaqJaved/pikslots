export const PIKSLOT_EVENTS = {
  BUSINESS: {
    BUSINESS_REGISTRATION_INVITE: 'business.registration.invite',
  },
  USER: {
    USER_ASSIGN_TO_BUSINESS: 'user.assign.to.business',
  },
  // juntion table many to many
  SERVICE_GROUP_ASSIGNMENT: {
    ASSIGN_SERVICE_TO_SERVICE_GROUPS: 'assign.service.to.service.groups', // (single) service --> assign to --> service groups (multiple)
    ASSIGN_SERVICE_GROUP_TO_SERVICES: 'assign.service.group.to.services', // (single) service group --> assign to --> services (multiple)
  },
} as const;
