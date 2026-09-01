'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts'
import { useI18n } from '@/lib/i18n/LanguageProvider'

type HistoryPoint = {
  id?: number
  created_at: string
  prices: { '24k': number; '22k': number; '21k': number; '18k': number }
}

type ChartPoint = {
  time: number
  date: string
  label: string
  labelShort?: string
  '24k': number
  '22k': number
  '21k': number
  '18k': number
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatDateAndTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const KARATS = ['24k', '22k', '21k', '18k'] as const
type KaratKey = (typeof KARATS)[number]

const HISTORY_PAGE_SIZE = 500
const TIME_RANGES = [
  { key: '7d', label: '7D', days: 7 },
  { key: '30d', label: '30D', days: 30 },
  { key: '90d', label: '90D', days: 90 },
  { key: '1y', label: '1Y', days: 365 },
  { key: 'all', label: 'All', days: null },
] as const
type TimeRangeKey = (typeof TIME_RANGES)[number]['key']

const KARAT_COLORS: Record<KaratKey, string> = {
  '24k': '#B8860B',
  '22k': '#D4A017',
  '21k': '#F5BE27',
  '18k': '#C9A227',
}

function parseKaratPrices(p: Record<string, unknown>) {
  return {
    '24k': Number(p['24k'] ?? 0),
    '22k': Number(p['22k'] ?? 0),
    '21k': Number(p['21k'] ?? 0),
    '18k': Number(p['18k'] ?? 0),
  }
}

function buildChartPoints(json: { success?: boolean; data?: unknown }): ChartPoint[] {
  if (json.success !== true || !Array.isArray(json.data)) return []
  const raw: ChartPoint[] = []
  for (const row of json.data as HistoryPoint[]) {
    const time = new Date(row.created_at).getTime()
    if (!Number.isFinite(time)) continue
    const prices = parseKaratPrices((row.prices ?? {}) as Record<string, unknown>)
    if (prices['24k'] <= 0 && prices['22k'] <= 0 && prices['21k'] <= 0 && prices['18k'] <= 0) {
      continue
    }
    raw.push({
      time,
      date: row.created_at,
      label: formatDateAndTime(row.created_at),
      labelShort: formatDate(row.created_at),
      ...prices,
    })
  }
  raw.sort((a, b) => a.time - b.time || (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  const deduped: ChartPoint[] = []
  for (const pt of raw) {
    const prev = deduped[deduped.length - 1]
    if (prev && prev.time === pt.time) {
      deduped[deduped.length - 1] = pt
    } else {
      deduped.push(pt)
    }
  }
  return deduped
}

function mergeLatestPoint(points: ChartPoint[], latest: { updated_at: string; prices: Record<string, unknown> }): ChartPoint[] {
  if (points.length === 0) return points
  const liveMs = new Date(latest.updated_at).getTime()
  if (!Number.isFinite(liveMs)) return points
  const last = points[points.length - 1]
  if (liveMs <= last.time) return points
  const prices = parseKaratPrices(latest.prices)
  if (prices['24k'] <= 0 && prices['22k'] <= 0 && prices['21k'] <= 0 && prices['18k'] <= 0) {
    return points
  }
  return [
    ...points,
    {
      time: liveMs,
      date: latest.updated_at,
      label: formatDateAndTime(latest.updated_at),
      labelShort: formatDate(latest.updated_at),
      ...prices,
    },
  ]
}

async function fetchAllHistory(): Promise<ChartPoint[]> {
  const rows: HistoryPoint[] = []
  let offset = 0

  while (true) {
    const response = await fetch(
      `/api/v1/gold/history?limit=${HISTORY_PAGE_SIZE}&offset=${offset}`,
      { cache: 'no-store' }
    )
    if (!response.ok) throw new Error(`History API ${response.status}`)

    const json = await response.json()
    if (json.success !== true || !Array.isArray(json.data)) {
      throw new Error('Invalid history response')
    }

    rows.push(...(json.data as HistoryPoint[]))
    if (json.data.length < HISTORY_PAGE_SIZE) break
    offset += json.data.length
  }

  return buildChartPoints({ success: true, data: rows })
}

export default function HeroGoldChart() {
  const { t } = useI18n()
  const [data, setData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKarat, setSelectedKarat] = useState<KaratKey>('24k')
  const [selectedRange, setSelectedRange] = useState<TimeRangeKey>('all')

  useEffect(() => {
    let cancelled = false

    function load() {
      Promise.all([
        fetchAllHistory(),
        fetch('/api/v1/gold/latest', { cache: 'no-store' }),
      ])
        .then(async ([historyPoints, latestRes]) => {
          let points = historyPoints
          if (latestRes.ok) {
            const latestJson = await latestRes.json()
            if (!latestJson?.error && latestJson?.updated_at && latestJson?.prices) {
              points = mergeLatestPoint(points, {
                updated_at: latestJson.updated_at,
                prices: latestJson.prices as Record<string, unknown>,
              })
            }
          }
          return points
        })
        .then((points) => {
          if (cancelled) return
          setData(points)
          setError(null)
        })
        .catch((err) => {
          if (!cancelled) {
            setError(err instanceof Error ? err.message : 'Failed to load')
            setData([])
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const interval = setInterval(load, 2 * 60 * 1000)
    const onFocus = () => load()
    window.addEventListener('focus', onFocus)
    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  const visibleData = useMemo(() => {
    const range = TIME_RANGES.find((item) => item.key === selectedRange)
    if (!range?.days || data.length === 0) return data

    const latestTime = data[data.length - 1].time
    const startTime = latestTime - range.days * 24 * 60 * 60 * 1000
    return data.filter((point) => point.time >= startTime)
  }, [data, selectedRange])

  if (loading) {
    return (
      <div className="w-full h-[140px] sm:h-[180px] md:h-[220px] mx-auto flex items-center justify-center mt-4 sm:mt-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-[#F5BE27] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full mx-auto mt-4 sm:mt-6 px-3 py-4 sm:px-4 sm:py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">{t('home.couldNotLoadChart')}</p>
        <p className="text-xs text-[#888] mt-1">{error}</p>
      </div>
    )
  }

  if (data.length < 2) {
    return (
      <div className="w-full mx-auto mt-4 sm:mt-6 px-3 py-4 sm:px-4 sm:py-6 rounded-xl bg-white/60 border border-amber-200 text-center">
        <p className="text-sm text-[#5c5c5c]">
          {t('home.chartNeedsData')}
        </p>
        <p className="text-xs text-[#888] mt-1">
          {t('home.noHistory')}
        </p>
      </div>
    )
  }

  const latest = data[data.length - 1]
  const selectedValues = visibleData.map((d) => d[selectedKarat]).filter((v) => Number.isFinite(v) && v > 0)
  const yMin = selectedValues.length ? Math.min(...selectedValues) : 0
  const yMax = selectedValues.length ? Math.max(...selectedValues) : 0
  const ySpan = yMax - yMin
  const yPadding = Math.max(0.12, ySpan > 0 ? ySpan * 0.08 : 0.25)
  let yLow = Math.floor((yMin - yPadding) * 1000) / 1000
  let yHigh = Math.ceil((yMax + yPadding) * 1000) / 1000
  if (!Number.isFinite(yLow) || !Number.isFinite(yHigh) || yLow >= yHigh) {
    yLow = (Number.isFinite(yMin) ? yMin : 0) - 0.5
    yHigh = (Number.isFinite(yMax) ? yMax : 1) + 0.5
  }
  const yDomain: [number, number] = [yLow, yHigh]

  const strokeColor = KARAT_COLORS[selectedKarat]
  const gradientId = `hero-gold-area-${selectedKarat}`

  return (
    <div className="mx-auto mt-4 min-w-0 w-full overflow-hidden px-0 sm:mt-5 md:mt-6">
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-2 sm:mb-2.5">
        {KARATS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setSelectedKarat(k)}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-md sm:rounded-lg text-xs sm:text-sm font-medium transition-all border-2 min-w-[3rem] sm:min-w-[3.5rem] md:min-w-[4rem]"
            style={{
              borderColor: selectedKarat === k ? KARAT_COLORS[k] : 'rgba(0,0,0,0.12)',
              backgroundColor: selectedKarat === k ? `${KARAT_COLORS[k]}18` : 'transparent',
              color: selectedKarat === k ? '#1a1a1a' : '#5c5c5c',
            }}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-1 mb-2 sm:mb-2.5" aria-label={t('home.chartTimeRange')}>
        {TIME_RANGES.map((range) => (
          <button
            key={range.key}
            type="button"
            aria-pressed={selectedRange === range.key}
            onClick={() => setSelectedRange(range.key)}
            className={`min-w-10 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
              selectedRange === range.key
                ? 'border-[#1a1a1a] bg-[#1a1a1a] text-white'
                : 'border-black/10 bg-white/55 text-[#5c5c5c] hover:border-black/25'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>
      {latest && (
        <div className="flex max-w-full flex-wrap items-center justify-center gap-x-2 gap-y-0.5 mb-2 text-xs text-[#5c5c5c] sm:mb-2.5 sm:gap-x-3 sm:text-sm md:gap-x-4">
          <span className="font-medium text-[#1a1a1a]">{t('home.latestPerGram')}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['24k'] }}>24k</span> {latest['24k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['22k'] }}>22k</span> {latest['22k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['21k'] }}>21k</span> {latest['21k'].toFixed(3)}</span>
          <span><span className="font-medium" style={{ color: KARAT_COLORS['18k'] }}>18k</span> {latest['18k'].toFixed(3)}</span>
          <span className="text-[#888]">{t('common.omr')}</span>
        </div>
      )}
      <div className="mb-2 text-center text-[11px] text-[#777] sm:text-xs">
        {t('home.showingRecords', { shown: visibleData.length.toLocaleString(), total: data.length.toLocaleString() })}
      </div>
      <div className="h-[168px] w-full min-w-0 overflow-hidden rounded-lg border border-[#e8e2da] bg-white/[0.72] px-1.5 py-2 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(184,134,11,0.06)] backdrop-blur-sm min-[400px]:h-[192px] sm:h-[216px] sm:px-2 sm:py-2.5 md:h-[248px] lg:h-[276px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visibleData} margin={{ top: 10, right: 8, left: 2, bottom: 4 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.42} />
                <stop offset="45%" stopColor={strokeColor} stopOpacity={0.12} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#ebe5dd" strokeOpacity={0.9} vertical={false} strokeDasharray="3 8" />
            <XAxis
              type="number"
              dataKey="time"
              domain={['dataMin', 'dataMax']}
              tick={{ fontSize: 9, fill: '#6b6560' }}
              axisLine={{ stroke: '#e0d9d0' }}
              tickLine={false}
              minTickGap={30}
              tickMargin={8}
              height={28}
              tickFormatter={(ms) => formatDateAndTime(new Date(Number(ms)).toISOString())}
            />
            <YAxis
              domain={yDomain}
              tick={{ fontSize: 9, fill: '#6b6560' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${Number(v).toFixed(2)}`}
              width={38}
              tickMargin={6}
            />
            <Tooltip
              cursor={{ stroke: strokeColor, strokeWidth: 1, strokeOpacity: 0.35 }}
              contentStyle={{
                backgroundColor: 'rgba(255,255,255,0.97)',
                border: '1px solid #e8e4df',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              }}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.date
                  ? formatDateAndTime((payload[0].payload as ChartPoint).date)
                  : ''
              }
              formatter={(value: unknown, name: unknown) => [`${Number(value ?? 0).toFixed(3)} ${t('common.omr')}`, String(name ?? '')]}
            />
            <Legend
              wrapperStyle={{ fontSize: '11px', paddingTop: 4 }}
              formatter={(value) => <span style={{ color: KARAT_COLORS[value as KaratKey] }}>{value}</span>}
            />
            <Area
              type="monotoneX"
              dataKey={selectedKarat}
              name={selectedKarat}
              stroke={strokeColor}
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              fillOpacity={1}
              baseValue={yLow}
              strokeLinecap="round"
              strokeLinejoin="round"
              dot={(dotProps) => {
                const { cx, cy, index, payload } = dotProps as {
                  cx?: number
                  cy?: number
                  index?: number
                  payload?: ChartPoint
                }
                if (
                  index !== visibleData.length - 1 ||
                  cx == null ||
                  cy == null ||
                  !payload ||
                  !Number.isFinite(payload[selectedKarat])
                ) {
                  return null
                }
                return (
                  <circle cx={cx} cy={cy} r={5} fill={strokeColor} stroke="#fff" strokeWidth={2.5} />
                )
              }}
              activeDot={{
                r: 7,
                strokeWidth: 2,
                stroke: '#fff',
                fill: strokeColor,
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
