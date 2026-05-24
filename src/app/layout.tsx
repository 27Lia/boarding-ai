import type { Metadata } from 'next'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import './globals.css'

export const metadata: Metadata = {
  title: 'BoardingAI — AI 고객 온보딩 관리',
  description: 'AI로 고객 온보딩을 자동화하고 이탈을 방지하세요',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="h-full">
      <body className="min-h-full">
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  )
}
