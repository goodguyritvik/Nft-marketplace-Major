import { mockSuggestPrice } from '../../../lib/aiMock'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { category, description, tags } = req.body || {}

  const provider = (process.env.AI_PROVIDER || '').toLowerCase()
  const preferGrok = provider === 'grok' || provider === 'xai'
  const grokKey = process.env.GROK_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY
  const key = (preferGrok ? grokKey : null) || openAiKey || grokKey

  if (!key) {
    return res.status(200).json(mockSuggestPrice(category, description, tags))
  }

  const useGrok = preferGrok || (!openAiKey && Boolean(grokKey))
  const baseUrl = useGrok
    ? process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
    : process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = useGrok
    ? process.env.GROK_MODEL || 'grok-2-latest'
    : process.env.OPENAI_MODEL || 'gpt-4o-mini'

  try {
    const prompt = `Suggest a fair listing price in ETH as a decimal number only for an NFT in category "${category || 'Art'}". Description length: ${(description || '').length}. Tags: ${(tags || []).join(', ')}. Reply JSON only: {"price":"0.123","currency":"ETH","rationale":"one sentence"}`

    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      }),
    })
    const data = await r.json()
    const text = data.choices?.[0]?.message?.content?.trim() || ''
    const m = text.match(/\{[\s\S]*\}/)
    if (m) {
      const parsed = JSON.parse(m[0])
      if (parsed.price) return res.status(200).json(parsed)
    }
  } catch (e) {
    console.error(e)
  }
  return res.status(200).json(mockSuggestPrice(category, description, tags))
}
