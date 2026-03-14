'use client'

import { useEffect, useState } from 'react'
import { fetchBatches, type Batch } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

function fmt(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function ReportsPage() {
  const [batches, setBatches] = useState<Batch[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBatches().then(setBatches).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">📈</div>
          <p className="text-sm" style={{ color: '#6b896f' }}>Loading reports...</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )

  if (batches.length === 0) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <div className="text-5xl mb-3">📈</div>
          <p className="text-sm font-medium" style={{ color: '#3d5c42' }}>No data yet</p>
          <p className="text-xs mt-1" style={{ color: '#6b896f' }}>Add batches to see reports</p>
        </div>
      </div>
      <BottomNav />
    </div>
  )

  const totalProfit = batches.reduce((s, b) => s + b.profit, 0)
  const totalSales = batches.reduce((s, b) => s + b.total_sales, 0)
  const totalCost = batches.reduce((s, b) => s + b.total_cost, 0)
  const totalRice = batches.reduce((s, b) => s + (b.batch_outputs?.[0]?.rice_qty || 0), 0)
  const avgYield = batches.reduce((s, b) => s + b.yield_percent, 0) / batches.length
  const avgMargin = batches.reduce((s, b) => s + b.margin, 0) / batches.length
  const profitBatches = batches.filter(b => b.profit >= 0).length
  const totalRiceSales = batches.reduce((s, b) => s + (b.batch_outputs?.[0] ? b.batch_outputs[0].rice_qty * b.batch_outputs[0].rice_price : 0), 0)
  const totalBrokenSales = batches.reduce((s, b) => s + (b.batch_outputs?.[0] ? b.batch_outputs[0].broken_qty * b.batch_outputs[0].broken_price : 0), 0)
  const totalBranSales = batches.reduce((s, b) => s + (b.batch_outputs?.[0] ? b.batch_outputs[0].bran_qty * b.batch_outputs[0].bran_price : 0), 0)
  const totalHuskSales = batches.reduce((s, b) => s + (b.batch_outputs?.[0] ? b.batch_outputs[0].husk_qty * b.batch_outputs[0].husk_price : 0), 0)

  const salesMix = [
    { label: 'Rice', value: totalRiceSales, color: '#2d7a3a' },
    { label: 'Broken', value: totalBrokenSales, color: '#c8900a' },
    { label: 'Bran', value: totalBranSales, color: '#7a5c2a' },
    { label: 'Husk', value: totalHuskSales, color: '#5a8a30' },
  ]

  const perf = [
    { label: 'Avg Rice Yield', value: `${avgYield.toFixed(1)}%`, pct: avgYield },
    { label: 'Avg Profit Margin', value: `${avgMargin.toFixed(1)}%`, pct: Math.max(0, avgMargin) },
    { label: 'Profitable Batches', value: `${profitBatches} / ${batches.length}`, pct: (profitBatches / batches.length) * 100 },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: '#3d5c42' }}>
          Monthly Summary
          <span style={{ flex: 1, height: '1px', background: '#c3dcc8', display: 'block' }} />
        </p>

        <div className="grid grid-cols-2 gap-2.5 mb-4">
          {[
            { label: 'Total Revenue', value: fmt(totalSales), color: '#c8900a' },
            { label: 'Total Cost', value: fmt(totalCost), color: '#c0392b' },
            { label: 'Net Profit', value: fmt(totalProfit), color: totalProfit >= 0 ? '#2d7a3a' : '#c0392b' },
            { label: 'Rice Produced', value: `${totalRice.toLocaleString('en-IN')}kg`, color: '#1a2e1d' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-3.5" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: '#6b896f' }}>{s.label}</p>
              <p className="font-serif text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#3d5c42' }}>Performance Averages</p>
          {perf.map(m => (
            <div key={m.label} className="mb-3.5">
              <div className="flex justify-between text-sm mb-1.5">
                <span style={{ color: '#3d5c42' }}>{m.label}</span>
                <span className="font-bold" style={{ color: '#1a2e1d' }}>{m.value}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: '#eaf3eb' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, m.pct)}%`, background: '#4caf65' }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: '#3d5c42' }}>Sales Mix</p>
          <div className="flex items-center gap-4">
            <svg width="90" height="90" viewBox="0 0 90 90">
              {(() => {
                let offset = -25
                const tot = salesMix.reduce((s, x) => s + x.value, 0)
                return salesMix.map((s, i) => {
                  const pct = tot > 0 ? (s.value / tot) * 100 : 25
                  const dash = (pct / 100) * 251.2
                  const el = (
                    <circle key={i} cx="45" cy="45" r="40" fill="none"
                      stroke={s.color} strokeWidth="18"
                      strokeDasharray={`${dash} ${251.2}`}
                      strokeDashoffset={offset}
                    />
                  )
                  offset -= dash
                  return el
                })
              })()}
              <circle cx="45" cy="45" r="31" fill="white" />
              <text x="45" y="49" textAnchor="middle" fontSize="11" fontWeight="600"
                fill={totalProfit >= 0 ? '#2d7a3a' : '#c0392b'} fontFamily="DM Sans, sans-serif">
                {avgMargin.toFixed(0)}%
              </text>
            </svg>
            <div className="flex-1">
              {salesMix.map(s => (
                <div key={s.label} className="flex items-center gap-2 mb-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-sm flex-1" style={{ color: '#3d5c42' }}>{s.label}</span>
                  <span className="text-sm font-bold" style={{ color: '#1a2e1d' }}>{fmt(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl p-4 mb-4" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3d5c42' }}>Batch Profit Trend</p>
          <div className="flex items-end gap-1.5" style={{ height: '100px' }}>
            {batches.slice(-10).map(b => {
              const max = Math.max(...batches.map(x => Math.abs(x.profit)), 1)
              const h = Math.max(8, Math.round((Math.abs(b.profit) / max) * 85))
              return (
                <div key={b.id} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm" style={{ height: `${h}px`, background: b.profit >= 0 ? '#4caf65' : '#c0392b' }} />
                  <span style={{ fontSize: '8px', color: '#6b896f' }}>{b.batch_number.replace('B-', '')}</span>
                </div>
              )
            })}
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
