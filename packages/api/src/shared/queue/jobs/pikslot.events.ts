export const PIKSLOT_EVENTS = {
  BUSINESS: {
    BUSINESS_REGISTRATION_INVITE: 'business.registration.invite',
  },
  USER: {
    USER_ASSIGN_TO_BUSINESS: 'user.assign.to.business',
  },
  // juntion table many to many
  SERVICE_GROUP_ASSIGNMENT: {
    SYNC_SERVICE_SERVICE_GROUPS: 'sync.service.service.groups',
    SYNC_SERVICE_GROUP_SERVICES: 'sync.service.group.services',
  },
  SERVICE_USER_ASSIGNMENT: {
    ASSIGN_SERVICE_TO_USERS: 'assign.service.to.users', // (single) service --> assign to --> users (multiple)
  },
} as const;
