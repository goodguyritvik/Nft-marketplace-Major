import { connectMongo, isMongoConfigured } from '../../lib/mongoose'
import Nft from '../../models/Nft'

function toBool(v) {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

function parseItemIds(raw) {
  if (!raw) return []
  const list = Array.isArray(raw) ? raw : String(raw).split(',')
  return [...new Set(list.map((v) => Number(v)).filter((v) => Number.isFinite(v)))]
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!isMongoConfigured()) {
    return res.status(200).json({ ok: true, source: 'client', nfts: [] })
  }

  try {
    await connectMongo()
    const q = req.method === 'GET' ? req.query : req.body || {}
    const itemIds = parseItemIds(q.itemIds)
    const query = {}

    if (itemIds.length > 0) query.itemId = { $in: itemIds }
    if (q.category) query.category = String(q.category)
    if (q.seller) query.seller = String(q.seller).toLowerCase()
    if (q.owner) query.owner = String(q.owner).toLowerCase()
    const listed = toBool(q.listed)
    if (listed != null) query.listed = listed

    const nfts = await Nft.find(query).sort({ updatedAt: -1 }).lean()
    return res.status(200).json({ ok: true, source: 'mongo', nfts })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Database error' })
  }
}
