'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const STATE_OPTIONS = ['VIC', 'QLD', 'SA', 'ACT', 'WA', 'NSW', 'TAS', 'NT'] as const

export default function OnboardingPage() {
  const router = useRouter()
  const [organisationName, setOrganisationName] = useState('')
  const [abn, setAbn] = useState('')
  const [state, setState] = useState('VIC')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!organisationName.trim()) {
      setError('Organisation name is required.')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await fetch('/api/register/org', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organisationName: organisationName.trim(),
          abn: abn.trim(),
          state,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'Failed to create organisation. Please try again.')
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch {
      setError('Failed to create organisation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-sm border-slate-200">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-slate-900">Create your organisation</CardTitle>
        <CardDescription className="text-slate-500">
          Set up your organisation to finish onboarding.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="organisationName">Organisation name</Label>
            <Input
              id="organisationName"
              value={organisationName}
              onChange={(e) => setOrganisationName(e.target.value)}
              placeholder="Acme Labour Hire Pty Ltd"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="abn">ABN (optional)</Label>
            <Input
              id="abn"
              value={abn}
              onChange={(e) => setAbn(e.target.value)}
              placeholder="12 345 678 901"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {STATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating organisation...
              </>
            ) : (
              'Create organisation'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center text-sm text-slate-500">
        You can update these details later in settings.
      </CardFooter>
    </Card>
  )
}
