import { NextRequest, NextResponse } from 'next/server'
import { generateChecklistSteps } from '@/lib/claude/generate-checklist'

export async function POST(req: NextRequest) {
  const { description } = await req.json()

  if (!description?.trim()) {
    return NextResponse.json({ error: '제품 설명을 입력해주세요' }, { status: 400 })
  }

  const steps = await generateChecklistSteps(description)
  return NextResponse.json({ steps })
}
