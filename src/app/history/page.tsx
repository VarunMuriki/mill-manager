'use client'

import { useEffect, useState } from 'react'
import { fetchBatches, type Batch } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import BatchCard from '@/components/BatchCard'

export default function HistoryPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchBatches().then(setBatches).finally(() => setLoading(false))
  }, [])

  const filtered = batches.filter(b =>
    b.batch_number.toLowerCase().includes(search.toLowerCase()) ||
    b.date.includes(search)
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <div className="relative mb-4">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base">🔍</span>
          <input
            type="text"
            placeholder="Search batch number or date..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl outline-none"
            style={{
              padding: '13px 14px 13px 38px',
              border: '1.5px solid #c3dcc8',
              fontSize: '15px',
              background: '#ffffff',
              color: '#1a2e1d',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onFocus={e => (e.target.style.borderColor = '#2d7a3a')}
            onBlur={e => (e.target.style.borderColor = '#c3dcc8')}
          />
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3 animate-pulse">📋</div>
            <p className="text-sm" style={{ color: '#6b896f' }}>Loading batches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-sm font-medium" style={{ color: '#3d5c42' }}>
              {search ? 'No batches match your search' : 'No batches yet'}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs mb-3" style={{ color: '#6b896f' }}>
              {filtered.length} batch{filtered.length !== 1 ? 'es' : ''} found
            </p>
            {filtered.map(b => (
              <BatchCard key={b.id} batch={b} showDetails />
            ))}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  )
}
