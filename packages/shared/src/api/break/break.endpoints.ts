export const BREAK_ENDPOINTS = {
  GET_USER_BREAKS:    '/users/:userId/breaks',
  GET_BREAK_BY_ID:   '/users/:userId/breaks/:breakId',
  CREATE_BREAK:      '/users/:userId/breaks',
  UPDATE_BREAK:      '/users/:userId/breaks/:breakId',
  DELETE_BREAK:      '/users/:userId/breaks/:breakId',
} as const;