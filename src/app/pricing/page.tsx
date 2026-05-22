import Link from 'next/link'
import { CheckCircle2, ShieldCheck } from 'lucide-react'

const providerFeatures = [
  'All 4 state licences (VIC, QLD, SA, ACT)',
  'Unlimited worker records',
  'Automated email alerts',
  'Compliance dashboard',
]

const hostFeatures: { label: string; subtext?: string; comingSoon?: boolean }[] = [
  { label: 'Everything in Provider plan' },
  {
    label: 'Provider licence verification portal',
    subtext: 'Instantly check if your labour hire provider is licensed in VIC, QLD, SA or ACT',
    comingSoon: true,
  },
  {
    label: 'Pre-mobilisation approval workflow',
    subtext: 'Require licence verification before any worker can be deployed to your site',
    comingSoon: true,
  },
  {
    label: 'Full audit trail',
    subtext: 'Documented proof you verified every provider — critical if you face a WorkSafe investigation',
    comingSoon: true,
  },
  {
    label: 'Multi-site management',
    subtext: 'Manage compliance across all your locations from one dashboard',
    comingSoon: true,
  },
]

export default function PricingPage() {
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
            <Link href="/login" className="rounded-lg border border-[var(--border)] px-4 py-2">
              Sign in
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
            Simple pricing.
            <br />
            No surprises.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-center text-[16px] leading-[1.7] text-[#9090a8]">
            Pick a plan that matches your compliance responsibilities and move away from spreadsheet risk.
          </p>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
              <span className="inline-flex rounded-full bg-[rgba(79,123,255,0.2)] px-3 py-1 text-xs font-semibold text-[var(--accent-blue)]">
                Most Popular
              </span>
              <h2 className="mt-5 text-xl font-semibold">PROVIDER PLAN</h2>
              <p className="mt-3 text-5xl font-bold">
                $99 <span className="text-base font-medium text-[var(--text-muted)]">/month</span>
              </p>
              <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">For labour hire providers</p>
              <ul className="mt-6 space-y-2.5 text-[15px] text-[var(--text-secondary)]">
                {providerFeatures.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[var(--accent-blue)]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-[var(--accent-blue)] px-5 py-3 font-semibold text-white transition hover:brightness-110"
              >
                Start Free Trial
              </Link>
            </article>

            <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
              <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
                Coming Soon
              </span>
              <h2 className="mt-5 text-xl font-semibold">HOST EMPLOYER PLAN</h2>
              <p className="mt-3 text-5xl font-bold">
                $149 <span className="text-base font-medium text-[var(--text-muted)]">/month</span>
              </p>
              <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                For businesses that engage labour hire providers
              </p>
              <p className="mt-2 text-[14px] font-medium text-amber-300">
                ⚠️ Host employers face up to $500,000 in fines for engaging unlicensed providers.
              </p>
              <ul className="mt-6 space-y-4 text-[15px] text-[var(--text-secondary)]">
                {hostFeatures.map((item) => (
                  <li key={item.label}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--accent-blue)]" />
                      <span>{item.label}</span>
                      {item.comingSoon && (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    {item.subtext && (
                      <p className="mt-1 pl-6 text-[13px] leading-[1.6] text-[var(--text-muted)]">{item.subtext}</p>
                    )}
                  </li>
                ))}
              </ul>
              <Link
                href="/waitlist"
                className="mt-8 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-400"
              >
                Join Waitlist
              </Link>
              <p className="mt-3 text-center text-[13px] text-[var(--text-muted)]">
                Be first to access when Host features launch. No payment until then.
              </p>
            </article>
          </div>

          <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-surface)] p-5 text-[15px] leading-[1.7] text-[var(--text-secondary)]">
            <strong className="text-[var(--text-primary)]">Why does Host cost more?</strong> Host employers carry
            significant legal liability for their providers&apos; compliance. The Host portal includes automated
            verification workflows that protect you from $500,000+ fines.
          </div>
        </div>
      </main>
    </div>
  )
}
