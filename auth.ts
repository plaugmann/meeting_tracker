import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Resend from 'next-auth/providers/resend';
import { prisma } from './lib/prisma';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Resend({
      from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowedDomains = ['@ey.com', '@dk.ey.com'];
      const isAllowed = allowedDomains.some(domain => user.email?.endsWith(domain));
      if (!isAllowed) {
        return false;
      }
      return true;
    },
    async session({ session, user }) {
      if (session.user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { role: true, target: true },
        });
        session.user.id = user.id;
        session.user.role = dbUser?.role || 'EMPLOYEE';
        session.user.target = dbUser?.target || 8;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    verifyRequest: '/auth/verify',
  },
});
