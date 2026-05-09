import { mockDescribe } from '../../../lib/aiMock'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { imageUrl, category } = req.body || {}
  if (!imageUrl || typeof imageUrl !== 'string') {
    return res.status(400).json({ error: 'imageUrl required' })
  }

  const provider = (process.env.AI_PROVIDER || '').toLowerCase()
  const preferGrok = provider === 'grok' || provider === 'xai'
  const grokKey = process.env.GROK_API_KEY
  const openAiKey = process.env.OPENAI_API_KEY
  const key = (preferGrok ? grokKey : null) || openAiKey || grokKey

  if (!key) {
    return res.status(200).json(mockDescribe(imageUrl, category))
  }

  const useGrok = preferGrok || (!openAiKey && Boolean(grokKey))
  const baseUrl = useGrok
    ? process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
    : process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
  const model = useGrok
    ? process.env.GROK_MODEL || 'grok-2-latest'
    : process.env.OPENAI_MODEL || 'gpt-4o-mini'

  try {
    const body = {
      model,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are an NFT listing assistant. Category hint: ${category || 'Art'}. Return ONLY valid JSON with keys: title (string), description (string), tags (array of 3-6 short strings). No markdown.`,
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl },
            },
          ],
        },
      ],
      max_tokens: 400,
    }

    const r = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await r.json()
    if (!r.ok) {
      console.error(`${useGrok ? 'Grok' : 'OpenAI'} error`, data)
      return res.status(200).json(mockDescribe(imageUrl, category))
    }

    const text = data.choices?.[0]?.message?.content?.trim() || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    if (parsed?.title && parsed?.description) {
      return res.status(200).json({
        title: parsed.title,
        description: parsed.description,
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      })
    }
    return res.status(200).json(mockDescribe(imageUrl, category))
  } catch (e) {
    console.error(e)
    return res.status(200).json(mockDescribe(imageUrl, category))
  }
}
