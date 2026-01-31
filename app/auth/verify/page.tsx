'use client';

import { useSearchParams } from 'next/navigation';

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">📧</div>
        <h1 className="text-3xl font-bold">Check your email</h1>
        {email && (
          <p className="text-sm font-medium text-blue-600 bg-blue-50 py-2 px-4 rounded">
            {email}
          </p>
        )}
        <p className="text-gray-600">
          We've sent you a magic link. Click the link in the email to sign in.
        </p>
        <p className="text-sm text-gray-500">
          The email should arrive within a few seconds. Don't forget to check your spam folder!
        </p>
        <p className="text-sm text-gray-500">
          You can close this window and return to the email.
        </p>
        <a
          href="/auth/signin"
          className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          ← Back to sign in
        </a>
      </div>
    </div>
  );
}
