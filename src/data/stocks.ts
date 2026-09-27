export type Market = 'KR' | 'US'

export type StockProfile = {
  ticker: string
  name: string
  market: Market
  sector: string
  basePrice: number
  currency: 'KRW' | 'USD'
  thesis: string
  growthDrivers: string[]
  risks: string[]
  qualityScore: number
  growthScore: number
  tags: string[]
}

export const watchlist: StockProfile[] = [
  {
    ticker: '005930.KS',
    name: '삼성전자',
    market: 'KR',
    sector: '반도체·IT',
    basePrice: 72000,
    currency: 'KRW',
    thesis:
      '글로벌 메모리·파운드리 경쟁력을 바탕으로 AI 서버용 HBM·고대역폭 수요 수혜가 기대되는 국내 대표 우량주입니다.',
    growthDrivers: ['AI 서버 HBM 수요', '파운드리 고객 다변화', '견조한 현금창출력'],
    risks: ['메모리 사이클 변동', '지정학·수출규제', '경쟁사 기술 추격'],
    qualityScore: 92,
    growthScore: 78,
    tags: ['우량주', '반도체', '배당'],
  },
  {
    ticker: '000660.KS',
    name: 'SK하이닉스',
    market: 'KR',
    sector: '반도체',
    basePrice: 198000,
    currency: 'KRW',
    thesis:
      'HBM 시장 선두권 지위로 AI 가속기 공급망에서 핵심 수혜주로 평가됩니다. 실적 레버리지가 큰 성장형 우량주입니다.',
    growthDrivers: ['HBM3E·차세대 HBM', 'AI 캡ex 사이클', '제품 믹스 개선'],
    risks: ['고객 집중도', '설비투자 부담', '메모리 가격 급변'],
    qualityScore: 88,
    growthScore: 90,
    tags: ['성장', 'AI', '반도체'],
  },
  {
    ticker: '035420.KS',
    name: 'NAVER',
    market: 'KR',
    sector: '인터넷·플랫폼',
    basePrice: 215000,
    currency: 'KRW',
    thesis:
      '검색·커머스·핀테크·클라우드를 아우르는 국내 플랫폼. 클라우드·AI 검색 고도화가 중장기 성장 축입니다.',
    growthDrivers: ['커머스 수수료 구조 개선', '클라우드·AI', '콘텐츠·웹툰 해외'],
    risks: ['규제·경쟁 심화', '자회사 실적 변동', '광고 경기 민감'],
    qualityScore: 84,
    growthScore: 76,
    tags: ['플랫폼', 'AI', '현금흐름'],
  },
  {
    ticker: '068270.KS',
    name: '셀트리온',
    market: 'KR',
    sector: '바이오',
    basePrice: 182000,
    currency: 'KRW',
    thesis:
      '바이오시밀러 포트폴리오 확대와 글로벌 판매망이 강점입니다. 신약·신제품 파이프라인이 성장 스토리입니다.',
    growthDrivers: ['바이오시밀러 출시 확대', '미국·유럽 침투', '파이프라인'],
    risks: ['약가·경쟁', '임상·허가 리스크', '환율'],
    qualityScore: 80,
    growthScore: 82,
    tags: ['바이오', '성장', '글로벌'],
  },
  {
    ticker: '105560.KS',
    name: 'KB금융',
    market: 'KR',
    sector: '금융',
    basePrice: 92000,
    currency: 'KRW',
    thesis:
      '안정적 순이자마진·비이자이익과 주주환원(배당·자사주)이 매력인 금융 우량주입니다.',
    growthDrivers: ['주주환원 정책', '비은행 다각화', '자산건전성'],
    risks: ['금리 방향성', '신용비용', '규제'],
    qualityScore: 86,
    growthScore: 62,
    tags: ['배당', '우량주', '금융'],
  },
  {
    ticker: 'AAPL',
    name: 'Apple',
    market: 'US',
    sector: '컨슈머·테크',
    basePrice: 228,
    currency: 'USD',
    thesis:
      '하드웨어·서비스 생태계의 현금창출력과 브랜드 해자가 돋보이는 글로벌 우량주입니다. AI 온디바이스가 차기 모멘텀입니다.',
    growthDrivers: ['서비스 매출 비중 확대', '온디바이스 AI', '구독·설치기반'],
    risks: ['중국 수요', '규제·반독점', '혁신 사이클 공백'],
    qualityScore: 95,
    growthScore: 72,
    tags: ['우량주', '현금흐름', '브랜드'],
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    market: 'US',
    sector: '소프트웨어·클라우드',
    basePrice: 430,
    currency: 'USD',
    thesis:
      'Azure·Office·GitHub·OpenAI 제휴로 엔터프라이즈 AI 인프라의 핵심입니다. 반복매출 비중이 높은 품질 성장주입니다.',
    growthDrivers: ['Azure AI', 'Copilot 상용화', '보안·GitHub'],
    risks: ['클라우드 경쟁', 'AI 투자 회수기간', '밸류에이션'],
    qualityScore: 96,
    growthScore: 88,
    tags: ['AI', '클라우드', '우량주'],
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA',
    market: 'US',
    sector: '반도체·AI',
    basePrice: 125,
    currency: 'USD',
    thesis:
      '데이터센터 GPU·CUDA 생태계로 AI 학습·추론 인프라를 사실상 표준화한 성장주입니다. 소프트웨어·네트워킹으로 해자를 확장 중입니다.',
    growthDrivers: ['데이터센터 GPU', '추론·엣지 확장', 'CUDA 생태계'],
    risks: ['고객 집중·사이클', '경쟁 ASIC', '수출규제'],
    qualityScore: 90,
    growthScore: 95,
    tags: ['AI', '성장', '모멘텀'],
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet',
    market: 'US',
    sector: '인터넷·AI',
    basePrice: 178,
    currency: 'USD',
    thesis:
      '검색·YouTube 현금창출력 위에 Gemini·클라우드 AI가 성장축입니다. 자사주·순현금 기반도 튼튼합니다.',
    growthDrivers: ['검색 AI 고도화', 'Google Cloud', 'YouTube'],
    risks: ['검색 점유율 위협', '반독점 소송', '광고 경기'],
    qualityScore: 93,
    growthScore: 80,
    tags: ['AI', '현금흐름', '우량주'],
  },
  {
    ticker: 'AMZN',
    name: 'Amazon',
    market: 'US',
    sector: '커머스·클라우드',
    basePrice: 195,
    currency: 'USD',
    thesis:
      'AWS가 이익의 중심축이고, 리테일 효율화·광고가 마진을 끌어올립니다. AI 인프라 수요도 AWS 성장에 연결됩니다.',
    growthDrivers: ['AWS', '광고 사업', '물류 효율'],
    risks: ['규제·노무', '클라우드 경쟁', '소비 둔화'],
    qualityScore: 91,
    growthScore: 84,
    tags: ['클라우드', '성장', '현금흐름'],
  },
  {
    ticker: 'TSM',
    name: 'TSMC',
    market: 'US',
    sector: '반도체 파운드리',
    basePrice: 175,
    currency: 'USD',
    thesis:
      '첨단 공정 파운드리 사실상 독보적 지위. AI·스마트폰 AP 수요의 병목이자 수혜입니다.',
    growthDrivers: ['3nm·2nm 램프업', 'AI 가속기 수요', '가격 결정력'],
    risks: ['지정학(대만)', '설비투자', '고객 집중'],
    qualityScore: 94,
    growthScore: 86,
    tags: ['반도체', '우량주', 'AI'],
  },
  {
    ticker: 'LLY',
    name: 'Eli Lilly',
    market: 'US',
    sector: '제약·바이오',
    basePrice: 780,
    currency: 'USD',
    thesis:
      '비만·당뇨 GLP-1 치료제가 구조적 수요를 만들고 있습니다. 파이프라인과 생산능력 확대가 관건입니다.',
    growthDrivers: ['GLP-1 수요', '적응증 확대', '생산능력'],
    risks: ['경쟁약', '보험·약가', '공급 병목'],
    qualityScore: 89,
    growthScore: 91,
    tags: ['바이오', '성장', '구조적수요'],
  },
]

export function formatPrice(value: number, currency: 'KRW' | 'USD') {
  if (currency === 'KRW') {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      maximumFractionDigits: 0,
    }).format(value)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}
