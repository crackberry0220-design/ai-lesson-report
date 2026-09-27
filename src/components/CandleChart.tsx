import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { AccumulationSignal, Candle } from '../lib/market'
import { sma } from '../lib/market'

type Props = {
  candles: Candle[]
  signals?: AccumulationSignal[]
  currency: 'KRW' | 'USD'
}

export function CandleChart({ candles, signals = [], currency }: Props) {
  const closes = candles.map((c) => c.close)
  const ma20 = sma(closes, 20)
  const data = candles.map((c, i) => ({
    ...c,
    ma20: ma20[i],
  }))

  const signalIdx = new Set(signals.map((s) => s.index))

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(125,185,160,0.12)" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#5f7d6e', fontSize: 11 }}
            tickFormatter={(v: string) => v.slice(5)}
            minTickGap={28}
          />
          <YAxis
            yAxisId="price"
            domain={['auto', 'auto']}
            tick={{ fill: '#5f7d6e', fontSize: 11 }}
            width={56}
            tickFormatter={(v: number) =>
              currency === 'KRW' ? `${Math.round(v / 1000)}k` : v.toFixed(0)
            }
          />
          <YAxis yAxisId="vol" orientation="right" hide domain={[0, 'dataMax']} />
          <Tooltip
            contentStyle={{
              background: '#12261f',
              border: '1px solid rgba(125,185,160,0.25)',
              borderRadius: 12,
            }}
            labelStyle={{ color: '#e8f2ec' }}
            formatter={(value, name) => {
              const n = typeof value === 'number' ? value : Number(value)
              if (name === 'close') {
                return [
                  currency === 'KRW'
                    ? `₩${Math.round(n).toLocaleString('ko-KR')}`
                    : `$${n.toFixed(2)}`,
                  '종가',
                ]
              }
              if (name === 'ma20') {
                return [
                  currency === 'KRW'
                    ? `₩${Math.round(n).toLocaleString('ko-KR')}`
                    : `$${Number(n).toFixed(2)}`,
                  'MA20',
                ]
              }
              if (name === 'volume') return [Math.round(n).toLocaleString('ko-KR'), '거래량']
              return [value, String(name)]
            }}
          />
          <Bar
            yAxisId="vol"
            dataKey="volume"
            fill="rgba(45,212,168,0.18)"
            barSize={5}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="close"
            stroke="#2dd4a8"
            strokeWidth={2.2}
            dot={(props) => {
              const { cx, cy, index } = props
              if (cx == null || cy == null || index == null) return null
              if (!signalIdx.has(index)) return <g key={`d-${index}`} />
              return (
                <circle
                  key={`sig-${index}`}
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill="#f0b429"
                  stroke="#07110e"
                  strokeWidth={2}
                />
              )
            }}
            activeDot={{ r: 4 }}
          />
          <Line
            yAxisId="price"
            type="monotone"
            dataKey="ma20"
            stroke="#f0b429"
            strokeWidth={1.4}
            strokeDasharray="4 4"
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
