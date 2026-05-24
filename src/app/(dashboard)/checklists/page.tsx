'use client'

import { useState, useEffect, useCallback } from 'react'
import loadDynamic from 'next/dynamic'
import {
  Button, Card, Modal, Input, Form, Switch, Tag,
  Spin, Empty, message, Popconfirm,
} from 'antd'
import {
  PlusOutlined, ThunderboltOutlined, CheckSquareOutlined, LinkOutlined,
} from '@ant-design/icons'
import type { DropResult } from '@hello-pangea/dnd'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/store/workspace.store'

const DragStepList = loadDynamic(() => import('@/components/checklist/DragStepList'), { ssr: false })

const { TextArea } = Input

interface Step {
  id: string
  title: string
  description: string
  is_required: boolean
  link_url?: string
  order: number
}

interface Template {
  id: string
  name: string
  steps: Step[]
}

export default function ChecklistsPage() {
  const workspace = useWorkspaceStore((s) => s.currentWorkspace)
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [aiModalOpen, setAiModalOpen] = useState(false)
  const [addStepModalOpen, setAddStepModalOpen] = useState(false)
  const [addTemplateModalOpen, setAddTemplateModalOpen] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [productDesc, setProductDesc] = useState('')
  const [form] = Form.useForm()
  const [templateForm] = Form.useForm()

  const loadTemplates = useCallback(async () => {
    if (!workspace) return
    const supabase = createClient()
    const { data } = await supabase
      .from('checklist_templates')
      .select('*, checklist_steps(*)')
      .eq('workspace_id', workspace.id)
      .order('created_at')

    if (data) {
      const parsed = data.map((t) => ({
        ...t,
        steps: (t.checklist_steps as Step[]).sort((a, b) => a.order - b.order),
      }))
      setTemplates(parsed)
      if (parsed.length > 0 && !selectedTemplate) setSelectedTemplate(parsed[0])
    }
    setLoading(false)
  }, [workspace, selectedTemplate])

  useEffect(() => { loadTemplates() }, [workspace])

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !selectedTemplate) return
    const steps = [...selectedTemplate.steps]
    const [moved] = steps.splice(result.source.index, 1)
    steps.splice(result.destination.index, 0, moved)
    const reordered = steps.map((s, i) => ({ ...s, order: i }))

    setSelectedTemplate({ ...selectedTemplate, steps: reordered })
    setTemplates((prev) => prev.map((t) => t.id === selectedTemplate.id ? { ...t, steps: reordered } : t))

    const supabase = createClient()
    await Promise.all(reordered.map((s) =>
      supabase.from('checklist_steps').update({ order: s.order }).eq('id', s.id)
    ))
  }

  const handleAiGenerate = async () => {
    if (!productDesc.trim()) { message.warning('제품 설명을 입력해주세요'); return }
    if (!selectedTemplate || !workspace) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/generate-checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: productDesc }),
      })
      const data = await res.json()

      const supabase = createClient()
      await supabase.from('checklist_steps').delete().eq('template_id', selectedTemplate.id)

      const stepsToInsert = data.steps.map((s: Omit<Step, 'id' | 'order'>, i: number) => ({
        template_id: selectedTemplate.id,
        title: s.title,
        description: s.description,
        is_required: s.is_required,
        order: i,
      }))
      const { data: inserted } = await supabase.from('checklist_steps').insert(stepsToInsert).select()

      if (inserted) {
        const updated = { ...selectedTemplate, steps: inserted as Step[] }
        setSelectedTemplate(updated)
        setTemplates((prev) => prev.map((t) => t.id === updated.id ? updated : t))
      }

      setAiModalOpen(false)
      setProductDesc('')
      message.success(`${data.steps.length}개의 온보딩 단계가 생성됐습니다!`)
    } catch {
      message.error('AI 생성 중 오류가 발생했습니다')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddTemplate = async (values: { name: string }) => {
    if (!workspace) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('checklist_templates').insert({
      workspace_id: workspace.id,
      name: values.name,
      created_by: user!.id,
    }).select().single()

    if (data) {
      const newTemplate = { ...data, steps: [] }
      setTemplates((prev) => [...prev, newTemplate])
      setSelectedTemplate(newTemplate)
    }
    setAddTemplateModalOpen(false)
    templateForm.resetFields()
  }

  const handleAddStep = async (values: Omit<Step, 'id' | 'order'>) => {
    if (!selectedTemplate) return
    const supabase = createClient()
    const { data } = await supabase.from('checklist_steps').insert({
      template_id: selectedTemplate.id,
      title: values.title,
      description: values.description,
      link_url: values.link_url,
      is_required: values.is_required ?? true,
      order: selectedTemplate.steps.length,
    }).select().single()

    if (data) {
      const updated = { ...selectedTemplate, steps: [...selectedTemplate.steps, data as Step] }
      setSelectedTemplate(updated)
      setTemplates((prev) => prev.map((t) => t.id === updated.id ? updated : t))
    }
    setAddStepModalOpen(false)
    form.resetFields()
  }

  const handleDeleteStep = async (stepId: string) => {
    if (!selectedTemplate) return
    const supabase = createClient()
    await supabase.from('checklist_steps').delete().eq('id', stepId)
    const updated = { ...selectedTemplate, steps: selectedTemplate.steps.filter((s) => s.id !== stepId) }
    setSelectedTemplate(updated)
    setTemplates((prev) => prev.map((t) => t.id === updated.id ? updated : t))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Spin size="large" /></div>

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
            disabled={!selectedTemplate}
          >
            AI로 생성
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            style={{ background: '#6366f1', borderColor: '#6366f1' }}
            onClick={() => setAddStepModalOpen(true)}
            disabled={!selectedTemplate}
          >
            단계 추가
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-60 flex-shrink-0 space-y-2">
          {templates.map((t) => (
            <Card
              key={t.id}
              size="small"
              className={`cursor-pointer border transition-all ${
                selectedTemplate?.id === t.id
                  ? 'border-indigo-400 bg-indigo-50'
                  : 'border-gray-100 hover:border-indigo-200'
              }`}
              onClick={() => setSelectedTemplate(t)}
            >
              <div className="flex items-center gap-2">
                <CheckSquareOutlined className={selectedTemplate?.id === t.id ? 'text-indigo-500' : 'text-gray-400'} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.steps.length}단계</p>
                </div>
              </div>
            </Card>
          ))}
          <Button block icon={<PlusOutlined />} type="dashed" className="mt-2" onClick={() => setAddTemplateModalOpen(true)}>
            템플릿 추가
          </Button>
        </div>

        <div className="flex-1">
          {!selectedTemplate ? (
            <Card className="border-0 shadow-sm">
              <Empty description="템플릿을 선택하거나 새로 만드세요">
                <Button type="primary" onClick={() => setAddTemplateModalOpen(true)} style={{ background: '#6366f1', borderColor: '#6366f1' }}>
                  템플릿 만들기
                </Button>
              </Empty>
            </Card>
          ) : (
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
                <Empty description="단계가 없습니다. AI로 자동 생성하거나 직접 추가해보세요." image={Empty.PRESENTED_IMAGE_SIMPLE}>
                  <Button type="primary" icon={<ThunderboltOutlined />} style={{ background: '#6366f1', borderColor: '#6366f1' }} onClick={() => setAiModalOpen(true)}>
                    AI로 생성하기
                  </Button>
                </Empty>
              ) : (
                <DragStepList steps={selectedTemplate.steps} onDragEnd={handleDragEnd} onDelete={handleDeleteStep} />
              )}
            </Card>
          )}
        </div>
      </div>

      {/* AI 생성 모달 */}
      <Modal
        title={<div className="flex items-center gap-2"><ThunderboltOutlined className="text-indigo-500" /><span>AI로 온보딩 단계 생성</span></div>}
        open={aiModalOpen}
        onCancel={() => { setAiModalOpen(false); setProductDesc('') }}
        footer={null}
      >
        <div className="mt-4">
          <p className="text-gray-600 text-sm mb-3">제품에 대해 설명해주시면 Claude AI가 최적의 온보딩 단계를 자동으로 만들어드립니다.</p>
          <TextArea rows={5} placeholder="예: 저희 제품은 팀 프로젝트 관리 SaaS입니다." value={productDesc} onChange={(e) => setProductDesc(e.target.value)} className="mb-4" />
          <Button type="primary" block size="large" loading={aiLoading} icon={<ThunderboltOutlined />} style={{ background: '#6366f1', borderColor: '#6366f1' }} onClick={handleAiGenerate}>
            {aiLoading ? 'AI가 생성 중...' : 'AI로 생성하기'}
          </Button>
          {aiLoading && <div className="text-center mt-4"><Spin /><p className="text-xs text-gray-400 mt-2">Claude AI가 최적의 단계를 분석 중입니다...</p></div>}
        </div>
      </Modal>

      {/* 템플릿 추가 모달 */}
      <Modal title="새 템플릿 추가" open={addTemplateModalOpen} onCancel={() => { setAddTemplateModalOpen(false); templateForm.resetFields() }} onOk={() => templateForm.submit()} okText="추가" cancelText="취소" okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}>
        <Form form={templateForm} layout="vertical" className="mt-4" onFinish={handleAddTemplate}>
          <Form.Item name="name" label="템플릿 이름" rules={[{ required: true }]}>
            <Input placeholder="예: 기본 온보딩 템플릿" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 단계 추가 모달 */}
      <Modal title="새 단계 추가" open={addStepModalOpen} onCancel={() => { setAddStepModalOpen(false); form.resetFields() }} onOk={() => form.submit()} okText="추가" cancelText="취소" okButtonProps={{ style: { background: '#6366f1', borderColor: '#6366f1' } }}>
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
