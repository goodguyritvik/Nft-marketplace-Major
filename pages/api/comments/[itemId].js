import { connectMongo, isMongoConfigured } from '../../../lib/mongoose'
import Comment from '../../../models/Comment'

export default async function handler(req, res) {
  const itemId = Number(req.query.itemId)
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid itemId' })
  }

  if (!isMongoConfigured()) {
    if (req.method === 'GET') {
      return res.status(200).json({ ok: true, source: 'client', comments: [] })
    }
    return res.status(503).json({ error: 'MongoDB not configured' })
  }

  try {
    await connectMongo()
  } catch (e) {
    return res.status(500).json({ error: 'Database connection failed' })
  }

  if (req.method === 'GET') {
    const comments = await Comment.find({ itemId }).sort({ createdAt: -1 }).lean()
    return res.status(200).json({ ok: true, source: 'mongo', comments })
  }

  if (req.method === 'POST') {
    const { userKey, text } = req.body || {}
    if (!userKey || !text) {
      return res.status(400).json({ error: 'userKey and text required' })
    }
    const doc = await Comment.create({
      itemId,
      userKey: String(userKey).slice(0, 200),
      text: String(text).slice(0, 2000),
    })
    return res.status(201).json({ ok: true, comment: doc.toObject() })
  }

  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
