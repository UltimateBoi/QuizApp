'use client';

import { useState } from 'react';

export type SyncAction = 'upload' | 'download' | 'merge' | 'cancel';

interface SyncDialogProps {
  isOpen: boolean;
  isNewUser: boolean;
  hasLocalData: boolean;
  hasCloudData: boolean;
  onAction: (action: SyncAction) => void;
}

export default function SyncDialog({
  isOpen,
  isNewUser,
  hasLocalData,
  hasCloudData,
  onAction,
}: SyncDialogProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAction = async (action: SyncAction) => {
    setLoading(true);
    try {
      await onAction(action);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isNewUser ? 'Welcome! Sync Your Data' : 'Sync Your Data'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isNewUser
              ? hasLocalData
                ? 'We found local data on this device. Would you like to save it to the cloud?'
                : 'Your data will be automatically saved to the cloud from now on.'
              : 'We found data both locally and in the cloud. How would you like to proceed?'}
          </p>
        </div>

        <div className="space-y-3">
          {isNewUser ? (
            <>
              {hasLocalData && (
                <>
                  <button
                    onClick={() => handleAction('upload')}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? 'Uploading...' : 'Upload Local Data to Cloud'}
                  </button>
                  <button
                    onClick={() => handleAction('cancel')}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    Skip (Keep Local Only)
                  </button>
                </>
              )}
              {!hasLocalData && (
                <button
                  onClick={() => handleAction('cancel')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Continue
                </button>
              )}
            </>
          ) : (
            <>
              {hasCloudData && hasLocalData && (
                <>
                  <button
                    onClick={() => handleAction('merge')}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? 'Merging...' : 'Merge Local and Cloud Data'}
                  </button>
                  <button
                    onClick={() => handleAction('download')}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? 'Loading...' : 'Load Cloud Data (Replace Local)'}
                  </button>
                  <button
                    onClick={() => handleAction('upload')}
                    disabled={loading}
                    className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {loading ? 'Uploading...' : 'Upload Local Data (Replace Cloud)'}
                  </button>
                </>
              )}
              {hasCloudData && !hasLocalData && (
                <button
                  onClick={() => handleAction('download')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Loading...' : 'Load Cloud Data'}
                </button>
              )}
              {!hasCloudData && hasLocalData && (
                <button
                  onClick={() => handleAction('upload')}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {loading ? 'Uploading...' : 'Upload Local Data to Cloud'}
                </button>
              )}
              <button
                onClick={() => handleAction('cancel')}
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {isNewUser && !hasLocalData && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Your quizzes, flashcards, sessions, and settings will be automatically synced across all your devices.
          </p>
        )}
        {!isNewUser && hasCloudData && hasLocalData && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <strong>Merge:</strong> Combines both datasets, keeping unique items from each.
            <br />
            <strong>Load Cloud:</strong> Replaces your local data with cloud data.
            <br />
            <strong>Upload Local:</strong> Replaces cloud data with your local data.
          </p>
        )}
      </div>
    </div>
  );
}
