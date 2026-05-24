'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, message } from 'antd'
import { MailOutlined, LockOutlined, UserOutlined, BankOutlined, RocketOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: {
    name: string
    company: string
    email: string
    password: string
  }) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { name: values.name, company: values.company },
      },
    })
    setLoading(false)

    if (error) {
      message.error(error.message)
      return
    }

    message.success('가입 완료! 이메일 인증 후 로그인해주세요.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <RocketOutlined className="text-indigo-600 text-2xl" />
            <span className="font-bold text-xl text-gray-900">BoardingAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">14일 무료로 시작하세요</h1>
          <p className="text-gray-500 mt-1">신용카드 없이 바로 시작</p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="name"
              label={<span className="font-medium text-gray-700">이름</span>}
              rules={[{ required: true, message: '이름을 입력해주세요' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="홍길동"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="company"
              label={<span className="font-medium text-gray-700">회사명</span>}
              rules={[{ required: true, message: '회사명을 입력해주세요' }]}
            >
              <Input
                prefix={<BankOutlined className="text-gray-400" />}
                placeholder="회사 이름"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label={<span className="font-medium text-gray-700">업무 이메일</span>}
              rules={[
                { required: true, message: '이메일을 입력해주세요' },
                { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
              ]}
            >
              <Input
                prefix={<MailOutlined className="text-gray-400" />}
                placeholder="you@company.com"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={<span className="font-medium text-gray-700">비밀번호</span>}
              rules={[
                { required: true, message: '비밀번호를 입력해주세요' },
                { min: 8, message: '비밀번호는 8자 이상이어야 합니다' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="8자 이상"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              label={<span className="font-medium text-gray-700">비밀번호 확인</span>}
              dependencies={['password']}
              rules={[
                { required: true, message: '비밀번호를 다시 입력해주세요' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) return Promise.resolve()
                    return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="비밀번호 재입력"
                size="large"
              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ background: '#6366f1', borderColor: '#6366f1', height: 48 }}
            >
              무료로 시작하기
            </Button>
          </Form>

          <p className="text-center text-xs text-gray-400 mt-4">
            가입하면{' '}
            <a href="#" className="underline">이용약관</a>과{' '}
            <a href="#" className="underline">개인정보처리방침</a>에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
