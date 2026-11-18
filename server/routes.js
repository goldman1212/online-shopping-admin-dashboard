import { verifyPassword, createSession, destroySession, loginBlocked, loginFailed, loginOk, hashPassword } from './auth.js'

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status }
}
const bad = (m) => new HttpError(400, m)
const notFound = () => new HttpError(404, 'Not found')

const num = (v, d, min, max) => {
  const n = Number.parseInt(v, 10)
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : d
}
const pageOf = (q) => ({ limit: num(q.get('limit'), 200, 1, 500), offset: num(q.get('offset'), 0, 0, 1e9) })
const idOf = (s) => { const n = Number.parseInt(String(s).replace(/^[A-Z]+-/, ''), 10); if (!Number.isInteger(n) || n < 1) throw bad('Invalid id'); return n }
const orderCode = (id) => 'ORD-' + (1000 + id)
const orderId = (code) => idOf(code) - (/^ORD-/.test(code) ? 1000 : 0)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function buildRoutes(db) {
  const all = (sql, ...p) => db.prepare(sql).all(...p).map((r) => ({ ...r }))
  const one = (sql, ...p) => { const r = db.prepare(sql).get(...p); return r ? { ...r } : undefined }
  const audit = (admin, action, target, detail) =>
    db.prepare('INSERT INTO audit_log (admin_id, action, target, detail) VALUES (?,?,?,?)').run(admin.id, action, target, detail ?? null)

  const orderRow = (r) => ({
    id: orderCode(r.id), buyer: r.buyer, product: r.product, quantity: r.quantity, amount: r.amount,
    paymentStatus: r.payment_status, deliveryStatus: r.delivery_status, date: r.created_at,
  })
  const ORDER_SQL = `SELECT o.*, u.name AS buyer, p.name AS product FROM orders o
    JOIN users u ON u.id = o.buyer_id JOIN products p ON p.id = o.product_id`

  // 
    // ---- users ----
    { method: 'GET', path: '/users', handler: ({ query }) => {
      const { limit, offset } = pageOf(query)
      const role = query.get('role'), q = `%${query.get('q') ?? ''}%`
      return all(`SELECT id, name, email, role, status, created_at AS joined FROM users
        WHERE (? IS NULL OR role = ?) AND (name LIKE ? OR email LIKE ?) ORDER BY id LIMIT ? OFFSET ?`, role, role, q, q, limit, offset)
    } },

    // Add user
    { method: 'POST', path: '/users', handler: ({ body, admin }) => {
      const name = String(body?.name ?? '').trim()
      const email = String(body?.email ?? '').trim().toLowerCase()
      const role = body?.role

      if (!name || name.length > 100) throw bad('Invalid name')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad('Invalid email')
      if (!['Buyer', 'Seller'].includes(role)) throw bad('Role must be Buyer or Seller')

      try {
        const result = db.prepare(
          'INSERT INTO users (name, email, role) VALUES (?, ?, ?)'
        ).run(name, email, role)

        const id = Number(result.lastInsertRowid)
        audit(admin, 'user.create', `user:${id}`, email)
        return { id, name, email, role, status: 'Active' }
      } catch (e) {
        if (String(e.message).includes('UNIQUE constraint failed'))
          throw new HttpError(409, 'Email already exists')
        throw e
      }
    } },

    // Update user
    { method: 'PATCH', path: '/users/:id', handler: ({ params, body, admin }) => {
      const id = idOf(params.id)
      const current = one('SELECT * FROM users WHERE id = ?', id)
      if (!current) throw notFound()

      const name = String(body?.name ?? current.name).trim()
      const email = String(body?.email ?? current.email).trim().toLowerCase()
      const role = body?.role ?? current.role
      const status = body?.status ?? current.status

      if (!name || name.length > 100) throw bad('Invalid name')
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw bad('Invalid email')
      if (!['Buyer', 'Seller'].includes(role)) throw bad('Invalid role')
      if (!['Active', 'Suspended'].includes(status)) throw bad('Invalid status')

      try {
        db.prepare('UPDATE users SET name=?, email=?, role=?, status=? WHERE id=?')
          .run(name, email, role, status, id)
      } catch (e) {
        if (String(e.message).includes('UNIQUE constraint failed'))
          throw new HttpError(409, 'Email already exists')
        throw e
      }

      audit(admin, 'user.update', `user:${id}`, email)
      return { id, name, email, role, status }
    } },

    // Delete user only when no related records exist
    { method: 'DELETE', path: '/users/:id', handler: ({ params, admin }) => {
      const id = idOf(params.id)
      const user = one('SELECT * FROM users WHERE id=?', id)
      if (!user) throw notFound()

      const orders = one('SELECT COUNT(*) AS n FROM orders WHERE buyer_id=?', id).n
      const seller = one('SELECT COUNT(*) AS n FROM sellers WHERE user_id=?', id).n
      const tickets = one('SELECT COUNT(*) AS n FROM support_tickets WHERE user_id=?', id).n

      if (orders || seller || tickets)
        throw new HttpError(409, 'Cannot delete user with related records. Suspend instead.')

      audit(admin, 'user.delete', `user:${id}`, user.email)
      db.prepare('DELETE FROM users WHERE id=?').run(id)
      return { success: true, id }
    } },

