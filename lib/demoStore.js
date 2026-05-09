/**
 * localStorage-backed demo marketplace. Safe for viva when chain is down.
 */

import { normalizeCategory } from './categories'

const STORAGE_KEY = 'metanft_demo_v1'
const LIKES_KEY = 'metanft_demo_likes_v1'

const DEMO_USER = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}

function nowIso() {
  return new Date().toISOString()
}

function defaultSeedItems() {
  const imgs = [
    'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=800&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80',
    'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800&q=80',
  ]
  const categories = [
    'Art',
    'Gaming',
    'Photography',
    'Music',
    'Memes',
    'Collectibles',
  ]
  const names = [
    'Cosmic Artifact',
    'Neon Drift',
    'Pixel Legend',
    'Synthwave Keys',
    'Doge Classic',
    'Golden Relic',
  ]
  const creators = [
    'Studio Nova',
    'Glitch Labs',
    'PlayerOne',
    'AudioVoid',
    'MemeDAO',
    'Vault Co.',
  ]

  return names.map((name, idx) => {
    const category = categories[idx]
    const metadata = {
      name,
      description: `A curated ${category} piece for the MetaNFT demo marketplace.`,
      image: imgs[idx],
      category,
      creatorName: creators[idx],
      tags: [category, 'demo', 'metanft'],
    }
    const itemId = idx + 1
    const priceWei = (0.05 + idx * 0.02).toFixed(2)
    return {
      itemId,
      tokenId: itemId,
      nftContract: '0x000000000000000000000000000000000000dEaD',
      price: priceWei,
      seller: DEMO_USER,
      owner: `0x${'0'.repeat(40)}`,
      sold: false,
      tokenURI: JSON.stringify(metadata),
      createdAt: new Date(Date.now() - (6 - idx) * 86400000).toISOString(),
      transactions: [
        {
          type: 'mint',
          from: '0x0000000000000000000000000000000000000000',
          to: DEMO_USER,
          ts: new Date(Date.now() - (6 - idx) * 86400000).toISOString(),
        },
        {
          type: 'list',
          from: DEMO_USER,
          to: `0x${'0'.repeat(40)}`,
          price: priceWei,
          ts: new Date(Date.now() - (6 - idx) * 86400000 + 60000).toISOString(),
        },
      ],
    }
  })
}

export function readRawStore() {
  if (typeof window === 'undefined') return { items: defaultSeedItems(), seeded: true }
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const items = defaultSeedItems()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
    return { items, seeded: true }
  }
  const data = safeParse(raw, { items: [] })
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    const items = defaultSeedItems()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
    return { items, seeded: true }
  }
  return { items: data.items, seeded: false }
}

function writeItems(items) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }))
}

export function parseItemMetadata(tokenURI) {
  let metadata = {
    name: 'Unknown NFT',
    description: 'No description available',
    image:
      'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?q=80&w=1200&auto=format&fit=crop',
    category: 'Art',
    creatorName: 'Unknown',
    tags: [],
  }
  if (!tokenURI) return metadata
  try {
    const parsed = JSON.parse(tokenURI)
    metadata = {
      ...metadata,
      ...parsed,
      category: normalizeCategory(parsed.category),
      creatorName: parsed.creatorName || parsed.creator || metadata.creatorName,
    }
  } catch {
    // leave defaults
  }
  return metadata
}

function zeroAddr(a) {
  if (!a) return true
  return String(a).toLowerCase() === `0x${'0'.repeat(40)}`
}

/** Normalize demo row to same shape as chain mapper */
export function normalizeDemoItem(row) {
  const meta = parseItemMetadata(row.tokenURI)
  const listed = !row.sold && zeroAddr(row.owner)
  return {
    itemId: Number(row.itemId),
    tokenId: row.tokenId != null ? Number(row.tokenId) : Number(row.itemId),
    nftContract: row.nftContract,
    price: String(row.price),
    seller: row.seller,
    owner: row.owner,
    sold: Boolean(row.sold),
    tokenURI: row.tokenURI,
    createdAt: row.createdAt || nowIso(),
    image: meta.image,
    name: meta.name,
    description: meta.description,
    category: meta.category,
    creatorName: meta.creatorName,
    tags: meta.tags || [],
    transactions: row.transactions || [],
    listed,
  }
}

/** All items including sold — for profile & analytics */
export function fetchDemoAllItems() {
  const { items } = readRawStore()
  return items.map(normalizeDemoItem)
}

export function fetchDemoMarketItems() {
  const { items } = readRawStore()
  return items
    .filter((i) => !i.sold && zeroAddr(i.owner))
    .map(normalizeDemoItem)
}

export function fetchDemoMyNfts(address) {
  const addr = (address || DEMO_USER).toLowerCase()
  const { items } = readRawStore()
  return items
    .filter((i) => {
      const o = (i.owner || '').toLowerCase()
      const s = (i.seller || '').toLowerCase()
      return o === addr || s === addr
    })
    .map(normalizeDemoItem)
}

export function fetchDemoNft(itemId) {
  const { items } = readRawStore()
  const row = items.find((i) => Number(i.itemId) === Number(itemId))
  if (!row) return null
  return normalizeDemoItem(row)
}

export function mintDemoNft({
  name,
  description,
  image,
  price,
  category,
  creatorName,
  tags = [],
}) {
  const { items } = readRawStore()
  const nextId =
    items.reduce((m, i) => Math.max(m, Number(i.itemId) || 0), 0) + 1
  const meta = {
    name,
    description,
    image,
    category: normalizeCategory(category),
    creatorName: creatorName || 'Demo Creator',
    tags,
  }
  const row = {
    itemId: nextId,
    tokenId: nextId,
    nftContract: '0x000000000000000000000000000000000000dEaD',
    price: String(price).trim(),
    seller: DEMO_USER,
    owner: `0x${'0'.repeat(40)}`,
    sold: false,
    tokenURI: JSON.stringify(meta),
    createdAt: nowIso(),
    transactions: [
      {
        type: 'mint',
        from: `0x${'0'.repeat(40)}`,
        to: DEMO_USER,
        ts: nowIso(),
      },
      {
        type: 'list',
        from: DEMO_USER,
        to: `0x${'0'.repeat(40)}`,
        price: String(price).trim(),
        ts: nowIso(),
      },
    ],
  }
  items.push(row)
  writeItems(items)
  return normalizeDemoItem(row)
}

export function buyDemoNft(itemId, buyerAddress) {
  const buyer = (buyerAddress || DEMO_USER).toLowerCase()
  const { items } = readRawStore()
  const idx = items.findIndex((i) => Number(i.itemId) === Number(itemId))
  if (idx === -1) throw new Error('NFT not found')
  const row = items[idx]
  if (row.sold || !zeroAddr(row.owner)) throw new Error('Not for sale')
  row.owner = buyer
  row.sold = true
  row.transactions = row.transactions || []
  row.transactions.push({
    type: 'sale',
    from: row.seller,
    to: buyer,
    price: row.price,
    ts: nowIso(),
  })
  items[idx] = row
  writeItems(items)
  return normalizeDemoItem(row)
}

export function getLikesMap() {
  if (typeof window === 'undefined') return {}
  return safeParse(window.localStorage.getItem(LIKES_KEY) || '{}', {})
}

export function setLikesMap(map) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(LIKES_KEY, JSON.stringify(map))
}

export function toggleDemoLike(itemId, userKey = 'anon') {
  const map = getLikesMap()
  const key = String(itemId)
  const arr = Array.isArray(map[key]) ? map[key] : []
  const i = arr.indexOf(userKey)
  if (i >= 0) arr.splice(i, 1)
  else arr.push(userKey)
  map[key] = arr
  setLikesMap(map)
  return arr.length
}

export function getDemoLikeCount(itemId) {
  const map = getLikesMap()
  const arr = map[String(itemId)]
  return Array.isArray(arr) ? arr.length : 0
}

export function isDemoLiked(itemId, userKey = 'anon') {
  const map = getLikesMap()
  const arr = map[String(itemId)]
  return Array.isArray(arr) && arr.includes(userKey)
}

export const DEMO_DEFAULT_ADDRESS = DEMO_USER
