'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Calendar, PlusCircle, LayoutDashboard, LogOut, LogIn, UserPlus } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      setShowLogoutModal(false);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 hover:text-primary-600 transition">
              <Calendar className="w-7 h-7 text-primary-500" />
              <span>EventsPlatform</span>
            </Link>

            <nav className="flex items-center gap-4 sm:gap-6">
              <Link
                href="/events"
                className={`flex items-center gap-1.5 text-sm font-medium transition ${
                  pathname === '/events' ? 'text-primary-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Events</span>
              </Link>

              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`flex items-center gap-1.5 text-sm font-medium transition ${
                      pathname === '/dashboard' ? 'text-primary-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/events/new"
                    className="flex items-center gap-1.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white px-3.5 py-1.5 rounded-lg transition shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Create Event</span>
                  </Link>

                  <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
                    <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                      {user?.name}
                    </span>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      title="Sign Out"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
                  <Link
                    href="/login"
                    className="flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Log In</span>
                  </Link>

                  <Link
                    href="/register"
                    className="flex items-center gap-1 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg transition"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-50 rounded-xl">
                <LogOut className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Sign Out?</h3>
                <p className="text-xs text-slate-500">Are you sure you want to log out?</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              You will need to sign in again to create events, manage RSVPs, or access your dashboard.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold text-xs px-4 py-2 rounded-lg transition shadow-sm"
              >
                {isLoggingOut ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
