'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { LicenceSchema, type LicenceInput } from '@/lib/validations'

type ActiveState = 'VIC' | 'QLD' | 'SA' | 'ACT'
import { ACTIVE_STATES, STATE_AUTHORITIES } from '@/lib/compliance'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddLicenceDialogProps {
  /** Pre-select a state when opened from a state card */
  defaultState?: ActiveState
  triggerLabel?: string
}

export function AddLicenceDialog({
  defaultState,
  triggerLabel = 'Add Licence',
}: AddLicenceDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LicenceInput>({
    resolver: zodResolver(LicenceSchema),
    defaultValues: {
      state: (defaultState ?? 'VIC') as LicenceInput['state'],
    },
  })

  function handleOpen() {
    reset({ state: (defaultState ?? 'VIC') as LicenceInput['state'] })
    setServerError(null)
    setOpen(true)
  }

  async function onSubmit(data: LicenceInput) {
    setServerError(null)
    const res = await fetch('/api/licences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Failed to save licence. Please try again.')
      return
    }

    setOpen(false)
    reset()
    router.refresh()
  }

  return (
    <>
      <Button onClick={handleOpen} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Licence</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])} className="space-y-4 py-2" noValidate>
            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {serverError}
              </p>
            )}

            {/* State */}
            <div className="space-y-2">
              <Label>State *</Label>
              <Controller
                name="state"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state…" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTIVE_STATES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s} — {STATE_AUTHORITIES[s].shortName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.state && (
                <p className="text-sm text-red-600">{errors.state.message}</p>
              )}
            </div>

            {/* Licence number */}
            <div className="space-y-2">
              <Label htmlFor="licenceNumber">
                Licence number <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <Input
                id="licenceNumber"
                placeholder="e.g. LH-2024-001234"
                {...register('licenceNumber')}
              />
            </div>

            {/* Dates row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="issuedDate">
                  Issue date <span className="text-slate-400 font-normal">(optional)</span>
                </Label>
                <Input id="issuedDate" type="date" {...register('issuedDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry date *</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  {...register('expiryDate')}
                  className={errors.expiryDate ? 'border-red-500' : ''}
                />
                {errors.expiryDate && (
                  <p className="text-sm text-red-600">{errors.expiryDate.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                Notes <span className="text-slate-400 font-normal">(optional)</span>
              </Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Any additional compliance notes…"
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('notes')}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Licence'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
