export const BOOKING_ENDPOINTS = {
  REGISTER: '/bookings/register',
  FIND_ALL_BY_BUSINESS_FOR_USER: '/bookings/business/:businessId/user/:userId',
  FIND_BY_ID: '/bookings/:bookingId',
  EDIT: '/bookings/:bookingId',
  DELETE: '/bookings/:bookingId',
} as const;
