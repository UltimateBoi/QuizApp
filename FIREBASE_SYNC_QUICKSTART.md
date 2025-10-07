# Firebase Sync Feature - Quick Start Guide

## Overview

The QuizApp now includes a comprehensive Firebase synchronization system that allows users to seamlessly sync their data across multiple devices using Google authentication.

## What Gets Synced

✅ **Custom Quizzes** - All your created quizzes
✅ **Quiz Sessions** - Complete quiz history and scores  
✅ **Flashcard Decks** - All flashcard decks and cards
✅ **Settings** - User preferences (theme, animations, etc.)

## How It Works

### First-Time Users

1. Click the **user icon** in the top-right corner
2. Sign in with your Google account
3. If you have local data, you'll be prompted:
   - **Upload to Cloud** - Save your existing data
   - **Skip** - Keep data local only

### Returning Users

1. Sign in with your Google account on any device
2. Choose how to sync:
   - **Merge** - Combine local and cloud data (recommended)
   - **Download** - Replace local with cloud data
   - **Upload** - Replace cloud with local data

### After Initial Setup

Once set up, all changes automatically sync across your devices in real-time! 🎉

## Setup (For Deployment)

To enable Firebase sync, you'll need:

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use existing

2. **Enable Services**
   - Firestore Database
   - Google Authentication

3. **Add Configuration**

   **For Local Development:**
   - Copy Firebase config values
   - Add to `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

   **For GitHub Pages Deployment:**
   - Go to your repository on GitHub
   - Navigate to `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret` and add the following secrets:
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`
   - The GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically use these secrets during build
   - Your deployed GitHub Pages site will have Firebase sync fully enabled!

4. **Configure Security Rules**
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

5. **Add Authorized Domain (Important!)**
   - In Firebase Console, go to Authentication → Settings → Authorized domains
   - Add your GitHub Pages domain: `<username>.github.io`
   - This allows authentication to work on your deployed site

## Features

- 🔐 **Secure** - User data isolated by authentication
- 🔄 **Real-time** - Changes sync instantly across devices
- 💾 **Smart Merge** - No data loss when combining datasets
- ⚡ **Efficient** - Debounced updates reduce costs
- 🎯 **User Control** - Choose how to sync your data
- 📱 **Multi-device** - Access from anywhere

## Documentation

For detailed information:
- `FIREBASE_SYNC_IMPLEMENTATION.md` - Complete technical guide
- `SYNC_FLOW_DIAGRAM.md` - Visual flow diagrams
- `IMPLEMENTATION_SUMMARY.md` - Implementation overview

## Troubleshooting

**Sync dialog not appearing?**
- Ensure Firebase credentials are configured
- Check browser console for errors

**Data not syncing?**
- Verify you're signed in (check top-right corner)
- Check internet connection
- Ensure Firestore security rules are configured

**Want to reset sync?**
- Sign out and sign back in
- You'll be prompted again to choose sync strategy

## Privacy & Security

- All data is encrypted in transit (HTTPS)
- User data is isolated (only you can access your data)
- Firebase API keys are designed to be public
- Security enforced through Firestore security rules
- No data shared between users

## Support

For issues or questions about Firebase sync:
1. Check the documentation files
2. Review Firebase Console for errors
3. Check browser developer console
4. Verify Firestore security rules

---

**Note**: The app works perfectly fine without Firebase configuration - sync features are simply disabled. All data continues to work locally using browser localStorage.
