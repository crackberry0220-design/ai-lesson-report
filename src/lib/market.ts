export type Candle = {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export type AccumulationSignal = {
  index: number
  date: string
  score: number
  reasons: string[]
  candle: Candle
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashTicker(ticker: string) {
  let h = 2166136261
  for (let i = 0; i < ticker.length; i++) {
    h ^= ticker.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** 교육·데모용 시드 기반 OHLCV. 실제 시세가 아닌 분석 엔진 시연 데이터입니다. */
export function generateCandles(
  ticker: string,
  basePrice: number,
  days = 90,
): Candle[] {
  const rand = mulberry32(hashTicker(ticker) ^ 0x5a0c7)
  const candles: Candle[] = []
  let price = basePrice * (0.88 + rand() * 0.08)
  const start = new Date()
  start.setDate(start.getDate() - days)

  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue

    const drift = (rand() - 0.48) * 0.028
    const shock = rand() < 0.04 ? (rand() - 0.5) * 0.06 : 0
    const open = price
    const close = Math.max(0.5, open * (1 + drift + shock))
    const wickUp = rand() * 0.012 * close
    const wickDown = rand() * 0.018 * close
    let high = Math.max(open, close) + wickUp
    let low = Math.min(open, close) - wickDown

    // Inject occasional accumulation-like bars
    let volume = Math.floor(800_000 + rand() * 2_200_000)
    if (rand() < 0.08) {
      low = Math.min(open, close) - close * (0.025 + rand() * 0.03)
      const recover = close >= open ? close : open * (0.995 + rand() * 0.02)
      candles.push({
        date: d.toISOString().slice(0, 10),
        open,
        high: Math.max(high, recover),
        low,
        close: recover,
        volume: Math.floor(volume * (2.2 + rand() * 2)),
      })
      price = recover
      continue
    }

    volume = Math.floor(volume * (0.7 + rand() * 0.8))
    candles.push({
      date: d.toISOString().slice(0, 10),
      open: round(open),
      high: round(high),
      low: round(low),
      close: round(close),
      volume,
    })
    price = close
  }
  return candles
}

function round(n: number) {
  return Math.round(n * 100) / 100
}

export function sma(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(null)
      continue
    }
    let sum = 0
    for (let j = i - period + 1; j <= i; j++) sum += values[j]
    out.push(sum / period)
  }
  return out
}

export function rsi(closes: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(closes.length).fill(null)
  if (closes.length <= period) return out

  let gain = 0
  let loss = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gain += diff
    else loss -= diff
  }
  let avgGain = gain / period
  let avgLoss = loss / period
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const g = diff > 0 ? diff : 0
    const l = diff < 0 ? -diff : 0
    avgGain = (avgGain * (period - 1) + g) / period
    avgLoss = (avgLoss * (period - 1) + l) / period
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss)
  }
  return out
}

/**
 * 매집봉 점수화
 * - 거래량: 20일 평균 대비 배수
 * - 아랫꼬리(저가 눌림 후 회복)
 * - 종가 위치(몸통 상단 회복)
 * - 양봉 또는 도지형 회복
 */
export function detectAccumulation(
  candles: Candle[],
  lookback = 20,
): AccumulationSignal[] {
  const signals: AccumulationSignal[] = []
  if (candles.length < lookback + 1) return signals

  for (let i = lookback; i < candles.length; i++) {
    const c = candles[i]
    const window = candles.slice(i - lookback, i)
    const avgVol = window.reduce((s, x) => s + x.volume, 0) / lookback
    const volRatio = avgVol > 0 ? c.volume / avgVol : 0

    const range = c.high - c.low
    if (range <= 0) continue

    const lowerWick = Math.min(c.open, c.close) - c.low
    const upperWick = c.high - Math.max(c.open, c.close)
    const body = Math.abs(c.close - c.open)
    const lowerWickRatio = lowerWick / range
    const closePos = (c.close - c.low) / range
    const isBullish = c.close >= c.open

    const reasons: string[] = []
    let score = 0

    if (volRatio >= 1.8) {
      score += Math.min(35, (volRatio - 1) * 18)
      reasons.push(`거래량 ${volRatio.toFixed(1)}배 (20일 평균 대비)`)
    }
    if (lowerWickRatio >= 0.35) {
      score += lowerWickRatio * 30
      reasons.push(`긴 아랫꼬리 ${(lowerWickRatio * 100).toFixed(0)}% — 저가 매수세`)
    }
    if (closePos >= 0.65) {
      score += 18
      reasons.push('종가가 당일 고가권 회복')
    }
    if (isBullish && body / range >= 0.25) {
      score += 12
      reasons.push('매수 우위 양봉')
    } else if (closePos >= 0.7 && lowerWickRatio >= 0.4) {
      score += 10
      reasons.push('장중 매집 후 회복형')
    }
    if (upperWick / range < 0.25 && lowerWickRatio > upperWick / range) {
      score += 8
      reasons.push('윗꼬리 짧음 — 매도세 약함')
    }

    // Support near MA20
    const closes = candles.slice(0, i + 1).map((x) => x.close)
    const ma = sma(closes, 20)
    const ma20 = ma[i]
    if (ma20 && c.low <= ma20 * 1.01 && c.close >= ma20 * 0.99) {
      score += 10
      reasons.push('20일선 지지 구간에서 반등')
    }

    if (score >= 55 && reasons.length >= 2) {
      signals.push({
        index: i,
        date: c.date,
        score: Math.min(100, Math.round(score)),
        reasons,
        candle: c,
      })
    }
  }

  return signals.sort((a, b) => b.score - a.score)
}

export type TimingBias = '매수 관심' | '관망' | '매도·비중축소 관심'

export type TimingReport = {
  bias: TimingBias
  confidence: number
  summary: string
  bullets: string[]
  rsi: number | null
  ma20: number | null
  ma60: number | null
  lastClose: number
  changePct: number
  latestAccumulation: AccumulationSignal | null
}

export function analyzeTiming(candles: Candle[]): TimingReport {
  const closes = candles.map((c) => c.close)
  const last = candles[candles.length - 1]
  const prev = candles[candles.length - 2]
  const ma20Arr = sma(closes, 20)
  const ma60Arr = sma(closes, 60)
  const rsiArr = rsi(closes, 14)
  const ma20 = ma20Arr[ma20Arr.length - 1]
  const ma60 = ma60Arr[ma60Arr.length - 1]
  const lastRsi = rsiArr[rsiArr.length - 1]
  const acc = detectAccumulation(candles)
  const recentAcc = acc.find((s) => s.index >= candles.length - 5) ?? null

  const bullets: string[] = []
  let buy = 0
  let sell = 0

  if (ma20 && ma60) {
    if (ma20 > ma60 && last.close > ma20) {
      buy += 2
      bullets.push('단기·중기 이평선 정배열 + 주가 20일선 상회')
    } else if (ma20 < ma60 && last.close < ma20) {
      sell += 2
      bullets.push('이평선 역배열 + 주가 20일선 하회')
    } else {
      bullets.push('이평선 혼조 — 추세 확인 대기')
    }
  }

  if (lastRsi != null) {
    if (lastRsi <= 32) {
      buy += 2
      bullets.push(`RSI ${lastRsi.toFixed(1)} — 과매도권 반등 후보`)
    } else if (lastRsi >= 72) {
      sell += 2
      bullets.push(`RSI ${lastRsi.toFixed(1)} — 과매수권, 차익실현 검토`)
    } else {
      bullets.push(`RSI ${lastRsi.toFixed(1)} — 중립 구간`)
    }
  }

  if (recentAcc) {
    buy += 2
    bullets.push(
      `최근 매집봉 의심 (${recentAcc.date}, 점수 ${recentAcc.score})`,
    )
  }

  const changePct = prev ? ((last.close - prev.close) / prev.close) * 100 : 0

  let bias: TimingBias = '관망'
  let confidence = 45
  if (buy - sell >= 2) {
    bias = '매수 관심'
    confidence = Math.min(88, 50 + buy * 12)
  } else if (sell - buy >= 2) {
    bias = '매도·비중축소 관심'
    confidence = Math.min(88, 50 + sell * 12)
  }

  const summary =
    bias === '매수 관심'
      ? '수급·추세 지표가 단기 매수 관심 쪽으로 기울어 있습니다. 분할 매수와 손절가를 함께 설정하세요.'
      : bias === '매도·비중축소 관심'
        ? '과열·추세 약화 신호가 보입니다. 목표가 도달·손절 규칙을 점검하세요.'
        : '뚜렷한 방향 신호가 약합니다. 알림을 걸어두고 확인봉을 기다리세요.'

  return {
    bias,
    confidence,
    summary,
    bullets,
    rsi: lastRsi,
    ma20,
    ma60,
    lastClose: last.close,
    changePct,
    latestAccumulation: recentAcc,
  }
}
