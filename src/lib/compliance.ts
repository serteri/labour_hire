import { AustralianState } from '@prisma/client'

// State authority names and portal URLs
export const STATE_AUTHORITIES: Record<AustralianState, {
  name: string
  shortName: string
  portalUrl: string
  reportingFrequency: string
  graceDate?: string
}> = {
  VIC: {
    name: 'Labour Hire Authority Victoria',
    shortName: 'LHA',
    portalUrl: 'https://labourhire.vic.gov.au',
    reportingFrequency: 'Annual',
  },
  QLD: {
    name: 'Office of Industrial Relations Queensland',
    shortName: 'OIR QLD',
    portalUrl: 'https://labourhire.qld.gov.au',
    reportingFrequency: '6-monthly',
  },
  SA: {
    name: 'Consumer and Business Services SA',
    shortName: 'CBS SA',
    portalUrl: 'https://www.cbs.sa.gov.au',
    reportingFrequency: 'Annual',
    graceDate: '29 July 2026',
  },
  ACT: {
    name: 'Access Canberra',
    shortName: 'ACT Gov',
    portalUrl: 'https://www.accesscanberra.act.gov.au',
    reportingFrequency: 'Annual',
  },
  WA: {
    name: 'Department of Mines, Industry, Regulation and Safety WA',
    shortName: 'DMIRS WA',
    portalUrl: 'https://www.commerce.wa.gov.au',
    reportingFrequency: 'TBC — scheme not yet active',
  },
  NSW: { name: 'NSW — No licence scheme', shortName: 'N/A', portalUrl: '', reportingFrequency: 'N/A' },
  TAS: { name: 'TAS — No licence scheme', shortName: 'N/A', portalUrl: '', reportingFrequency: 'N/A' },
  NT:  { name: 'NT — No licence scheme',  shortName: 'N/A', portalUrl: '', reportingFrequency: 'N/A' },
}

// States with active licensing schemes
export const ACTIVE_STATES: AustralianState[] = ['VIC', 'QLD', 'SA', 'ACT']

// States coming soon
export const UPCOMING_STATES: AustralianState[] = ['WA']

// Maximum fine amounts per state (for UI warnings)
export const STATE_PENALTIES: Partial<Record<AustralianState, string>> = {
  QLD: '$240,000 company + $80,000 director',
  VIC: '$500,000+ company',
  SA: '$10,000 per offence',
}
