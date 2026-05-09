const MAX_BYTES = 5 * 1024 * 1024

/**
 * Upload an image file to /api/upload (Cloudinary or local fallback).
 * @param {File} file
 * @param {(pct: number) => void} [onProgress] — indeterminate; called with 50 mid-flight
 */
export async function uploadImage(file, onProgress) {
  if (!file || !file.size) throw new Error('No file selected')
  if (!file.type?.startsWith('image/')) throw new Error('Only image files are allowed')
  if (file.size > MAX_BYTES) throw new Error('Image must be 5MB or smaller')

  const body = new FormData()
  body.append('file', file)

  onProgress?.(10)

  const res = await fetch('/api/upload', {
    method: 'POST',
    body,
  })

  onProgress?.(90)

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Upload failed')
  }
  if (!data.url) throw new Error('No URL returned')
  onProgress?.(100)
  return data.url
}
