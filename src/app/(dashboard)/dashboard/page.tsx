'use client'

import { useEffect, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, Table, Tag, Avatar, Progress, Spin } from 'antd'
import {
  TeamOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined,
} from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/store/workspace.store'

const CompletionLineChart = dynamic(() => import('@/components/charts/CompletionLineChart'), { ssr: false })
const StatusDoughnutChart = dynamic(() => import('@/components/charts/StatusDoughnutChart'), { ssr: false })
const StepDropoffBarChart = dynamic(() => import('@/components/charts/StepDropoffBarChart'), { ssr: false })

interface Stats { total: number; completed: number; in_progress: number; at_risk: number }
interface AtRiskRow { key: string; name: string; company: string; step: string; days: number; progress: number }

export default function DashboardPage() {
  const workspace = useWorkspaceStore((s) => s.currentWorkspace)
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, in_progress: 0, at_risk: 0 })
  const [atRisk, setAtRisk] = useState<AtRiskRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadDashboard = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()

    const { data: customers } = await supabase
      .from('customers')
      .select('id, name, company, status, template_id, updated_at')
      .eq('workspace_id', workspace.id)

    if (!customers) { setLoading(false); return }

    const total = customers.length
    const completed = customers.filter((c) => c.status === 'completed').length
    const in_progress = customers.filter((c) => c.status === 'in_progress').length
    const at_risk = customers.filter((c) => c.status === 'at_risk').length
    setStats({ total, completed, in_progress, at_risk })

    const atRiskCustomers = customers.filter((c) => c.status === 'at_risk' || c.status === 'in_progress')
    const atRiskRows = await Promise.all(atRiskCustomers.slice(0, 5).map(async (c) => {
      const { data: steps } = await supabase
        .from('checklist_steps')
        .select('id')
        .eq('template_id', c.template_id)

      const { data: done } = await supabase
        .from('customer_progress')
        .select('id, checklist_steps(title)')
        .eq('customer_id', c.id)
        .eq('completed', false)
        .limit(1)

      const total = steps?.length ?? 0
      const { data: doneCount } = await supabase
        .from('customer_progress')
        .select('id', { count: 'exact' })
        .eq('customer_id', c.id)
        .eq('completed', true)

      const completedCount = doneCount?.length ?? 0
      const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0
      const updatedAt = new Date(c.updated_at)
      const days = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24))

      const nextStep = (done?.[0] as { checklist_steps?: { title: string } } | undefined)?.checklist_steps?.title ?? '미설정'

      return { key: c.id, name: c.name, company: c.company ?? '-', step: nextStep, days, progress }
    }))

    setAtRisk(atRiskRows)
    setLoading(false)
  }, [workspace])

  useEffect(() => { loadDashboard() }, [workspace])

  const statCards = [
    { label: '전체 고객', value: stats.total, icon: <TeamOutlined />, color: '#6366f1', bg: '#eef2ff' },
    { label: '온보딩 완료', value: stats.completed, icon: <CheckCircleOutlined />, color: '#22c55e', bg: '#f0fdf4' },
    { label: '진행 중', value: stats.in_progress, icon: <ClockCircleOutlined />, color: '#f59e0b', bg: '#fffbeb' },
    { label: '위험 고객', value: stats.at_risk, icon: <WarningOutlined />, color: '#ef4444', bg: '#fef2f2' },
  ]

  const columns = [
    {
      title: '고객',
      dataIndex: 'name',
      render: (name: string, row: AtRiskRow) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ background: '#6366f1' }}>{name[0]}</Avatar>
          <div>
            <p className="font-medium text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{row.company}</p>
          </div>
        </div>
      ),
    },
    { title: '멈춘 단계', dataIndex: 'step', render: (s: string) => <Tag color="orange">{s}</Tag> },
    { title: '미진행', dataIndex: 'days', render: (d: number) => <span className="text-red-500 font-medium">{d}일</span> },
    { title: '진행률', dataIndex: 'progress', render: (v: number) => <Progress percent={v} size="small" strokeColor="#6366f1" /> },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 mt-1">고객 온보딩 현황을 한눈에 확인하세요</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm" styles={{ body: { padding: '20px' } }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{s.label}</p>
                <p className="text-3xl font-bold text-gray-900">{s.value}</p>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ background: s.bg, color: s.color }}>
                {s.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title={<span className="font-semibold text-gray-800">온보딩 완료율 추이</span>} className="lg:col-span-2 border-0 shadow-sm">
          <div style={{ height: 240 }}><CompletionLineChart /></div>
        </Card>
        <Card title={<span className="font-semibold text-gray-800">고객 상태 분포</span>} className="border-0 shadow-sm">
          <div style={{ height: 240 }}>
            <StatusDoughnutChart
              completed={stats.completed}
              inProgress={stats.in_progress}
              notStarted={stats.total - stats.completed - stats.in_progress - stats.at_risk}
              atRisk={stats.at_risk}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card title={<span className="font-semibold text-gray-800">단계별 이탈 현황</span>} className="border-0 shadow-sm">
          <div style={{ height: 220 }}><StepDropoffBarChart /></div>
        </Card>
        <Card
          title={<div className="flex items-center justify-between"><span className="font-semibold text-gray-800">위험 고객</span><Tag color="red">즉시 확인 필요</Tag></div>}
          className="lg:col-span-2 border-0 shadow-sm"
        >
          <Table dataSource={atRisk} columns={columns} pagination={false} size="small" locale={{ emptyText: '위험 고객 없음' }} />
        </Card>
      </div>
    </div>
  )
}
