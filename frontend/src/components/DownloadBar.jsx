import { useState } from 'react'

export default function DownloadBar({ videoInfo, selectedFormat, url }) {
  const [downloading, setDownloading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState(null)

  const isYT = videoInfo?.platform === 'youtube'
  const accentColor = isYT ? '#dc2626' : '#7c3aed'
  const gradient = isYT ? 'var(--gradient-yt)' : 'var(--gradient-ig)'

  function handleDownload() {
    if (!selectedFormat || !url) return
    setDownloading(true)
    setDone(false)
    setError(null)

    const params = new URLSearchParams({
      url,
      formatId: selectedFormat.formatId,
      title: videoInfo?.title || 'video',
      ext: selectedFormat.ext || 'mp4',
    })

    const API_BASE = import.meta.env.VITE_API_URL || '';
    const anchor = document.createElement('a')
    anchor.href = `${API_BASE}/api/download?${params.toString()}`
    anchor.download = `${(videoInfo?.title || 'video').replace(/[^a-zA-Z0-9\s\-_.()]/g, '').trim()}.${selectedFormat.ext || 'mp4'}`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)

    setTimeout(() => { setDownloading(false); setDone(true) }, 3000)
  }

  if (!selectedFormat) {
    return (
      <div className="animate-fade-in text-center mt-6 py-4" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        ↑ Select a quality above to continue
      </div>
    )
  }

  return (
    <div className="animate-slide-up" style={{ marginTop: '20px' }}>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Download
      </p>

      <div className="card" style={{ padding: '20px' }}>
        {/* Selected format summary */}
        <div
          className="flex items-center justify-between flex-wrap gap-3 mb-4 p-3 rounded-xl"
          style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
            >
              {selectedFormat.quality === 'audio' ? '🎵' : selectedFormat.quality === 'best' ? '⭐' : '📹'}
            </div>
            <div>
              <p className="font-semibold m-0" style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {selectedFormat.label}
              </p>
              <p className="m-0" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {selectedFormat.ext?.toUpperCase()} • {selectedFormat.hasAudio ? 'Video + Audio' : 'Video Only'}
              </p>
            </div>
          </div>

          {done && (
            <span
              className="text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Download started!
            </span>
          )}
        </div>

        {/* Progress bar */}
        {downloading && (
          <div className="progress-bar-track mb-4">
            <div className="progress-bar-fill" style={{ width: '100%' }} />
          </div>
        )}

        {/* Error */}
        {error && <div className="error-box mb-4">⚠ {error}</div>}

        {/* Download CTA */}
        <button
          className="btn-gradient w-full flex items-center justify-center gap-2.5"
          style={{
            padding: '14px 24px',
            fontSize: '1rem',
            borderRadius: 'var(--radius-sm)',
            background: downloading ? '#e5e5f5' : gradient,
            color: downloading ? 'var(--text-secondary)' : 'white',
            boxShadow: downloading ? 'none' : undefined,
          }}
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? (
            <>
              <span className="animate-spin-custom w-5 h-5 border-2 border-current border-t-transparent rounded-full inline-block" />
              Starting download…
            </>
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              {done ? 'Download Again' : `Download ${selectedFormat.quality === 'audio' ? 'Audio' : selectedFormat.quality}`}
            </>
          )}
        </button>

        <p className="text-center m-0 mt-3" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Streams directly to your browser · No files stored on server
        </p>
      </div>
    </div>
  )
}
