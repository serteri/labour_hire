import { z } from 'zod'

export const LoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  organisationName: z.string().min(2, 'Organisation name must be at least 2 characters'),
})

export const AddLicenceSchema = z.object({
  state: z.enum(['VIC', 'QLD', 'SA', 'ACT', 'WA', 'NSW', 'TAS', 'NT']),
  licenceNumber: z.string().optional(),
  licenceType: z.string().optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  notes: z.string().optional(),
})

export const workerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  visaType: z.string().optional(),
  visaSubclass: z.string().optional(),
  visaExpiryDate: z.string().optional(),
  workHoursLimit: z.number().int().positive().optional().nullable(),
  policeCheckDate: z.string().optional(),
  policeCheckExpiry: z.string().optional(),
  whsInduction: z.boolean().default(false),
  whsInductionDate: z.string().optional(),
  notes: z.string().optional(),
})

export const AddWorkerSchema = workerSchema

// Alias used for the licences form (scoped to active states only)
export const LicenceSchema = z.object({
  state: z.enum(['VIC', 'QLD', 'SA', 'ACT']),
  licenceNumber: z.string().optional(),
  issuedDate: z.string().optional(),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  notes: z.string().optional(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type RegisterInput = z.infer<typeof RegisterSchema>
export type AddLicenceInput = z.infer<typeof AddLicenceSchema>
export type AddWorkerInput = z.infer<typeof AddWorkerSchema>
export type WorkerInput = z.infer<typeof workerSchema>
export type WorkerFormInput = z.input<typeof workerSchema>
export type LicenceInput = z.infer<typeof LicenceSchema>
