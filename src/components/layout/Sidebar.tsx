'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Layout, Menu, Button, Avatar, Dropdown } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  CheckSquareOutlined,
  SettingOutlined,
  RocketOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { createClient } from '@/lib/supabase/client'

const { Sider } = Layout

const navItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '대시보드', href: '/dashboard' },
  { key: '/customers', icon: <TeamOutlined />, label: '고객 관리', href: '/customers' },
  { key: '/checklists', icon: <CheckSquareOutlined />, label: '체크리스트', href: '/checklists' },
  { key: '/settings', icon: <SettingOutlined />, label: '설정', href: '/settings' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const activeKey = navItems.find((item) => pathname.startsWith(item.key))?.key || '/dashboard'

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <Sider
      width={240}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 로고 */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <RocketOutlined className="text-indigo-600 text-xl" />
        <span className="font-bold text-gray-900 text-lg">BoardingAI</span>
      </div>

      {/* 네비게이션 */}
      <Menu
        mode="inline"
        selectedKeys={[activeKey]}
        style={{ border: 'none', flex: 1, paddingTop: 8 }}
        items={navItems.map((item) => ({
          key: item.key,
          icon: item.icon,
          label: <Link href={item.href}>{item.label}</Link>,
        }))}
      />

      {/* 하단 유저 영역 */}
      <div className="border-t border-gray-100 p-4">
        <Dropdown
          menu={{
            items: [
              {
                key: 'logout',
                icon: <LogoutOutlined />,
                label: '로그아웃',
                onClick: handleLogout,
                danger: true,
              },
            ],
          }}
          placement="topLeft"
        >
          <Button type="text" block className="flex items-center gap-3 h-auto py-2 px-2 text-left">
            <Avatar size={32} icon={<UserOutlined />} style={{ background: '#6366f1', flexShrink: 0 }} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">내 워크스페이스</p>
              <p className="text-xs text-gray-400">Free 플랜</p>
            </div>
          </Button>
        </Dropdown>
      </div>
    </Sider>
  )
}
