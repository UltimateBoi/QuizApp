'use client';

import { useState } from 'react';
import { QuizSession } from '@/types/quiz';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import Quiz from '@/components/Quiz';
import Statistics from '@/components/Statistics';
import { sampleQuestions } from '@/data/questions';

type AppState = 'home' | 'quiz' | 'statistics';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('home');
  const [quizSessions, setQuizSessions] = useLocalStorage<QuizSession[]>('quiz-sessions', []);

  const handleQuizComplete = (session: QuizSession) => {
    setQuizSessions(prev => [...prev, session]);
  };

  const renderHome = () => (
    <div className="max-w-4xl mx-auto text-center">
      <div className="card">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to QuizApp
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge with our interactive quiz platform. 
            Track your progress, review explanations, and improve your skills with detailed statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Interactive Quizzes</h3>
            <p className="text-gray-600">
              Engage with carefully crafted questions that challenge your understanding and knowledge.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Detailed Analytics</h3>
            <p className="text-gray-600">
              Track your performance, identify strengths, and discover areas for improvement.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="text-3xl mb-4">💡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Explanations</h3>
            <p className="text-gray-600">
              Learn from detailed explanations for each question to deepen your understanding.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Time Tracking</h3>
            <p className="text-gray-600">
              Monitor your response times and optimize your test-taking strategies.
            </p>
          </div>
        </div>

        {quizSessions.length > 0 && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-800">{quizSessions.length}</div>
                <div className="text-gray-600">Quizzes Taken</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {Math.round(quizSessions.reduce((sum, s) => sum + s.score, 0) / quizSessions.length)}%
                </div>
                <div className="text-gray-600">Average Score</div>
              </div>
              <div>
                <div className="font-medium text-gray-800">
                  {Math.max(...quizSessions.map(s => s.score))}%
                </div>
                <div className="text-gray-600">Best Score</div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setAppState('quiz')}
            className="btn-primary px-8 py-3 text-lg"
          >
            Start Quiz
          </button>
          <button
            onClick={() => setAppState('statistics')}
            className="btn-secondary px-8 py-3 text-lg"
            disabled={quizSessions.length === 0}
          >
            View Statistics
          </button>
        </div>
      </div>
    </div>
  );

  if (appState === 'quiz') {
    return (
      <div>
        <div className="mb-6 text-center">
          <button
            onClick={() => setAppState('home')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
        <Quiz 
          questions={sampleQuestions}
          onQuizComplete={handleQuizComplete}
        />
      </div>
    );
  }

  if (appState === 'statistics') {
    return (
      <div>
        <div className="mb-6 text-center">
          <button
            onClick={() => setAppState('home')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Home
          </button>
        </div>
        <Statistics sessions={quizSessions} />
      </div>
    );
  }

  return renderHome();
}