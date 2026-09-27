import { useState } from 'react'
import type { StockProfile } from './data/stocks'
import { TechniquesSection } from './components/TechniquesSection'
import { ScannerSection } from './components/ScannerSection'
import { DiscoverySection } from './components/DiscoverySection'
import { AlertsSection } from './components/AlertsSection'

export default function App() {
  const [draft, setDraft] = useState<{
    stock: StockProfile
    price: number
    token: number
  } | null>(null)

  return (
    <div className="app-shell">
      <header className="topnav">
        <a href="#top" className="brand">
          <div className="brand-mark" aria-hidden>
            <span />
          </div>
          개미레이더
        </a>
        <nav className="nav-links">
          <a href="#learn">기법 학습</a>
          <a href="#scanner">매집봉</a>
          <a href="#discover">종목 분석</a>
          <a href="#alerts">알림</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow" style={{ color: 'var(--brand)', fontWeight: 600 }}>
              Retail Investor Companion
            </div>
            <h1>
              개미레이더
              <br />
              <em>매집·타이밍</em>을
              <br />
              놓치지 않게
            </h1>
            <p className="hero-lead">
              투자 기법을 배우고, 매집봉을 스캔하고, 국내·해외 우량·성장 후보를
              이유와 함께 분석하며, 매수·매도 알림까지 한곳에서 챙기세요.
            </p>
            <div className="cta-row">
              <a className="btn btn-primary" href="#discover">
                종목 분석 보기
              </a>
              <a className="btn btn-ghost" href="#scanner">
                매집봉 스캔
              </a>
            </div>
            <p className="disclaimer">
              교육·의사결정 보조 도구입니다. 투자 권유나 확정 수익을 보장하지
              않으며, 실제 매매 전 공시·시세·전문가 의견을 확인하세요.
            </p>
          </div>
          <div className="hero-visual" role="img" aria-label="상승 추세와 매집 신호 시각화">
            <div className="hero-caption">
              <div>
                <strong>수급이 모이는 자리</strong>
                <span>거래량 · 아랫꼬리 · 이평 지지</span>
              </div>
              <span className="chip signal">LIVE SCAN</span>
            </div>
          </div>
        </section>

        <TechniquesSection />
        <ScannerSection />
        <DiscoverySection
          onPickForAlert={(stock, price) =>
            setDraft({ stock, price, token: Date.now() })
          }
        />
        <AlertsSection draft={draft} />
      </main>

      <footer className="footer">
        개미레이더 · 차트·시세는 교육용 시드 데이터입니다. 실제 투자 판단은
        본인 책임입니다.
      </footer>
    </div>
  )
}
