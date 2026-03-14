'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '📊' },
  { href: '/batch/new', label: 'New Batch', icon: '➕' },
  { href: '/history', label: 'History', icon: '📋' },
  { href: '/reports', label: 'Reports', icon: '📈' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="sticky bottom-0 z-50 bottom-nav"
      style={{
        background: '#1a5c2a',
        borderTop: '2px solid #f5c842',
      }}
    >
      <div className="flex">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all"
              style={{
                color: isActive ? '#f5c842' : 'rgba(255,255,255,0.55)',
                background: isActive ? 'rgba(245,200,66,0.12)' : 'transparent',
                textDecoration: 'none',
                fontSize: '10px',
                fontWeight: 500,
                letterSpacing: '0.3px',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
