/** Polls `condition` until it's true, for asserting on async side effects (queue workers, S3 eventual deletes, ...). */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  { timeoutMs = 5000, intervalMs = 100 } = {},
): Promise<void> {
  const start = Date.now();
  while (!(await condition())) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`waitFor: condition not met within ${timeoutMs}ms`);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}
