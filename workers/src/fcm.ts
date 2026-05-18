// FCM v1 client — JWT RS256 signed via Web Crypto, no external deps.
// Service account JSON (downloaded from Firebase Console) provides the RSA private key.

export interface ServiceAccount {
  type: 'service_account'
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
}

export interface FcmMessage {
  token: string
  title: string
  body: string
  data?: Record<string, string>
}

export async function getFcmAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const header = { alg: 'RS256', typ: 'JWT' }
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: sa.token_uri,
    exp: now + 3600,
    iat: now,
  }

  const headerB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(header)))
  const claimsB64 = base64UrlEncode(new TextEncoder().encode(JSON.stringify(claims)))
  const signingInput = `${headerB64}.${claimsB64}`

  const privateKey = await importRsaPrivateKey(sa.private_key)
  const sig = await crypto.subtle.sign(
    { name: 'RSASSA-PKCS1-v1_5' },
    privateKey,
    new TextEncoder().encode(signingInput),
  )
  const sigB64 = base64UrlEncode(new Uint8Array(sig))
  const jwt = `${signingInput}.${sigB64}`

  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })
  if (!res.ok)
    throw new Error(`OAuth token request failed: ${res.status} ${await res.text()}`)

  const data = await res.json<{ access_token: string }>()
  return data.access_token
}

export async function sendFcmMessage(
  accessToken: string,
  projectId: string,
  msg: FcmMessage,
): Promise<void> {
  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          token: msg.token,
          notification: { title: msg.title, body: msg.body },
          data: msg.data,
        },
      }),
    },
  )
  if (!res.ok)
    throw new FcmSendError(res.status, await res.text())
}

export class FcmSendError extends Error {
  constructor(public status: number, public response: string) {
    super(`FCM send failed: ${status} ${response}`)
  }

  // FCM returns UNREGISTERED when the token is no longer valid (uninstall, etc.)
  // The device row should be deleted in that case.
  isUnregistered(): boolean {
    return this.status === 404 || this.response.includes('UNREGISTERED')
  }
}

async function importRsaPrivateKey(pem: string): Promise<CryptoKey> {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s+/g, '')
  const binary = atob(body)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++)
    bytes[i] = binary.charCodeAt(i)
  return crypto.subtle.importKey(
    'pkcs8',
    bytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  )
}

function base64UrlEncode(bytes: Uint8Array): string {
  let str = ''
  for (let i = 0; i < bytes.length; i++)
    str += String.fromCharCode(bytes[i])
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
