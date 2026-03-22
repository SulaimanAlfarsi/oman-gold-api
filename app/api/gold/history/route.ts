import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        currency: 'OMR',
        unit: 'gram',
        data: data.map((row) => ({
          id: row.id,
          prices: {
            '24k': row.price_24k,
            '22k': row.price_22k,
            '21k': row.price_21k,
            '18k': row.price_18k
          },
          source: row.source,
          created_at: row.created_at
        }))
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0'
        }
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gold price history'
      },
      { status: 500 }
    )
  }
}