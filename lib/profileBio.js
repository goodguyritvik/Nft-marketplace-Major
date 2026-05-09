const prefix = 'metanft_bio_'

export function getBio(username) {
  if (typeof window === 'undefined' || !username) return ''
  return window.localStorage.getItem(prefix + username.toLowerCase()) || ''
}

export function setBio(username, text) {
  if (typeof window === 'undefined' || !username) return
  window.localStorage.setItem(prefix + username.toLowerCase(), text.slice(0, 500))
}
