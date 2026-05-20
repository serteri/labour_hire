'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  ClipboardList,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/licences', label: 'Licences', icon: FileCheck },
  { href: '/workers', label: 'Workers', icon: Users },
  { href: '/reports', label: 'Reports', icon: ClipboardList },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarNavProps {
  unreadAlertCount?: number
}

export function SidebarNav({ unreadAlertCount = 0 }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            )}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.label}</span>
            {item.href === '/alerts' && unreadAlertCount > 0 && (
              <Badge className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0 h-5 min-w-5 flex items-center justify-center">
                {unreadAlertCount > 99 ? '99+' : unreadAlertCount}
              </Badge>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

interface SidebarProps {
  orgName?: string
  unreadAlertCount?: number
}

export function Sidebar({ orgName = 'My Organisation', unreadAlertCount = 0 }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      {/* Logo / Org name */}
      <div className="px-6 py-5 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-slate-900 text-base">HireComply</span>
        </Link>
        <p className="mt-2 text-xs text-slate-500 truncate" title={orgName}>
          {orgName}
        </p>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav unreadAlertCount={unreadAlertCount} />
      </div>
    </aside>
  )
}
