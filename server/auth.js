import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto'

export const SESSION_TTL_MS = 8 * 60 * 60 * 1000
export const COOKIE = 'admin_session'

export function hashPassword(pw) {
  const salt = randomBytes(16)
  const key = scryptSync(pw, salt, 64)
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`
}
export function verifyPassword(pw, stored) {
  const [alg, saltHex, keyHex] = String(stored).split('$')
  if (alg !== 'scrypt' || !saltHex || !keyHex) return false
  const expected = Buffer.from(keyHex, 'hex')
  const actual = scryptSync(pw, Buffer.from(saltHex, 'hex'), expected.length)
  return timingSafeEqual(actual, expected)
}
const sha = (s) => createHash('sha256').update(s).digest('hex')

export function createSession(db, adminId) {
  const token = randomBytes(32).toString('base64url')
  db.prepare('INSERT INTO sessions (token_hash, admin_id, expires_at) VALUES (?,?,?)')
    .run(sha(token), adminId, Date.now() + SESSION_TTL_MS)
  return token
}
export function getSessionAdmin(db, token) {
  if (!token) return null
  const row = db.prepare(`SELECT a.id, a.name, a.email, a.role, s.expires_at FROM sessions s
    JOIN admins a ON a.id = s.admin_id WHERE s.token_hash = ?`).get(sha(token))
  if (!row) return null
  if (row.expires_at < Date.now()) { destroySession(db, token); return null }
  return { id: row.id, name: row.name, email: row.email, role: row.role }
}
export function destroySession(db, token) {
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(sha(token))
}
export function purgeExpired(db) {
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now())
}

export function parseCookies(header = '') {
  const out = {}
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim())
  }
  return out
}
export function cookieHeader(token, { secure, crossSite }) {
  const attrs = [`${COOKIE}=${token}`, 'Path=/', 'HttpOnly', `SameSite=${crossSite ? 'None' : 'Lax'}`]
  if (secure || crossSite) attrs.push('Secure')
  attrs.push(token ? `Max-Age=${SESSION_TTL_MS / 1000}` : 'Max-Age=0')
  return attrs.join('; ')
}

// Simple in-memory limiter for login attempts (per IP + email).
const fails = new Map()
const WINDOW = 15 * 60 * 1000, MAX = 8
export function loginBlocked(key) {
  const f = fails.get(key)
  if (!f) return false
  if (Date.now() - f.first > WINDOW) { fails.delete(key); return false }
  return f.n >= MAX
}
export function loginFailed(key) {
  const f = fails.get(key)
  if (!f || Date.now() - f.first > WINDOW) fails.set(key, { n: 1, first: Date.now() })
  else f.n++
}
export function loginOk(key) { fails.delete(key) }
