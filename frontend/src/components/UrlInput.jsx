import { useState, useRef, useEffect } from 'react'

function detectPlatform(url) {
  try {
    const parsed = new URL(url)
    const hostname = parsed.hostname.replace('www.', '').replace('m.', '')
    if (['youtube.com', 'youtu.be', 'music.youtube.com'].includes(hostname)) return 'youtube'
    if (['instagram.com', 'instagr.am'].includes(hostname)) return 'instagram'
  } catch {}
  return null
}

export default function UrlInput({ onFetch, loading }) {
  const [url, setUrl] = useState('')
  const [platform, setPlatform] = useState(null)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  function handleChange(e) {
    const val = e.target.value
    setUrl(val)
    setPlatform(detectPlatform(val.trim()))
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').trim()
    setUrl(pasted)
    setPlatform(detectPlatform(pasted))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (url.trim()) onFetch(url.trim(), platform)
  }

  const inputClass = [
    'url-input',
    platform === 'instagram' ? 'platform-ig' : '',
    platform === 'youtube' ? 'platform-yt' : '',
  ].filter(Boolean).join(' ')

  const accentColor = platform === 'youtube' ? '#dc2626' : platform === 'instagram' ? '#7c3aed' : '#7c3aed'

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Input row */}
      <div
        className="flex items-center gap-2 p-2"
        style={{
          background: 'var(--bg-surface)',
          border: `1.5px solid ${platform ? accentColor + '40' : 'var(--border)'}`,
          borderRadius: 'var(--radius-pill)',
          boxShadow: platform ? `0 0 0 3px ${accentColor}12` : 'var(--shadow-sm)',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Platform icon */}
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ml-1 transition-all duration-300"
          style={{
            background: platform === 'youtube'
              ? '#fef2f2'
              : platform === 'instagram'
              ? '#fdf4ff'
              : 'var(--bg-muted)',
          }}
        >
          {platform === 'youtube' && <YouTubeIcon />}
          {platform === 'instagram' && <InstagramIcon />}
          {!platform && <LinkIcon />}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={handleChange}
          onPaste={handlePaste}
          placeholder="Paste YouTube or Instagram link…"
          className={inputClass}
          style={{ padding: '10px 4px', background: 'transparent', border: 'none', boxShadow: 'none', flex: 1 }}
          disabled={loading}
        />

        {/* Clear */}
        {url && !loading && (
          <button
            type="button"
            onClick={() => { setUrl(''); setPlatform(null) }}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-muted)', border: 'none', cursor: 'pointer' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}

        {/* Fetch Button */}
        <button
          type="submit"
          className="btn-gradient flex-shrink-0 flex items-center justify-center gap-2"
          disabled={!url.trim() || loading}
          style={{ padding: '10px clamp(12px, 3vw, 22px)', fontSize: '0.9rem' }}
        >
          {loading ? (
            <>
              <span className="animate-spin-custom w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              <span className="hidden sm:inline">Fetching…</span>
            </>
          ) : (
            <>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              </svg>
              <span className="hidden sm:inline">Fetch</span>
            </>
          )}
        </button>
      </div>

      {/* Platform hint */}
      {platform && (
        <p className="text-center text-xs mt-2 animate-fade-in" style={{ color: 'var(--text-muted)' }}>
          {platform === 'youtube' ? '🔴 YouTube link detected' : '💜 Instagram link detected'}
        </p>
      )}
    </form>
  )
}

function YouTubeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#dc2626"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
}
function InstagramIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="#7c3aed"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
}
function LinkIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
}
