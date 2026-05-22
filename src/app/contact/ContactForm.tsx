'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Enter a valid email address'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export function ContactForm() {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  })

  const onSubmit = async (values: ContactFormValues) => {
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      setSubmitSuccess("✓ Message sent! We'll get back to you shortly.")
      reset()
    } catch {
      setSubmitError(
        'Something went wrong. Please email us directly at support@providershield.com.au'
      )
    }
  }

  const inputBase =
    'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-[15px] text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[var(--accent-blue-glow)]'

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7">
      <h1 className="text-3xl font-bold md:text-4xl">Send us a message</h1>
      <p className="mt-3 text-[15px] leading-[1.7] text-[#9090a8]">
        We typically respond within 2 hours on business days (Mon-Fri, 9am-5pm AEST)
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
            Name
          </label>
          <input id="name" type="text" {...register('name')} className={inputBase} />
          {errors.name && <p className="mt-1.5 text-sm text-red-300">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
            Email
          </label>
          <input id="email" type="email" {...register('email')} className={inputBase} />
          {errors.email && <p className="mt-1.5 text-sm text-red-300">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="subject" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
            Subject
          </label>
          <input id="subject" type="text" {...register('subject')} className={inputBase} />
          {errors.subject && <p className="mt-1.5 text-sm text-red-300">{errors.subject.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className="mb-1.5 block text-sm text-[var(--text-secondary)]">
            Message
          </label>
          <textarea id="message" rows={6} {...register('message')} className={inputBase} />
          {errors.message && <p className="mt-1.5 text-sm text-red-300">{errors.message.message}</p>}
        </div>

        {submitSuccess && (
          <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-[15px] text-emerald-300">
            {submitSuccess}
          </p>
        )}

        {submitError && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[15px] text-red-300">
            {submitError}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_8px_30px_rgba(79,123,255,0.35)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Sending...' : 'Send Message →'}
          {!isSubmitting && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>
    </div>
  )
}
