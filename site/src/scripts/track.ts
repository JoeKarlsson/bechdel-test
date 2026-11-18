// Sends a Plausible custom event. analytics.ts sets window.plausible up; for
// bots and headless browsers it never does, so nothing is sent.
export const track = (event: string, props?: Record<string, string>) => window.plausible?.(event, props && { props });
