'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Pencil, Trash2 } from 'lucide-react'
import { LicenceRecord } from '@prisma/client'
import { LicenceSchema, type LicenceInput } from '@/lib/validations'
import { STATE_AUTHORITIES } from '@/lib/compliance'
import { formatAUDate } from '@/lib/utils'
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

interface EditLicenceDialogProps {
  licence: LicenceRecord
}

export function EditLicenceDialog({ licence }: EditLicenceDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Convert Date to YYYY-MM-DD string for input[type=date]
  function toInputDate(d: Date | null | undefined): string {
    if (!d) return ''
    return new Date(d).toISOString().split('T')[0]
  }

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LicenceInput>({
    resolver: zodResolver(LicenceSchema),
    defaultValues: {
      state: licence.state as 'VIC' | 'QLD' | 'SA' | 'ACT',
      licenceNumber: licence.licenceNumber ?? '',
      issuedDate: toInputDate(licence.issuedDate),
      expiryDate: toInputDate(licence.expiryDate),
      notes: licence.notes ?? '',
    },
  })

  async function onSubmit(data: LicenceInput) {
    setServerError(null)
    const res = await fetch(`/api/licences/${licence.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Failed to update licence. Please try again.')
      return
    }

    setOpen(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setIsDeleting(true)
    const res = await fetch(`/api/licences/${licence.id}`, { method: 'DELETE' })
    if (res.ok) {
      setOpen(false)
      router.refresh()
    } else {
      setServerError('Failed to delete licence.')
      setIsDeleting(false)
      setConfirmDelete(false)
    }
  }

  const authority = STATE_AUTHORITIES[licence.state]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => { setConfirmDelete(false); setServerError(null); setOpen(true) }}
      >
        <Pencil className="h-3.5 w-3.5 mr-1.5" />
        Edit
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit {licence.state} Licence</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-2">{authority.name}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
            {serverError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {serverError}
              </p>
            )}

            {/* State — read-only on edit */}
            <div className="space-y-2">
              <Label>State</Label>
              <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                {licence.state} — {authority.shortName}
              </div>
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

            {/* Dates */}
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
              <Label htmlFor="notes">Notes</Label>
              <textarea
                id="notes"
                rows={3}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('notes')}
              />
            </div>

            <DialogFooter showCloseButton={false}>
              {/* Delete button on left */}
              <div className="flex-1 flex items-center">
                {confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 font-medium">Are you sure?</span>
                    <Button
                      type="button"
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Yes, delete'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Delete
                  </Button>
                )}
              </div>

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
                disabled={isSubmitting || isDeleting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
