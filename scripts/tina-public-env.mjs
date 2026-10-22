// Tina only exposes TINA_PUBLIC_* (and NEXT_PUBLIC_*) in its browser admin.
// Keep the original setup's env names working without making the token public.
for (const [legacy, publicName] of [
  ['TINA_CLIENT_ID', 'TINA_PUBLIC_CLIENT_ID'],
  ['TINA_BRANCH', 'TINA_PUBLIC_BRANCH'],
]) {
  if (!process.env[publicName] && process.env[legacy]) {
    process.env[publicName] = process.env[legacy];
  }
}
