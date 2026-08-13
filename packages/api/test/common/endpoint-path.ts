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
 * Throws if a requested param key has no matching `:key` token in the
 * template, or if the result still contains an unsubstituted `:token` —
 * both indicate a mismatch between this call's param names and the real
 * route (e.g. guessing `:userId` when the actual route uses `:id`), which
 * would otherwise silently produce a wrong-but-valid-looking path and fail
 * far away from the real cause (often as a confusing "Invalid URL" from
 * superagent, or a silent 404).
 *
 * @example endpointForParams(CLASS_GROUP_ASSIGNMENT_ENDPOINTS.FIND_BY_GROUP, { classGroupId })
 */
export function endpointForParams(
  template: string,
  params: Record<string, string>,
): string {
  const result = Object.entries(params).reduce((path, [key, value]) => {
    if (!path.includes(`:${key}`)) {
      throw new Error(
        `endpointForParams: template "${template}" has no ":${key}" segment to substitute. Check the real route's param name.`,
      );
    }
    return path.replace(`:${key}`, value);
  }, template);

  if (/:[a-zA-Z_]+/.test(result)) {
    throw new Error(
      `endpointForParams: result "${result}" still has an unsubstituted param — check for a typo in the param name passed in.`,
    );
  }

  return result;
}
