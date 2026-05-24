export function closeTab(panicUrl) {
  const target = panicUrl || 'https://google.com'

  try { localStorage.clear() } catch {}
  try { sessionStorage.clear() } catch {}

  document.cookie.split(';').forEach(c => {
    const name = c.split('=')[0].trim()
    if (name) document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
  })

  try {
    if (indexedDB.databases) {
      indexedDB.databases().then(dbs =>
        dbs.forEach(db => { try { indexedDB.deleteDatabase(db.name) } catch {} })
      ).catch(() => {})
    }
  } catch {}

  try {
    if (window.caches) {
      caches.keys().then(keys =>
        keys.forEach(k => { try { caches.delete(k) } catch {} })
      ).catch(() => {})
    }
  } catch {}

  try { history.replaceState(null, '', '/') } catch {}

  document.documentElement.innerHTML =
    '<style>*{margin:0;padding:0;border:0}html,body{background:#000;height:100%}</style>'

  window.location.replace(target)
}
