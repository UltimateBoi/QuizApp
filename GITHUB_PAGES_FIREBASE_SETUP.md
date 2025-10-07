# Setting Up Firebase for GitHub Pages Deployment

## Overview

This guide walks you through configuring Firebase environment variables as GitHub Secrets so that the deployed GitHub Pages site has full Firebase authentication and sync capabilities.

## Why GitHub Secrets?

- **Security**: Secrets are encrypted and not exposed in your repository
- **Automation**: GitHub Actions automatically injects secrets during build
- **Production-Ready**: Your deployed site will have Firebase fully functional

## Prerequisites

1. A Firebase project created at [Firebase Console](https://console.firebase.google.com/)
2. Firebase Authentication with Google Sign-in enabled
3. Firestore Database created
4. Admin access to your GitHub repository

## Step-by-Step Setup

### Part 1: Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to "Your apps" section
5. If you haven't added a web app yet:
   - Click **Add app** → Select **Web** (</> icon)
   - Register your app with a nickname (e.g., "QuizApp")
6. You'll see your Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

7. **Copy these values** - you'll need them in the next step

### Part 2: Add Secrets to GitHub Repository

1. Go to your repository on GitHub
2. Click **Settings** (you need admin access)
3. In the left sidebar, expand **Secrets and variables** → Click **Actions**
4. Click **New repository secret** button
5. Add each of the following secrets one by one:

| Secret Name | Value from Firebase Config |
|-------------|---------------------------|
| `FIREBASE_API_KEY` | `apiKey` |
| `FIREBASE_AUTH_DOMAIN` | `authDomain` |
| `FIREBASE_PROJECT_ID` | `projectId` |
| `FIREBASE_STORAGE_BUCKET` | `storageBucket` |
| `FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` |
| `FIREBASE_APP_ID` | `appId` |

**For each secret:**
- Enter the name exactly as shown above (case-sensitive)
- Paste the corresponding value from your Firebase config
- Click **Add secret**

### Part 3: Configure Firebase Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Google** sign-in provider
3. Go to **Settings** tab (in Authentication section)
4. Scroll to **Authorized domains**
5. Click **Add domain**
6. Add your GitHub Pages domain:
   ```
   <your-username>.github.io
   ```
   For example: `ultimateboi.github.io`
7. Click **Add**

### Part 4: Set Up Firestore Security Rules

1. In Firebase Console, go to **Firestore Database**
2. Click **Rules** tab
3. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User data - only accessible by the user themselves
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Click **Publish**

### Part 5: Deploy and Test

1. Push any commit to the `main` branch (or merge a PR)
2. GitHub Actions will automatically:
   - Build your app with Firebase secrets
   - Deploy to GitHub Pages
3. Visit your GitHub Pages URL: `https://<username>.github.io/QuizApp/`
4. Click the user icon in the top-right
5. Sign in with Google
6. You should see the sync dialog!

## How It Works

### During Build (GitHub Actions)

The workflow file `.github/workflows/deploy.yml` contains:

```yaml
- name: Build application
  run: npm run build
  env:
    NODE_ENV: production
    NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: ${{ secrets.FIREBASE_STORAGE_BUCKET }}
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}
    NEXT_PUBLIC_FIREBASE_APP_ID: ${{ secrets.FIREBASE_APP_ID }}
```

These environment variables are:
1. Read from GitHub Secrets
2. Injected during the build process
3. Embedded into the static JavaScript files
4. Available to the deployed app

### After Deployment

- Your deployed site has Firebase fully configured
- Users can sign in with Google
- Data syncs across devices automatically
- All sync features work as expected

## Verifying Setup

### Check if Secrets are Configured

1. Go to repository **Settings** → **Secrets and variables** → **Actions**
2. You should see all 6 secrets listed (values are hidden)

### Check if Build Uses Secrets

1. Go to **Actions** tab in your repository
2. Click on the latest workflow run
3. Click **build-and-deploy** job
4. Expand **Build application** step
5. You should see environment variables being set (values are masked as ***)

### Check if Firebase is Active

1. Visit your GitHub Pages site
2. Open browser developer console (F12)
3. Look for Firebase initialization messages
4. Try signing in - if successful, Firebase is working!

## Troubleshooting

### Problem: "Firebase is not configured" message

**Solution**: 
- Verify all 6 secrets are added to GitHub
- Check secret names match exactly (case-sensitive)
- Trigger a new deployment (push to main or re-run workflow)

### Problem: Sign-in popup blocked or fails

**Solution**:
- Check authorized domains in Firebase Authentication settings
- Make sure `<username>.github.io` is added
- Clear browser cache and try again

### Problem: "Permission denied" when accessing Firestore

**Solution**:
- Verify Firestore security rules are published
- Make sure user is signed in before accessing data
- Check browser console for detailed error messages

### Problem: Changes not reflected on GitHub Pages

**Solution**:
- Check GitHub Actions workflow completed successfully
- Wait a few minutes for GitHub Pages to update
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- Clear browser cache

## Security Notes

### Are Firebase API Keys Safe to Expose?

**Yes!** Firebase client-side API keys are designed to be public:
- They're embedded in your JavaScript and HTML
- They identify your Firebase project
- Security is enforced through Firebase Security Rules and authorized domains
- Not through hiding the API key

### Real Security Measures

1. **Firestore Security Rules**: Control who can read/write data
2. **Authorized Domains**: Limit where authentication can occur
3. **App Check** (recommended): Additional protection against abuse
4. **API Key Restrictions** (optional): Limit API key to specific services

## Testing Locally vs Production

### Local Development
- Uses `.env.local` file
- Secrets stay on your machine
- Good for testing and development

### GitHub Pages Production
- Uses GitHub Secrets
- Secrets injected during build
- Production-ready and secure

## Updating Firebase Configuration

If you need to change Firebase settings:

1. Update secrets in GitHub repository settings
2. Trigger a new deployment (push to main)
3. New build will use updated secrets
4. GitHub Pages will update automatically

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Summary

Once you complete these steps:
- ✅ Firebase secrets are securely stored in GitHub
- ✅ Automated deployments include Firebase configuration
- ✅ GitHub Pages site has full Firebase functionality
- ✅ Users can sign in and sync data across devices
- ✅ All features work in production

Your QuizApp is now production-ready with Firebase sync! 🎉
