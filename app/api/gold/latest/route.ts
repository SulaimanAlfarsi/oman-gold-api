import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: 'No gold price data available yet' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      currency: data.currency,
      prices: {
        '24k': data.price_24k,
        '22k': data.price_22k,
        '21k': data.price_21k,
        '18k': data.price_18k
      },
      updated_at: data.created_at,
      source: data.source
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch latest gold price' },
      { status: 500 }
    )
  }
}