'use client'

import Link from 'next/link'
import type { Batch } from '@/lib/supabase'

function fmt(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

interface BatchCardProps {
  batch: Batch
  showDetails?: boolean
}

export default function BatchCard({ batch, showDetails = false }: BatchCardProps) {
  const isProfit = batch.profit >= 0

  return (
    <Link href={`/batch/${batch.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="rounded-xl p-3.5 mb-2.5 transition-all cursor-pointer"
        style={{
          background: '#ffffff',
          border: '1px solid #c3dcc8',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#4caf65'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(45,122,58,0.1)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = '#c3dcc8'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Top row */}
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-sm" style={{ color: '#1a2e1d' }}>
              {batch.batch_number}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#6b896f' }}>
              {new Date(batch.date).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <p
              className="font-bold text-base"
              style={{ color: isProfit ? '#2d7a3a' : '#c0392b' }}
            >
              {isProfit ? '+' : '-'}{fmt(batch.profit)}
            </p>
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1"
              style={{
                background: isProfit ? '#e8f5ec' : '#fdecea',
                color: isProfit ? '#1a5c2a' : '#c0392b',
              }}
            >
              {isProfit ? '▲ Profit' : '▼ Loss'}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-4 mt-2 text-xs" style={{ color: '#6b896f' }}>
          <span>🌾 {batch.paddy_qty.toLocaleString('en-IN')}kg</span>
          {batch.batch_outputs?.[0] && (
            <span>📦 {batch.batch_outputs[0].rice_qty.toLocaleString('en-IN')}kg rice</span>
          )}
          <span>📉 {batch.margin.toFixed(1)}% margin</span>
        </div>

        {showDetails && (
          <div
            className="grid grid-cols-3 gap-2 mt-3 pt-3"
            style={{ borderTop: '1px solid #eaf3eb' }}
          >
            <div className="text-center">
              <p className="text-xs font-semibold" style={{ color: '#1a2e1d' }}>
                {batch.yield_percent.toFixed(1)}%
              </p>
              <p className="text-xs" style={{ color: '#6b896f', fontSize: '10px' }}>Yield</p>
            </div>
            <div className="text-center">
              <p
                className="text-xs font-semibold"
                style={{ color: isProfit ? '#2d7a3a' : '#c0392b' }}
              >
                ₹{batch.profit_per_kg.toFixed(2)}/kg
              </p>
              <p className="text-xs" style={{ color: '#6b896f', fontSize: '10px' }}>Per KG</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-semibold" style={{ color: '#1a2e1d' }}>
                {fmt(batch.total_sales)}
              </p>
              <p className="text-xs" style={{ color: '#6b896f', fontSize: '10px' }}>Sales</p>
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
