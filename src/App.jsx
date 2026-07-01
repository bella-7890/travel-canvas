import { useEffect, useMemo, useState } from 'react'
import './App.css'
import ApiKeyPanel from './components/ApiKeyPanel'
import { buildImageOptions, generateStoryDraft } from './lib/storyAgent.clean'
import { analyzeStory } from './services/claude'
import { searchUnsplashImages } from './services/unsplash'

const STORAGE_KEY = 'travelcanvas-stories'
const envAnthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const envUnsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || ''

function App() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [stories, setStories] = useState([])
  const [selectedStory, setSelectedStory] = useState(null)
  const [imageOptions, setImageOptions] = useState([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [status, setStatus] = useState('Write a travel note and let the agent craft a story.')
  const [apiKey] = useState(envAnthropicKey)
  const [unsplashKey] = useState(envUnsplashKey)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setStories(parsed)
          if (parsed[0]) {
            setSelectedStory(parsed[0])
          }
        } catch {
          localStorage.removeItem(STORAGE_KEY)
        }
      }
    } catch (err) {
      console.warn('localStorage unavailable:', err)
    }
  }, [])

  useEffect(() => {
    if (stories.length) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stories))
      } catch (err) {
        console.warn('Failed to save stories:', err)
      }
    }
  }, [stories])

  const latestStory = useMemo(() => stories[0] ?? null, [stories])
  const mode = apiKey || unsplashKey ? 'live' : 'demo'

  const handleGenerate = async () => {
    if (!title.trim() || !content.trim()) {
      setStatus('Please add both a title and a travel note.')
      return
    }

    setIsGenerating(true)
    setStatus('AI agent is analyzing your journey...')

    try {
      const aiResult = await analyzeStory(title, content, apiKey)
      const fallbackDraft = generateStoryDraft(title, content)
      const draft = aiResult && aiResult.country && aiResult.city
        ? {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            title: title.trim() || fallbackDraft.title,
            content: content.trim(),
            country: aiResult.country,
            city: aiResult.city,
            place: aiResult.place || fallbackDraft.place,
            summary: aiResult.summary || fallbackDraft.summary,
            keywords: Array.isArray(aiResult.keywords) && aiResult.keywords.length ? aiResult.keywords : fallbackDraft.keywords,
            hashtags: Array.isArray(aiResult.hashtags) && aiResult.hashtags.length ? aiResult.hashtags : fallbackDraft.hashtags,
            heroImage: '',
          }
        : fallbackDraft

      const imageQuery = `${draft.city} ${draft.place}`
      const options = await searchUnsplashImages(imageQuery, 6)
      const fallbackOptions = buildImageOptions(draft.city, draft.country)
      setImageOptions(options.length ? options : fallbackOptions)
      setSelectedStory(draft)
      setStatus('Choose a hero image to complete the story card.')
    } catch (err) {
      console.error('Generation error:', err)
      const fallbackDraft = generateStoryDraft(title, content)
      const fallbackOptions = buildImageOptions(fallbackDraft.city, fallbackDraft.country)
      setImageOptions(fallbackOptions)
      setSelectedStory(fallbackDraft)
      setStatus('Demo mode: the agent generated a local story draft.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleClearData = () => {
    if (window.confirm('���� ��� ���丮�� �����Ͻðڽ��ϱ�?')) {
      try {
        localStorage.removeItem(STORAGE_KEY)
        setStories([])
        setSelectedStory(null)
        setTitle('')
        setContent('')
        setImageOptions([])
        setStatus('All data cleared. Start fresh!')
      } catch (err) {
        console.error('Failed to clear data:', err)
      }
    }
  }

  const handleSelectImage = (image) => {
    if (!selectedStory) {
      return
    }

    const nextStory = {
      ...selectedStory,
      heroImage: image.url,
    }

    const existingIndex = stories.findIndex((s) => s.id === nextStory.id)
    const nextStories = existingIndex >= 0
      ? stories.map((s) => (s.id === nextStory.id ? nextStory : s))
      : [nextStory, ...stories]

    setStories(nextStories)
    setSelectedStory(nextStory)
    setStatus('Story saved! Click timeline items to preview.')
  }

  return (
    <div className="app-shell">
      <header className="hero-banner">
        <div>
          <p className="eyebrow">AI Agent Travel Journal</p>
          <h1>TravelCanvas Lite</h1>
          <p className="hero-copy">Write once. Let AI illustrate your journey.</p>
        </div>
        <div className="hero-pill">{stories.length} Stories</div>
      </header>

      <main className="grid-layout">
        <section className="card form-card">
          <div className="section-heading">
            <h2>Write Story</h2>
            <span>300-500 characters recommended</span>
          </div>
          <label className="field-label" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="A rainy morning in Kyoto"
          />
          <label className="field-label" htmlFor="content">
            Travel note
          </label>
          <textarea
            id="content"
            rows="10"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Describe the place, mood, food, and moments you want to remember."
          />
          <button type="button" onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Thinking...' : 'Find AI images'}
          </button>
          <p className="status-text">{status}</p>
        </section>

        <section className="card preview-card">
          <div className="section-heading">
            <h2>Story Preview</h2>
            <span>Agent output</span>
          </div>
          {selectedStory ? (
            <div className="story-preview">
              {selectedStory.heroImage ? (
                <img src={selectedStory.heroImage} alt={selectedStory.title} />
              ) : (
                <div className="image-placeholder">Hero image will appear here</div>
              )}
              <div className="story-meta">
                <p className="eyebrow">{selectedStory.city}, {selectedStory.country}</p>
                <h3>{selectedStory.title}</h3>
                <p>{selectedStory.summary}</p>
                <div className="tag-row">
                  {selectedStory.hashtags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-state">Your generated story will appear here.</p>
          )}
        </section>
      </main>

      <ApiKeyPanel
        apiKey={apiKey}
        unsplashKey={unsplashKey}
        mode={mode}
        onClearData={handleClearData}
      />

      <section className="card image-card">
        <div className="section-heading">
          <h2>AI Image Picker</h2>
          <span>Choose one image as the hero shot</span>
        </div>
        <div className="image-grid">
          {imageOptions.map((image) => (
            <button key={image.id} type="button" className="image-option" onClick={() => handleSelectImage(image)}>
              <img src={image.url} alt={image.label} />
            </button>
          ))}
        </div>
      </section>

      <section className="card timeline-card">
        <div className="section-heading">
          <h2>Timeline</h2>
          <span>Recent travel stories</span>
        </div>
        {stories.length ? (
          <div className="timeline-list">
            {stories.map((story) => (
              <article 
                key={story.id} 
                className="timeline-item" 
                onClick={() => {
                  console.log('Clicked story:', story)
                  setSelectedStory(story)
                }}
              >
                <div>
                  <p className="eyebrow">{new Date(story.createdAt).toLocaleDateString()}</p>
                  <h3>{story.title}</h3>
                  <p>{story.city}, {story.country}</p>
                </div>
                <div className="timeline-arrow">{'=>'}</div>
              </article>
            ))}
          </div>
        ) : (
          <p className="empty-state">No stories yet. Create your first one.</p>
        )}
      </section>

      <footer className="footer-note">
        <p>Latest story: {latestStory ? latestStory.title : 'Waiting for your first journey'}</p>
      </footer>
    </div>
  )
}

export default App
