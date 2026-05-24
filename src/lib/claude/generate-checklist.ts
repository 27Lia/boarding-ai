import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function generateChecklistSteps(productDescription: string): Promise<
  { title: string; description: string; is_required: boolean }[]
> {
  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `당신은 SaaS 제품 온보딩 전문가입니다.
아래 제품 설명을 읽고, 신규 고객이 제품을 성공적으로 활성화하기 위한 온보딩 체크리스트 단계를 5~8개 생성해주세요.

제품 설명: ${productDescription}

응답은 반드시 아래 JSON 배열 형식으로만 답하세요. 다른 설명 없이 JSON만 반환하세요:
[
  {
    "title": "단계 제목",
    "description": "이 단계에서 고객이 해야 할 일에 대한 간단한 설명",
    "is_required": true
  }
]`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response type')

  const jsonMatch = content.text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Invalid response format')

  return JSON.parse(jsonMatch[0])
}
