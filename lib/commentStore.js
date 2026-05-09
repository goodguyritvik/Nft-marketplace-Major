const KEY = 'metanft_comments_v1'

function readAll() {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(window.localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

function writeAll(data) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEY, JSON.stringify(data))
}

export function getLocalComments(itemId) {
  const all = readAll()
  return Array.isArray(all[String(itemId)]) ? all[String(itemId)] : []
}

export function addLocalComment(itemId, { userKey, text }) {
  const all = readAll()
  const id = String(itemId)
  const list = Array.isArray(all[id]) ? all[id] : []
  list.push({
    userKey,
    text,
    createdAt: new Date().toISOString(),
  })
  all[id] = list
  writeAll(all)
  return list
}
