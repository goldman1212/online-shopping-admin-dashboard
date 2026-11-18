import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, ShieldCheck, Package, ShoppingCart, CreditCard, Truck, Scan, Megaphone,
  ChartNoAxesCombined, Bell, Headset, Settings, LogOut, Search, PanelLeft, Moon, ChevronDown, Store,
  Wallet, PlugZap, TriangleAlert, Inbox, Footprints, Loader,
} from 'lucide-react'
import { L, LANGS } from './i18n.js'
import { getData, isDemo, store, login, logout as apiLogout, mutate } from './api.js'
import './admin.css'

const NAV = [
  ['overview', LayoutDashboard], ['users', Users], ['sellers', ShieldCheck], ['products', Package], ['orders', ShoppingCart],
  ['payments', CreditCard], ['delivery', Truck], ['tryon', Scan], ['ads', Megaphone], ['analytics', ChartNoAxesCombined],
  ['support', Headset], ['notifications', Bell], ['prefs', Settings],
]
const SECRET = /password|hash|secret|token|key|document/i
const etb = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'ETB', maximumFractionDigits: 0 }).format(n)

function useData(path, dep) {
  const [s, set] = useState({ data: null, error: null, loading: true })
  const [n, setN] = useState(0)
  useEffect(() => {
    let live = true
    set({ data: null, error: null, loading: true })
    getData(path).then((data) => live && set({ data, error: null, loading: false }))
      .catch((error) => live && set({ data: null, error, loading: false }))
    return () => { live = false }
  }, [path, dep, n])
  return { ...s, retry: () => setN((x) => x + 1) }
}

function State({ icon: Icon, title, text, children }) {
  return <div className="state"><Icon /><h4>{title}</h4><p>{text}</p>{children}</div>
}
function Gate({ s, t, children }) {
  if (s.loading) return <State icon={Loader} title={t('loading')} />
  if (s.error) {
    return s.error.message === 'NOT_CONFIGURED'
      ? <State icon={PlugZap} title={t('noApi')} text={t('noApiMsg')} />
      : <State icon={TriangleAlert} title={t('err')} text={s.error.message}><button className="btn ghost" onClick={s.retry}>{t('retry')}</button></State>
  }
  return children
}

function Bars({ rows }) {
  const max = Math.max(...rows.map((r) => r.total), 1)
  return (
    <div className="tw"><svg viewBox={`0 0 ${Math.max(rows.length * 56, 300)} 220`} width="100%" role="img" aria-label="Monthly sales">
      {rows.map((r, i) => {
        const h = (r.total / max) * 160
        return <g key={r.month}><rect x={i * 56 + 10} y={180 - h} width="36" height={h} rx="4" fill="#2563EB"><title>{r.month}: {etb(r.total)}</title></rect>
          <text x={i * 56 + 28} y="200" textAnchor="middle" fontSize="11" fill="#64748B">{r.month}</text></g>
      })}
    </svg></div>
  )
}

function OrdersTable({ rows, t }) {
  const [q, setQ] = useState(''), [st, setSt] = useState('all'), [pg, setPg] = useState(1), [sel, setSel] = useState(null)
  const per = 5
  const f = rows.filter((o) => (st === 'all' || o.paymentStatus === st) && JSON.stringify(o).toLowerCase().includes(q.toLowerCase()))
  const pages = Math.max(1, Math.ceil(f.length / per)), cur = Math.min(pg, pages)
  if (!rows.length) return <State icon={ShoppingCart} title={t('empty')} />
  return (
    <>
      <div className="tools">
        <input aria-label={t('searchOrders')} placeholder={t('searchOrders')} value={q} onChange={(e) => { setQ(e.target.value); setPg(1) }} />
        <select aria-label={t('payment')} value={st} onChange={(e) => { setSt(e.target.value); setPg(1) }}>
          <option value="all">{t('allPay')}</option>
          {[...new Set(rows.map((o) => o.paymentStatus))].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="tw"><table>
        <thead><tr>{['oid', 'buyer', 'product', 'amount', 'payment', 'delivery', 'date', 'action'].map((k) => <th key={k}>{t(k)}</th>)}</tr></thead>
        <tbody>{f.slice((cur - 1) * per, cur * per).map((o) => (
          <tr key={o.id}><td>{o.id}</td><td>{o.buyer}</td><td>{o.product}</td><td>{etb(o.amount)}</td>
            <td><span className="pill">{o.paymentStatus}</span></td><td><span className="pill">{o.deliveryStatus}</span></td>
            <td>{new Date(o.date).toLocaleDateString()}</td><td><button className="btn ghost" onClick={() => setSel(o)}>{t('details')}</button></td></tr>
        ))}</tbody>
      </table></div>
      <div className="pg">
        <button className="btn ghost" disabled={cur < 2} onClick={() => setPg(cur - 1)}>{t('prev')}</button>
        {t('page')} {cur} {t('of')} {pages}
        <button className="btn ghost" disabled={cur >= pages} onClick={() => setPg(cur + 1)}>{t('next')}</button>
      </div>
      {sel && <div className="modal" role="dialog" aria-modal="true" onClick={() => setSel(null)}>
        <div className="card" onClick={(e) => e.stopPropagation()}>
          <h3>{sel.id}</h3>
          <dl>{Object.entries(sel).filter(([k]) => !SECRET.test(k)).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>)}</dl>
          <button className="btn" onClick={() => setSel(null)}>{t('close')}</button>
        </div></div>}
    </>
  )
}

function Overview({ t, dep }) {
  const s = useData('/overview', dep), d = s.data || {}
  const cards = [['users', Users, 'users'], ['sellers', Store, 'sellers'], ['products', Package, 'products'], ['orders', ShoppingCart, 'orders'], ['revenue', Wallet, 'revenue'], ['pending', ShieldCheck, 'pendingVerifications']]
  const os = d.orderStatus || [], tot = os.reduce((a, b) => a + b.count, 0)
  return (
    <>
      <div className="grid stats">{cards.map(([k, Icon, f]) => (
        <div className="card stat" key={k}><div><p>{t(k)}</p><b>{d[f] != null ? (f === 'revenue' ? etb(d[f]) : d[f].toLocaleString('en-US')) : '—'}</b></div><div className="ico"><Icon /></div></div>
      ))}</div>
      <div className="grid two">
        <div className="card"><h3>{t('sales')}</h3><Gate s={s} t={t}>{d.monthlySales?.length ? <Bars rows={d.monthlySales} /> : <State icon={Inbox} title={t('empty')} />}</Gate></div>
        <div className="card"><h3>{t('status')}</h3><Gate s={s} t={t}>{os.map((x) => (
          <div key={x.status} className="bar"><div><span>{x.status}</span><b>{x.count}</b></div><i><u style={{ width: `${tot ? (x.count / tot) * 100 : 0}%` }} /></i></div>
        ))}</Gate></div>
      </div>
      <div className="card"><h3>{t('recent')}</h3><Gate s={s} t={t}><OrdersTable rows={d.recentOrders || []} t={t} /></Gate></div>
    </>
  )
}

function Module({ id, t, dep }) {
  const s = useData('/' + id, dep)
  const [busy, setBusy] = useState(false), [msg, setMsg] = useState('')
  const rows = Array.isArray(s.data) ? s.data : s.data?.items || []
  const acts = ACTIONS[id]
  const run = async (fn) => { setBusy(true); setMsg(''); try { await fn(); s.retry() } catch (e) { setMsg(e.message) } finally { setBusy(false) } }
  if (id === 'orders' && rows.length) return <div className="card"><Gate s={s} t={t}><OrdersTable rows={rows} t={t} /></Gate></div>
  const keys = rows[0] ? Object.keys(rows[0]).filter((k) => !SECRET.test(k)).slice(0, 7) : []
  return (
    <div className="card"><Gate s={s} t={t}>
      {id === 'notifications' && rows.some((r) => !r.is_read) && <div className="tools"><button className="btn" disabled={busy} onClick={() => run(() => mutate('POST', '/notifications/read-all'))}>{t('markRead')}</button></div>}
      {msg && <p role="alert" style={{ color: '#DC2626' }}>{msg}</p>}
      {rows.length ? <div className="tw"><table><thead><tr>{keys.map((k) => <th key={k}>{k}</th>)}{acts && <th>{t('action')}</th>}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={r.id ?? i}>{keys.map((k) => <td key={k}>{String(r[k])}</td>)}
          {acts && <td>{acts.filter(([, , show]) => show(r)).map(([k, body]) => (
            <button key={k} className="btn ghost" disabled={busy} onClick={() => run(() => mutate('PATCH', `/${id}/${r.id}`, body))}>{t(k)}</button>
          ))}</td>}</tr>)}</tbody></table></div>
        : <State icon={Inbox} title={t('empty')} />}
    </Gate></div>
  )
}

function Login({ t, onDone }) {
  const [email, setEmail] = useState(''), [pw, setPw] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setErr('')
    try { await login(email, pw); setPw(''); onDone() } catch (x) { setErr(x.message) } finally { setBusy(false) }
  }
  return (
    <div className="state" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <form className="card f" onSubmit={submit} style={{ width: 'min(360px, 92vw)' }}>
        <div className="logo" style={{ alignSelf: 'center' }}><Footprints /></div>
        <h3 style={{ textAlign: 'center' }}>{t('signin')}</h3>
        <label>{t('email')}<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>{t('password')}<input type="password" autoComplete="current-password" required value={pw} onChange={(e) => setPw(e.target.value)} /></label>
        {err && <p role="alert" style={{ color: '#DC2626', margin: 0 }}>{err}</p>}
        <button className="btn" disabled={busy}>{busy ? t('loading') : t('signin')}</button>
      </form>
    </div>
  )
}

// Row actions per module: [label key, PATCH body, show-when predicate]
const ACTIONS = {
  sellers: [['approve', { status: 'Approved' }, (r) => r.status !== 'Approved'], ['reject', { status: 'Rejected' }, (r) => r.status !== 'Rejected']],
  products: [['approve', { status: 'Approved' }, (r) => r.status !== 'Approved'], ['reject', { status: 'Rejected' }, (r) => r.status !== 'Rejected']],
  users: [['suspend', { status: 'Suspended' }, (r) => r.status === 'Active'], ['reactivate', { status: 'Active' }, (r) => r.status === 'Suspended']],
  support: [['resolve', { status: 'Resolved' }, (r) => r.status === 'Open']],
  ads: [['approve', { status: 'Active' }, (r) => r.status === 'Pending' || r.status === 'Paused'], ['reject', { status: 'Rejected' }, (r) => r.status === 'Pending']],
}

function Prefs({ t, lang, setLang, bump }) {
  const [base, setBase] = useState(store.get('apiBase', ''))
  const [demo, setDemo] = useState(isDemo())
  return (
    <div className="card"><h3>{t('api')}</h3><div className="f">
      <label>{t('lang')}<select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select></label>
      <label className="row"><input type="checkbox" checked={demo} onChange={(e) => { setDemo(e.target.checked); store.set('demo', e.target.checked ? '1' : '0'); bump() }} /> {t('demo')}</label>
      <label>{t('apiUrl')}<input value={base} placeholder="https://your-backend.example.com" onChange={(e) => setBase(e.target.value)} /></label>
      <button className="btn" onClick={() => { store.set('apiBase', base.trim()); bump() }}>{t('save')}</button>
    </div></div>
  )
}

export default function AdminApp() {
  const [lang, setLangS] = useState(store.get('lang', 'en'))
  const [route, setRoute] = useState(location.hash.slice(1) || 'overview')
  const [collapsed, setCollapsed] = useState(false), [drawer, setDrawer] = useState(false), [menu, setMenu] = useState(false)
  const [theme, setTheme] = useState(store.get('theme', '')), [dep, setDep] = useState(0), [gs, setGs] = useState('')
  const [needLogin, setNeedLogin] = useState(false)
  const t = (k) => L[lang][k] ?? L.en[k] ?? k
  const setLang = (l) => { setLangS(l); store.set('lang', l) }
  const me = useData('/me', dep), unread = useData('/notifications/unread-count', dep)
  useEffect(() => { const h = () => { if (!isDemo()) setNeedLogin(true) }; addEventListener('admin:unauthorized', h); return () => removeEventListener('admin:unauthorized', h) }, [])
  useEffect(() => { const h = () => { setRoute(location.hash.slice(1) || 'overview'); setDrawer(false) }; addEventListener('hashchange', h); return () => removeEventListener('hashchange', h) }, [])
  useEffect(() => { if (theme) document.documentElement.dataset.theme = theme; else delete document.documentElement.dataset.theme }, [theme])
  useEffect(() => { document.title = t('n_' + route) + ' – Online Shopping' })
  const title = t('n_' + route)
  const search = (e) => {
    if (e.key !== 'Enter' || !gs.trim()) return
    const m = NAV.find(([id]) => t('n_' + id).toLowerCase().includes(gs.trim().toLowerCase()))
    if (m) { location.hash = m[0]; setGs('') }
  }
  const logout = async () => { await apiLogout(); setNeedLogin(!isDemo()); setDep((x) => x + 1); location.hash = 'overview'; setMenu(false) }
  if (needLogin && !isDemo()) return <Login t={t} onDone={() => { setNeedLogin(false); setDep((x) => x + 1) }} />
  return (
    <div className={'app' + (collapsed ? ' collapsed' : '') + (drawer ? ' open-nav' : '')}>
      <aside aria-label="Main navigation">
        <div className="brand"><div className="logo"><Footprints /></div><span>ONLINE SHOPPING</span></div>
        <nav>{NAV.map(([id, Icon]) => <a key={id} href={'#' + id} className={route === id ? 'on' : ''} title={t('n_' + id)}><Icon /><span className="lbl">{t('n_' + id)}</span></a>)}</nav>
        <div className="foot"><button onClick={logout}><LogOut /><span className="lbl">{t('logout')}</span></button></div>
      </aside>
      {drawer && <div className="scrim" onClick={() => setDrawer(false)} />}
      <div className="main">
        <header>
          <button className="ib" aria-label="Toggle sidebar" onClick={() => (matchMedia('(max-width:900px)').matches ? setDrawer(!drawer) : setCollapsed(!collapsed))}><PanelLeft /></button>
          <div className="crumb"><small>Admin{route !== 'overview' && ' / ' + title}</small><h1>{title}</h1></div>
          <div className="search"><Search /><input aria-label="Global search" placeholder={t('search')} value={gs} onChange={(e) => setGs(e.target.value)} onKeyDown={search} /></div>
          <button className="ib" aria-label={t('theme')} onClick={() => { const n = (theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) === 'dark' ? 'light' : 'dark'; setTheme(n); store.set('theme', n) }}><Moon /></button>
          <select className="ib" aria-label={t('lang')} value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map(([c, n]) => <option key={c} value={c}>{n}</option>)}</select>
          <a className="ib" href="#notifications" aria-label={t('n_notifications')}><Bell />{unread.data?.count > 0 && <span className="badge">{unread.data.count}</span>}</a>
          <div className="menu">
            <button className="ib" aria-haspopup="true" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <span className="av">{(me.data?.name || 'A')[0]}</span>
              <span className="who">{me.data?.name || 'Admin'}<small>{me.data?.role || '—'}</small></span><ChevronDown />
            </button>
            {menu && <div className="drop">
              <a href="#prefs" onClick={() => setMenu(false)}><Settings />{t('n_prefs')}</a>
              <button onClick={logout}><LogOut />{t('logout')}</button>
            </div>}
          </div>
        </header>
        {isDemo() && <div className="demo">{t('demoBanner')}</div>}
        <main>
          {route === 'overview' ? <Overview t={t} dep={dep} />
            : route === 'prefs' ? <Prefs t={t} lang={lang} setLang={setLang} bump={() => setDep((x) => x + 1)} />
            : <Module key={route + dep} id={route} t={t} dep={dep} />}
        </main>
      </div>
    </div>
  )
}
