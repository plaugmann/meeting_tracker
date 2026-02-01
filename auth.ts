import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: true, // Enable debug logging
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Authorize attempt:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        console.log('[AUTH] User found:', !!user);
        
        if (!user || !user.password) {
          console.log('[AUTH] User not found or no password');
          return null;
        }

        const isValidPassword = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        console.log('[AUTH] Password valid:', isValidPassword);

        if (!isValidPassword) {
          return null;
        }

        console.log('[AUTH] Login successful');
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          target: user.target,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
        token.role = user.role;
        token.target = user.target;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = (token.name as string | null) ?? null;
        session.user.email = (token.email as string) ?? '';
        session.user.image = (token.image as string | null) ?? null;
        session.user.role = token.role as Role;
        session.user.target = token.target as number;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
});
