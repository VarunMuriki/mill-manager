'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchBatches, type Batch } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import BatchCard from '@/components/BatchCard'

function fmt(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function DashboardPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBatches()
      .then(setBatches)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const totalProfit = batches.reduce((s, b) => s + b.profit, 0)
  const totalPaddy = batches.reduce((s, b) => s + b.paddy_qty, 0)
  const lossBatches = batches.filter(b => b.profit < 0).length
  const avgYield = batches.length > 0
    ? batches.reduce((s, b) => s + b.yield_percent, 0) / batches.length
    : 0
  const barMax = batches.length > 0
    ? Math.max(...batches.map(b => Math.abs(b.profit)))
    : 1

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 pb-2">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="text-4xl mb-3 animate-pulse">🌾</div>
              <p className="text-sm" style={{ color: '#6b896f' }}>Loading mill data...</p>
            </div>
          </div>
        ) : error ? (
          <div
            className="rounded-xl p-4 text-sm"
            style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' }}
          >
            <strong>Connection Error:</strong> {error}
            <p className="mt-1 text-xs">Check your Supabase credentials in .env.local</p>
          </div>
        ) : (
          <div className="fade-in">
            {/* Date notice */}
            <div
              className="rounded-xl p-3 mb-4 flex items-center gap-2 text-xs"
              style={{ background: '#fff8e1', border: '1px solid #f0d070', color: '#c8900a' }}
            >
              <span>💡</span>
              <span>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                &nbsp;·&nbsp;{batches.length} total batch{batches.length !== 1 ? 'es' : ''} recorded
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {[
                {
                  label: 'Total Profit',
                  value: fmt(totalProfit),
                  sub: 'All batches',
                  color: totalProfit >= 0 ? '#2d7a3a' : '#c0392b',
                },
                {
                  label: 'Paddy Processed',
                  value: `${totalPaddy.toLocaleString('en-IN')}kg`,
                  sub: `${batches.length} batches`,
                  color: '#c8900a',
                },
                {
                  label: 'Avg Rice Yield',
                  value: `${avgYield.toFixed(1)}%`,
                  sub: 'Industry avg ~65%',
                  color: '#1a2e1d',
                },
                {
                  label: 'Loss Batches',
                  value: `${lossBatches}`,
                  sub: `${batches.length - lossBatches} profitable`,
                  color: lossBatches > 0 ? '#c0392b' : '#2d7a3a',
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl p-3.5"
                  style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: '#6b896f' }}
                  >
                    {s.label}
                  </p>
                  <p
                    className="font-serif text-2xl font-bold"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b896f' }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Profit chart */}
            {batches.length > 0 && (
              <div
                className="rounded-xl p-4 mb-4"
                style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
              >
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-3"
                  style={{ color: '#3d5c42' }}
                >
                  📊 Profit per Batch
                </p>
                <div className="flex items-end gap-1.5" style={{ height: '80px' }}>
                  {batches.slice(-8).map((b) => {
                    const h = barMax > 0 ? Math.max(10, Math.round((Math.abs(b.profit) / barMax) * 70)) : 10
                    const isPos = b.profit >= 0
                    return (
                      <div key={b.id} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t-sm transition-all"
                          style={{
                            height: `${h}px`,
                            background: isPos ? '#4caf65' : '#c0392b',
                          }}
                        />
                        <span className="text-center" style={{ fontSize: '9px', color: '#6b896f', lineHeight: 1 }}>
                          {b.batch_number.replace('B-', '')}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Recent batches */}
            <p
              className="text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-2"
              style={{ color: '#3d5c42' }}
            >
              Recent Batches
              <span style={{ flex: 1, height: '1px', background: '#c3dcc8', display: 'block' }} />
            </p>

            {batches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🌾</div>
                <p className="text-sm font-medium mb-1" style={{ color: '#3d5c42' }}>
                  No batches yet
                </p>
                <p className="text-xs mb-4" style={{ color: '#6b896f' }}>
                  Add your first batch to see profit analytics!
                </p>
                <Link
                  href="/batch/new"
                  className="inline-block px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
                  style={{ background: '#2d7a3a' }}
                >
                  + Add First Batch
                </Link>
              </div>
            ) : (
              batches.slice(0, 5).map((b) => (
                <BatchCard key={b.id} batch={b} />
              ))
            )}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="sticky bottom-14 px-4 mb-2 pointer-events-none">
        <Link
          href="/batch/new"
          className="pointer-events-auto flex items-center justify-center gap-2 w-full py-4 rounded-xl text-white font-semibold text-base btn-pulse"
          style={{ background: '#2d7a3a', boxShadow: '0 4px 16px rgba(45,122,58,0.35)' }}
        >
          <span>🌾</span> Add New Batch
        </Link>
      </div>

      <BottomNav />
    </div>
  )
}
