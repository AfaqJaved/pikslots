export const SERVICE_ENDPOINTS = {
  REGISTER: '/services/register',
  FIND_ALL_BY_BUSINESS: '/services/by-business/:businessId',
  UPDATE: '/services/:serviceId',
  DELETE: '/services/:serviceId',
  UPDATE_SERVICE_AVATAR: '/service/:serviceId/avatar',
} as const;
