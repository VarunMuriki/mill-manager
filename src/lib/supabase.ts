import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── TYPES ────────────────────────────────────────────────────────
export interface Batch {
  id: string
  batch_number: string
  date: string
  paddy_qty: number
  paddy_price: number
  labor_cost: number
  electricity_cost: number
  transport_cost: number
  packaging_cost: number
  other_cost: number
  raw_material_cost: number
  total_cost: number
  total_sales: number
  profit: number
  margin: number
  profit_per_kg: number
  yield_percent: number
  notes?: string
  created_at: string
  updated_at: string
  batch_outputs?: BatchOutput[]
}

export interface BatchOutput {
  id: string
  batch_id: string
  rice_qty: number
  rice_price: number
  broken_qty: number
  broken_price: number
  bran_qty: number
  bran_price: number
  husk_qty: number
  husk_price: number
}

export interface BatchFormData {
  batch_number: string
  date: string
  paddy_qty: number
  paddy_price: number
  labor_cost: number
  electricity_cost: number
  transport_cost: number
  packaging_cost: number
  other_cost: number
  rice_qty: number
  rice_price: number
  broken_qty: number
  broken_price: number
  bran_qty: number
  bran_price: number
  husk_qty: number
  husk_price: number
  notes?: string
}

// ─── CALCULATIONS ─────────────────────────────────────────────────
export function calculateBatch(data: BatchFormData) {
  const rawMaterialCost = data.paddy_qty * data.paddy_price
  const totalCost = rawMaterialCost + data.labor_cost + data.electricity_cost +
    data.transport_cost + data.packaging_cost + data.other_cost
  const riceSales = data.rice_qty * data.rice_price
  const brokenSales = data.broken_qty * data.broken_price
  const branSales = data.bran_qty * data.bran_price
  const huskSales = data.husk_qty * data.husk_price
  const totalSales = riceSales + brokenSales + branSales + huskSales
  const profit = totalSales - totalCost
  const margin = totalSales > 0 ? (profit / totalSales) * 100 : 0
  const profitPerKg = data.paddy_qty > 0 ? profit / data.paddy_qty : 0
  const yieldPercent = data.paddy_qty > 0 ? (data.rice_qty / data.paddy_qty) * 100 : 0

  return {
    rawMaterialCost,
    totalCost,
    riceSales,
    brokenSales,
    branSales,
    huskSales,
    totalSales,
    profit,
    margin,
    profitPerKg,
    yieldPercent,
  }
}

// ─── API HELPERS ──────────────────────────────────────────────────
export async function fetchBatches(): Promise<Batch[]> {
  const { data, error } = await supabase
    .from('batches')
    .select('*, batch_outputs(*)')
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchBatch(id: string): Promise<Batch | null> {
  const { data, error } = await supabase
    .from('batches')
    .select('*, batch_outputs(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function saveBatch(formData: BatchFormData): Promise<Batch> {
  const calc = calculateBatch(formData)

  const batchPayload = {
    batch_number: formData.batch_number,
    date: formData.date,
    paddy_qty: formData.paddy_qty,
    paddy_price: formData.paddy_price,
    labor_cost: formData.labor_cost,
    electricity_cost: formData.electricity_cost,
    transport_cost: formData.transport_cost,
    packaging_cost: formData.packaging_cost,
    other_cost: formData.other_cost,
    total_cost: calc.totalCost,
    total_sales: calc.totalSales,
    profit: calc.profit,
    margin: calc.margin,
    profit_per_kg: calc.profitPerKg,
    yield_percent: calc.yieldPercent,
    notes: formData.notes || null,
  }

  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .upsert(batchPayload, { onConflict: 'batch_number' })
    .select()
    .single()

  if (batchError) throw batchError

  const outputPayload = {
    batch_id: batch.id,
    rice_qty: formData.rice_qty,
    rice_price: formData.rice_price,
    broken_qty: formData.broken_qty,
    broken_price: formData.broken_price,
    bran_qty: formData.bran_qty,
    bran_price: formData.bran_price,
    husk_qty: formData.husk_qty,
    husk_price: formData.husk_price,
  }

  await supabase.from('batch_outputs').delete().eq('batch_id', batch.id)
  const { error: outputError } = await supabase.from('batch_outputs').insert(outputPayload)
  if (outputError) throw outputError

  return batch
}

export async function deleteBatch(id: string): Promise<void> {
  const { error } = await supabase.from('batches').delete().eq('id', id)
  if (error) throw error
}
