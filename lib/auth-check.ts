import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export async function requireAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }
  
  return session;
}

export async function requireManagerOrAdmin() {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  if (session.user.role === 'EMPLOYEE') {
    redirect('/');
  }
  
  return session;
}
