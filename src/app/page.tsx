'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import { QuizSession, CustomQuiz } from '@/types/quiz';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSettings } from '@/hooks/useSettings';
import { useCustomQuizzes } from '@/hooks/useCustomQuizzes';
import Quiz from '@/components/Quiz';
import Statistics from '@/components/Statistics';
import SettingsButton from '@/components/SettingsButton';
import SettingsModal from '@/components/SettingsModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import QuizCreator from '@/components/QuizCreator';
import SavedQuizzesManager from '@/components/SavedQuizzesManager';

type AppState = 'home' | 'quiz' | 'statistics' | 'createQuiz' | 'editQuiz' | 'manageQuizzes';

function HomeContent() {
  const [appState, setAppState] = useState<AppState>('home');
  const [quizSessions, setQuizSessions] = useLocalStorage<QuizSession[]>('quiz-sessions', []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<CustomQuiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<CustomQuiz | null>(null);
  const { settings, updateSettings, resetSettings, isLoaded } = useSettings();
  const { allQuizzes, createQuiz, updateQuiz, isLoading, error } = useCustomQuizzes();

  const handleQuizComplete = useCallback((session: QuizSession) => {
    const sessionWithId = {
      ...session,
      id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      quizId: selectedQuiz?.id || 'unknown',
      quizName: selectedQuiz?.name || 'Unknown Quiz'
    };
    setQuizSessions(prev => [...prev, sessionWithId]);
  }, [setQuizSessions, selectedQuiz]);

  const handleSettingsOpen = useCallback(() => setIsSettingsOpen(true), []);
  const handleSettingsClose = useCallback(() => setIsSettingsOpen(false), []);

  const handleCreateQuiz = useCallback(() => {
    setEditingQuiz(null);
    setAppState('createQuiz');
  }, []);

  const handleEditQuiz = useCallback((quiz: CustomQuiz) => {
    setEditingQuiz(quiz);
    setAppState('editQuiz');
  }, []);

  const handleSelectQuiz = useCallback((quiz: CustomQuiz) => {
    setSelectedQuiz(quiz);
    setAppState('quiz');
  }, []);

  const handleSaveQuiz = useCallback((quizData: any) => {
    if (editingQuiz && !editingQuiz.isDefault) {
      updateQuiz(editingQuiz.id, quizData);
    } else {
      createQuiz(quizData);
    }
    setAppState('home');
    setEditingQuiz(null);
  }, [editingQuiz, createQuiz, updateQuiz]);

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

        {/* Available Quizzes Section */}
        {!isLoading && allQuizzes.length > 0 && (
          <div className={`mb-8 ${settings.animations ? 'animate-fade-in' : ''}`} style={{ animationDelay: '800ms' }}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">Choose a Quiz</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {allQuizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 bg-white dark:bg-gray-800"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{quiz.name}</h4>
                    {quiz.isDefault && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-xs mb-3 line-clamp-2">
                    {quiz.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span>{quiz.questions.length} questions</span>
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>
                  <button
                    onClick={() => handleSelectQuiz(quiz)}
                    className="btn-primary w-full py-2 text-sm"
                  >
                    Take Quiz
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 justify-center max-w-2xl mx-auto">
          <button
            onClick={handleCreateQuiz}
            className="btn-secondary px-6 py-3 text-base"
          >
            Create Quiz
          </button>
          <button
            onClick={() => setAppState('manageQuizzes')}
            className="btn-secondary px-6 py-3 text-base"
          >
            Manage Quizzes
          </button>
          <button
            onClick={() => setAppState('statistics')}
            className="btn-secondary px-6 py-3 text-base"
            disabled={!isClient || quizSessions.length === 0}
          >
            View Statistics
          </button>
          {isLoading && (
            <div className="flex items-center justify-center py-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading quizzes...</span>
            </div>
          )}
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
          {selectedQuiz ? (
            <Quiz 
              questions={selectedQuiz.questions}
              onQuizComplete={handleQuizComplete}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No quiz selected</p>
              <button onClick={() => setAppState('home')} className="btn-primary">
                Select a Quiz
              </button>
            </div>
          )}
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

      {appState === 'createQuiz' && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
          <QuizCreator
            onSave={handleSaveQuiz}
            onCancel={() => setAppState('home')}
          />
        </div>
      )}

      {appState === 'editQuiz' && editingQuiz && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
          <QuizCreator
            quiz={editingQuiz}
            onSave={handleSaveQuiz}
            onCancel={() => setAppState('home')}
          />
        </div>
      )}

      {appState === 'manageQuizzes' && (
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
          <SavedQuizzesManager
            onEditQuiz={handleEditQuiz}
            onSelectQuiz={handleSelectQuiz}
          />
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