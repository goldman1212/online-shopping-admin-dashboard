// Usage:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='long-secret' node server/seed.js          -> create/update admin only
//   ... node server/seed.js --demo                                                         -> also load sample marketplace data
import { openDb } from './db.js'
import { hashPassword } from './auth.js'
import { randomBytes } from 'node:crypto'

const db = openDb()
const email = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase()
let password = process.env.ADMIN_PASSWORD, generated = false
if (!password) { password = randomBytes(9).toString('base64url'); generated = true }
if (password.length < 10) { console.error('ADMIN_PASSWORD must be at least 10 characters'); process.exit(1) }
db.prepare(`INSERT INTO admins (name, email, password_hash) VALUES (?,?,?)
  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash`).run(process.env.ADMIN_NAME || 'Administrator', email, hashPassword(password))
console.log(`Admin ready: ${email}` + (generated ? `  password (shown once): ${password}` : ''))

if (process.argv.includes('--demo')) {
  if (db.prepare('SELECT COUNT(*) n FROM users').get().n > 0) { console.log('Users already exist; skipping demo data.'); process.exit(0) }
  let seed = 7; const rnd = (n) => { seed = (seed * 1664525 + 1013904223) % 4294967296; return Math.floor((seed / 4294967296) * n) }
  const pick = (a) => a[rnd(a.length)]
  const first = ['Abebe', 'Marta', 'Dawit', 'Selam', 'Hana', 'Yonas', 'Liya', 'Kebede', 'Tigist', 'Bereket', 'Meron', 'Samuel', 'Rahel', 'Henok', 'Almaz', 'Fikru']
  const last = ['Kebede', 'Ali', 'Bekele', 'Tesfaye', 'Girma', 'Alemu', 'Haile', 'Tola', 'Assefa', 'Negash']
  const cities = ['Addis Ababa', 'Adama', 'Bahir Dar', 'Hawassa', 'Mekelle', 'Dire Dawa']
  const shoes = ['Leather Oxford', 'Running Sneaker', 'Canvas Low-Top', 'Suede Loafer', 'Trail Boot', 'Classic Sandal', 'Chelsea Boot', 'Court Trainer']
  const now = Date.now(), day = 86400000
  const iso = (ms) => new Date(ms).toISOString().slice(0, 19) + 'Z'
  const ins = (sql) => db.prepare(sql)
  db.exec('BEGIN')
  try {
    const uIns = ins('INSERT INTO users (name,email,role,status,created_at) VALUES (?,?,?,?,?)')
    const buyers = [], sellerUsers = []
    for (let i = 0; i < 60; i++) {
      const seller = i < 12, n = `${pick(first)} ${pick(last)}`
      const id = Number(uIns.run(n, `user${i}@example.com`, seller ? 'Seller' : 'Buyer', i % 23 === 22 ? 'Suspended' : 'Active', iso(now - rnd(200) * day)).lastInsertRowid)
      ;(seller ? sellerUsers : buyers).push({ id, name: n })
    }
    const sIns = ins('INSERT INTO sellers (user_id,business,city,status,created_at) VALUES (?,?,?,?,?)')
    const sellers = sellerUsers.map((u, i) => Number(sIns.run(u.id, `${u.name.split(' ')[0]} Footwear`, pick(cities), i < 3 ? 'Pending' : i === 11 ? 'Rejected' : 'Approved', iso(now - rnd(150) * day)).lastInsertRowid))
    const approved = sellers.slice(3, 11)
    const pIns = ins('INSERT INTO products (seller_id,name,price,stock,status,created_at) VALUES (?,?,?,?,?,?)')
    const products = []
    for (let i = 0; i < 32; i++) {
      const price = 1500 + rnd(40) * 100
      const id = Number(pIns.run(pick(approved), `${shoes[i % shoes.length]} ${Math.floor(i / shoes.length) + 1}`, price, rnd(60), i % 11 === 10 ? 'Pending review' : 'Approved', iso(now - rnd(120) * day)).lastInsertRowid)
      products.push({ id, price })
    }
    const oIns = ins('INSERT INTO orders (buyer_id,product_id,quantity,amount,payment_status,delivery_status,created_at) VALUES (?,?,?,?,?,?,?)')
    const pyIns = ins('INSERT INTO payments (order_id,method,amount,status,created_at) VALUES (?,?,?,?,?)')
    const dIns = ins('INSERT INTO deliveries (order_id,courier,city,status,eta) VALUES (?,?,?,?,?)')
    for (let i = 0; i < 220; i++) {
      const p = pick(products), q = 1 + rnd(3), age = rnd(170), created = now - age * day
      const pay = pick(['Paid', 'Paid', 'Paid', 'Pending', 'Failed'])
      const del = pay !== 'Paid' ? (pay === 'Failed' ? 'Cancelled' : 'Processing') : age > 10 ? 'Delivered' : pick(['Processing', 'In transit', 'Delivered'])
      const oid = Number(oIns.run(pick(buyers).id, p.id, q, p.price * q, pay, del, iso(created)).lastInsertRowid)
      pyIns.run(oid, pick(['Telebirr', 'CBE Birr', 'Card', 'Cash on delivery']), p.price * q, pay, iso(created))
      if (pay === 'Paid') dIns.run(oid, pick(['Zemen Express', 'Ethio Courier', 'Fast Track']), pick(cities), del, iso(created + 4 * day).slice(0, 10))
    }
    const tIns = ins('INSERT INTO tryon_models (product_id,format,status) VALUES (?,?,?)')
    products.slice(0, 10).forEach((p, i) => tIns.run(p.id, pick(['glb', 'usdz']), i % 5 === 4 ? 'Processing' : 'Ready'))
    const aIns = ins('INSERT INTO ads (seller_id,title,budget,status,starts_on,ends_on) VALUES (?,?,?,?,?,?)')
    approved.slice(0, 5).forEach((s, i) => aIns.run(s, `Season sale #${i + 1}`, 2000 + i * 1500, ['Active', 'Pending', 'Paused', 'Active', 'Ended'][i], iso(now - 10 * day).slice(0, 10), iso(now + 20 * day).slice(0, 10)))
    const tkIns = ins('INSERT INTO support_tickets (user_id,subject,priority,status,created_at) VALUES (?,?,?,?,?)')
    ;['Wrong size delivered', 'Refund not received', 'Cannot update address', 'Seller not responding', 'App crashes at checkout'].forEach((s, i) => tkIns.run(pick(buyers).id, s, pick(['Low', 'Normal', 'High']), i < 3 ? 'Open' : 'Resolved', iso(now - i * day)))
    const nIns = ins('INSERT INTO notifications (title,body,is_read,created_at) VALUES (?,?,?,?)')
    nIns.run('New seller awaiting verification', 'Three seller applications are pending review.', 0, iso(now - 3600e3))
    nIns.run('Payment failures increased', 'Several Telebirr payments failed today.', 0, iso(now - 7200e3))
    nIns.run('Weekly report ready', 'Last week’s sales summary is available.', 1, iso(now - 2 * day))
    db.exec('COMMIT')
    console.log('Demo data loaded.')
  } catch (e) { db.exec('ROLLBACK'); throw e }
}
