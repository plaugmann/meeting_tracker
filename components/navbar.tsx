import { signOut } from '@/auth';

interface NavbarProps {
  userEmail?: string | null;
  userRole?: string;
  showAdminLinks?: boolean;
}

export default function Navbar({ userEmail, userRole, showAdminLinks }: NavbarProps) {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <a href="/" className="text-xl font-bold hover:text-gray-700">
              EY Meeting Tracker
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
            <span className="text-sm text-gray-600 hidden sm:inline">{userEmail}</span>
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
              {userRole}
            </span>
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
