'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileCheck,
  Users,
  ClipboardList,
  Bell,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const mobileNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/licences', label: 'Licences', icon: FileCheck },
  { href: '/workers', label: 'Workers', icon: Users },
  { href: '/reports', label: 'Reports', icon: ClipboardList },
  { href: '/alerts', label: 'Alerts', icon: Bell },
]

interface MobileNavProps {
  unreadAlertCount?: number
}

export function MobileNav({ unreadAlertCount = 0 }: MobileNavProps) {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-slate-200 flex">
      {mobileNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex-1 flex flex-col items-center justify-center py-2 gap-1 text-xs font-medium transition-colors',
              isActive ? 'text-blue-600' : 'text-slate-500'
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {item.href === '/alerts' && unreadAlertCount > 0 && (
                <Badge className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center">
                  {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
                </Badge>
              )}
            </div>
            <span>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
