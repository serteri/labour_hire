import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { LoginSchema } from '@/lib/validations'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) return null

        const passwordMatch = await bcrypt.compare(password, user.password)
        if (!passwordMatch) return null

        return user
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
      }
      return token
    },
    async session({ session, token }) {
      try {
        if (token.sub && session.user) {
          session.user.id = token.sub

          const membership = await prisma.organizationMember.findFirst({
            where: { userId: token.sub },
            include: { organization: true },
          })

          if (membership) {
            ;(session.user as typeof session.user & {
              orgId?: string
              orgName?: string
              role?: string
            }).orgId = membership.orgId
            ;(session.user as typeof session.user & {
              orgId?: string
              orgName?: string
              role?: string
            }).orgName = membership.organization.name
            ;(session.user as typeof session.user & {
              orgId?: string
              orgName?: string
              role?: string
            }).role = membership.role
          }
        }
      } catch (error) {
        console.error('Session callback error:', error)
      }

      return session
    },
  },
})
