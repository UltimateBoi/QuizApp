#!/bin/bash

# Firebase Setup Script for QuizApp
# This script will help you deploy the Firestore security rules

echo "🚀 Firebase Setup Script"
echo "========================"
echo ""
echo "This will deploy the Firestore security rules to fix permission errors."
echo ""

# Check if firebase is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Login to Firebase
echo "📝 Step 1: Login to Firebase"
echo "A browser window will open for authentication."
firebase login

# Check if login was successful
if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "✅ Login successful!"
echo ""

# Deploy rules
echo "📤 Step 2: Deploying Firestore security rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Firestore rules deployed."
    echo ""
    echo "🎉 Next steps:"
    echo "   1. Refresh your browser"
    echo "   2. The permission errors should be gone"
    echo "   3. You can now sync your data!"
else
    echo ""
    echo "❌ Deployment failed. Please check the error message above."
    echo ""
    echo "📖 Manual steps:"
    echo "   1. Go to https://console.firebase.google.com/"
    echo "   2. Select project: a-quizapp"
    echo "   3. Go to Firestore Database → Rules"
    echo "   4. Copy the rules from: firestore.rules"
    echo "   5. Click Publish"
fi
