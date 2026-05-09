import fs from 'fs'
import path from 'path'
import { v2 as cloudinary } from 'cloudinary'
import formidable from 'formidable'
import { hasCloudinary } from '../../lib/env'

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_BYTES = 5 * 1024 * 1024

function ensureUploadDir() {
  const dir = path.join(process.cwd(), 'public', 'uploads')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const form = formidable({
    maxFileSize: MAX_BYTES,
    keepExtensions: true,
    filter: ({ mimetype, originalFilename }) => {
      if (!mimetype || !mimetype.startsWith('image/')) return false
      if (!originalFilename) return true
      return /\.(jpe?g|png|gif|webp|svg)$/i.test(originalFilename)
    },
  })

  let fields
  let files
  try {
    ;[fields, files] = await form.parse(req)
  } catch (e) {
    const msg = e?.message || 'Invalid upload'
    const code = e?.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    return res.status(code).json({ error: msg })
  }

  const file = files.file?.[0] || files.file
  const f = Array.isArray(file) ? file[0] : file
  if (!f || !f.filepath) {
    return res.status(400).json({ error: 'Missing file field "file"' })
  }

  if (f.size > MAX_BYTES) {
    try {
      fs.unlinkSync(f.filepath)
    } catch {
      // ignore
    }
    return res.status(413).json({ error: 'File too large (max 5MB)' })
  }

  try {
    if (hasCloudinary()) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      })
      const result = await cloudinary.uploader.upload(f.filepath, {
        folder: 'metanft',
        resource_type: 'image',
      })
      try {
        fs.unlinkSync(f.filepath)
      } catch {
        // ignore
      }
      return res.status(200).json({ url: result.secure_url || result.url })
    }

    const ext = path.extname(f.originalFilename || '').toLowerCase() || '.bin'
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext)
      ? ext
      : '.png'
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`
    const dir = ensureUploadDir()
    const dest = path.join(dir, name)
    fs.copyFileSync(f.filepath, dest)
    try {
      fs.unlinkSync(f.filepath)
    } catch {
      // ignore
    }
    const url = `/uploads/${name}`
    return res.status(200).json({ url })
  } catch (err) {
    console.error('upload error', err)
    try {
      fs.unlinkSync(f.filepath)
    } catch {
      // ignore
    }
    return res.status(500).json({ error: 'Upload failed' })
  }
}
