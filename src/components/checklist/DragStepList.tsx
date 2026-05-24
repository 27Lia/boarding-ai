'use client'

import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Button, Tag, Tooltip, Popconfirm } from 'antd'
import { DragOutlined, EditOutlined, DeleteOutlined, LinkOutlined } from '@ant-design/icons'

interface Step {
  id: string
  title: string
  description: string
  is_required: boolean
  link_url?: string
}

interface Props {
  steps: Step[]
  onDragEnd: (result: DropResult) => void
  onDelete: (id: string) => void
}

export default function DragStepList({ steps, onDragEnd, onDelete }: Props) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="steps">
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {steps.map((step, index) => (
              <Draggable key={step.id} draggableId={step.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                      snapshot.isDragging
                        ? 'bg-indigo-50 border-indigo-200 shadow-md'
                        : 'bg-gray-50 border-gray-100 hover:border-indigo-100'
                    }`}
                  >
                    <div {...provided.dragHandleProps} className="mt-0.5 text-gray-300 hover:text-gray-500 cursor-grab">
                      <DragOutlined />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-indigo-400">STEP {index + 1}</span>
                        {step.is_required && <Tag color="red" className="text-xs">필수</Tag>}
                      </div>
                      <p className="font-medium text-gray-900 text-sm">{step.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      {step.link_url && (
                        <a href={step.link_url} className="text-xs text-indigo-500 flex items-center gap-1 mt-1">
                          <LinkOutlined /> 참고 링크
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Tooltip title="편집">
                        <Button type="text" size="small" icon={<EditOutlined />} />
                      </Tooltip>
                      <Popconfirm
                        title="이 단계를 삭제할까요?"
                        onConfirm={() => onDelete(step.id)}
                        okText="삭제"
                        cancelText="취소"
                        okButtonProps={{ danger: true }}
                      >
                        <Button type="text" size="small" icon={<DeleteOutlined />} danger />
                      </Popconfirm>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
