import { connectMongo, isMongoConfigured } from '../../../lib/mongoose'
import Nft from '../../../models/Nft'

function normalizeString(v, max = 5000) {
  if (v == null) return undefined
  return String(v).slice(0, max)
}

function normalizeBool(v) {
  if (typeof v === 'boolean') return v
  if (v === 'true') return true
  if (v === 'false') return false
  return undefined
}

function normalizePayload(itemId, body) {
  const payload = { itemId }

  const tokenId = Number(body.tokenId)
  if (Number.isFinite(tokenId)) payload.tokenId = tokenId

  const listed = normalizeBool(body.listed)
  if (listed != null) payload.listed = listed

  const sold = normalizeBool(body.sold)
  if (sold != null) payload.sold = sold

  const fields = [
    'name',
    'description',
    'image',
    'category',
    'price',
    'creatorName',
    'owner',
    'seller',
    'tokenURI',
    'nftContract',
    'txHash',
    'network',
    'mintedBy',
    'createdAt',
    'lastSyncedAt',
  ]

  for (const field of fields) {
    const value = normalizeString(body[field])
    if (value !== undefined) payload[field] = value
  }

  if (Array.isArray(body.tags)) {
    payload.tags = body.tags
      .map((t) => normalizeString(t, 100))
      .filter(Boolean)
      .slice(0, 30)
  }

  if (Array.isArray(body.transactions)) {
    payload.transactions = body.transactions.slice(0, 200)
  }

  return payload
}

export default async function handler(req, res) {
  const itemId = Number(req.query.itemId)
  if (Number.isNaN(itemId)) {
    return res.status(400).json({ error: 'Invalid itemId' })
  }

  if (req.method === 'GET') {
    if (!isMongoConfigured()) {
      return res.status(200).json({ ok: true, source: 'client', nft: null })
    }
    try {
      await connectMongo()
      const nft = await Nft.findOne({ itemId }).lean()
      return res.status(200).json({ ok: true, source: 'mongo', nft })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'PUT' || req.method === 'POST') {
    if (!isMongoConfigured()) {
      return res.status(503).json({ error: 'MongoDB not configured' })
    }
    try {
      await connectMongo()
      const body = typeof req.body === 'object' ? req.body : {}
      const payload = normalizePayload(itemId, body)
      const nft = await Nft.findOneAndUpdate(
        { itemId },
        { $set: payload },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
      return res.status(200).json({ ok: true, source: 'mongo', nft })
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  res.setHeader('Allow', 'GET, PUT, POST')
  return res.status(405).json({ error: 'Method not allowed' })
}
