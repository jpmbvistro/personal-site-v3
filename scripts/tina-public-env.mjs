// Tina only exposes TINA_PUBLIC_* (and NEXT_PUBLIC_*) in its browser admin.
// Keep the original setup's env names working without making the token public.
if (process.env.TINA_PUBLIC_IS_LOCAL === 'true') {
  throw new Error('Cloud builds must not enable the unauthenticated local Tina editor. Unset TINA_PUBLIC_IS_LOCAL.');
}

for (const [legacy, publicName] of [
  ['TINA_CLIENT_ID', 'TINA_PUBLIC_CLIENT_ID'],
  ['TINA_BRANCH', 'TINA_PUBLIC_BRANCH'],
]) {
  if (!process.env[publicName] && process.env[legacy]) {
    process.env[publicName] = process.env[legacy];
  }
}

// Vercel previews read content from the deployed branch so TinaCloud validates
// the matching schema. An explicitly configured branch always wins, so
// production keeps its intended target.
if (!process.env.TINA_PUBLIC_BRANCH && process.env.VERCEL_GIT_COMMIT_REF) {
  process.env.TINA_PUBLIC_BRANCH = process.env.VERCEL_GIT_COMMIT_REF;
}
