'use client';

import { useState } from 'react';
import { handleSignOut } from '@/app/actions/auth';

interface NavbarProps {
  userName?: string | null;
  userEmail?: string | null;
  userImage?: string | null;
  userRole?: string;
  showAdminLinks?: boolean;
}

export default function Navbar({ userName, userEmail, userImage, userRole, showAdminLinks }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            {/* Desktop Menu */}
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
            <form action={handleSignOut} className="hidden sm:block">
              <button
                type="submit"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign out
              </button>
            </form>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-3">
              {/* User Info */}
              <div className="flex items-center gap-3 px-4 pb-3 border-b border-gray-200">
                {userImage && (
                  <img
                    src={userImage}
                    alt={userName || 'User'}
                    className="w-10 h-10 rounded-full grayscale-image object-cover"
                  />
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">{userName || userEmail}</span>
                  <span className="text-xs text-gray-500">{userRole}</span>
                </div>
              </div>

              {/* Admin Links */}
              {showAdminLinks && userRole === 'ADMIN' && (
                <>
                  <a
                    href="/admin/customers"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Customers
                  </a>
                  <a
                    href="/admin/users"
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Users
                  </a>
                </>
              )}

              {/* Reports Link */}
              {showAdminLinks && (userRole === 'ADMIN' || userRole === 'MANAGER') && (
                <a
                  href="/reports"
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Reports
                </a>
              )}

              {/* Settings Link */}
              <a
                href="/settings"
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                Settings
              </a>

              {/* Sign Out */}
              <form action={handleSignOut} className="px-4 pt-3 border-t border-gray-200">
                <button
                  type="submit"
                  className="w-full text-left py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
