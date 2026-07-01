const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

function normalizeJson(text) {
  const trimmed = text.trim()
  const match = trimmed.match(/```json\s*([\s\S]*?)\s*```/)
  if (match) {
    return match[1].trim()
  }
  return trimmed
}

export async function analyzeStory(title, content, apiKey) {
  if (!apiKey) {
    return null
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      messages: [
        {
          role: 'system',
          content:
            'You are a travel journaling agent. Return compact JSON with country, city, place, keywords (array), hashtags (array), summary.',
        },
        {
          role: 'user',
          content: `Title: ${title}\nStory: ${content}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error('OpenAI request failed')
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content ?? '{}'

  try {
    const parsed = JSON.parse(normalizeJson(raw))
    return {
      country: parsed.country ?? 'Unknown',
      city: parsed.city ?? 'Hidden city',
      place: parsed.place ?? 'Unexpected corner',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      summary: parsed.summary ?? '',
    }
  } catch {
    return null
  }
}
