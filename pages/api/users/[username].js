import { connectMongo, isMongoConfigured } from '../../../lib/mongoose'
import User from '../../../models/User'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const username = String(req.query.username || '')
    .trim()
    .toLowerCase()

  if (!username) {
    return res.status(400).json({ error: 'Username required' })
  }

  if (!isMongoConfigured()) {
    return res.status(200).json({
      ok: true,
      source: 'client',
      user: {
        username,
        name: username,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        bio: '',
        favorites: [],
      },
    })
  }

  try {
    await connectMongo()
    let user = await User.findOne({ username }).lean()
    if (!user) {
      user = {
        username,
        name: username,
        image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`,
        bio: '',
        favorites: [],
      }
    }
    return res.status(200).json({ ok: true, source: 'mongo', user })
  } catch (e) {
    console.error(e)
    return res.status(500).json({ error: 'Database error' })
  }
}
