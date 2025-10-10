'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

interface AuthButtonProps {
  syncing?: boolean;
  lastSync?: Date | null;
  onManualSync?: () => Promise<void>;
}

export default function AuthButton({ syncing = false, lastSync = null, onManualSync }: AuthButtonProps = {}) {
  const { user, loading, signInWithGoogle, signOut, isConfigured } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={signInWithGoogle}
        disabled={!isConfigured}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
        title={!isConfigured ? 'Authentication not configured. Add Firebase credentials to enable.' : 'Sign in with Google'}
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Sign in with Google
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.photoURL}
            alt={user.displayName || 'User'}
            className="w-6 h-6 rounded-full"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
            {user.displayName?.[0] || user.email?.[0] || 'U'}
          </div>
        )}
        <span className="text-gray-900 dark:text-white text-sm">
          {user.displayName || user.email}
        </span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                {user.email}
              </div>
              
              {/* Sync Status Section */}
              <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Sync Status</span>
                  {syncing ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                      <span className="text-xs text-blue-600 dark:text-blue-400">Syncing...</span>
                    </div>
                  ) : lastSync ? (
                    <span className="text-xs text-green-600 dark:text-green-400">✓ Synced</span>
                  ) : (
                    <span className="text-xs text-gray-500 dark:text-gray-400">Not synced</span>
                  )}
                </div>
                {lastSync && !syncing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last: {new Date(lastSync).toLocaleTimeString()}
                  </p>
                )}
                {onManualSync && (
                  <button
                    onClick={() => {
                      onManualSync();
                    }}
                    disabled={syncing}
                    className="w-full mt-2 px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                )}
              </div>
              
              <button
                onClick={() => {
                  signOut();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mt-1"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
