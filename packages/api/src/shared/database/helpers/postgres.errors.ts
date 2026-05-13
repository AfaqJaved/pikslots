export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code: string }).code === '23505'
  );
}

export function getUniqueViolationField(error: unknown): 'email' | 'username' {
  const constraint =
    typeof error === 'object' && error !== null && 'constraint' in error
      ? (error as { constraint: string }).constraint
      : '';

  if (constraint.includes('email')) return 'email';
  return 'username';
}
