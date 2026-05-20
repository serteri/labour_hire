import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { MobileNav } from '@/components/layout/MobileNav'

async function getOrgData(userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId },
    include: { organization: true },
  })
  return membership?.organization ?? null
}

async function getUnreadAlertCount(orgId: string) {
  return prisma.complianceAlert.count({
    where: { orgId, isRead: false, isDismissed: false },
  })
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [org, unreadCount] = await Promise.all([
    getOrgData(session.user.id),
    prisma.complianceAlert.count({
      where: {
        organization: {
          members: { some: { userId: session.user.id } },
        },
        isRead: false,
        isDismissed: false,
      },
    }),
  ])

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar
        orgName={org?.name}
        unreadAlertCount={unreadCount}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          userName={session.user.name ?? undefined}
          userEmail={session.user.email ?? undefined}
          userImage={session.user.image}
          unreadAlertCount={unreadCount}
        />

        <main className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav unreadAlertCount={unreadCount} />
    </div>
  )
}
