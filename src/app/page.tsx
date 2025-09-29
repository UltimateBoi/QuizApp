'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import { QuizSession } from '@/types/quiz';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSettings } from '@/hooks/useSettings';
import Quiz from '@/components/Quiz';
import Statistics from '@/components/Statistics';
import SettingsButton from '@/components/SettingsButton';
import SettingsModal from '@/components/SettingsModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import { sampleQuestions } from '@/data/questions';

type AppState = 'home' | 'quiz' | 'statistics';

function HomeContent() {
  const [appState, setAppState] = useState<AppState>('home');
  const [quizSessions, setQuizSessions] = useLocalStorage<QuizSession[]>('quiz-sessions', []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { settings, updateSettings, resetSettings, isLoaded } = useSettings();

  const handleQuizComplete = useCallback((session: QuizSession) => {
    setQuizSessions(prev => [...prev, session]);
  }, [setQuizSessions]);

  const handleSettingsOpen = useCallback(() => setIsSettingsOpen(true), []);
  const handleSettingsClose = useCallback(() => setIsSettingsOpen(false), []);

  // Ensure client-side hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  const renderHome = () => (
    <div className="max-w-4xl mx-auto text-center">
      <div className="card">
        <div className="mb-8">
          <h1 className={`text-4xl font-bold text-gray-900 dark:text-white mb-4 ${settings.animations ? 'animate-slide-in-down' : ''}`}>
            Welcome to QuizApp
          </h1>
          <p className={`text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto ${settings.animations ? 'animate-fade-in' : ''}`} style={{ animationDelay: '200ms' }}>
            Test your knowledge with our interactive quiz platform. 
            Track your progress, review explanations, and improve your skills with detailed statistics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className={`bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg p-6 border border-blue-200 dark:border-blue-800 hover:scale-105 transition-all duration-300 ${settings.animations ? 'animate-slide-in-left' : ''}`} style={{ animationDelay: '300ms' }}>
            <div className="text-3xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Interactive Quizzes</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Engage with carefully crafted questions that challenge your understanding and knowledge.
            </p>
          </div>

          <div className={`bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg p-6 border border-green-200 dark:border-green-800 hover:scale-105 transition-all duration-300 ${settings.animations ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: '400ms' }}>
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Detailed Analytics</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Track your performance, identify strengths, and discover areas for improvement.
            </p>
          </div>

          <div className={`bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800 hover:scale-105 transition-all duration-300 ${settings.animations ? 'animate-slide-in-left' : ''}`} style={{ animationDelay: '500ms' }}>
            <div className="text-3xl mb-4">💡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Smart Explanations</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Learn from detailed explanations for each question to deepen your understanding.
            </p>
          </div>

          <div className={`bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg p-6 border border-orange-200 dark:border-orange-800 hover:scale-105 transition-all duration-300 ${settings.animations ? 'animate-slide-in-right' : ''}`} style={{ animationDelay: '600ms' }}>
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Time Tracking</h3>
            <p className="text-gray-700 dark:text-gray-200">
              Monitor your response times and optimize your test-taking strategies.
            </p>
          </div>
        </div>

        {isClient && quizSessions.length > 0 && (
          <div className={`mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 ${isLoaded && settings.animations ? 'animate-fade-in' : ''}`} style={{ animationDelay: '700ms' }}>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Your Progress</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{quizSessions.length}</div>
                <div className="text-gray-700 dark:text-gray-200">Quizzes Taken</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {Math.round(quizSessions.reduce((sum, s) => sum + s.score, 0) / quizSessions.length)}%
                </div>
                <div className="text-gray-700 dark:text-gray-200">Average Score</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {Math.max(...quizSessions.map(s => s.score))}%
                </div>
                <div className="text-gray-700 dark:text-gray-200">Best Score</div>
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
            disabled={!isClient || quizSessions.length === 0}
          >
            View Statistics
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <AnimatedBackground 
        enabled={settings.backgroundAnimations && settings.animations} 
        reduced={settings.reducedMotion}
      />
      <SettingsButton onClick={handleSettingsOpen} />
      
      {appState === 'quiz' && (
        <div className={settings.animations ? 'animate-slide-in-right' : ''}>
          <div className="mb-6 text-center">
            <button
              onClick={() => setAppState('home')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
          <Quiz 
            questions={sampleQuestions}
            onQuizComplete={handleQuizComplete}
          />
        </div>
      )}

      {appState === 'statistics' && (
        <div className={settings.animations ? 'animate-slide-in-left' : ''}>
          <div className="mb-6 text-center">
            <button
              onClick={() => setAppState('home')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200 flex items-center mx-auto"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </button>
          </div>
          <Statistics sessions={quizSessions} />
        </div>
      )}

      {appState === 'home' && (
        <div className={`transition-all duration-500 ${settings.animations ? 'animate-fade-in' : ''}`}>
          {renderHome()}
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}