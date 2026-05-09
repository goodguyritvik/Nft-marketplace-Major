import { normalizeCategory } from './categories'

export function mockDescribe(imageUrl, category) {
  const cat = normalizeCategory(category)
  const seed = (imageUrl || '').slice(-8) || 'nft'
  return {
    title: `${cat} Piece #${seed.slice(0, 4)}`,
    description: `A striking ${cat.toLowerCase()} work with bold composition and rich detail. Inspired by contemporary digital culture — perfect for collectors who value originality.`,
    tags: [cat, 'digital', 'collectible', 'metanft'],
  }
}

export function mockSuggestPrice(category, description = '', tags = []) {
  const cat = normalizeCategory(category)
  const base = {
    Art: 0.12,
    Gaming: 0.18,
    Photography: 0.15,
    Music: 0.14,
    Memes: 0.08,
    Collectibles: 0.22,
  }[cat] || 0.1
  const len = (description || '').length
  const bonus = Math.min(0.05, len / 2000)
  const tagBonus = Math.min(0.03, (tags?.length || 0) * 0.01)
  const price = (base + bonus + tagBonus).toFixed(3)
  return { price, currency: 'ETH', rationale: `Baseline for ${cat} plus metadata richness.` }
}
