import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-4">
        <Link href="/" className="flex items-center gap-2 w-fit">
          <ShieldCheck className="h-7 w-7 text-blue-600" />
          <span className="text-xl font-bold text-slate-900">HireComply</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center text-sm text-slate-500">
        © 2026 HireComply. Australian Labour Hire Compliance Made Simple.
      </footer>
    </div>
  )
}
