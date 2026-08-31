import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 500

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')
  const limit = limitParam === null ? DEFAULT_LIMIT : Number(limitParam)
  const offset = offsetParam === null ? 0 : Number(offsetParam)

  if (
    (limitParam !== null && !/^\d+$/.test(limitParam)) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_LIMIT
  ) {
    return NextResponse.json(
      {
        success: false,
        error: `limit must be an integer between 1 and ${MAX_LIMIT}`,
      },
      { status: 400 }
    )
  }

  if (
    (offsetParam !== null && !/^\d+$/.test(offsetParam)) ||
    !Number.isSafeInteger(offset) ||
    offset < 0
  ) {
    return NextResponse.json(
      {
        success: false,
        error: 'offset must be a non-negative integer',
      },
      { status: 400 }
    )
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

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
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch gold price history'
      },
      { status: 500 }
    )
  }
}
