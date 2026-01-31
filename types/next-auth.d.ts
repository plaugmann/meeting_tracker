import { DefaultSession } from 'next-auth';
import { Role } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    role: Role;
    target: number;
    image?: string | null;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role: Role;
      target: number;
    };
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: Role;
    target: number;
  }
}
