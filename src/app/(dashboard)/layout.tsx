'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layout } from 'antd'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/client'
import { useWorkspaceStore } from '@/store/workspace.store'

const { Content } = Layout

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const setWorkspace = useWorkspaceStore((s) => s.setWorkspace)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (data) setWorkspace(data)
    }
    load()
  }, [router, setWorkspace])

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
