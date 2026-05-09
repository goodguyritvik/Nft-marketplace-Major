const KEY = 'metanft_favorites_v1'

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

export function getFavoriteIds(userKey = 'anon') {
  const all = readAll()
  const arr = all[userKey]
  return Array.isArray(arr) ? arr : []
}

export function isFavorite(itemId, userKey = 'anon') {
  return getFavoriteIds(userKey).includes(Number(itemId))
}

export function toggleFavorite(itemId, userKey = 'anon') {
  const id = Number(itemId)
  const all = readAll()
  const key = userKey
  const list = Array.isArray(all[key]) ? [...all[key]] : []
  const i = list.indexOf(id)
  if (i >= 0) list.splice(i, 1)
  else list.push(id)
  all[key] = list
  writeAll(all)
  return list
}
