'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { fetchBatch, deleteBatch, type Batch } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'
import Link from 'next/link'

function fmt(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function BatchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchBatch(params.id as string).then(setBatch).finally(() => setLoading(false))
    }
  }, [params.id])

  async function handleDelete() {
    if (!batch) return
    if (!confirm(`Delete batch ${batch.batch_number}? This cannot be undone.`)) return
    setDeleting(true)
    await deleteBatch(batch.id)
    router.push('/history')
  }

  if (loading) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center"><div className="text-4xl mb-3 animate-pulse">🌾</div></div>
      </div>
      <BottomNav />
    </div>
  )

  if (!batch) return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-sm" style={{ color: '#3d5c42' }}>Batch not found</p>
          <Link href="/history" className="inline-block mt-3 text-sm" style={{ color: '#2d7a3a' }}>← Back to History</Link>
        </div>
      </div>
      <BottomNav />
    </div>
  )

  const isProfit = batch.profit >= 0
  const out = batch.batch_outputs?.[0]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-4">
        <Link href="/history" className="inline-flex items-center gap-1 text-sm mb-4" style={{ color: '#2d7a3a', textDecoration: 'none' }}>
          ← Back to History
        </Link>

        <div className="rounded-2xl p-5 text-center mb-4" style={{
          background: `linear-gradient(135deg, ${isProfit ? '#1a5c2a, #2d7a3a' : '#8b1a1a, #c0392b'})`,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '4px' }}>
            {batch.batch_number} · {new Date(batch.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p className="font-serif text-white" style={{ fontSize: '40px', lineHeight: 1 }}>{fmt(batch.profit)}</p>
          <span className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold text-white" style={{ background: 'rgba(255,255,255,0.18)' }}>
            {isProfit ? '▲ Profit' : '▼ Loss'} · {Math.abs(batch.margin).toFixed(1)}% margin
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          {[
            { v: `${batch.yield_percent.toFixed(1)}%`, l: 'Rice Yield' },
            { v: `₹${batch.profit_per_kg.toFixed(2)}`, l: 'Per KG', color: isProfit ? '#2d7a3a' : '#c0392b' },
            { v: `${batch.paddy_qty.toLocaleString('en-IN')}kg`, l: 'Paddy In' },
          ].map(m => (
            <div key={m.l} className="rounded-xl p-2.5 text-center" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
              <p className="text-base font-bold" style={{ color: m.color || '#1a2e1d' }}>{m.v}</p>
              <p style={{ color: '#6b896f', fontSize: '10px', marginTop: '2px' }}>{m.l}</p>
            </div>
          ))}
        </div>

        {[
          {
            title: 'Paddy & Costs', rows: [
              { l: 'Paddy Qty', v: `${batch.paddy_qty}kg` },
              { l: 'Paddy Price', v: `₹${batch.paddy_price}/kg` },
              { l: 'Raw Material', v: fmt(batch.raw_material_cost), c: '#c0392b' },
              { l: 'Labor', v: fmt(batch.labor_cost) },
              { l: 'Electricity', v: fmt(batch.electricity_cost) },
              { l: 'Transport', v: fmt(batch.transport_cost) },
              { l: 'Packaging', v: fmt(batch.packaging_cost) },
              { l: 'Other', v: fmt(batch.other_cost) },
              { l: 'Total Cost', v: fmt(batch.total_cost), c: '#c0392b', bold: true },
            ]
          },
          out ? {
            title: 'Milling Output', rows: [
              { l: `🍚 Rice (${out.rice_qty}kg)`, v: fmt(out.rice_qty * out.rice_price), c: '#2d7a3a' },
              { l: `💔 Broken (${out.broken_qty}kg)`, v: fmt(out.broken_qty * out.broken_price), c: '#2d7a3a' },
              { l: `🟤 Bran (${out.bran_qty}kg)`, v: fmt(out.bran_qty * out.bran_price), c: '#2d7a3a' },
              { l: `🌿 Husk (${out.husk_qty}kg)`, v: fmt(out.husk_qty * out.husk_price), c: '#2d7a3a' },
              { l: 'Total Sales', v: fmt(batch.total_sales), c: '#2d7a3a', bold: true },
            ]
          } : null,
        ].filter(Boolean).map(section => (
          <div key={section!.title} className="rounded-xl p-4 mb-3" style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3d5c42' }}>{section!.title}</p>
            {section!.rows.map(r => (
              <div key={r.l} className="flex justify-between py-2" style={{ borderBottom: '1px solid #eaf3eb', fontSize: r.bold ? '15px' : '14px' }}>
                <span style={{ color: '#3d5c42', fontWeight: r.bold ? 700 : 400 }}>{r.l}</span>
                <span style={{ color: r.c || '#1a2e1d', fontWeight: r.bold ? 700 : 600 }}>{r.v}</span>
              </div>
            ))}
          </div>
        ))}

        {batch.notes && (
          <div className="rounded-xl p-4 mb-3" style={{ background: '#fff8e1', border: '1px solid #f0d070' }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#c8900a' }}>Notes</p>
            <p className="text-sm" style={{ color: '#3d5c42' }}>{batch.notes}</p>
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-full py-3.5 rounded-xl font-semibold text-sm mb-4"
          style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' }}
        >
          {deleting ? 'Deleting...' : '🗑️ Delete Batch'}
        </button>
      </main>
      <BottomNav />
    </div>
  )
}
