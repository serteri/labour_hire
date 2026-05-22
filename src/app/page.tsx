import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileX,
  ShieldCheck,
  Zap,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      <div className="sticky top-0 z-[60] border-b border-[rgba(245,158,11,0.2)] bg-gradient-to-r from-amber-900/40 to-amber-800/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-2 text-center sm:flex-row sm:text-left">
          <p className="flex items-center gap-2 text-[13px] text-amber-200">
            <span
              className="h-2.5 w-2.5 rounded-full bg-amber-400"
              style={{ animation: 'pulse 1.5s infinite' }}
            />
            SA Grace Period ends 29 July 2026
          </p>
          <Link href="/pricing" className="text-[13px] font-semibold text-amber-300 transition hover:text-amber-100">
            Get compliant →
          </Link>
        </div>
      </div>

      <header className="sticky top-[37px] z-50 border-b border-[var(--border)] bg-[rgba(8,8,16,0.8)] backdrop-blur-[12px]">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-[20px] font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-[var(--accent-blue)]" />
            HireComply
          </Link>

          <div className="hidden items-center gap-5 md:flex">
            <Link href="/features" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Pricing
            </Link>
            <a href="mailto:hello@providershield.com.au" className="text-sm text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]">
              Contact
            </a>
            <span className="h-5 w-px bg-[var(--border)]" />
            <Link
              href="/login"
              className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--border-strong)]"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-[var(--accent-blue)] px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-px hover:shadow-[0_0_20px_rgba(79,123,255,0.3)]"
            >
              Start Free Trial
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link href="/login" className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)]">
              Sign in
            </Link>
            <Link href="/register" className="rounded-lg bg-[var(--accent-blue)] px-3 py-1.5 text-sm font-semibold text-white">
              Trial
            </Link>
          </div>
        </nav>
      </header>

      <main>
        <section
          className="px-4 pb-20 pt-20 text-center md:pb-28 md:pt-24"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(79,123,255,0.15), transparent), var(--bg-base)',
          }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[rgba(79,123,255,0.3)] bg-[rgba(79,123,255,0.08)] px-4 py-1 text-[13px] text-[var(--accent-blue)]">
              <Zap className="h-3.5 w-3.5" />
              Built for Australian Labour Hire Providers
            </div>

            <h1 className="mt-8 text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] md:text-[64px]">
              Stop Managing Labour
              <br />
              Hire Compliance in
              <br />
              <span className="bg-gradient-to-br from-[#4f7bff] to-[#a855f7] bg-clip-text text-transparent">
                Spreadsheets.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-[560px] text-[16px] leading-[1.7] text-[var(--text-secondary)]">
              Track your VIC, QLD, SA and ACT labour hire licences in one dashboard. Automated renewal alerts. Worker
              compliance records. Never miss a deadline again.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#4f7bff] px-7 py-3.5 font-semibold text-white shadow-[0_4px_24px_rgba(79,123,255,0.4)] transition hover:-translate-y-px hover:shadow-[0_8px_30px_rgba(79,123,255,0.5)]"
              >
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/features"
                className="inline-flex items-center justify-center rounded-[10px] border border-[var(--border-strong)] px-7 py-3.5 font-semibold text-[var(--text-primary)] transition hover:border-white/25"
              >
                See how it works
              </Link>
            </div>

            <p className="mt-6 text-[13px] text-[var(--text-muted)]">
              ✓ No credit card required · ✓ 5-minute setup · ✓ Cancel anytime
            </p>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-[var(--bg-surface)] py-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 md:grid-cols-4 md:gap-8">
            {[
              ['$240,000', 'Maximum fine for unlicensed operation in QLD'],
              ['4 States', 'Active licensing schemes: VIC, QLD, SA, ACT'],
              ['29 July', 'SA grace period deadline 2026'],
              ['5 min', 'Average setup time'],
            ].map(([value, label]) => (
              <div key={value} className="text-center md:text-left">
                <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-[var(--bg-base)] px-4 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="mx-auto max-w-4xl text-center text-[28px] font-bold md:text-[40px]">
              The compliance nightmare keeping you up at night
            </h2>

            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7 transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]">
                <div className="inline-flex rounded-xl bg-[var(--accent-red)]/15 p-2.5 shadow-[0_0_28px_rgba(239,68,68,0.22)]">
                  <FileX className="h-5 w-5 text-[var(--accent-red)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">3 portals, 3 deadlines, 3 formats</h3>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                  VIC, QLD and SA each have separate licensing portals with different renewal dates and reporting
                  requirements. One missed deadline means penalties.
                </p>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7 transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]">
                <div className="inline-flex rounded-xl bg-[var(--accent-amber-glow)] p-2.5 shadow-[0_0_28px_rgba(245,158,11,0.22)]">
                  <AlertTriangle className="h-5 w-5 text-[var(--accent-amber)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">$240,000 in fines — already happened</h3>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                  In October 2025, QLD successfully prosecuted an unlicensed provider. $240,000 company fine. $80,000
                  personal fine for the director.
                </p>
              </article>

              <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7 transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-card-hover)]">
                <div className="inline-flex rounded-xl bg-[var(--accent-blue-glow)] p-2.5 shadow-[0_0_28px_rgba(79,123,255,0.22)]">
                  <Clock className="h-5 w-5 text-[var(--accent-blue)]" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">SA grace period ends 29 July 2026</h3>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                  SA expanded licensing to all industries in January 2026. Unlicensed operation after 29 July is
                  illegal. 68 days remaining.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section id="features" className="bg-[var(--bg-surface)] px-4 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-[28px] font-bold md:text-[40px]">Everything you need to stay compliant</h2>
            <p className="mt-4 text-center text-[16px] leading-[1.7] text-[#9090a8]">
              Built specifically for Australian labour hire providers
            </p>

            <div className="mt-14 space-y-14">
              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-3xl font-semibold">Multi-State Licence Dashboard</h3>
                  <p className="mt-4 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                    Track your VIC, QLD, SA and ACT licences in one place. See expiry dates, renewal status and
                    authority portal links at a glance.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-[var(--text-secondary)]">
                    {[
                      'All 4 active states in one view',
                      'Progress bar showing licence period used',
                      'Direct links to state authority portals',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-secondary)]">Licence Overview</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">VIC Labour Hire Licence</p>
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs text-emerald-300">Active</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">Expires: 12/12/2027</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">SA Labour Hire Licence</p>
                        <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs text-amber-300">Expiring 30 days</span>
                      </div>
                      <p className="mt-2 text-sm text-[var(--text-muted)]">Expires: 29/07/2026</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div className="order-2 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 lg:order-1">
                  <p className="text-sm text-[var(--text-secondary)]">Alert Centre</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                      <p className="text-sm font-semibold text-red-300">CRITICAL · QLD Licence expires in 7 days</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Sent 1 minute ago</p>
                    </div>
                    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-4">
                      <p className="text-sm font-semibold text-amber-300">WARNING · Worker visa expires in 30 days</p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">Sent 3 minutes ago</p>
                    </div>
                  </div>
                </div>

                <div className="order-1 lg:order-2">
                  <h3 className="text-3xl font-semibold">Automated Compliance Alerts</h3>
                  <p className="mt-4 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                    Get email alerts 90, 60, 30 and 7 days before every renewal deadline. For licences AND worker
                    visas.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-[var(--text-secondary)]">
                    {[
                      'Email notifications with action links',
                      'Dashboard alert centre',
                      'Critical / Warning / Info severity levels',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="grid items-center gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-3xl font-semibold">Worker Compliance Records</h3>
                  <p className="mt-4 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                    Track visa work rights, police checks and WHS inductions for every worker. Know exactly who is
                    compliant before they step on site.
                  </p>
                  <ul className="mt-5 space-y-2.5 text-[var(--text-secondary)]">
                    {['Visa expiry tracking', 'Work hours restrictions', 'Police check expiry alerts'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[var(--accent-green)]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                  <p className="text-sm text-[var(--text-secondary)]">Worker Compliance Snapshot</p>
                  <div className="mt-4 space-y-2">
                    {[
                      ['Workers active', '128', 'text-[var(--text-primary)]'],
                      ['Visa checks up-to-date', '121', 'text-emerald-300'],
                      ['Police checks due soon', '7', 'text-amber-300'],
                    ].map(([label, value, color]) => (
                      <div key={label} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2.5">
                        <span className="text-sm text-[var(--text-secondary)]">{label}</span>
                        <span className={`text-sm font-semibold ${color}`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-[var(--bg-base)] px-4 py-20 md:py-24">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-center text-[28px] font-bold md:text-[40px]">Simple pricing. No surprises.</h2>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
                <span className="inline-flex rounded-full bg-[rgba(79,123,255,0.2)] px-3 py-1 text-xs font-semibold text-[var(--accent-blue)]">
                  Most Popular
                </span>
                <h3 className="mt-5 text-xl font-semibold">PROVIDER PLAN</h3>
                <p className="mt-3 text-5xl font-bold">
                  $99 <span className="text-base font-medium text-[var(--text-muted)]">/month</span>
                </p>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">For labour hire providers</p>
                <ul className="mt-6 space-y-2.5 text-[var(--text-secondary)]">
                  {[
                    'All 4 state licences (VIC, QLD, SA, ACT)',
                    'Unlimited worker records',
                    'Automated email alerts',
                    'Compliance dashboard',
                    'Xero integration',
                    'Reporting assistant',
                  ].map((item) => (
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
                <h3 className="text-xl font-semibold">HOST EMPLOYER PLAN</h3>
                <p className="mt-3 text-5xl font-bold">
                  $149 <span className="text-base font-medium text-[var(--text-muted)]">/month</span>
                </p>
                <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">
                  For businesses using labour hire
                </p>
                <ul className="mt-6 space-y-2.5 text-[var(--text-secondary)]">
                  {[
                    'Everything in Provider',
                    'Provider licence verification',
                    'Mobilisation approval workflow',
                    'Full audit trail',
                    'Multi-site management',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[var(--accent-blue)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-lg border border-[var(--border-strong)] px-5 py-3 font-semibold text-[var(--text-primary)] transition hover:border-white/30"
                >
                  Start Free Trial
                </Link>
              </article>
            </div>

            <div className="mt-7 rounded-2xl border border-amber-400/35 bg-amber-500/10 p-5 text-amber-100">
              🎁 Founding Member Offer — First 50 customers get $69/month (Provider) or $99/month (Host), locked in
              for life.
            </div>
          </div>
        </section>

        <section
          className="px-4 py-20 text-center"
          style={{ background: 'radial-gradient(circle at 50% 45%, rgba(79,123,255,0.25), rgba(8,8,16,0.95) 58%)' }}
        >
          <div className="mx-auto max-w-3xl">
            <h2 className="text-[28px] font-bold md:text-[40px]">Start before the 29 July deadline.</h2>
            <p className="mx-auto mt-4 max-w-xl text-[16px] leading-[1.7] text-[#9090a8]">
              Get set up in 5 minutes. No credit card required.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-8 py-4 text-lg font-semibold text-white shadow-[0_8px_30px_rgba(79,123,255,0.45)] transition hover:-translate-y-px hover:shadow-[0_10px_36px_rgba(79,123,255,0.6)]"
            >
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--bg-surface)] px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="flex items-center gap-2 text-lg font-semibold">
              <ShieldCheck className="h-5 w-5 text-[var(--accent-blue)]" />
              HireComply
            </p>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">Labour hire compliance, simplified.</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">© 2026 HireComply. Built for Australian businesses.</p>
          </div>

          <div className="flex gap-5 text-sm text-[var(--text-secondary)]">
            <a href="/privacy" className="transition hover:text-[var(--text-primary)]">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-[var(--text-primary)]">
              Terms
            </a>
            <a href="mailto:hello@providershield.com.au" className="transition hover:text-[var(--text-primary)]">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
