import { useState } from 'react'
import Header from './components/Header'
import UrlInput from './components/UrlInput'
import VideoPreview from './components/VideoPreview'
import FormatSelector from './components/FormatSelector'
import DownloadBar from './components/DownloadBar'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [videoInfo, setVideoInfo] = useState(null)
  const [selectedFormat, setSelectedFormat] = useState(null)
  const [currentUrl, setCurrentUrl] = useState(null)

  async function handleFetch(url) {
    setLoading(true)
    setError(null)
    setVideoInfo(null)
    setSelectedFormat(null)
    setCurrentUrl(url)

    try {
      const res = await fetch('/api/fetch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`)
      setVideoInfo(data)
      if (data.formats?.length > 0) setSelectedFormat(data.formats[0])
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError('Cannot connect to SanTube server. Make sure the backend is running on port 3001.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setVideoInfo(null)
    setSelectedFormat(null)
    setError(null)
    setCurrentUrl(null)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Main container */}
      <div
        style={{
          flex: 1,
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          padding: 'clamp(20px, 4vw, 48px) clamp(16px, 4vw, 32px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Header />

        {/* Search card */}
        <div className="card" style={{ padding: 'clamp(20px, 4vw, 28px)' }}>
          <UrlInput onFetch={handleFetch} loading={loading} />

          {/* Error */}
          {error && (
            <div className="error-box mt-4 animate-fade-in">
              <div className="flex items-start gap-2">
                <span style={{ flexShrink: 0, fontSize: '1rem' }}>⚠</span>
                <div>
                  <strong>Something went wrong</strong>
                  <p className="m-0 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="mt-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="skeleton flex-shrink-0 w-full sm:w-[220px]" style={{ height: '124px', borderRadius: '8px' }} />
                <div className="flex flex-col gap-3 flex-1 pt-1">
                  <div className="skeleton" style={{ height: '13px', width: '55%' }} />
                  <div className="skeleton" style={{ height: '20px', width: '95%' }} />
                  <div className="skeleton" style={{ height: '16px', width: '70%' }} />
                  <div className="flex gap-2 mt-1">
                    <div className="skeleton" style={{ height: '26px', width: '80px', borderRadius: '99px' }} />
                    <div className="skeleton" style={{ height: '26px', width: '60px', borderRadius: '99px' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results — two-column layout on wide screens */}
        {videoInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-5 items-start animate-slide-up">
            {/* Left column: video info + format selector */}
            <div className="card" style={{ padding: 'clamp(20px, 3vw, 28px)' }}>
              <VideoPreview info={videoInfo} />

              {videoInfo.formats?.length > 0 && (
                <FormatSelector
                  formats={videoInfo.formats}
                  selected={selectedFormat}
                  onSelect={setSelectedFormat}
                  platform={videoInfo.platform}
                />
              )}

              {/* Reset link */}
              <button
                onClick={handleReset}
                className="mt-5 text-sm transition-colors flex items-center gap-1.5"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px 0' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                Search another video
              </button>
            </div>

            {/* Right column: download panel */}
            <div>
              <DownloadBar
                videoInfo={videoInfo}
                selectedFormat={selectedFormat}
                url={currentUrl}
              />

              {/* Info tips card */}
              <div className="card mt-4" style={{ padding: '16px 20px' }}>
                <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
                  Tips
                </p>
                <ul className="m-0 p-0 list-none flex flex-col gap-2">
                  {[
                    { icon: '✨', text: 'All videos download seamlessly with audio' },
                    { icon: '🎵', text: 'Audio Only gives the best quality sound' },
                    { icon: '🔒', text: 'For personal use only' },
                  ].map(({ icon, text }) => (
                    <li key={text} className="flex items-start gap-2" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      <span style={{ fontSize: '0.85rem', flexShrink: 0, lineHeight: 1.5 }}>{icon}</span>
                      {text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Empty state — when no search yet */}
        {!videoInfo && !loading && !error && (
          <div
            className="card animate-fade-in"
            style={{ padding: 'clamp(32px, 5vw, 48px) 24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎬</div>
            <h2 className="m-0 mb-2 font-bold" style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>
              How it works
            </h2>
            <p className="m-0 mb-6" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Paste any YouTube or Instagram link above and download in seconds.
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '16px',
                textAlign: 'left',
              }}
            >
              {[
                { step: '1', icon: '📋', title: 'Paste Link', desc: 'Copy the video URL from YouTube or Instagram' },
                { step: '2', icon: '🔍', title: 'Fetch Info', desc: 'We extract title, thumbnail, and quality options' },
                { step: '3', icon: '⚙️', title: 'Pick Quality', desc: 'Choose from 1080p down to audio-only' },
                { step: '4', icon: '⬇️', title: 'Download', desc: 'File streams directly to your device' },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  className="card-inner"
                  style={{ padding: '16px', borderRadius: 'var(--radius-sm)' }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded gradient-text"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', fontSize: '0.65rem' }}
                    >
                      STEP {step}
                    </span>
                  </div>
                  <p className="font-semibold m-0 mb-1" style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{title}</p>
                  <p className="m-0" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer
        className="text-center py-5"
        style={{
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
        }}
      >
        <p className="m-0">
          Powered by <span className="gradient-text font-semibold">yt-dlp</span>
          {' · '}
          <span className="gradient-text font-bold">SanTube</span> © {new Date().getFullYear()}
        </p>
        <p className="mt-1.5 m-0" style={{ fontSize: '0.85rem' }}>
          Developed by <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>Santheesh P M</span>
        </p>
        <p className="mt-1.5 m-0" style={{ opacity: 0.8 }}>For personal use only. Respect copyright laws.</p>
      </footer>
    </div>
  )
}
