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
export function endpointForParams(
  template: string,
  params: Record<string, string>,
): string {
  return Object.entries(params).reduce(
    (path, [key, value]) => path.replace(`:${key}`, value),
    template,
  );
}
