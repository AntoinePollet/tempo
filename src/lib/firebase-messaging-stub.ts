// Stub for `firebase/messaging`, aliased in vite.config.ts.
//
// `@capacitor-firebase/messaging` declares `firebase` as an optional peer dep,
// only needed if you want a working Web Push fallback. Tempo only targets
// native iOS / Android (web is gated out via `isNativePlatform()`), so we
// stub the imports the web.js fallback expects. None of these functions are
// reached at runtime in our flow — they only exist for the bundler.

export function isSupported(): Promise<boolean> {
  return Promise.resolve(false)
}

export function getMessaging(): unknown {
  return null
}

export function getToken(): Promise<string | null> {
  return Promise.resolve(null)
}

export function deleteToken(): Promise<boolean> {
  return Promise.resolve(true)
}

export function onMessage(): () => void {
  return () => {}
}
