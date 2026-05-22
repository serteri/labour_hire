import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import WaitlistForm from './WaitlistForm'

export const metadata = {
  title: 'Join Waitlist — HireComply Host Employer Plan',
  description: 'Be first to access the HireComply Host Employer portal when it launches.',
}

export default function WaitlistPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] bg-[rgba(8,8,16,0.8)] backdrop-blur-[12px]">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[20px] font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-[var(--accent-blue)]" />
            HireComply
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/pricing" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Pricing
            </Link>
            <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2">
              Sign in
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex items-center justify-center px-4 py-16 md:py-24">
        <div className="w-full max-w-[480px]">
          <div className="mb-6 text-center">
            <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
              Host Employer Plan
            </span>
            <h1 className="mt-4 text-[32px] font-extrabold leading-[1.15] tracking-[-0.02em] md:text-[40px]">
              Be first when Host features launch
            </h1>
            <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
              We&apos;re building the Host Employer portal now. Leave your details and we&apos;ll contact
              you personally when it&apos;s ready — before public launch.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8">
            <WaitlistForm />
          </div>

          <p className="mt-5 text-center text-[13px] text-[var(--text-muted)]">
            Already a Provider?{' '}
            <Link href="/register" className="text-[var(--accent-blue)] hover:underline">
              Start a free trial →
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
