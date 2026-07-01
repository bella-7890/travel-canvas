import Anthropic from '@anthropic-ai/sdk'

const responseSchema = {
  type: 'object',
  properties: {
    country: { type: 'string' },
    city: { type: 'string' },
    place: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' } },
    hashtags: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['country', 'city', 'place', 'keywords', 'hashtags', 'summary'],
  additionalProperties: false,
}

export async function analyzeStory(title, content, apiKey) {
  if (!apiKey) {
    return null
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  try {
    const response = await client.messages.parse({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system:
        'You are a travel journaling agent. Extract structured trip details from the story: country, city, place, keywords, hashtags, summary.',
      messages: [{ role: 'user', content: `Title: ${title}\nStory: ${content}` }],
      output_config: {
        format: { type: 'json_schema', schema: responseSchema },
      },
    })

    if (response.stop_reason === 'refusal' || !response.parsed_output) {
      return null
    }

    const parsed = response.parsed_output
    return {
      country: parsed.country ?? 'Unknown',
      city: parsed.city ?? 'Hidden city',
      place: parsed.place ?? 'Unexpected corner',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : [],
      summary: parsed.summary ?? '',
    }
  } catch (err) {
    console.error('Claude request failed:', err)
    return null
  }
}
