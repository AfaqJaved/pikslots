export const CUSTOMER_ENDPOINTS = {
  REGISTER: '/customers/register',
  FIND_ALL_BY_BUSINESS: '/customers/by-business/:businessId',
  FIND_BY_ID: '/customers/:customerId',
  EDIT: '/customers/:customerId',
  DELETE: '/customers/:customerId',
  UPDATE_PROFILE_IMAGE: '/customer/:customerId/profile-image',
} as const;
