import { signOut } from '@/auth';

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  userRole?: string;
  showAdminLinks?: boolean;
}

export default function Navbar({ userName, userEmail, userImage, userRole, showAdminLinks }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity">
              <img 
                src="/web-app-manifest-512x512.png" 
                alt="EY Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
              />
              <span className="text-lg sm:text-xl font-bold text-gray-900">EY Meeting Tracker</span>
            </a>
            {showAdminLinks && userRole === 'ADMIN' && (
              <div className="hidden md:flex gap-4">
                <a
                  href="/admin/customers"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Customers
                </a>
                <a
                  href="/admin/users"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Users
                </a>
              </div>
            )}
            {showAdminLinks && (userRole === 'ADMIN' || userRole === 'MANAGER') && (
              <a
                href="/reports"
                className="text-sm text-gray-600 hover:text-gray-900 hidden md:block"
              >
                Reports
              </a>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              {userImage && (
                <img
                  src={userImage}
                  alt={userName || 'User'}
                  className="w-8 h-8 rounded-full grayscale-image object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">{userName || userEmail}</span>
                <span className="text-xs text-gray-500">{userRole}</span>
              </div>
            </div>
            <a
              href="/settings"
              className="text-sm text-gray-600 hover:text-gray-900 hidden sm:inline"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  );
}
