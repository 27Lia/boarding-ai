'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Table, Button, Tag, Avatar, Progress, Input, Modal,
  Form, Select, Drawer, Timeline, Badge, Empty, Spin, message,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, UserOutlined,
  MailOutlined, BankOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import type { Customer } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/store/workspace.store'

const { Search } = Input

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: 'success', label: '완료' },
  in_progress: { color: 'processing', label: '진행 중' },
  not_started: { color: 'default', label: '미시작' },
  at_risk: { color: 'error', label: '위험' },
}

interface CustomerWithProgress extends Customer {
  progress_rate: number
}

interface Template { id: string; name: string }
interface ProgressItem { id: string; step_id: string; completed: boolean; completed_at?: string; checklist_steps: { title: string } }

export default function CustomersPage() {
  const workspace = useWorkspaceStore((s) => s.currentWorkspace)
  const [customers, setCustomers] = useState<CustomerWithProgress[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithProgress | null>(null)
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([])
  const [form] = Form.useForm()

  const loadCustomers = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('workspace_id', workspace.id)
      .order('created_at', { ascending: false })

    if (!customerData) { setLoading(false); return }

    const withProgress = await Promise.all(customerData.map(async (c) => {
      const { data: steps } = await supabase
        .from('checklist_steps')
        .select('id')
        .eq('template_id', c.template_id)

      const { data: done } = await supabase
        .from('customer_progress')
        .select('id')
        .eq('customer_id', c.id)
        .eq('completed', true)

      const total = steps?.length ?? 0
      const completed = done?.length ?? 0
      const progress_rate = total > 0 ? Math.round((completed / total) * 100) : 0
      return { ...c, progress_rate }
    }))

    setCustomers(withProgress)
    setLoading(false)
  }, [workspace])

  const loadTemplates = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()
    const { data } = await supabase
      .from('checklist_templates')
      .select('id, name')
      .eq('workspace_id', workspace.id)
    if (data) setTemplates(data)
  }, [workspace])

  useEffect(() => {
    loadCustomers()
    loadTemplates()
  }, [workspace])

  const openDrawer = async (customer: CustomerWithProgress) => {
    setSelectedCustomer(customer)
    setDrawerOpen(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('customer_progress')
      .select('*, checklist_steps(title)')
      .eq('customer_id', customer.id)
      .order('completed_at', { ascending: false })
    if (data) setProgressItems(data as ProgressItem[])
  }

  const handleAddCustomer = async (values: { name: string; email: string; company?: string; template_id: string }) => {
    if (!workspace) return
    const supabase = createClient()
    const { data } = await supabase.from('customers').insert({
      workspace_id: workspace.id,
      name: values.name,
      email: values.email,
      company: values.company,
      template_id: values.template_id,
      status: 'not_started',
    }).select().single()

    if (data) {
      const { data: steps } = await supabase
        .from('checklist_steps')
        .select('id')
        .eq('template_id', values.template_id)

      if (steps && steps.length > 0) {
        await supabase.from('customer_progress').insert(
          steps.map((s) => ({ customer_id: data.id, step_id: s.id, completed: false }))
        )
      }

      setCustomers((prev) => [{ ...data, progress_rate: 0 }, ...prev])
      message.success('고객이 추가됐습니다')
    }
    setAddModalOpen(false)
    form.resetFields()
  }

  const filtered = customers.filter((c) =>
    c.name.includes(search) || c.email.includes(search) || (c.company ?? '').includes(search)
  )

  const columns = [
    {
      title: '고객',
      dataIndex: 'name',
      render: (name: string, row: CustomerWithProgress) => (
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => openDrawer(row)}>
          <Avatar style={{ background: '#6366f1' }}>{name[0]}</Avatar>
          <div>
            <p className="font-medium text-gray-900 text-sm hover:text-indigo-600">{name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: '회사',
      dataIndex: 'company',
      render: (c: string) => <span className="text-gray-600 text-sm">{c ?? '-'}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (s: string) => <Tag color={statusConfig[s]?.color}>{statusConfig[s]?.label}</Tag>,
      filters: Object.entries(statusConfig).map(([v, { label }]) => ({ text: label, value: v })),
      onFilter: (value: unknown, record: CustomerWithProgress) => record.status === value,
    },
    {
      title: '진행률',
      dataIndex: 'progress_rate',
      render: (v: number) => <div className="w-32"><Progress percent={v} size="small" strokeColor="#6366f1" /></div>,
      sorter: (a: CustomerWithProgress, b: CustomerWithProgress) => a.progress_rate - b.progress_rate,
    },
    {
      title: '시작일',
      dataIndex: 'created_at',
      render: (d: string) => <span className="text-gray-400 text-sm">{d.slice(0, 10)}</span>,
    },
    {
      title: '',
      render: (_: unknown, row: CustomerWithProgress) => (
        <Button type="text" size="small" onClick={() => openDrawer(row)}>상세보기</Button>
      ),
    },
  ]

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="text-gray-500 mt-1">총 {customers.length}명의 고객</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} size="large" style={{ background: '#6366f1', borderColor: '#6366f1' }} onClick={() => setAddModalOpen(true)}>
          고객 추가
        </Button>
      </div>

      <div className="mb-4">
        <Search placeholder="이름, 이메일, 회사명 검색..." prefix={<SearchOutlined />} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 320 }} size="large" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border-0">
        <Table
          dataSource={filtered}
          columns={columns}
          rowKey="id"
          locale={{ emptyText: <Empty description="고객이 없습니다" /> }}
          pagination={{ pageSize: 10, showTotal: (total) => `총 ${total}명` }}
        />
      </div>

      {/* 고객 추가 모달 */}
      <Modal title="새 고객 추가" open={addModalOpen} onCancel={() => { setAddModalOpen(false); form.resetFields() }} onOk={() => form.submit()} okText="추가" cancelText="취소" okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}>
        <Form form={form} layout="vertical" className="mt-4" onFinish={handleAddCustomer}>
          <Form.Item name="name" label="이름" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="홍길동" />
          </Form.Item>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="hong@company.com" />
          </Form.Item>
          <Form.Item name="company" label="회사명">
            <Input prefix={<BankOutlined />} placeholder="회사 이름" />
          </Form.Item>
          <Form.Item name="template_id" label="온보딩 템플릿" rules={[{ required: true }]}>
            <Select placeholder="템플릿 선택">
              {templates.map((t) => (
                <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 고객 상세 드로어 */}
      <Drawer
        title={
          selectedCustomer && (
            <div className="flex items-center gap-3">
              <Avatar size={40} style={{ background: '#6366f1' }}>{selectedCustomer.name[0]}</Avatar>
              <div>
                <p className="font-semibold text-gray-900">{selectedCustomer.name}</p>
                <p className="text-xs text-gray-400 font-normal">{selectedCustomer.company}</p>
              </div>
            </div>
          )
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
      >
        {selectedCustomer && (
          <div>
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">온보딩 진행률</span>
                <Tag color={statusConfig[selectedCustomer.status]?.color}>
                  {statusConfig[selectedCustomer.status]?.label}
                </Tag>
              </div>
              <Progress percent={selectedCustomer.progress_rate} strokeColor="#6366f1" size={['100%', 8]} />
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <MailOutlined className="text-gray-400" />
                <span className="text-gray-600">{selectedCustomer.email}</span>
              </div>
              {selectedCustomer.company && (
                <div className="flex items-center gap-3 text-sm">
                  <BankOutlined className="text-gray-400" />
                  <span className="text-gray-600">{selectedCustomer.company}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <ClockCircleOutlined className="text-gray-400" />
                <span className="text-gray-600">시작일: {selectedCustomer.created_at.slice(0, 10)}</span>
              </div>
            </div>

            <div>
              <p className="font-semibold text-gray-800 mb-4">활동 타임라인</p>
              {progressItems.length === 0 ? (
                <Empty description="아직 완료한 단계가 없습니다" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Timeline
                  items={progressItems.map((p) => ({
                    color: p.completed ? 'green' : 'gray',
                    dot: p.completed ? <CheckCircleOutlined /> : undefined,
                    children: (
                      <div>
                        <p className="text-sm text-gray-800">{p.checklist_steps.title}</p>
                        <p className="text-xs text-gray-400">{p.completed_at?.slice(0, 16).replace('T', ' ') ?? '미완료'}</p>
                      </div>
                    ),
                  }))}
                />
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
