'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
        <p className="text-gray-600 mb-6">
          An error occurred while loading this page.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
        <a
          href="/"
          className="block mt-4 text-sm text-blue-600 hover:text-blue-700"
        >
          Return to dashboard
        </a>
      </div>
    </div>
  );
}
