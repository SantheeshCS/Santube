function formatDuration(seconds) {
  if (!seconds) return null
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function VideoPreview({ info }) {
  const { title, thumbnail, duration, uploader, platform } = info
  const durationStr = formatDuration(duration)
  const isYT = platform === 'youtube'

  const pillClass = isYT ? 'platform-pill-yt' : 'platform-pill-ig'
  const platformLabel = isYT ? 'YouTube' : 'Instagram'
  const accentColor = isYT ? '#dc2626' : '#7c3aed'

  return (
    <div className="animate-slide-up" style={{ marginTop: '20px' }}>
      {/* Section label */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Video Info
      </p>

      <div
        className="card overflow-hidden"
      >
        {/* Top accent bar */}
        <div style={{ height: '3px', background: isYT ? 'var(--gradient-yt)' : 'var(--gradient-ig)' }} />

        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 items-stretch sm:items-start" style={{ flexWrap: 'wrap' }}>
          {/* Thumbnail column */}
          <div
            className="w-full sm:max-w-[260px] sm:min-w-[180px] shrink-0 relative bg-[#f0f0f5] aspect-video"
          >
            {thumbnail ? (
              <img
                src={thumbnail}
                alt={title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" opacity="0.3">
                  <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
            )}
            {/* Duration badge */}
            {durationStr && (
              <div
                className="absolute bottom-2 right-2 px-2 py-0.5 rounded font-bold text-xs"
                style={{ background: 'rgba(0,0,0,0.65)', color: 'white', backdropFilter: 'blur(4px)' }}
              >
                {durationStr}
              </div>
            )}
          </div>

          {/* Info column */}
          <div className="flex flex-col justify-between flex-1 p-4" style={{ minWidth: '200px', gap: '12px' }}>
            {/* Top: badge + title */}
            <div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 mb-2 ${pillClass}`}>
                {isYT ? '▶' : '◆'} {platformLabel}
              </span>
              <h2
                className="font-bold m-0 leading-snug"
                style={{
                  fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                  color: 'var(--text-primary)',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {title}
              </h2>
            </div>

            {/* Bottom: meta chips */}
            <div className="flex flex-wrap gap-2">
              {uploader && (
                <span className="stat-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                  </svg>
                  {uploader}
                </span>
              )}
              {durationStr && (
                <span className="stat-chip">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {durationStr}
                </span>
              )}
              <span className="stat-chip" style={{ color: accentColor }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
                </svg>
                Free download
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
