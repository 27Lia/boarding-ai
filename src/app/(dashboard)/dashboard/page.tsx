'use client'

import dynamic from 'next/dynamic'
import { Card, Table, Tag, Avatar, Progress } from 'antd'
import {
  TeamOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons'

const CompletionLineChart = dynamic(() => import('@/components/charts/CompletionLineChart'), { ssr: false })
const StatusDoughnutChart = dynamic(() => import('@/components/charts/StatusDoughnutChart'), { ssr: false })
const StepDropoffBarChart = dynamic(() => import('@/components/charts/StepDropoffBarChart'), { ssr: false })

const stats = [
  { label: '전체 고객', value: 87, icon: <TeamOutlined />, color: '#6366f1', bg: '#eef2ff' },
  { label: '온보딩 완료', value: 38, icon: <CheckCircleOutlined />, color: '#22c55e', bg: '#f0fdf4' },
  { label: '진행 중', value: 31, icon: <ClockCircleOutlined />, color: '#f59e0b', bg: '#fffbeb' },
  { label: '위험 고객', value: 9, icon: <WarningOutlined />, color: '#ef4444', bg: '#fef2f2' },
]

const atRiskCustomers = [
  { key: '1', name: '김철수', company: 'ABC Corp', step: '팀원 초대', days: 12, progress: 30 },
  { key: '2', name: '이영희', company: 'XYZ Inc', step: '계정 설정', days: 9, progress: 15 },
  { key: '3', name: '박민준', company: 'DEF Ltd', step: '첫 프로젝트', days: 8, progress: 45 },
  { key: '4', name: '최지원', company: 'GHI Co', step: '연동 설정', days: 7, progress: 60 },
]

const columns = [
  {
    title: '고객',
    dataIndex: 'name',
    render: (name: string, row: typeof atRiskCustomers[0]) => (
      <div className="flex items-center gap-3">
        <Avatar style={{ background: '#6366f1' }}>{name[0]}</Avatar>
        <div>
          <p className="font-medium text-gray-900 text-sm">{name}</p>
          <p className="text-xs text-gray-400">{row.company}</p>
        </div>
      </div>
    ),
  },
  {
    title: '멈춘 단계',
    dataIndex: 'step',
    render: (step: string) => <Tag color="orange">{step}</Tag>,
  },
  {
    title: '미진행',
    dataIndex: 'days',
    render: (days: number) => <span className="text-red-500 font-medium">{days}일</span>,
  },
  {
    title: '진행률',
    dataIndex: 'progress',
    render: (v: number) => <Progress percent={v} size="small" strokeColor="#6366f1" />,
  },
]

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">고객 온보딩 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                style={{ background: s.bg, color: s.color }}
              >
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 차트 행 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card
          title={<span className="font-semibold text-gray-800">온보딩 완료율 추이</span>}
          className="lg:col-span-2 border-0 shadow-sm"
        >
          <div style={{ height: 240 }}>
            <CompletionLineChart />
          </div>
        </Card>

        <Card
          title={<span className="font-semibold text-gray-800">고객 상태 분포</span>}
          className="border-0 shadow-sm"
        >
          <div style={{ height: 240 }}>
            <StatusDoughnutChart completed={38} inProgress={31} notStarted={9} atRisk={9} />
          </div>
        </Card>
      </div>

      {/* 차트 행 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card
          title={<span className="font-semibold text-gray-800">단계별 이탈 현황</span>}
          className="border-0 shadow-sm"
        >
          <div style={{ height: 220 }}>
            <StepDropoffBarChart />
          </div>
        </Card>

        <Card
          title={
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">위험 고객</span>
              <Tag color="red">즉시 확인 필요</Tag>
            </div>
          }
          className="lg:col-span-2 border-0 shadow-sm"
        >
          <Table
            dataSource={atRiskCustomers}
            columns={columns}
            pagination={false}
            size="small"
          />
        </Card>
      </div>
    </div>
  )
}
