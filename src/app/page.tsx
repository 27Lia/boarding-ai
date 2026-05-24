'use client'

import Link from 'next/link'
import { Button, Tag } from 'antd'
import { CheckCircleFilled, ThunderboltFilled, TeamOutlined, RocketOutlined, BarChartOutlined, SafetyCertificateOutlined } from '@ant-design/icons'

const features = [
  {
    icon: <ThunderboltFilled className="text-2xl text-indigo-500" />,
    title: 'AI 체크리스트 자동 생성',
    desc: '제품 설명만 입력하면 Claude AI가 최적의 온보딩 단계를 자동으로 만들어줍니다.',
  },
  {
    icon: <BarChartOutlined className="text-2xl text-indigo-500" />,
    title: '실시간 진행률 대시보드',
    desc: '전체 고객의 온보딩 현황을 한눈에 파악하고 이탈 위험 고객을 즉시 감지합니다.',
  },
  {
    icon: <TeamOutlined className="text-2xl text-indigo-500" />,
    title: '팀 협업',
    desc: '담당자 지정, 메모, 팀원 초대로 CS 팀 전체가 함께 온보딩을 관리합니다.',
  },
  {
    icon: <SafetyCertificateOutlined className="text-2xl text-indigo-500" />,
    title: '워크스페이스 관리',
    desc: '회사 단위 워크스페이스로 데이터를 안전하게 분리하고 권한을 관리합니다.',
  },
]

const plans = [
  {
    name: 'Free',
    price: '₩0',
    period: '/ 월',
    features: ['고객 10명까지', '체크리스트 3개', '팀원 2명', '기본 대시보드'],
    cta: '무료로 시작',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '₩29,000',
    period: '/ 월',
    features: ['고객 무제한', '체크리스트 무제한', '팀원 20명', 'AI 자동 생성', '위험 고객 알림', '고급 분석'],
    cta: '14일 무료 체험',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '문의',
    period: '',
    features: ['모든 Pro 기능', '전담 매니저', 'SSO / SAML', 'SLA 보장', 'API 접근', '맞춤 온보딩'],
    cta: '영업팀 문의',
    highlight: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RocketOutlined className="text-indigo-600 text-xl" />
            <span className="font-bold text-lg text-gray-900">BoardingAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">기능</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">요금제</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button type="text" className="text-gray-600">로그인</Button>
            </Link>
            <Link href="/signup">
              <Button type="primary" style={{ background: '#6366f1', borderColor: '#6366f1' }}>
                무료로 시작
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-24 pb-20 px-6 text-center bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto">
          <Tag color="purple" className="mb-6 px-4 py-1 text-sm font-medium">
            Powered by Claude AI
          </Tag>
          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
            고객 온보딩을 <span className="text-indigo-600">AI로 자동화</span>하세요
          </h1>
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            신규 고객이 제품을 제대로 쓰기 시작하도록<br />
            AI가 최적의 온보딩 체크리스트를 만들고 진행을 추적합니다.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button
                type="primary"
                size="large"
                style={{ background: '#6366f1', borderColor: '#6366f1', height: 48, padding: '0 32px', fontSize: 16 }}
              >
                무료로 시작하기 →
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="large" style={{ height: 48, padding: '0 32px', fontSize: 16 }}>
                데모 보기
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">신용카드 불필요 · 14일 무료 체험</p>
        </div>

        {/* 대시보드 미리보기 이미지 자리 */}
        <div className="mt-16 max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="ml-4 text-xs text-gray-400 font-mono">boardingai.io/dashboard</span>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 h-80 flex items-center justify-center">
            <div className="text-center">
              <BarChartOutlined className="text-6xl text-indigo-200 mb-4" />
              <p className="text-gray-300 text-lg">대시보드 스크린샷</p>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              온보딩 성공률을 높이는 모든 것
            </h2>
            <p className="text-gray-500 text-lg">SaaS 팀이 실제로 필요한 기능만 담았습니다</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-8 rounded-2xl border border-gray-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div className="mb-4">{f.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-16 px-6 bg-indigo-600">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
          {[
            { num: '68%', label: '온보딩 완료율 평균 향상' },
            { num: '3배', label: '이탈 감지 속도 향상' },
            { num: '2시간', label: '주간 CS 업무 절감' },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-bold mb-2">{s.num}</div>
              <div className="text-indigo-200">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 요금제 섹션 */}
      <section id="pricing" className="py-24 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">투명한 요금제</h2>
            <p className="text-gray-500 text-lg">팀 규모에 맞는 플랜을 선택하세요</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 ${
                  plan.highlight
                    ? 'bg-indigo-600 text-white shadow-xl scale-105'
                    : 'bg-white border border-gray-100'
                }`}
              >
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-end gap-1">
                    <span className={`text-3xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm mb-1 ${plan.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {plan.period}
                    </span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircleFilled className={plan.highlight ? 'text-indigo-200' : 'text-indigo-500'} />
                      <span className={`text-sm ${plan.highlight ? 'text-indigo-100' : 'text-gray-600'}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/signup">
                  <Button
                    block
                    size="large"
                    type={plan.highlight ? 'default' : 'primary'}
                    style={
                      plan.highlight
                        ? { fontWeight: 600 }
                        : { background: '#6366f1', borderColor: '#6366f1' }
                    }
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-24 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요
          </h2>
          <p className="text-gray-500 mb-8">14일 무료 체험, 신용카드 없이 시작 가능합니다</p>
          <Link href="/signup">
            <Button
              type="primary"
              size="large"
              style={{ background: '#6366f1', borderColor: '#6366f1', height: 52, padding: '0 40px', fontSize: 16 }}
            >
              무료로 시작하기 →
            </Button>
          </Link>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RocketOutlined className="text-indigo-600" />
            <span className="font-bold text-gray-900">BoardingAI</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 BoardingAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
