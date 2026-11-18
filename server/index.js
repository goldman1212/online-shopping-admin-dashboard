
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, normalize, extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openDb } from './db.js'
import { getSessionAdmin, parseCookies, cookieHeader, COOKIE, purgeExpired } from './auth.js'
import { buildRoutes, HttpError } from './routes.js'

const PORT = Number(process.env.PORT || 4000)
const CORS_ORIGIN = process.env.CORS_ORIGIN || ''
const PROD = process.env.NODE_ENV === 'production'
const DIST = resolve(fileURLToPath(new URL('../dist', import.meta.url)))
const MAX_BODY = 100 * 1024

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
}

export function createApp(db) {
  const routes = buildRoutes(db).map((r) => ({
    ...r,
    re: new RegExp('^/api/admin' + r.path.replace(/:\w+/g, '([^/]+)') + '/?$'),
    names: [...r.path.matchAll(/:(\w+)/g)].map((m) => m[1]),
  }))

  const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Content-Security-Policy': "default-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none'",
  }

  const send = (res, status, data, extra = {}) => {
    const body = data === undefined ? '' : JSON.stringify(data)
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...securityHeaders,
      ...extra
    })
    res.end(body)
  }

  const readBody = (req) => new Promise((ok, fail) => {
    let size = 0
    const chunks = []

    req.on('data', (c) => {
      size += c.length

      if (size > MAX_BODY) {
        fail(new HttpError(413, 'Body too large'))
        req.destroy()
      } else {
        chunks.push(c)
      }
    })

    req.on('end', () => {
      if (!chunks.length) return ok(undefined)

      try {
        ok(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch {
        fail(new HttpError(400, 'Invalid JSON'))
      }
    })

    req.on('error', fail)
  })

  async function serveStatic(req, res, pathname) {
    if (!PROD || (req.method !== 'GET' && req.method !== 'HEAD')) {
      return send(res, 404, { error: 'Not found' })
    }

    let file = resolve(join(DIST, normalize(decodeURIComponent(pathname))))

    if (file !== DIST && !file.startsWith(DIST + sep)) {
      return send(res, 403, { error: 'Forbidden' })
    }

    try {
      if (!(await stat(file)).isFile()) throw 0
    } catch {
      file = join(DIST, 'index.html')
    }

    try {
      const buf = await readFile(file)

      res.writeHead(200, {
        'Content-Type': MIME[extname(file)] || 'application/octet-stream',
        ...securityHeaders
      })

      res.end(req.method === 'HEAD' ? undefined : buf)
    } catch {
      send(res, 404, { error: 'Not found' })
    }
  }

  return async (req, res) => {
    const url = new URL(req.url, 'http://x')
    const origin = req.headers.origin

    try {
      if (CORS_ORIGIN && origin === CORS_ORIGIN) {
        res.setHeader('Access-Control-Allow-Origin', origin)
        res.setHeader('Access-Control-Allow-Credentials', 'true')
        res.setHeader('Vary', 'Origin')

        // DELETE added for CRUD operations
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET,POST,PATCH,DELETE,OPTIONS'
        )

        res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
      }

      if (req.method === 'OPTIONS') {
        res.writeHead(204)
        return res.end()
      }

      if (!url.pathname.startsWith('/api/')) {
        return serveStatic(req, res, url.pathname)
      }

      if (url.pathname === '/api/health') {
        return send(res, 200, { ok: true })
      }

      let route
      const params = {}
      let methodMatched = false

      for (const r of routes) {
        const m = r.re.exec(url.pathname)

        if (!m) continue

        methodMatched = true

        if (r.method !== req.method) continue

        route = r
        r.names.forEach((n, i) => {
          params[n] = decodeURIComponent(m[i + 1])
        })

        break
      }

      if (!route) {
        return send(
          res,
          methodMatched ? 405 : 404,
          { error: methodMatched ? 'Method not allowed' : 'Not found' }
        )
      }

      // CSRF protection for state-changing requests
      if (req.method !== 'GET') {
        const host = req.headers.host

        if (
          origin &&
          origin !== CORS_ORIGIN &&
          new URL(origin).host !== host
        ) {
          throw new HttpError(403, 'Cross-origin request blocked')
        }

        const ct = req.headers['content-type'] || ''

        if (
          !ct.startsWith('application/json') &&
          req.headers['content-length'] !== '0' &&
          req.headers['content-length'] !== undefined
        ) {
          throw new HttpError(415, 'Content-Type must be application/json')
        }
      }

      const token = parseCookies(req.headers.cookie)[COOKIE]
      const admin = getSessionAdmin(db, token)

      if (!route.public && !admin) {
        throw new HttpError(401, 'Not authenticated')
      }

      const ctx = {
        params,
        query: url.searchParams,
        admin,
        token,
        ip: req.socket.remoteAddress || '',
        body: req.method === 'GET' ? undefined : await readBody(req),

        setSession: (t) => {
          res.setHeader(
            'Set-Cookie',
            cookieHeader(t, {
              secure: PROD,
              crossSite: !!CORS_ORIGIN
            })
          )
        },
      }

      const data = await route.handler(ctx)
      send(res, 200, data)

    } catch (e) {
      if (e instanceof HttpError) {
        return send(res, e.status, { error: e.message })
      }

      console.error(e)
      send(res, 500, { error: 'Internal server error' })
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const db = openDb()

  purgeExpired(db)
  setInterval(() => purgeExpired(db), 60 * 60 * 1000).unref()

  createServer(createApp(db)).listen(PORT, () => {
    console.log(`Admin API listening on http://localhost:${PORT}`)
  })
}
