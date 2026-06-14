function formatFileSize(bytes) {
  if (!bytes) return null
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(0)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}

const QUALITY_META = {
  '1080p': { emoji: '🔥', tag: 'HD' },
  '720p':  { emoji: '✨', tag: 'HD' },
  '480p':  { emoji: '📺', tag: 'SD' },
  '360p':  { emoji: '📱', tag: 'SD' },
  'best':  { emoji: '⭐', tag: 'BEST' },
  'audio': { emoji: '🎵', tag: 'AUDIO' },
}

export default function FormatSelector({ formats, selected, onSelect, platform }) {
  const isYT = platform === 'youtube'
  const accentColor = isYT ? '#dc2626' : '#7c3aed'
  const accentLight = isYT ? '#fef2f2' : '#fdf4ff'
  const selectedClass = isYT ? 'selected selected-yt' : 'selected selected-ig'

  return (
    <div style={{ marginTop: '20px' }} className="animate-fade-in">
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
        Choose Quality
      </p>

      {/* Quality grid */}
      <div className="flex gap-3 flex-wrap">
        {formats.map((fmt) => {
          const meta = QUALITY_META[fmt.quality] || QUALITY_META['best']
          const isSelected = selected?.formatId === fmt.formatId
          const filesize = formatFileSize(fmt.filesize)

          return (
            <button
              key={fmt.formatId}
              className={`format-card flex flex-col items-center gap-1.5 ${isSelected ? selectedClass : ''}`}
              style={{
                padding: '14px 20px',
                minWidth: '88px',
                flex: '1 1 80px',
                maxWidth: '130px',
              }}
              onClick={() => onSelect(fmt)}
            >
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>{meta.emoji}</span>

              <span
                className="font-bold text-center"
                style={{
                  fontSize: fmt.quality === 'audio' ? '0.72rem' : '0.95rem',
                  color: isSelected ? accentColor : 'var(--text-primary)',
                  lineHeight: 1.25,
                  transition: 'color 0.2s',
                }}
              >
                {fmt.quality === 'audio' ? 'Audio\nOnly' : fmt.quality}
              </span>

              <span
                className="text-xs font-semibold px-1.5 py-0.5 rounded"
                style={{
                  background: isSelected ? accentLight : 'var(--bg-surface)',
                  color: isSelected ? accentColor : 'var(--text-muted)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.04em',
                  border: `1px solid ${isSelected ? accentColor + '40' : 'var(--border)'}`,
                }}
              >
                {meta.tag}
              </span>

              {filesize && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>~{filesize}</span>
              )}

              {!fmt.hasAudio && fmt.quality !== 'audio' && (
                <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', lineHeight: 1.2, textAlign: 'center' }}>
                  video only
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
