import { connectMongo, isMongoConfigured } from '../../lib/mongoose'
import Like from '../../models/Like'

export default async function handler(req, res) {
  const itemId = Number(
    req.method === 'GET' ? req.query.itemId : req.body?.itemId
  )
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid itemId' })
  }

  if (!isMongoConfigured()) {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, source: 'client', count: 0, liked: false })
    }
    return res.status(503).json({ error: 'MongoDB not configured — likes use client storage in demo mode' })
  }

  try {
    await connectMongo()
  } catch (e) {
    return res.status(500).json({ error: 'Database connection failed' })
  }

  if (req.method === 'GET') {
    const userKey = String(req.query.userKey || '')
    const count = await Like.countDocuments({ itemId })
    const liked =
      userKey &&
      (await Like.exists({
        itemId,
        userKey,
      }))
    return res.status(200).json({ ok: true, source: 'mongo', count, liked: Boolean(liked) })
  }

  if (req.method === 'POST') {
    const userKey = String(req.body?.userKey || '')
    if (!userKey) return res.status(400).json({ error: 'userKey required' })
    const existing = await Like.findOne({ itemId, userKey })
    if (existing) {
      await existing.deleteOne()
    } else {
      await Like.create({ itemId, userKey })
    }
    const count = await Like.countDocuments({ itemId })
    return res.status(200).json({ ok: true, count, liked: !existing })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
