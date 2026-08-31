import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import {
  calculateZakatScenario,
  parseZakatKarat,
  roundZakatValue,
  ZAKAT_NISAB_GRAMS,
  ZAKAT_RATE,
  type ZakatHolding,
} from '@/lib/zakat-calculations'

function parsePositiveNumber(value: string | null, fieldName: string): { value: number } | { error: string } {
  if (!value) {
    return { error: `${fieldName} parameter is required` }
  }

  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return { error: `${fieldName} must be a positive number` }
  }

  return { value: parsed }
}

function parsePersonalUse(value: string | null): boolean {
  if (!value) return false

  return ['1', 'true', 'yes', 'y', 'personal', 'worn', 'daily'].includes(value.trim().toLowerCase())
}

function parseHoldingToken(token: string): ZakatHolding | { error: string } {
  const parts = token.split(/[:|@]/).map((part) => part.trim()).filter(Boolean)

  if (parts.length < 2) {
    return { error: 'Each holding must use grams:karat, for example 100:21k' }
  }

  const grams = Number(parts[0])
  if (!Number.isFinite(grams) || grams <= 0) {
    return { error: 'Each holding grams value must be a positive number' }
  }

  const karat = parseZakatKarat(parts[1])
  if (!karat) {
    return { error: 'Invalid karat. Use 24, 22, 21, or 18.' }
  }

  return {
    grams,
    karat,
    personalUse: parsePersonalUse(parts[2] ?? null),
  }
}

function parseHoldings(searchParams: URLSearchParams): ZakatHolding[] | { error: string } {
  const itemValues = [
    ...searchParams.getAll('items[]'),
    ...searchParams.getAll('items'),
    ...searchParams.getAll('holding'),
  ]
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean)

  if (itemValues.length > 0) {
    const holdings = itemValues.map(parseHoldingToken)
    const invalid = holdings.find((holding): holding is { error: string } => 'error' in holding)
    if (invalid) return invalid
    return holdings as ZakatHolding[]
  }

  const gramsValues = searchParams.getAll('grams')
  const karatValues = searchParams.getAll('karat')
  const personalUseValues = searchParams.getAll('personal_use')

  if (gramsValues.length > 1 || karatValues.length > 1) {
    if (gramsValues.length === 0 || karatValues.length === 0 || gramsValues.length !== karatValues.length) {
      return { error: 'Repeated grams and karat parameters must have the same item count' }
    }

    const holdings: ZakatHolding[] = []

    for (let index = 0; index < gramsValues.length; index += 1) {
      const gramsResult = parsePositiveNumber(gramsValues[index], 'grams')
      if ('error' in gramsResult) return gramsResult

      const karat = parseZakatKarat(karatValues[index])
      if (!karat) return { error: 'Invalid karat. Use 24, 22, 21, or 18.' }

      holdings.push({
        grams: gramsResult.value,
        karat,
        personalUse: parsePersonalUse(personalUseValues[index] ?? null),
      })
    }

    return holdings
  }

  const gramsResult = parsePositiveNumber(searchParams.get('grams'), 'grams')
  if ('error' in gramsResult) return gramsResult

  const karat = parseZakatKarat(searchParams.get('karat'))
  if (!karat) {
    return { error: 'Invalid karat. Use 24, 22, 21, or 18.' }
  }

  return [{
    grams: gramsResult.value,
    karat,
    personalUse: parsePersonalUse(searchParams.get('personal_use')),
  }]
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const holdingsResult = parseHoldings(searchParams)

    if ('error' in holdingsResult) {
      return NextResponse.json({ error: holdingsResult.error }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('gold_prices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: 'No gold price data available' },
        { status: 404 }
      )
    }

    const holdings = holdingsResult
    const pricePerGram24k = Number(data.price_24k)
    const includingAll = calculateZakatScenario(holdings, pricePerGram24k)
    const exemptingPersonalUse = calculateZakatScenario(
      holdings.filter((holding) => !holding.personalUse),
      pricePerGram24k
    )
    const hasPersonalUse = holdings.some((holding) => holding.personalUse)
    const totalGrams = roundZakatValue(holdings.reduce((sum, holding) => sum + holding.grams, 0))
    const karat = holdings.length === 1 ? `${holdings[0].karat}k` : 'mixed'

    return NextResponse.json({
      grams: totalGrams,
      karat,
      holdings: holdings.map((holding) => ({
        grams: roundZakatValue(holding.grams),
        karat: `${holding.karat}k`,
        personal_use: Boolean(holding.personalUse),
        pure_weight_grams: roundZakatValue(holding.grams * (holding.karat / 24)),
      })),
      pure_weight_grams: includingAll.pure_weight_grams,
      nisab_grams: ZAKAT_NISAB_GRAMS,
      nisab_met: includingAll.nisab_met,
      price_per_gram_24k: pricePerGram24k,
      currency: data.currency || 'OMR',
      zakat_rate: ZAKAT_RATE,
      zakat_grams: includingAll.zakat_grams,
      zakat_amount: includingAll.zakat_amount,
      updated_at: data.created_at,
      note: includingAll.nisab_met
        ? 'Cash zakat should use the 24k price on the day zakat is paid.'
        : 'Zakat is not due because the aggregated pure gold weight is below the 85g nisab.',
      scenarios: {
        including_personal_use: includingAll,
        exempting_personal_use: exemptingPersonalUse,
      },
      personal_use_note: hasPersonalUse
        ? 'Some scholars exempt personally worn daily-use jewelry while others include it. Consult Oman official guidance or a qualified scholar for your situation.'
        : undefined,
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to calculate gold zakat' },
      { status: 500 }
    )
  }
}
