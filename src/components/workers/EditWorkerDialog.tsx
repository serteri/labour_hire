'use client'

import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Loader2, Trash2 } from 'lucide-react'
import { WorkerRecord } from '@prisma/client'
import { workerSchema, type WorkerFormInput } from '@/lib/validations'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Separator } from '@/components/ui/separator'

const VISA_TYPES = [
  'Australian Citizen',
  'Permanent Resident',
  '482 TSS Visa',
  '485 Graduate Visa',
  'Working Holiday (417/462)',
  'Student Visa (500)',
  'Other',
] as const

const NO_EXPIRY_VISA_TYPES = ['Australian Citizen', 'Permanent Resident'] as const

type VisaType = (typeof VISA_TYPES)[number]

interface EditWorkerDialogProps {
  worker: Omit<WorkerRecord, 'createdAt' | 'updatedAt' | 'visaExpiryDate' | 'policeCheckDate' | 'policeCheckExpiry' | 'whsInductionDate'> & {
    createdAt: string | Date
    updatedAt: string | Date
    visaExpiryDate: string | Date | null
    policeCheckDate: string | Date | null
    policeCheckExpiry: string | Date | null
    whsInductionDate: string | Date | null
  }
  open: boolean
  onOpenChange: (open: boolean) => void
}

function toInputDate(date: Date | string | null | undefined): string {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function EditWorkerDialog({ worker, open, onOpenChange }: EditWorkerDialogProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WorkerFormInput>({
    resolver: zodResolver(workerSchema),
    values: {
      firstName: worker.firstName,
      lastName: worker.lastName,
      email: worker.email ?? '',
      phone: worker.phone ?? '',
      jobTitle: worker.jobTitle ?? '',
      visaType: worker.visaType ?? 'Australian Citizen',
      visaSubclass: worker.visaSubclass ?? '',
      visaExpiryDate: toInputDate(worker.visaExpiryDate),
      workHoursLimit: worker.workHoursLimit ?? null,
      policeCheckDate: toInputDate(worker.policeCheckDate),
      policeCheckExpiry: toInputDate(worker.policeCheckExpiry),
      whsInduction: worker.whsInduction,
      whsInductionDate: toInputDate(worker.whsInductionDate),
      notes: worker.notes ?? '',
    },
  })

  const visaType = watch('visaType')
  const whsInduction = watch('whsInduction')

  const isCitizenOrPR = useMemo(
    () => NO_EXPIRY_VISA_TYPES.includes((visaType || '') as (typeof NO_EXPIRY_VISA_TYPES)[number]),
    [visaType]
  )

  async function onSubmit(data: WorkerFormInput) {
    setServerError(null)

    if (!isCitizenOrPR && !data.visaExpiryDate) {
      setError('visaExpiryDate', {
        type: 'manual',
        message: 'Visa expiry date is required for temporary visas',
      })
      return
    }

    const payload = {
      ...data,
      visaExpiryDate: isCitizenOrPR ? '' : data.visaExpiryDate,
      workHoursLimit: isCitizenOrPR ? null : data.workHoursLimit,
      whsInductionDate: data.whsInduction ? data.whsInductionDate : '',
      visaSubclass: data.visaType === 'Other' ? data.visaSubclass : '',
    }

    const res = await fetch(`/api/workers/${worker.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const json = await res.json()
    if (!res.ok) {
      setServerError(json.error ?? 'Failed to update worker. Please try again.')
      return
    }

    onOpenChange(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setIsDeleting(true)
    const res = await fetch(`/api/workers/${worker.id}`, { method: 'DELETE' })
    if (!res.ok) {
      setServerError('Failed to delete worker.')
      setConfirmDelete(false)
      setIsDeleting(false)
      return
    }

    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setServerError(null)
        setConfirmDelete(false)
        onOpenChange(nextOpen)
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Edit Worker: {worker.firstName} {worker.lastName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-2" noValidate>
          {serverError && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {serverError}
            </p>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Personal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name *</Label>
                <Input id="firstName" {...register('firstName')} />
                {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name *</Label>
                <Input id="lastName" {...register('lastName')} />
                {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register('phone')} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jobTitle">Job title</Label>
                <Input id="jobTitle" {...register('jobTitle')} />
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Work Rights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2 md:col-span-2">
                <Label>Visa type</Label>
                <Controller
                  name="visaType"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || undefined}
                      onValueChange={(value) => {
                        field.onChange(value as VisaType)
                        if (NO_EXPIRY_VISA_TYPES.includes(value as (typeof NO_EXPIRY_VISA_TYPES)[number])) {
                          setValue('visaExpiryDate', '')
                          setValue('workHoursLimit', null)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        {VISA_TYPES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {visaType === 'Other' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="visaSubclass">Visa subclass</Label>
                  <Input id="visaSubclass" {...register('visaSubclass')} />
                </div>
              )}

              {!isCitizenOrPR && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="visaExpiryDate">Visa expiry date *</Label>
                    <Input id="visaExpiryDate" type="date" {...register('visaExpiryDate')} />
                    {errors.visaExpiryDate && (
                      <p className="text-sm text-red-600">{errors.visaExpiryDate.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workHoursLimit">Weekly hours limit (leave blank if unrestricted)</Label>
                    <Input
                      id="workHoursLimit"
                      type="number"
                      min={1}
                      {...register('workHoursLimit', {
                        setValueAs: (value) => {
                          if (value === '' || value === null || value === undefined) return null
                          return Number(value)
                        },
                      })}
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          <Separator />

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Compliance Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="policeCheckDate">Police check date</Label>
                <Input id="policeCheckDate" type="date" {...register('policeCheckDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policeCheckExpiry">Police check expiry</Label>
                <Input id="policeCheckExpiry" type="date" {...register('policeCheckExpiry')} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-900">
                  <input type="checkbox" className="h-4 w-4" {...register('whsInduction')} />
                  WHS induction completed
                </label>
              </div>

              {whsInduction && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="whsInductionDate">WHS induction date</Label>
                  <Input id="whsInductionDate" type="date" {...register('whsInductionDate')} />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('notes')}
                />
              </div>
            </div>
          </section>

          <DialogFooter showCloseButton={false}>
            <div className="flex-1">
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
                  <Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
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

            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
