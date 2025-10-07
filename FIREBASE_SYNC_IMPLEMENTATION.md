# Firebase Sync Implementation Documentation

## Overview

This implementation provides a smart Firebase authentication and data synchronization system for the QuizApp. When users sign in with Google, the app intelligently manages their data across devices.

## Features

### 1. Smart User Detection
- **New Users**: Automatically detected when signing in for the first time
- **Returning Users**: Detected based on existing Firebase user metadata

### 2. Sync Dialog Prompts

#### For New Users:
- If the user has local data:
  - **Upload Local Data to Cloud**: Saves their existing quizzes, flashcards, sessions, and settings to Firebase
  - **Skip**: Keeps data local only
- If no local data:
  - Automatically proceeds with cloud sync enabled

#### For Returning Users:
- If both local and cloud data exist:
  - **Merge Local and Cloud Data**: Combines unique items from both sources
  - **Load Cloud Data**: Replaces local data with cloud data
  - **Upload Local Data**: Replaces cloud data with local data
  - **Cancel**: Skip sync for now
- If only cloud data exists:
  - **Load Cloud Data**: Downloads cloud data to local device
- If only local data exists:
  - **Upload Local Data**: Uploads local data to cloud

### 3. Real-time Synchronization

After initial sync is complete, all changes are automatically synced:
- **Quizzes**: Custom quizzes (excluding default quiz)
- **Quiz Sessions**: All completed quiz sessions and scores
- **Flashcard Decks**: All flashcard decks and cards
- **Settings**: User preferences (theme, animations, etc.)

Changes are debounced (2 seconds) before syncing to reduce unnecessary writes.

### 4. Multi-device Support

Users can access their data from any device:
1. Sign in with the same Google account
2. Data is automatically synced
3. Changes made on one device appear on all other devices

## Architecture

### Components

#### `SyncDialog.tsx`
- Modal dialog that prompts users for sync decisions
- Displays different options based on user status and data availability
- Provides clear explanations for each action

### Hooks

#### `useSyncManager.ts`
- Orchestrates the entire sync process
- Checks user status (new vs returning)
- Detects local and cloud data existence
- Handles upload, download, and merge operations
- Manages user metadata in Firebase

#### `useFirebaseSync.ts` (Enhanced)
- Generic hook for syncing collections (quizzes, sessions, flashcards)
- Supports real-time listeners for automatic updates
- Can be enabled/disabled based on initial sync status
- Handles debounced auto-sync

#### `useSettingsSync.ts`
- Specialized hook for syncing settings
- Similar to useFirebaseSync but for single document (settings)

### Data Structure in Firebase

```
users/
  {userId}/
    - createdAt: timestamp
    - lastSync: timestamp
    
    quizzes/
      {quizId}/
        - id, name, description, questions, tags
        - createdAt, updatedAt
    
    sessions/
      {sessionId}/
        - id, quizId, quizName, questions, userAnswers
        - startTime, endTime, score, totalQuestions
        - updatedAt
    
    flashcards/
      {deckId}/
        - id, name, description, cards, tags
        - createdAt, updatedAt
    
    settings/
      app/
        - theme, autoSubmit, animations, etc.
        - updatedAt
```

## Usage Flow

### First-time User Flow
1. User clicks "Sign in with Google"
2. Google authentication completes
3. `useSyncManager` detects new user (no metadata in Firebase)
4. If local data exists:
   - Shows SyncDialog with upload option
   - User chooses to upload or skip
5. If user uploads:
   - All local data copied to Firebase
   - User metadata created
6. Real-time sync enabled
7. Dialog closes

### Returning User Flow
1. User clicks "Sign in with Google"
2. Google authentication completes
3. `useSyncManager` detects returning user (metadata exists)
4. Checks for data in both locations
5. Shows SyncDialog with appropriate options
6. User chooses merge, download, or upload
7. Selected operation executes
8. Real-time sync enabled
9. Dialog closes

### Merge Logic
When merging data:
- Uses `id` field as unique identifier
- Cloud data is fetched first
- Local unique items are added
- Result is uploaded back to cloud and updated locally
- Ensures no data loss from either source

## Configuration

### Prerequisites
1. Firebase project with Firestore enabled
2. Google Authentication enabled
3. Firestore security rules configured
4. Authorized domain configured in Firebase

### Environment Variables

**For Local Development:**
Create a `.env.local` file with:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**For GitHub Pages Deployment:**
1. Go to repository `Settings` → `Secrets and variables` → `Actions`
2. Add the following repository secrets:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
3. The deployment workflow (`.github/workflows/deploy.yml`) automatically uses these secrets
4. Secrets are injected as environment variables during the build process
5. The built site will have Firebase fully configured and functional

### Firestore Security Rules Example
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Firebase Authorized Domains
Add your deployment domain to Firebase Console:
- Local: `localhost` (usually added by default)
- GitHub Pages: `<username>.github.io`

Go to Firebase Console → Authentication → Settings → Authorized domains

## Error Handling

- Network errors: Logged to console, user notified via alert
- Authentication errors: Handled by AuthContext
- Sync failures: Continue with local-only operation
- Missing data: Gracefully handled with empty states

## Benefits

1. **No Data Loss**: Users never lose their work when switching devices
2. **Flexible**: Users control how data is synced
3. **Transparent**: Clear prompts explain what will happen
4. **Automatic**: After initial setup, everything syncs automatically
5. **Efficient**: Debounced updates reduce Firebase writes
6. **Real-time**: Changes appear instantly across devices

## Future Enhancements

Potential improvements:
- Conflict resolution for simultaneous edits
- Offline queue for sync operations
- Sync status indicator in UI
- Manual sync trigger button
- Selective sync (choose what to sync)
- Data export/import functionality
