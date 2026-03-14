'use client'

export default function Header() {
  return (
    <header
      className="relative overflow-hidden px-5 pt-5 pb-4"
      style={{ background: 'linear-gradient(135deg, #1a5c2a 0%, #2d7a3a 60%, #1e7a35 100%)' }}
    >
      {/* Decorative circles */}
      <div
        className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20"
        style={{ background: '#f5c842' }}
      />
      <div
        className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full opacity-10"
        style={{ background: '#ffffff' }}
      />

      <div className="relative flex items-center gap-3 mb-1">
        {/* Logo icon */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 shadow-md"
          style={{ background: '#f5c842' }}
        >
          🌾
        </div>

        <div>
          <h1
            className="font-serif text-white leading-tight"
            style={{ fontSize: '17px' }}
          >
            Sri Kanakadhara Agro Industries
          </h1>
          <p className="text-xs mt-0.5 tracking-wide" style={{ color: 'rgba(255,255,255,0.65)' }}>
            RICE MILL MANAGER · PROFIT TRACKER
          </p>
        </div>
      </div>

      {/* Gold accent line */}
      <div
        className="mt-3 h-0.5 rounded-full"
        style={{ background: 'linear-gradient(90deg, #f5c842, transparent)' }}
      />
    </header>
  )
}
