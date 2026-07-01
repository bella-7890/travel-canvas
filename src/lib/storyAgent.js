const stopWords = new Set([
  'the',
  'and',
  'with',
  'that',
  'this',
  'were',
  'was',
  'from',
  'into',
  'through',
  'around',
  'after',
  'before',
  'during',
  'while',
  'have',
  'been',
  'about',
  'when',
  'then',
  'where',
  'there',
  'their',
  'your',
  'very',
  'just',
  'will',
  'would',
  'could',
  'should',
  'only',
  'over',
  'under',
  'into',
  'them',
  'they',
  'ours',
  'some',
  'made',
  'felt',
  'took',
  'went',
  'trip',
  'journey',
  'travel',
])

const placeMap = [
  {
    keywords: ['kyoto', 'japan', 'temple', 'matcha', 'rain'],
    country: 'Japan',
    city: 'Kyoto',
    place: 'Temple alley',
    imageSeed: 'kyoto',
  },
  {
    keywords: ['seoul', 'korea', 'hanok', 'night'],
    country: 'South Korea',
    city: 'Seoul',
    place: 'Night market',
    imageSeed: 'seoul',
  },
  {
    keywords: ['osaka', 'japan', 'street', 'food'],
    country: 'Japan',
    city: 'Osaka',
    place: 'Neon street',
    imageSeed: 'osaka',
  },
  {
    keywords: ['paris', 'france', 'cafe', 'museum'],
    country: 'France',
    city: 'Paris',
    place: 'Riverbank caf?',
    imageSeed: 'paris',
  },
  {
    keywords: ['barcelona', 'spain', 'beach', 'sunset'],
    country: 'Spain',
    city: 'Barcelona',
    place: 'Seaside promenade',
    imageSeed: 'barcelona',
  },
  {
    keywords: ['bali', 'indonesia', 'surf', 'beach'],
    country: 'Indonesia',
    city: 'Bali',
    place: 'Ocean view',
    imageSeed: 'bali',
  },
]

function extractPlace(text) {
  const normalized = text.toLowerCase()
  const match = placeMap.find((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword)),
  )

  return match ?? {
    country: 'Unknown',
    city: 'Hidden city',
    place: 'Unexpected corner',
    imageSeed: 'travel',
  }
}

function extractKeywords(text) {
  return text
    .split(/[^a-zA-Z°¡-ÆR]+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3)
    .filter((word) => !stopWords.has(word.toLowerCase()))
    .slice(0, 6)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
}

function createHashtags(city, place, keywords) {
  const tags = [city, place, ...keywords.slice(0, 3)]
  return tags.map((tag) => `#${tag.replace(/\s+/g, '')}`)
}

function summarize(text) {
  const sentence = text.split(/(?<=[.!?])\s+/).find(Boolean) ?? text
  return sentence.trim().slice(0, 120)
}

export function generateStoryDraft(title, content) {
  const place = extractPlace(content)
  const keywords = extractKeywords(content)
  const storyTitle = title.trim() || 'Untitled journey'
  const storyContent = content.trim()

  return {
    id: crypto.randomUUID(),
    title: storyTitle,
    content: storyContent,
    country: place.country,
    city: place.city,
    place: place.place,
    summary: summarize(storyContent),
    hashtags: createHashtags(place.city, place.place, keywords),
    heroImage: '',
    createdAt: new Date().toISOString(),
  }
}

export function buildImageOptions(city, country) {
  const seed = city.toLowerCase().replace(/\s+/g, '') || country.toLowerCase()
  const base = [
    `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80&sat=-20`,
    `https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80`,
    `https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80`,
    `https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80`,
    `https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80`,
    `https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&w=900&q=80`,
  ]

  return base.map((url, index) => ({
    id: `${seed}-${index}`,
    url: `${url}&ixlib=rb-4.0.3&ixid=${seed}`,
    label: `${city} scene ${index + 1}`,
  }))
}
