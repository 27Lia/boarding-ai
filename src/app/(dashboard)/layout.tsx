'use client'

import { Layout } from 'antd'
import Sidebar from '@/components/layout/Sidebar'

const { Content } = Layout

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout style={{ marginLeft: 240, background: '#f5f6fa' }}>
        <Content style={{ padding: '32px', minHeight: '100vh' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
