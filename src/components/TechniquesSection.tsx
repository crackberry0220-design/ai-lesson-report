import { useMemo, useState } from 'react'
import { techniques, type Technique } from '../data/techniques'

export function TechniquesSection() {
  const [activeId, setActiveId] = useState(techniques[1].id)
  const active = useMemo(
    () => techniques.find((t) => t.id === activeId) as Technique,
    [activeId],
  )

  return (
    <section id="learn">
      <div className="section-head">
        <div className="eyebrow">기법 학습</div>
        <h2>개미가 알아야 할 투자 기법</h2>
        <p>
          가치·기술·수급·심리 축으로 정리했습니다. 카드를 눌러 단계와 함정을
          확인하세요.
        </p>
      </div>

      <div className="tech-grid">
        {techniques.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tech-card ${activeId === t.id ? 'active' : ''}`}
            onClick={() => setActiveId(t.id)}
          >
            <div className="tech-meta">
              <span className="chip brand">{t.category}</span>
              <span className="chip">{t.level}</span>
            </div>
            <h3>{t.title}</h3>
            <p>{t.summary}</p>
          </button>
        ))}
      </div>

      <div className="panel tech-detail" style={{ marginTop: '1rem' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.6rem' }}>
            {active.title} — 실전 단계
          </h3>
          <ol>
            {active.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p style={{ marginTop: '0.9rem', color: 'var(--signal)' }}>
            Tip: {active.tip}
          </p>
        </div>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.6rem' }}>
            자주 하는 실수
          </h3>
          <ul>
            {active.pitfalls.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
