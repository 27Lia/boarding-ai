'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Form, Input, Button, Divider, message } from 'antd'
import { MailOutlined, LockOutlined, RocketOutlined } from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    setLoading(false)

    if (error) {
      message.error('이메일 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* 로고 */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <RocketOutlined className="text-indigo-600 text-2xl" />
            <span className="font-bold text-xl text-gray-900">BoardingAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">다시 오셨군요!</h1>
          <p className="text-gray-500 mt-1">계정에 로그인하세요</p>
        </div>

        {/* 폼 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              name="email"
              label={<span className="font-medium text-gray-700">이메일</span>}
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
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="비밀번호 입력"
                size="large"
              />
            </Form.Item>

            <div className="text-right mb-4">
              <a href="#" className="text-sm text-indigo-600 hover:underline">비밀번호를 잊으셨나요?</a>
            </div>

            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              style={{ background: '#6366f1', borderColor: '#6366f1', height: 48 }}
            >
              로그인
            </Button>
          </Form>

          <Divider plain className="text-gray-400 text-sm">또는</Divider>

          <Button
            block
            size="large"
            style={{ height: 48 }}
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: `${window.location.origin}/auth/callback` },
              })
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google로 계속하기
            </span>
          </Button>
        </div>

        <p className="text-center mt-6 text-gray-500 text-sm">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="text-indigo-600 font-medium hover:underline">
            무료로 시작하기
          </Link>
        </p>
      </div>
    </div>
  )
}
