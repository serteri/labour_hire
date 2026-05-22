import Link from 'next/link'
import { Clock, Mail, MapPin, Phone, ShieldCheck } from 'lucide-react'
import { ContactForm } from './ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <header className="border-b border-[var(--border)] bg-[rgba(8,8,16,0.8)] backdrop-blur-[12px]">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[20px] font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-[var(--accent-blue)]" />
            HireComply
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/features" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Features
            </Link>
            <Link href="/pricing" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Pricing
            </Link>
            <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-[var(--accent-blue)] px-4 py-2 font-semibold text-white">
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main className="px-4 py-12 md:py-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
          <ContactForm />

          <div className="space-y-6">
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
              <h2 className="text-2xl font-semibold">Contact Information</h2>

              <div className="mt-6 space-y-4">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-blue-glow)]">
                    <Mail className="h-6 w-6 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Email</p>
                    <p className="mt-1 text-[15px] text-[var(--text-primary)]">support@providershield.com.au</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15">
                    <Phone className="h-6 w-6 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Phone</p>
                    <p className="mt-1 text-[15px] text-[var(--text-primary)]">+61 422 355 462</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-purple-500/15">
                    <MapPin className="h-6 w-6 text-purple-300" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Location</p>
                    <p className="mt-1 text-[15px] text-[var(--text-primary)]">Brisbane, Australia</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent-amber-glow)]">
                    <Clock className="h-6 w-6 text-[var(--accent-amber)]" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">Hours</p>
                    <p className="mt-1 text-[15px] text-[var(--text-primary)]">Mon-Fri, 9am-5pm AEST</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
              <h2 className="text-2xl font-semibold">Common Questions</h2>

              <div className="mt-5 space-y-3">
                <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <summary className="cursor-pointer text-[15px] font-medium text-[var(--text-primary)]">
                    Is there a free trial?
                  </summary>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                    Yes — sign up for free and explore the full platform. No credit card required.
                  </p>
                </details>

                <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <summary className="cursor-pointer text-[15px] font-medium text-[var(--text-primary)]">
                    Which states are covered?
                  </summary>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                    Currently VIC, QLD, SA and ACT. WA is coming soon when their scheme launches.
                  </p>
                </details>

                <details className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                  <summary className="cursor-pointer text-[15px] font-medium text-[var(--text-primary)]">
                    What happens at the SA 29 July deadline?
                  </summary>
                  <p className="mt-3 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
                    Labour hire providers operating in SA without a licence after 29 July 2026 face fines and
                    potential prosecution. We help you get and stay compliant before the deadline.
                  </p>
                </details>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
