# QuizApp

A comprehensive Next.js quiz application built with TypeScript and TailwindCSS that provides interactive learning with detailed statistics and smart analytics.

## Features

- **🎯 Interactive Quizzes**: Engage with carefully crafted questions that challenge your understanding
- **📊 Detailed Analytics**: Track your performance, identify strengths, and discover areas for improvement  
- **💡 Smart Explanations**: Learn from detailed explanations for each question to deepen your understanding
- **⏱️ Time Tracking**: Monitor your response times and optimize your test-taking strategies
- **📈 Statistics Dashboard**: View comprehensive statistics including scores, timing, and performance trends
- **💾 Local Storage**: Your quiz history is saved locally and persists between sessions

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

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd QuizApp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Home page
├── components/         # React components
│   ├── QuestionCard.tsx
│   ├── Quiz.tsx
│   ├── ResultsScreen.tsx
│   └── Statistics.tsx
├── data/              # Quiz data
│   └── questions.ts
├── hooks/             # Custom React hooks
│   └── useLocalStorage.ts
├── types/             # TypeScript type definitions
│   └── quiz.ts
└── utils/             # Utility functions
    └── quiz.ts
```

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects
- **Local Storage**: Client-side data persistence

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

## License

This project is licensed under the ISC License.