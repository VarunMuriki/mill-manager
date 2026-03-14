'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveBatch, calculateBatch, type BatchFormData } from '@/lib/supabase'
import Header from '@/components/Header'
import BottomNav from '@/components/BottomNav'

const empty: BatchFormData = {
  batch_number: '',
  date: new Date().toISOString().split('T')[0],
  paddy_qty: 0, paddy_price: 0,
  labor_cost: 0, electricity_cost: 0, transport_cost: 0, packaging_cost: 0, other_cost: 0,
  rice_qty: 0, rice_price: 0,
  broken_qty: 0, broken_price: 0,
  bran_qty: 0, bran_price: 0,
  husk_qty: 0, husk_price: 0,
  notes: '',
}

function fmt(n: number) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

export default function NewBatchPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [data, setData] = useState<BatchFormData>({ ...empty })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof BatchFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value
    setData(prev => ({ ...prev, [k]: v }))
  }

  function InputField({
    label, field, type = 'number', placeholder = '0', unit
  }: {
    label: string, field: keyof BatchFormData, type?: string, placeholder?: string, unit?: string
  }) {
    return (
      <div className="mb-3.5">
        <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: '#3d5c42' }}>
          {label}
        </label>
        <div className="relative">
          <input
            type={type}
            value={data[field] as string | number || ''}
            onChange={set(field)}
            placeholder={placeholder}
            className="w-full rounded-xl outline-none transition-all"
            style={{
              padding: '13px 14px',
              paddingRight: unit ? '42px' : '14px',
              border: '1.5px solid #c3dcc8',
              fontSize: '16px',
              background: '#ffffff',
              color: '#1a2e1d',
              fontFamily: 'DM Sans, sans-serif',
            }}
            onFocus={e => (e.target.style.borderColor = '#2d7a3a')}
            onBlur={e => (e.target.style.borderColor = '#c3dcc8')}
          />
          {unit && (
            <span
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
              style={{ color: '#6b896f' }}
            >
              {unit}
            </span>
          )}
        </div>
      </div>
    )
  }

  function TwoCol({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-2 gap-2.5">{children}</div>
  }

  const validate = (s: number) => {
    if (s === 1 && (!data.batch_number || !data.paddy_qty || !data.paddy_price)) {
      setError('Please fill in batch number, paddy quantity, and price.')
      return false
    }
    if (s === 3 && !data.rice_qty) {
      setError('Please enter at least the rice quantity.')
      return false
    }
    setError('')
    return true
  }

  const next = (from: number) => {
    if (!validate(from)) return
    setStep(from + 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      await saveBatch(data)
      router.push('/')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save batch. Check Supabase connection.')
    } finally {
      setSaving(false)
    }
  }

  const calc = calculateBatch(data)
  const isProfit = calc.profit >= 0

  const steps = [
    { num: 1, label: 'Paddy' },
    { num: 2, label: 'Costs' },
    { num: 3, label: 'Output' },
    { num: 4, label: 'Results' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 p-4 pb-4">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <button
                onClick={() => s.num < step && setStep(s.num)}
                className="flex items-center gap-1 flex-shrink-0"
                style={{ cursor: s.num < step ? 'pointer' : 'default' }}
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: s.num === step ? '#2d7a3a' : s.num < step ? '#e8f5ec' : '#ffffff',
                    border: `2px solid ${s.num === step ? '#2d7a3a' : s.num < step ? '#4caf65' : '#c3dcc8'}`,
                    color: s.num === step ? '#fff' : s.num < step ? '#1a5c2a' : '#6b896f',
                  }}
                >
                  {s.num < step ? '✓' : s.num}
                </div>
              </button>
              {i < steps.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 rounded-full transition-all"
                  style={{ background: s.num < step ? '#4caf65' : '#c3dcc8' }}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div
            className="rounded-xl p-3 mb-4 text-xs"
            style={{ background: '#fdecea', color: '#c0392b', border: '1px solid #f5c6cb' }}
          >
            {error}
          </div>
        )}

        {/* ── STEP 1: Paddy Info ── */}
        {step === 1 && (
          <div className="fade-in">
            <h2 className="font-serif text-xl mb-4" style={{ color: '#1a2e1d' }}>🌾 Paddy Information</h2>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
            >
              <InputField label="Batch Number" field="batch_number" type="text" placeholder="e.g. B-005" />
              <InputField label="Date" field="date" type="date" />
              <TwoCol>
                <InputField label="Paddy Qty" field="paddy_qty" unit="kg" />
                <InputField label="Price / kg" field="paddy_price" unit="₹" />
              </TwoCol>
              <div
                className="rounded-xl p-3 mt-2 flex justify-between items-center"
                style={{ background: '#e8f5ec' }}
              >
                <span className="text-xs font-medium" style={{ color: '#3d5c42' }}>Raw Material Cost</span>
                <span className="text-sm font-bold" style={{ color: '#1a5c2a' }}>
                  {fmt(data.paddy_qty * data.paddy_price)}
                </span>
              </div>
            </div>
            <button
              onClick={() => next(1)}
              className="w-full py-4 rounded-xl text-white font-semibold text-base"
              style={{ background: '#2d7a3a' }}
            >
              Next: Costs →
            </button>
          </div>
        )}

        {/* ── STEP 2: Costs ── */}
        {step === 2 && (
          <div className="fade-in">
            <h2 className="font-serif text-xl mb-4" style={{ color: '#1a2e1d' }}>💰 Cost Information</h2>
            <div
              className="rounded-2xl p-4 mb-4"
              style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
            >
              {[
                { label: 'Labor Cost', field: 'labor_cost' as keyof BatchFormData },
                { label: 'Electricity Cost', field: 'electricity_cost' as keyof BatchFormData },
                { label: 'Transport Cost', field: 'transport_cost' as keyof BatchFormData },
                { label: 'Packaging Cost', field: 'packaging_cost' as keyof BatchFormData },
                { label: 'Other Expenses', field: 'other_cost' as keyof BatchFormData },
              ].map(c => (
                <InputField key={c.field} label={c.label} field={c.field} unit="₹" />
              ))}
              <div
                className="rounded-xl p-3 mt-2 flex justify-between items-center"
                style={{ background: '#fdecea' }}
              >
                <span className="text-xs font-medium" style={{ color: '#7a1c1c' }}>
                  Total Cost (incl. raw material)
                </span>
                <span className="text-sm font-bold" style={{ color: '#c0392b' }}>
                  {fmt(calc.totalCost)}
                </span>
              </div>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-xl font-semibold text-sm"
                style={{ background: '#ffffff', border: '1.5px solid #c3dcc8', color: '#3d5c42' }}
              >
                ← Back
              </button>
              <button
                onClick={() => next(2)}
                className="flex-[2] py-4 rounded-xl text-white font-semibold text-base"
                style={{ background: '#2d7a3a' }}
              >
                Next: Output →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Milling Output ── */}
        {step === 3 && (
          <div className="fade-in">
            <h2 className="font-serif text-xl mb-4" style={{ color: '#1a2e1d' }}>📦 Milling Output</h2>
            <div
              className="rounded-2xl p-4 mb-3"
              style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#2d7a3a' }}>
                🍚 Rice
              </p>
              <TwoCol>
                <InputField label="Rice Qty (kg)" field="rice_qty" unit="kg" />
                <InputField label="Price / kg (₹)" field="rice_price" unit="₹" />
              </TwoCol>

              <p className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: '#2d7a3a' }}>
                💔 Broken Rice
              </p>
              <TwoCol>
                <InputField label="Broken Qty (kg)" field="broken_qty" unit="kg" />
                <InputField label="Price / kg (₹)" field="broken_price" unit="₹" />
              </TwoCol>

              <p className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: '#2d7a3a' }}>
                🟤 Bran
              </p>
              <TwoCol>
                <InputField label="Bran Qty (kg)" field="bran_qty" unit="kg" />
                <InputField label="Price / kg (₹)" field="bran_price" unit="₹" />
              </TwoCol>

              <p className="text-xs font-bold uppercase tracking-wider mb-3 mt-2" style={{ color: '#2d7a3a' }}>
                🌿 Husk
              </p>
              <TwoCol>
                <InputField label="Husk Qty (kg)" field="husk_qty" unit="kg" />
                <InputField label="Price / kg (₹)" field="husk_price" unit="₹" />
              </TwoCol>

              <div
                className="rounded-xl p-3 mt-2 flex justify-between items-center"
                style={{ background: '#e8f5ec' }}
              >
                <span className="text-xs font-medium" style={{ color: '#3d5c42' }}>Total Sales</span>
                <span className="text-sm font-bold" style={{ color: '#1a5c2a' }}>
                  {fmt(calc.totalSales)}
                </span>
              </div>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-4 rounded-xl font-semibold text-sm"
                style={{ background: '#ffffff', border: '1.5px solid #c3dcc8', color: '#3d5c42' }}
              >
                ← Back
              </button>
              <button
                onClick={() => next(3)}
                className="flex-[2] py-4 rounded-xl text-white font-semibold text-base"
                style={{ background: '#2d7a3a' }}
              >
                Calculate Profit 🧮
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Results ── */}
        {step === 4 && (
          <div className="fade-in">
            <h2 className="font-serif text-xl mb-4" style={{ color: '#1a2e1d' }}>🧮 Profit Results</h2>

            {/* Hero result */}
            <div
              className="rounded-2xl p-5 text-center mb-4"
              style={{
                background: `linear-gradient(135deg, ${isProfit ? '#1a5c2a, #2d7a3a' : '#8b1a1a, #c0392b'})`,
              }}
            >
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', marginBottom: '4px' }}>
                {isProfit ? 'Net Profit' : 'Net Loss'} — {data.batch_number}
              </p>
              <p className="font-serif text-white" style={{ fontSize: '44px', lineHeight: 1 }}>
                {fmt(calc.profit)}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginTop: '6px' }}>
                {new Date(data.date).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
              <span
                className="inline-block mt-2.5 px-4 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'rgba(255,255,255,0.18)' }}
              >
                {isProfit ? '▲' : '▼'} {Math.abs(calc.margin).toFixed(1)}% margin
              </span>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { v: `${calc.yieldPercent.toFixed(1)}%`, l: 'Rice Yield' },
                { v: `₹${calc.profitPerKg.toFixed(2)}`, l: 'Per KG', color: isProfit ? '#2d7a3a' : '#c0392b' },
                { v: `${calc.margin.toFixed(1)}%`, l: 'Margin' },
              ].map(m => (
                <div
                  key={m.l}
                  className="rounded-xl p-2.5 text-center"
                  style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
                >
                  <p className="text-base font-bold" style={{ color: m.color || '#1a2e1d' }}>{m.v}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#6b896f', fontSize: '10px' }}>{m.l}</p>
                </div>
              ))}
            </div>

            {/* Cost breakdown */}
            <div
              className="rounded-xl p-4 mb-3"
              style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3d5c42' }}>
                Cost Breakdown
              </p>
              {[
                { l: 'Raw Material', v: calc.rawMaterialCost },
                { l: 'Labor', v: data.labor_cost },
                { l: 'Electricity', v: data.electricity_cost },
                { l: 'Transport', v: data.transport_cost },
                { l: 'Packaging', v: data.packaging_cost },
                { l: 'Other', v: data.other_cost },
              ].map(r => (
                <div
                  key={r.l}
                  className="flex justify-between py-2"
                  style={{ borderBottom: '1px solid #eaf3eb', fontSize: '14px' }}
                >
                  <span style={{ color: '#3d5c42' }}>{r.l}</span>
                  <span className="font-semibold" style={{ color: '#c0392b' }}>{fmt(r.v)}</span>
                </div>
              ))}
              <div
                className="flex justify-between py-2 font-bold"
                style={{ fontSize: '15px' }}
              >
                <span style={{ color: '#1a2e1d' }}>Total Cost</span>
                <span style={{ color: '#c0392b' }}>{fmt(calc.totalCost)}</span>
              </div>
            </div>

            {/* Sales breakdown */}
            <div
              className="rounded-xl p-4 mb-4"
              style={{ background: '#ffffff', border: '1px solid #c3dcc8' }}
            >
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#3d5c42' }}>
                Sales Breakdown
              </p>
              {[
                { l: `🍚 Rice (${data.rice_qty}kg × ₹${data.rice_price})`, v: calc.riceSales },
                { l: `💔 Broken Rice (${data.broken_qty}kg × ₹${data.broken_price})`, v: calc.brokenSales },
                { l: `🟤 Bran (${data.bran_qty}kg × ₹${data.bran_price})`, v: calc.branSales },
                { l: `🌿 Husk (${data.husk_qty}kg × ₹${data.husk_price})`, v: calc.huskSales },
              ].map(r => (
                <div
                  key={r.l}
                  className="flex justify-between py-2"
                  style={{ borderBottom: '1px solid #eaf3eb', fontSize: '13px' }}
                >
                  <span style={{ color: '#3d5c42' }}>{r.l}</span>
                  <span className="font-semibold" style={{ color: '#2d7a3a' }}>{fmt(r.v)}</span>
                </div>
              ))}
              <div
                className="flex justify-between py-2 font-bold"
                style={{ fontSize: '15px' }}
              >
                <span style={{ color: '#1a2e1d' }}>Total Sales</span>
                <span style={{ color: '#2d7a3a' }}>{fmt(calc.totalSales)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-4">
              <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: '#3d5c42' }}>
                Notes (optional)
              </label>
              <textarea
                value={data.notes || ''}
                onChange={set('notes')}
                rows={2}
                placeholder="Any additional remarks..."
                className="w-full rounded-xl outline-none"
                style={{
                  padding: '12px 14px', border: '1.5px solid #c3dcc8',
                  fontSize: '15px', background: '#ffffff', color: '#1a2e1d',
                  fontFamily: 'DM Sans, sans-serif', resize: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = '#2d7a3a')}
                onBlur={e => (e.target.style.borderColor = '#c3dcc8')}
              />
            </div>

            <div className="flex gap-2.5 mb-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-4 rounded-xl font-semibold text-sm"
                style={{ background: '#ffffff', border: '1.5px solid #c3dcc8', color: '#3d5c42' }}
              >
                ← Edit
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-[2] py-4 rounded-xl text-white font-semibold text-base transition-all"
                style={{
                  background: saving ? '#6b896f' : '#2d7a3a',
                  boxShadow: saving ? 'none' : '0 4px 16px rgba(45,122,58,0.35)',
                }}
              >
                {saving ? '⏳ Saving...' : '💾 Save Batch'}
              </button>
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
