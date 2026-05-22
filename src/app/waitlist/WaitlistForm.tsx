'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

const waitlistSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
})

type WaitlistData = z.infer<typeof waitlistSchema>

export default function WaitlistForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistData>({ resolver: zodResolver(waitlistSchema) })

  async function onSubmit(data: WaitlistData) {
    setServerError('')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        setServerError(json.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSubmittedEmail(data.email)
      setSubmitted(true)
    } catch {
      setServerError('Network error. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <CheckCircle2 className="h-14 w-14 text-[var(--accent-green)]" />
        <h2 className="text-2xl font-bold">You&apos;re on the list!</h2>
        <p className="text-[15px] leading-[1.7] text-[var(--text-secondary)]">
          We&apos;ll reach out to{' '}
          <span className="font-medium text-[var(--text-primary)]">{submittedEmail}</span> personally when
          Host features are ready. Expected: Q3 2026.
        </p>
        <Link
          href="/"
          className="mt-2 text-[14px] text-[var(--accent-blue)] transition hover:underline"
        >
          Back to home →
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
          Full name <span className="text-[var(--accent-red)]">*</span>
        </label>
        <input
          {...register('name')}
          placeholder="Jane Smith"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
        />
        {errors.name && (
          <p className="mt-1 text-[12px] text-[var(--accent-red)]">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
          Company name <span className="text-[var(--accent-red)]">*</span>
        </label>
        <input
          {...register('company')}
          placeholder="Acme Corp"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
        />
        {errors.company && (
          <p className="mt-1 text-[12px] text-[var(--accent-red)]">{errors.company.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
          Work email <span className="text-[var(--accent-red)]">*</span>
        </label>
        <input
          {...register('email')}
          type="email"
          placeholder="jane@acmecorp.com.au"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
        />
        {errors.email && (
          <p className="mt-1 text-[12px] text-[var(--accent-red)]">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-[var(--text-secondary)]">
          Phone <span className="text-[var(--text-muted)]">(optional)</span>
        </label>
        <input
          {...register('phone')}
          type="tel"
          placeholder="0400 000 000"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3.5 py-2.5 text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:outline-none"
        />
      </div>

      {serverError && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-[13px] text-red-400">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-400 disabled:opacity-60"
      >
        {isSubmitting ? 'Joining...' : 'Join Waitlist →'}
      </button>
    </form>
  )
}
