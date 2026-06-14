export default function Header() {
  return (
    <header className="animate-fade-in">
      {/* Hero gradient banner */}
      <div
        className="hero-strip rounded-2xl mb-6 relative overflow-hidden"
        style={{ padding: 'clamp(28px, 5vw, 44px) clamp(24px, 4vw, 40px)' }}
      >
        {/* Decorative blobs */}
        <div style={{
          position: 'absolute', width: '280px', height: '280px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', top: '-80px', right: '-60px', pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute', width: '180px', height: '180px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', bottom: '-60px', left: '20px', pointerEvents: 'none'
        }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
              >
                <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 900, fontSize: '1.3rem', color: 'white' }}>S</span>
              </div>
              <h1
                style={{
                  fontFamily: 'Outfit, sans-serif', fontWeight: 900,
                  fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                  color: 'white', margin: 0, lineHeight: 1,
                  textShadow: '0 2px 12px rgba(0,0,0,0.15)'
                }}
              >
                SanTube
              </h1>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: 'clamp(0.9rem, 2vw, 1.05rem)', fontWeight: 400 }}>
              Download YouTube videos &amp; Instagram Reels — instantly, free.
            </p>
          </div>

          {/* Platform badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <YouTubeIcon size={14} /> YouTube
            </span>
            <span
              className="flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              <InstagramIcon size={14} /> Instagram
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

function YouTubeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  )
}

function InstagramIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}
