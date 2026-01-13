export async function register() {
  if (typeof window !== 'undefined') {
    // Only import client-side initialization in the browser
    await import('./instrumentation-client');
  }
}
