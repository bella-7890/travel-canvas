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
  'them',
  'they',
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
  { keywords: ['kyoto', 'japan', 'temple', 'matcha', 'rain', '교토', '일본', '사찰', '말차'], country: 'Japan', city: 'Kyoto', place: 'Temple alley' },
  { keywords: ['seoul', 'korea', 'hanok', 'night', '서울', '한국', '한옥', '밤'], country: 'South Korea', city: 'Seoul', place: 'Night market' },
  { keywords: ['osaka', 'japan', 'street', 'food', '오사카', '일본', '거리'], country: 'Japan', city: 'Osaka', place: 'Neon street' },
  { keywords: ['paris', 'france', 'cafe', 'museum', '파리', '프랑스', '카페', '박물관'], country: 'France', city: 'Paris', place: 'Riverbank cafe' },
  { keywords: ['barcelona', 'spain', 'beach', 'sunset', '바르셀로나', '스페인', '해변'], country: 'Spain', city: 'Barcelona', place: 'Seaside promenade' },
  { keywords: ['bali', 'indonesia', 'surf', 'beach', '발리', '인도네시아', '서핑'], country: 'Indonesia', city: 'Bali', place: 'Ocean view' },
]

function extractPlace(text) {
  const normalized = text.toLowerCase()
  const match = placeMap.find((entry) => entry.keywords.some((keyword) => normalized.includes(keyword)))
  return match ?? { country: 'Unknown', city: 'Hidden city', place: 'Unexpected corner' }
}

function extractKeywords(text) {
  return text
    .split(/[^a-zA-Z가-힣]+/)
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

export function buildImageOptions(city, country) {
  const query = encodeURIComponent(`${city} ${country}`)
  return [
    { id: 'unsplash-1', url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&q=80`, label: `${city} landscape` },
    { id: 'unsplash-2', url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&q=80`, label: `${city} view` },
    { id: 'unsplash-3', url: `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=500&h=300&fit=crop&q=80`, label: `${city} sunset` },
    { id: 'unsplash-4', url: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=300&fit=crop&q=80`, label: `${city} portrait` },
    { id: 'unsplash-5', url: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop&q=80`, label: `${city} nature` },
    { id: 'unsplash-6', url: `https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=500&h=300&fit=crop&q=80`, label: `${city} travel` },
  ]
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
