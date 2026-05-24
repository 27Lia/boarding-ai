'use client'

import { useState } from 'react'
import loadDynamic from 'next/dynamic'
import {
  Button, Card, Modal, Input, Form, Switch, Tag,
  Spin, Empty, message, Popconfirm,
} from 'antd'
import {
  PlusOutlined, ThunderboltOutlined, CheckSquareOutlined, LinkOutlined,
} from '@ant-design/icons'
import type { DropResult } from '@hello-pangea/dnd'

const DragStepList = loadDynamic(() => import('@/components/checklist/DragStepList'), { ssr: false })

const { TextArea } = Input

interface Step {
  id: string
  title: string
  description: string
  is_required: boolean
  link_url?: string
}

interface Template {
  id: string
  name: string
  steps: Step[]
}

const mockTemplates: Template[] = [
  {
    id: 't1',
    name: '기본 온보딩 템플릿',
    steps: [
      { id: 's1', title: '계정 설정 완료', description: '프로필 사진, 이름, 비밀번호를 설정합니다', is_required: true },
      { id: 's2', title: '팀원 초대', description: '함께 사용할 팀원을 최소 1명 초대합니다', is_required: true },
      { id: 's3', title: '첫 프로젝트 생성', description: '실제 업무에 사용할 프로젝트를 만들어봅니다', is_required: true },
      { id: 's4', title: '연동 설정', description: 'Slack, GitHub 등 자주 사용하는 툴과 연동합니다', is_required: false },
      { id: 's5', title: '알림 설정', description: '중요한 알림을 놓치지 않도록 알림 설정을 완료합니다', is_required: false },
    ],
  },
  {
    id: 't2',
    name: '엔터프라이즈 온보딩',
    steps: [
      { id: 'e1', title: 'SSO 설정', description: '회사 계정으로 로그인할 수 있도록 SSO를 연동합니다', is_required: true },
      { id: 'e2', title: '권한 정책 설정', description: '팀별 접근 권한을 설정합니다', is_required: true },
      { id: 'e3', title: '보안 감사 로그 활성화', description: '모든 활동이 기록되도록 설정합니다', is_required: true },
    ],
  },
]

export default function ChecklistsPage() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(mockTemplates[0])
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [addStepModalOpen, setAddStepModalOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [productDesc, setProductDesc] = useState('')
  const [form] = Form.useForm()

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return
    const steps = [...selectedTemplate.steps]
    const [moved] = steps.splice(result.source.index, 1)
    steps.splice(result.destination.index, 0, moved)
    const updated = { ...selectedTemplate, steps }
    setSelectedTemplate(updated)
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  const handleAiGenerate = async () => {
    if (!productDesc.trim()) { message.warning('제품 설명을 입력해주세요'); return }
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: productDesc }),
      })
      const data = await res.json()
      const newSteps: Step[] = data.steps.map((s: Omit<Step, 'id'>, i: number) => ({
        ...s,
        id: `ai-${Date.now()}-${i}`,
      }))
      const updated = { ...selectedTemplate, steps: newSteps }
      setSelectedTemplate(updated)
      setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
      setAiModalOpen(false)
      setProductDesc('')
      message.success(`${newSteps.length}개의 온보딩 단계가 생성됐습니다!`)
    } catch {
      message.error('AI 생성 중 오류가 발생했습니다')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddStep = (values: Omit<Step, 'id'>) => {
    const newStep: Step = { ...values, id: `s-${Date.now()}` }
    const updated = { ...selectedTemplate, steps: [...selectedTemplate.steps, newStep] }
    setSelectedTemplate(updated)
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    setAddStepModalOpen(false)
    form.resetFields()
  }

  const handleDeleteStep = (stepId: string) => {
    const updated = { ...selectedTemplate, steps: selectedTemplate.steps.filter((s) => s.id !== stepId) }
    setSelectedTemplate(updated)
    setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">체크리스트 템플릿</h1>
          <p className="text-gray-500 mt-1">온보딩 단계를 설계하고 AI로 자동 생성하세요</p>
        </div>
        <div className="flex gap-2">
          <Button
            icon={<ThunderboltOutlined />}
            size="large"
            style={{ borderColor: '#6366f1', color: '#6366f1' }}
            onClick={() => setAiModalOpen(true)}
          >
            AI로 생성
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={() => setAddStepModalOpen(true)}
          >
            단계 추가
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* 템플릿 목록 */}
        <div className="w-60 flex-shrink-0 space-y-2">
          {templates.map((t) => (
            <Card
              key={t.id}
              size="small"
              className={`cursor-pointer border transition-all ${
                selectedTemplate.id === t.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-100 hover:border-indigo-200'
              }`}
              onClick={() => setSelectedTemplate(t)}
            >
              <div className="flex items-center gap-2">
                <CheckSquareOutlined className={selectedTemplate.id === t.id ? 'text-indigo-500' : 'text-gray-400'} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.steps.length}단계</p>
                </div>
              </div>
            </Card>
          ))}
          <Button block icon={<PlusOutlined />} type="dashed" className="mt-2">
            템플릿 추가
          </Button>
        </div>

        {/* 단계 편집기 */}
        <div className="flex-1">
          <Card
            className="border-0 shadow-sm"
            title={
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">{selectedTemplate.name}</span>
                <Tag color="purple">{selectedTemplate.steps.length}단계</Tag>
              </div>
            }
          >
            {selectedTemplate.steps.length === 0 ? (
              <Empty
                description="단계가 없습니다. AI로 자동 생성하거나 직접 추가해보세요."
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<ThunderboltOutlined />}
                  style={{ background: '#6366f1', borderColor: '#6366f1' }}
                  onClick={() => setAiModalOpen(true)}
                >
                  AI로 생성하기
                </Button>
              </Empty>
            ) : (
              <DragStepList
                steps={selectedTemplate.steps}
                onDragEnd={handleDragEnd}
                onDelete={handleDeleteStep}
              />
            )}
          </Card>
        </div>
      </div>

      {/* AI 생성 모달 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <ThunderboltOutlined className="text-indigo-500" />
            <span>AI로 온보딩 단계 생성</span>
          </div>
        }
        open={aiModalOpen}
        onCancel={() => { setAiModalOpen(false); setProductDesc('') }}
        footer={null}
      >
        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-3">
            제품에 대해 설명해주시면 Claude AI가 최적의 온보딩 단계를 자동으로 만들어드립니다.
          </p>
          <TextArea
            rows={5}
            placeholder="예: 저희 제품은 팀 프로젝트 관리 SaaS입니다. 할 일 관리, 파일 공유, 팀 채팅 기능을 제공합니다."
            value={productDesc}
            onChange={(e) => setProductDesc(e.target.value)}
            className="mb-4"
          />
          <Button
            type="primary"
            block
            size="large"
            loading={aiLoading}
            icon={<ThunderboltOutlined />}
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={handleAiGenerate}
          >
            {aiLoading ? 'AI가 생성 중...' : 'AI로 생성하기'}
          </Button>
          {aiLoading && (
            <div className="text-center mt-4">
              <Spin />
              <p className="text-xs text-gray-400 mt-2">Claude AI가 최적의 단계를 분석 중입니다...</p>
            </div>
          )}
        </div>
      </Modal>

      {/* 단계 추가 모달 */}
      <Modal
        title="새 단계 추가"
        open={addStepModalOpen}
        onCancel={() => { setAddStepModalOpen(false); form.resetFields() }}
        onOk={() => form.submit()}
        okText="추가"
        cancelText="취소"
        okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}
      >
        <Form form={form} layout="vertical" className="mt-4" onFinish={handleAddStep}>
          <Form.Item name="title" label="단계 제목" rules={[{ required: true }]}>
            <Input placeholder="예: 팀원 초대하기" />
          </Form.Item>
          <Form.Item name="description" label="설명">
            <TextArea rows={3} placeholder="이 단계에서 고객이 해야 할 일을 설명하세요" />
          </Form.Item>
          <Form.Item name="link_url" label="참고 링크 (선택)">
            <Input prefix={<LinkOutlined />} placeholder="https://..." />
          </Form.Item>
          <Form.Item name="is_required" label="필수 단계" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
