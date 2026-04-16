/**
 * A utility function to wait for a given number of milliseconds
 * Replaces Puppeteer's deprecated Page.waitForTimeout() function
 * @param ms timeout duration in milliseconds
 * @see {@link https://pptr.dev/api/puppeteer.page.waitfortimeout}
 * @returns
 */
export async function waitForTimeout(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
