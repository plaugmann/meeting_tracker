export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl">📧</div>
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="text-gray-600">
          We've sent you a magic link. Click the link in the email to sign in.
        </p>
        <p className="text-sm text-gray-500">
          You can close this window and return to the email.
        </p>
      </div>
    </div>
  );
}
