'use client';

export default function AdBlockerWarning() {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
      <div className="flex">
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Cloud Sync Issues?
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              If you&apos;re experiencing sync issues, please disable your ad blocker or add
              this site to your whitelist. Ad blockers can interfere with Firebase cloud sync.
            </p>
            <p className="mt-1">
              <strong>Common ad blockers:</strong> uBlock Origin, AdBlock Plus, Brave Shield
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}