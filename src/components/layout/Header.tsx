'use client'

import { signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/licences': 'Licences',
  '/workers': 'Workers',
  '/reports': 'Reports',
  '/alerts': 'Alerts',
  '/settings': 'Settings',
}

interface HeaderProps {
  userName?: string
  userEmail?: string
  userImage?: string | null
  unreadAlertCount?: number
}

export function Header({ userName, userEmail, userImage, unreadAlertCount = 0 }: HeaderProps) {
  const pathname = usePathname()
  const title = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key))?.[1] ?? 'HireComply'

  const initials = userName
    ? userName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6">
      <h1 className="text-lg font-semibold text-slate-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Alert bell */}
        <Link href="/alerts" className="relative">
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
            <Bell className="h-5 w-5" />
          </Button>
          {unreadAlertCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0 h-4 min-w-4 flex items-center justify-center">
              {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
            </Badge>
          )}
        </Link>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 h-9 hover:bg-slate-100 transition-colors outline-none">
            <Avatar className="h-7 w-7">
              {userImage && <AvatarImage src={userImage} alt={userName ?? 'User'} />}
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden sm:inline text-sm font-medium text-slate-700">
              {userName ?? 'Account'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-slate-900">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
              <User className="h-4 w-4" />
              Account settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 cursor-pointer"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
