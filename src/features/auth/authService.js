async function sha256(value) {
  const data = new TextEncoder().encode(value)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function verifyPassword(password, credential) {
  if (!password || !credential?.salt || !credential?.passwordHash) return false
  return await sha256(`${credential.salt}${password}`) === credential.passwordHash
}

export async function createPasswordCredential(password) {
  const salt = globalThis.crypto.randomUUID()
  return { salt, passwordHash: await sha256(`${salt}${password}`) }
}
