[![Deploy to GitHub Pages](https://github.com/UltimateBoi/QuizApp/actions/workflows/deploy.yml/badge.svg)](https://github.com/UltimateBoi/QuizApp/actions/workflows/deploy.yml)

# QuizApp

A comprehensive Next.js quiz application built with TypeScript and TailwindCSS that provides interactive learning with detailed statistics and smart analytics.

🚀 **[Live Demo on GitHub Pages](https://ultimateboi.github.io/QuizApp/)**

## Features

- **🎯 Interactive Quizzes**: Engage with carefully crafted questions that challenge your understanding
- **📊 Detailed Analytics**: Track your performance, identify strengths, and discover areas for improvement  
- **💡 Smart Explanations**: Learn from detailed explanations for each question to deepen your understanding
- **⏱️ Time Tracking**: Monitor your response times and optimize your test-taking strategies
- **📈 Statistics Dashboard**: View comprehensive statistics including scores, timing, and performance trends
- **🔐 Google Sign-In**: Sign in with your Google account to sync your data across multiple devices
- **☁️ Cloud Sync**: Automatic synchronization of quizzes, sessions, and flashcards with Firebase
- **🗂️ Flash Cards**: Create and study flash cards to reinforce learning
- **🔄 Quiz to Flash Cards**: Convert any quiz into flash cards automatically
- **💾 Local Storage**: Your data is saved locally and syncs when signed in

## New Features

### Authentication & Cloud Sync
Sign in with your Google account to:
- Sync quizzes across all your devices
- Access your quiz history anywhere
- Keep your flash cards synchronized
- Never lose your progress

### Flash Cards
- Create custom flash card decks
- Study with an interactive flip card interface
- Convert quizzes to flash cards automatically
- Organize cards by topic and difficulty
- Track your study progress

## Deployment

This application is automatically deployed to GitHub Pages on every push to the main branch. The deployment is handled by a GitHub Actions workflow that:

1. Builds the Next.js application for static export
2. Optimizes assets for production
3. Deploys to GitHub Pages with proper routing

### GitHub Pages Configuration

The app is configured for static export with the following optimizations:
- Static HTML generation for all routes
- Asset optimization and minification
- Proper base path configuration for GitHub Pages subdirectory hosting
- Image optimization disabled for static hosting compatibility

### Automatic Deployment Workflow

Every push to the main branch triggers an automated deployment via GitHub Actions:
```yaml
# .github/workflows/deploy.yml
- Checkout code
- Setup Node.js environment  
- Install dependencies
- Build for production
- Deploy to GitHub Pages
```

### Configuring Firebase for GitHub Pages Deployment

To use Firebase authentication and cloud sync on your deployed GitHub Pages site, you need to configure Firebase secrets in your GitHub repository:

1. **Add Firebase Configuration to GitHub Secrets:**
   - Go to your repository on GitHub
   - Navigate to `Settings` → `Secrets and variables` → `Actions`
   - Click `New repository secret` and add the following secrets (get these values from your Firebase Console):
     - `FIREBASE_API_KEY`
     - `FIREBASE_AUTH_DOMAIN`
     - `FIREBASE_PROJECT_ID`
     - `FIREBASE_STORAGE_BUCKET`
     - `FIREBASE_MESSAGING_SENDER_ID`
     - `FIREBASE_APP_ID`

2. **How it Works:**
   - The GitHub Actions workflow automatically injects these secrets as environment variables during the build process
   - The secrets are used to configure Firebase but are NOT committed to your repository
   - Once built, the Firebase config will be in the compiled JavaScript (this is expected and secure)
   - Security is enforced through Firebase Security Rules, not by hiding the API keys

3. **Configure Firebase Security (Important!):**
   - In Firebase Console, set up Security Rules for Firestore
   - Add your GitHub Pages domain to authorized domains in Firebase Authentication settings
   - Enable App Check for additional security (recommended for production)

**Note:** Firebase client-side API keys are designed to be public. The real security comes from properly configured Firebase Security Rules and authorized domains, not from hiding the keys.

## Quiz Data Format

The application supports JSON quiz data in the following format:

```json
[
  {
    "type": "singleSelect",
    "question": "What is pipelining in a CPU?",
    "options": [
      "A technique to execute multiple instructions simultaneously by overlapping their execution phases",
      "A method to increase CPU clock speed",
      "A way to cool down the processor", 
      "A process for storing data in RAM"
    ],
    "answer": [0],
    "explanation": "Pipelining is a technique where multiple instruction execution phases are overlapped to improve CPU throughput. While one instruction is being decoded, another can be fetched, and yet another can be executed simultaneously."
  }
]
```

### Field Descriptions

- `type`: Currently supports `"singleSelect"` (more types can be added in the future)
- `question`: The question text to display
- `options`: Array of answer options (strings)
- `answer`: Array of correct answer indices (0-based)
- `explanation`: Detailed explanation shown after answering

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- (Optional) Firebase account for authentication and cloud sync

### Installation

1. Clone the repository:
```bash
git clone https://github.com/UltimateBoi/QuizApp.git
cd QuizApp
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Firebase for authentication and cloud sync:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Google Authentication in Firebase Console
   - Create a Firestore database
   - **For local development:** Copy `.env.local.example` to `.env.local` and add your Firebase configuration:
   ```bash
   cp .env.local.example .env.local
   ```
   - Edit `.env.local` with your Firebase credentials
   - **For GitHub Pages deployment:** Add your Firebase credentials to GitHub Secrets (see "Configuring Firebase for GitHub Pages Deployment" section above)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
```

This generates a static export in the `out/` directory suitable for GitHub Pages deployment.

## Project Structure

```
src/
├── app/                # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout with AuthProvider
│   └── page.tsx        # Home page with quiz and flashcard logic
├── components/         # React components
│   ├── QuestionCard.tsx
│   ├── Quiz.tsx
│   ├── ResultsScreen.tsx
│   ├── Statistics.tsx
│   ├── FlashCardView.tsx
│   ├── FlashCardCreator.tsx
│   ├── FlashCardManager.tsx
│   ├── FlashCardStudy.tsx
│   ├── QuizToFlashCards.tsx
│   └── AuthButton.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication context
├── data/              # Quiz data
│   └── questions.ts
├── hooks/             # Custom React hooks
│   ├── useLocalStorage.ts
│   ├── useFlashCards.ts
│   └── useFirebaseSync.ts
├── lib/               # Third-party library configurations
│   └── firebase.ts    # Firebase configuration
├── types/             # TypeScript type definitions
│   └── quiz.ts
└── utils/             # Utility functions
    └── quiz.ts
```

## Technology Stack

- **Next.js 15**: React framework with App Router and static export
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects
- **Firebase**: Authentication and real-time database
- **Google Authentication**: Secure sign-in with Google
- **Local Storage**: Client-side data persistence with cloud sync
- **GitHub Pages**: Static site hosting with automated deployment

## Features in Detail

### Quiz Flow
1. **Home Screen**: Welcome page with feature overview and progress summary
2. **Quiz Interface**: Interactive questions with multiple choice options
3. **Real-time Feedback**: Immediate answer validation with explanations
4. **Results Screen**: Comprehensive score breakdown with detailed analytics
5. **Statistics Dashboard**: Historical performance tracking and trends

### Statistics Tracking
- Total quizzes completed
- Average and best scores
- Time spent per question and total time
- Question-by-question performance breakdown
- Recent session history
- Performance level indicators

### Responsive Design
The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Changes to the main branch will automatically deploy to GitHub Pages!

## License

This project is licensed under the ISC License.
