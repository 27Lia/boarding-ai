'use client'

import { useState } from 'react'
import {
  Table, Button, Tag, Avatar, Progress, Input, Modal,
  Form, Select, Drawer, Timeline, Badge, Empty,
} from 'antd'
import {
  PlusOutlined, SearchOutlined, UserOutlined,
  MailOutlined, BankOutlined, ClockCircleOutlined, CheckCircleOutlined,
} from '@ant-design/icons'
import type { Customer } from '@/types'

const { Search } = Input

const statusConfig: Record<string, { color: string; label: string }> = {
  completed: { color: 'success', label: '완료' },
  in_progress: { color: 'processing', label: '진행 중' },
  not_started: { color: 'default', label: '미시작' },
  at_risk: { color: 'error', label: '위험' },
}

const mockCustomers: (Customer & { progress_rate: number })[] = [
  { id: '1', workspace_id: 'w1', name: '김철수', email: 'kim@abc.com', company: 'ABC Corp', template_id: 't1', status: 'at_risk', progress_rate: 30, created_at: '2025-04-10', updated_at: '2025-05-10' },
  { id: '2', workspace_id: 'w1', name: '이영희', email: 'lee@xyz.com', company: 'XYZ Inc', template_id: 't1', status: 'in_progress', progress_rate: 60, created_at: '2025-04-15', updated_at: '2025-05-18' },
  { id: '3', workspace_id: 'w1', name: '박민준', email: 'park@def.com', company: 'DEF Ltd', template_id: 't1', status: 'completed', progress_rate: 100, created_at: '2025-04-01', updated_at: '2025-05-01' },
  { id: '4', workspace_id: 'w1', name: '최지원', email: 'choi@ghi.com', company: 'GHI Co', template_id: 't1', status: 'not_started', progress_rate: 0, created_at: '2025-05-20', updated_at: '2025-05-20' },
  { id: '5', workspace_id: 'w1', name: '정수현', email: 'jung@jkl.com', company: 'JKL Corp', template_id: 't1', status: 'in_progress', progress_rate: 80, created_at: '2025-04-20', updated_at: '2025-05-22' },
]

const mockTimeline = [
  { time: '2025-05-22 14:32', label: '연동 설정 완료', color: 'green' },
  { time: '2025-05-20 09:15', label: '첫 프로젝트 생성', color: 'green' },
  { time: '2025-05-18 16:40', label: '팀원 초대 완료', color: 'green' },
  { time: '2025-05-15 11:20', label: '계정 설정 완료', color: 'green' },
  { time: '2025-05-15 10:05', label: '온보딩 시작', color: 'blue' },
]

export default function CustomersPage() {
  const [search, setSearch] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null)
  const [form] = Form.useForm()

  const filtered = mockCustomers.filter(
    (c) =>
      c.name.includes(search) ||
      c.email.includes(search) ||
      (c.company ?? '').includes(search)
  )

  const columns = [
    {
      title: '고객',
      dataIndex: 'name',
      render: (name: string, row: typeof mockCustomers[0]) => (
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => { setSelectedCustomer(row); setDrawerOpen(true) }}
        >
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
      render: (c: string) => <span className="text-gray-600 text-sm">{c}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag color={statusConfig[s].color}>{statusConfig[s].label}</Tag>
      ),
      filters: Object.entries(statusConfig).map(([v, { label }]) => ({ text: label, value: v })),
      onFilter: (value: unknown, record: typeof mockCustomers[0]) => record.status === value,
    },
    {
      title: '진행률',
      dataIndex: 'progress_rate',
      render: (v: number) => (
        <div className="w-32">
          <Progress percent={v} size="small" strokeColor="#6366f1" />
        </div>
      ),
      sorter: (a: typeof mockCustomers[0], b: typeof mockCustomers[0]) => a.progress_rate - b.progress_rate,
    },
    {
      title: '시작일',
      dataIndex: 'created_at',
      render: (d: string) => <span className="text-gray-400 text-sm">{d}</span>,
    },
    {
      title: '',
      render: (_: unknown, row: typeof mockCustomers[0]) => (
        <Button
          type="text"
          size="small"
          onClick={() => { setSelectedCustomer(row); setDrawerOpen(true) }}
        >
          상세보기
        </Button>
      ),
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">고객 관리</h1>
          <p className="text-gray-500 mt-1">총 {mockCustomers.length}명의 고객</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          style={{ background: '#6366f1', borderColor: '#6366f1' }}
          onClick={() => setAddModalOpen(true)}
        >
          고객 추가
        </Button>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <Search
          placeholder="이름, 이메일, 회사명 검색..."
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
          size="large"
        />
      </div>

      {/* 테이블 */}
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
      <Modal
        title="새 고객 추가"
        open={addModalOpen}
        onCancel={() => { setAddModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        okText="추가"
        cancelText="취소"
        okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}
      >
        <Form form={form} layout="vertical" className="mt-4" onFinish={() => setAddModalOpen(false)}>
          <Form.Item name="name" label="이름" rules={[{ required: true }]}>
            <Input prefix={<UserOutlined />} placeholder="홍길동" />
          </Form.Item>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="hong@company.com" />
          </Form.Item>
          <Form.Item name="company" label="회사명">
            <Input prefix={<BankOutlined />} placeholder="회사 이름" />
          </Form.Item>
          <Form.Item name="template" label="온보딩 템플릿" rules={[{ required: true }]}>
            <Select placeholder="템플릿 선택">
              <Select.Option value="t1">기본 온보딩 템플릿</Select.Option>
              <Select.Option value="t2">엔터프라이즈 온보딩</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 고객 상세 드로어 */}
      <Drawer
        title={
          selectedCustomer && (
            <div className="flex items-center gap-3">
              <Avatar size={40} style={{ background: '#6366f1' }}>
                {selectedCustomer.name[0]}
              </Avatar>
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
            {/* 진행률 */}
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">온보딩 진행률</span>
                <Tag color={statusConfig[selectedCustomer.status].color}>
                  {statusConfig[selectedCustomer.status].label}
                </Tag>
              </div>
              <Progress
                percent={selectedCustomer.progress_rate}
                strokeColor="#6366f1"
                size={['100%', 8]}
              />
            </div>

            {/* 정보 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm">
                <MailOutlined className="text-gray-400" />
                <span className="text-gray-600">{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <BankOutlined className="text-gray-400" />
                <span className="text-gray-600">{selectedCustomer.company}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <ClockCircleOutlined className="text-gray-400" />
                <span className="text-gray-600">시작일: {selectedCustomer.created_at}</span>
              </div>
            </div>

            {/* 타임라인 */}
            <div>
              <p className="font-semibold text-gray-800 mb-4">활동 타임라인</p>
              <Timeline
                items={mockTimeline.map((t) => ({
                  color: t.color,
                  dot: t.color === 'green' ? <CheckCircleOutlined /> : undefined,
                  children: (
                    <div>
                      <p className="text-sm text-gray-800">{t.label}</p>
                      <p className="text-xs text-gray-400">{t.time}</p>
                    </div>
                  ),
                }))}
              />
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}
