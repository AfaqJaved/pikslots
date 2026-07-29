/** Substitutes the `:id` route param in an endpoint template (e.g. BUSINESS_ENDPOINTS.GET_BY_ID). */
export function endpointFor(template: string, id: string): string {
  return template.replace(':id', id);
}
