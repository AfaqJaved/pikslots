/** Substitutes the `:id` route param in an endpoint template (e.g. BUSINESS_ENDPOINTS.GET_BY_ID). */
export function endpointFor(
  template: string,
  params: string | Record<string, string>,
): string {
  if (typeof params === 'string') {
    return template.replace(':id', params);
  }
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template,
  );
}

/**
 * Substitutes one or more named route params in an endpoint template, for
 * routes whose params aren't called `:id` (e.g. CLASS_GROUP_ASSIGNMENT_ENDPOINTS
 * .FIND_GROUPS_BY_CLASS has `:classId`, not `:id`).
 *
 * @example endpointForParams(CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP, { classGroupId })
 */
export function endpointForParams(
  template: string,
  params: Record<string, string>,
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template,
  );
}
