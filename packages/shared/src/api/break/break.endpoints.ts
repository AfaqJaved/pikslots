export const BREAK_ENDPOINTS = {
  CREATE: '/breaks',
  FIND_ALL_BY_USER: '/breaks/user/:userId/:businessId',
  FIND_BY_ID: '/breaks/:breakId',
  UPDATE: '/breaks/:breakId',
  DELETE: '/breaks/:breakId',
} as const;
