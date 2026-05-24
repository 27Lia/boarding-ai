'use client'

import { useState } from 'react'
import {
  Card, Form, Input, Button, Avatar, Switch, Select,
  Divider, Table, Tag, Modal, message,
} from 'antd'
import {
  UserOutlined, BankOutlined, MailOutlined,
  PlusOutlined, DeleteOutlined, CrownOutlined,
} from '@ant-design/icons'

const mockMembers = [
  { key: '1', name: '나 (관리자)', email: 'me@company.com', role: 'owner', joined: '2025-04-01' },
  { key: '2', name: '이팀원', email: 'lee@company.com', role: 'admin', joined: '2025-04-10' },
  { key: '3', name: '박담당', email: 'park@company.com', role: 'member', joined: '2025-05-01' },
]

const roleConfig: Record<string, { color: string; label: string }> = {
  owner: { color: 'gold', label: '오너' },
  admin: { color: 'blue', label: '관리자' },
  member: { color: 'default', label: '멤버' },
}

export default function SettingsPage() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [workspaceForm] = Form.useForm()
  const [inviteForm] = Form.useForm()

  const memberColumns = [
    {
      title: '멤버',
      dataIndex: 'name',
      render: (name: string, row: typeof mockMembers[0]) => (
        <div className="flex items-center gap-3">
          <Avatar style={{ background: '#6366f1' }}>{name[0]}</Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900">{name}</p>
            <p className="text-xs text-gray-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: '권한',
      dataIndex: 'role',
      render: (r: string) => (
        <Tag color={roleConfig[r].color} icon={r === 'owner' ? <CrownOutlined /> : undefined}>
          {roleConfig[r].label}
        </Tag>
      ),
    },
    {
      title: '가입일',
      dataIndex: 'joined',
      render: (d: string) => <span className="text-gray-400 text-sm">{d}</span>,
    },
    {
      title: '',
      render: (_: unknown, row: typeof mockMembers[0]) =>
        row.role !== 'owner' ? (
          <Button type="text" size="small" danger icon={<DeleteOutlined />}>
            제거
          </Button>
        ) : null,
    },
  ]

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">워크스페이스와 팀을 관리하세요</p>
      </div>

      {/* 워크스페이스 설정 */}
      <Card className="border-0 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">워크스페이스 정보</h2>
        <Form form={workspaceForm} layout="vertical" initialValues={{ name: '내 워크스페이스', plan: 'free' }}>
          <div className="flex items-center gap-4 mb-6">
            <Avatar size={64} style={{ background: '#6366f1', fontSize: 28 }}>B</Avatar>
            <Button>로고 변경</Button>
          </div>
          <Form.Item name="name" label={<span className="font-medium text-gray-700">워크스페이스 이름</span>}>
            <Input prefix={<BankOutlined />} size="large" />
          </Form.Item>
          <Form.Item name="plan" label={<span className="font-medium text-gray-700">현재 플랜</span>}>
            <Input
              prefix={<CrownOutlined />}
              size="large"
              disabled
              value="Free 플랜"
              suffix={
                <Button type="link" size="small" style={{ color: '#6366f1' }}>
                  업그레이드
                </Button>
              }
            />
          </Form.Item>
          <Button
            type="primary"
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={() => message.success('저장됐습니다')}
          >
            저장
          </Button>
        </Form>
      </Card>

      {/* 알림 설정 */}
      <Card className="border-0 shadow-sm mb-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">알림 설정</h2>
        <div className="space-y-4">
          {[
            { label: '위험 고객 알림', desc: '7일 이상 진행 없는 고객 발생 시 이메일 알림', defaultVal: true },
            { label: '온보딩 완료 알림', desc: '고객이 모든 단계를 완료했을 때 알림', defaultVal: true },
            { label: '주간 리포트', desc: '매주 월요일 온보딩 현황 요약 리포트', defaultVal: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Switch defaultChecked={item.defaultVal} />
            </div>
          ))}
        </div>
      </Card>

      {/* 팀 멤버 */}
      <Card className="border-0 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">팀 멤버</h2>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={() => setInviteModalOpen(true)}
          >
            팀원 초대
          </Button>
        </div>
        <Table dataSource={mockMembers} columns={memberColumns} pagination={false} size="small" />
      </Card>

      {/* 위험 구역 */}
      <Card className="border-0 shadow-sm mt-6 border-red-100">
        <h2 className="text-base font-semibold text-red-600 mb-4">위험 구역</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">워크스페이스 삭제</p>
            <p className="text-xs text-gray-400">삭제된 데이터는 복구할 수 없습니다</p>
          </div>
          <Button danger>워크스페이스 삭제</Button>
        </div>
      </Card>

      {/* 팀원 초대 모달 */}
      <Modal
        title="팀원 초대"
        open={inviteModalOpen}
        onCancel={() => { setInviteModalOpen(false); inviteForm.resetFields() }}
        onOk={() => inviteForm.submit()}
        okText="초대 보내기"
        cancelText="취소"
        okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}
      >
        <Form form={inviteForm} layout="vertical" className="mt-4" onFinish={() => { message.success('초대 이메일을 발송했습니다'); setInviteModalOpen(false) }}>
          <Form.Item name="email" label="이메일" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder="teammate@company.com" size="large" />
          </Form.Item>
          <Form.Item name="role" label="권한" initialValue="member">
            <Select size="large">
              <Select.Option value="admin">관리자</Select.Option>
              <Select.Option value="member">멤버</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
