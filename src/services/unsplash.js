export async function searchUnsplashImages(query, count = 6) {
  const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY
  if (!accessKey) {
    return []
  }

  const response = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}`,
    {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    },
  )

  if (!response.ok) {
    return []
  }

  const data = await response.json()
  return (data.results || []).map((item, index) => ({
    id: `${item.id}-${index}`,
    url: item.urls?.regular || '',
    label: item.alt_description || query,
  }))
}
