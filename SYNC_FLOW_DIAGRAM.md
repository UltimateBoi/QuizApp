# Firebase Sync Flow Diagram

## User Authentication and Sync Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    User Clicks "Sign in with Google"            │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              Google Authentication Completes                     │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│           useSyncManager Checks Firebase User Metadata          │
└─────────────────────┬───────────────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│  No Metadata    │       │  Metadata Exists │
│  (New User)     │       │  (Returning User)│
└────────┬────────┘       └────────┬─────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌──────────────────┐
│ Check Local Data│       │Check Local & Cloud│
└────────┬────────┘       └────────┬─────────┘
         │                         │
    ┌────┴────┐              ┌─────┴──────┐
    ▼         ▼              ▼            ▼
┌──────┐ ┌──────┐    ┌──────────┐  ┌──────────┐
│ Has  │ │ No   │    │Both Exist│  │Only One  │
│Local │ │Local │    │          │  │Exists    │
└──┬───┘ └──┬───┘    └────┬─────┘  └────┬─────┘
   │        │             │             │
   ▼        ▼             ▼             ▼
┌──────────────┐  ┌────────────┐  ┌────────────────┐
│Show Dialog:  │  │Create User │  │Show Dialog:    │
│- Upload      │  │Metadata    │  │- Merge         │
│- Skip        │  │Continue    │  │- Download      │
└──────┬───────┘  └─────┬──────┘  │- Upload        │
       │                │         │- Download/Upload│
       ▼                │         └────────┬────────┘
┌──────────────┐        │                 │
│User Selects  │        │                 ▼
│Action        │        │         ┌───────────────┐
└──────┬───────┘        │         │User Selects   │
       │                │         │Action         │
       ▼                │         └───────┬───────┘
┌──────────────┐        │                 │
│Execute Sync  │        │                 ▼
│Operation     │        │         ┌───────────────┐
└──────┬───────┘        │         │Execute Sync   │
       │                │         │Operation      │
       │                │         └───────┬───────┘
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                 syncComplete = true                              │
│            Real-time Sync Hooks Activated                        │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│     Ongoing: useFirebaseSync & useSettingsSync Monitor Data     │
│          Changes Debounced (2s) and Auto-synced to Firebase     │
└─────────────────────────────────────────────────────────────────┘
```

## Merge Operation Detail

```
┌─────────────────────────────────────────────────────────────────┐
│                      Merge Operation                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              1. Fetch Cloud Data from Firebase                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│       2. Create Map with Cloud Data (id as key)                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│     3. Add Local Items Not in Cloud to Map                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            4. Convert Map to Array (Merged Data)                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│              5. Upload Merged Data to Firebase                   │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│            6. Update Local Storage with Merged Data              │
└─────────────────────────────────────────────────────────────────┘

Result: No data loss, all unique items preserved from both sources
```

## Data Sync Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                    Application Lifecycle                        │
└────────────────────────────────────────────────────────────────┘

User Signs In
     │
     ├─► Initial Sync (useSyncManager)
     │   • One-time prompt
     │   • User chooses sync strategy
     │   • Data synchronized
     │
     ├─► Real-time Listeners Enabled
     │   • useFirebaseSync monitors collections
     │   • useSettingsSync monitors settings
     │   • Changes from other devices applied locally
     │
     └─► Auto-sync on Local Changes
         • User creates/modifies data locally
         • Change detected by hook
         • Debounced 2 seconds
         • Synced to Firebase
         • Other devices receive update via listener

User Signs Out
     │
     └─► Real-time Listeners Disabled
         • No more automatic sync
         • Data remains in local storage
         • Ready for next sign-in
```

## Error Handling Flow

```
Any Sync Operation
        │
        ├─► Success
        │   └─► Continue normal operation
        │
        └─► Error
            │
            ├─► Log to console
            ├─► Show alert to user (if critical)
            └─► Continue with local-only operation
                (App remains functional)
```
