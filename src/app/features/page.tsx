import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'

const builtFeatures = [
  {
    title: 'Multi-state licence dashboard (VIC, QLD, SA, ACT)',
    detail:
      'Track every active licence in one place with expiry windows, current status, and direct state authority links so your operations team can act quickly.',
  },
  {
    title: 'Automated email alerts (90/60/30/7 days)',
    detail:
      'The platform generates compliance alerts and sends email reminders to help you respond before a deadline becomes a breach.',
  },
  {
    title: 'Worker visa and compliance tracking',
    detail:
      'Store worker visa expiry, police check and related records in one workflow so compliance checks happen before mobilisation.',
  },
  {
    title: 'Compliance alert centre',
    detail:
      'A dedicated alert area consolidates critical, warning and info notifications so nothing is buried across inboxes and spreadsheets.',
  },
  {
    title: 'Onboarding flow',
    detail:
      'New accounts are guided through organisation setup and owner membership assignment, keeping data structured from day one.',
  },
]

const comingSoon = ['Xero integration', 'Reporting assistant', 'Host employer portal', 'WA scheme (when active)']

export default function FeaturesPage() {
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
            <Link href="/contact" className="text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Contact
            </Link>
            <Link href="/register" className="rounded-lg bg-[var(--accent-blue)] px-4 py-2 font-semibold text-white">
              Start Free Trial
            </Link>
          </div>
        </nav>
      </header>

      <main className="px-4 py-16 md:py-20">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-center text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[64px]">
            Features built for
            <br />
            real compliance work.
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-center text-[16px] leading-[1.7] text-[#9090a8]">
            Every feature below is already available and focused on reducing licensing risk for Australian labour hire
            businesses.
          </p>

          <div className="mt-12 space-y-5">
            {builtFeatures.map((feature) => (
              <article
                key={feature.title}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition hover:border-[var(--border-strong)]"
              >
                <h2 className="flex items-start gap-3 text-xl font-semibold">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[var(--accent-green)]" />
                  {feature.title}
                </h2>
                <p className="mt-3 pl-8 text-[16px] leading-[1.7] text-[var(--text-secondary)]">{feature.detail}</p>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-7">
            <h2 className="text-2xl font-semibold">Coming soon</h2>
            <p className="mt-2 text-[16px] leading-[1.7] text-[#9090a8]">
              Planned roadmap items already requested by early customers.
            </p>
            <ul className="mt-5 grid gap-3 text-[15px] text-[var(--text-secondary)] sm:grid-cols-2">
              {comingSoon.map((item) => (
                <li key={item} className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-[var(--accent-amber)]" />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[var(--accent-blue)] px-5 py-3 font-semibold text-white shadow-[0_8px_30px_rgba(79,123,255,0.35)] transition hover:brightness-110"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </main>
    </div>
  )
}
