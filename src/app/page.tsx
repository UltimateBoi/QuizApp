'use client';

import { useState, Suspense, useCallback, useEffect } from 'react';
import { QuizSession, CustomQuiz, FlashCardDeck } from '@/types/quiz';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useSettings } from '@/hooks/useSettings';
import { useCustomQuizzes } from '@/hooks/useCustomQuizzes';
import { useFlashCards } from '@/hooks/useFlashCards';
import { useFirebaseSync } from '@/hooks/useFirebaseSync';
import { useSettingsSync } from '@/hooks/useSettingsSync';
import { useSyncManager } from '@/hooks/useSyncManager';
import { useAuth } from '@/contexts/AuthContext';
import Quiz from '@/components/Quiz';
import Statistics from '@/components/Statistics';
import SettingsButton from '@/components/SettingsButton';
import SettingsModal from '@/components/SettingsModal';
import AnimatedBackground from '@/components/AnimatedBackground';
import QuizCreator from '@/components/QuizCreator';
import SavedQuizzesManager from '@/components/SavedQuizzesManager';
import BulkQuizGenerator from '@/components/BulkQuizGenerator';
import BulkFlashcardGenerator from '@/components/BulkFlashcardGenerator';
import FlashCardCreator from '@/components/FlashCardCreator';
import FlashCardManager from '@/components/FlashCardManager';
import FlashCardStudy from '@/components/FlashCardStudy';
import QuizToFlashCards from '@/components/QuizToFlashCards';
import AuthButton from '@/components/AuthButton';
import SyncDialog from '@/components/SyncDialog';

type AppState = 'home' | 'quiz' | 'statistics' | 'createQuiz' | 'editQuiz' | 'manageQuizzes' | 'bulkGenerate' | 'flashCards' | 'createFlashCards' | 'editFlashCards' | 'studyFlashCards' | 'quizToFlashCards' | 'bulkGenerateFlashcards';

function HomeContent() {
  const [appState, setAppState] = useState<AppState>('home');
  const [quizSessions, setQuizSessions] = useLocalStorage<QuizSession[]>('quiz-sessions', []);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<CustomQuiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<CustomQuiz | null>(null);
  const [editingDeck, setEditingDeck] = useState<FlashCardDeck | null>(null);
  const [studyingDeck, setStudyingDeck] = useState<FlashCardDeck | null>(null);
  const { settings, updateSettings, resetSettings, setSettings, isLoaded } = useSettings();
  const { allQuizzes, createQuiz, updateQuiz, isLoading, error, setCustomQuizzes } = useCustomQuizzes();
  const { flashCardDecks, createDeck, updateDeck, deleteDeck, setFlashCardDecks } = useFlashCards();
  const { user, loading, isFirebaseReady } = useAuth();

  // Debug auth state
  // useEffect(() => {
  //   console.log('🔐 Auth Debug:', {
  //     user: user,
  //     uid: user?.uid,
  //     email: user?.email,
  //     loading: loading,
  //     isFirebaseReady: isFirebaseReady,
  //     isAuthenticated: !!user
  //   });
  // }, [user, loading, isFirebaseReady]);

  // Sync manager for coordinated sync on login
  const {
    showSyncDialog,
    isNewUser,
    hasLocalData,
    hasCloudData,
    syncing,
    syncComplete,
    handleSyncAction,
  } = useSyncManager({
    localQuizzes: allQuizzes,
    localSessions: quizSessions,
    localFlashcards: flashCardDecks,
    localSettings: settings,
    setLocalQuizzes: setCustomQuizzes,
    setLocalSessions: setQuizSessions,
    setLocalFlashcards: setFlashCardDecks,
    setLocalSettings: setSettings,
  });

  // Real-time sync after initial sync is complete
  useFirebaseSync('quizzes', allQuizzes.filter(q => !q.isDefault), () => {}, syncComplete);
  useFirebaseSync('sessions', quizSessions, setQuizSessions, syncComplete);
  useFirebaseSync('flashcards', flashCardDecks, () => {}, syncComplete);
  const { syncing: settingsSyncing, lastSync: settingsLastSync, syncToFirebase: syncSettingsToFirebase } = useSettingsSync(settings, setSettings, syncComplete);

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

  const handleSaveBulkQuizzes = useCallback((quizzes: any[]) => {
    quizzes.forEach(quizData => {
      createQuiz(quizData);
    });
    setAppState('home');
  }, [createQuiz]);

  const handleSaveBulkFlashcards = useCallback((decks: any[]) => {
    decks.forEach(deckData => {
      createDeck(deckData);
    });
    setAppState('flashCards');
  }, [createDeck]);

  // FlashCard handlers
  const handleCreateFlashCards = useCallback(() => {
    setEditingDeck(null);
    setAppState('createFlashCards');
  }, []);

  const handleEditFlashCards = useCallback((deck: FlashCardDeck) => {
    setEditingDeck(deck);
    setAppState('editFlashCards');
  }, []);

  const handleStudyFlashCards = useCallback((deck: FlashCardDeck) => {
    setStudyingDeck(deck);
    setAppState('studyFlashCards');
  }, []);

  const handleSaveFlashCards = useCallback((deckData: any) => {
    if (editingDeck) {
      updateDeck(editingDeck.id, deckData);
    } else {
      createDeck(deckData);
    }
    setAppState('flashCards');
    setEditingDeck(null);
  }, [editingDeck, createDeck, updateDeck]);

  const handleQuizToFlashCards = useCallback((deckData: any) => {
    createDeck(deckData);
    setAppState('flashCards');
  }, [createDeck]);

  // Ensure client-side hydration is complete
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update page title dynamically based on app state
  useEffect(() => {
    const titles: Record<AppState, string> = {
      home: 'QuizApp - Interactive Learning Platform',
      quiz: 'QuizApp - Taking Quiz',
      statistics: 'QuizApp - Statistics',
      createQuiz: 'QuizApp - Create Quiz',
      editQuiz: 'QuizApp - Edit Quiz',
      manageQuizzes: 'QuizApp - Manage Quizzes',
      bulkGenerate: 'QuizApp - Bulk Generate',
      flashCards: 'QuizApp - Flashcards',
      createFlashCards: 'QuizApp - Create Flashcards',
      editFlashCards: 'QuizApp - Edit Flashcards',
      studyFlashCards: 'QuizApp - Study Flashcards',
      quizToFlashCards: 'QuizApp - Convert to Flashcards',
      bulkGenerateFlashcards: 'QuizApp - Bulk Generate Flashcards',
    };

    document.title = titles[appState] || 'QuizApp';
  }, [appState]);

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

        {/* Quiz Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Quizzes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 justify-center max-w-3xl mx-auto">
            <button
              onClick={handleCreateQuiz}
              className="btn-secondary px-6 py-3 text-base"
            >
              Create Quiz
            </button>
            <button
              onClick={() => setAppState('bulkGenerate')}
              className="btn-secondary px-6 py-3 text-base"
            >
              Bulk Generate Quizzes
            </button>
            <button
              onClick={() => setAppState('manageQuizzes')}
              className="btn-secondary px-6 py-3 text-base"
            >
              Manage Quizzes
            </button>
          </div>
        </div>

        {/* Flashcard Section */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 text-center">Flashcards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 justify-center max-w-3xl mx-auto">
            <button
              onClick={handleCreateFlashCards}
              className="btn-secondary px-6 py-3 text-base"
            >
              Create Flashcards
            </button>
            <button
              onClick={() => setAppState('bulkGenerateFlashcards')}
              className="btn-secondary px-6 py-3 text-base"
            >
              Bulk Generate Flashcards
            </button>
            <button
              onClick={() => setAppState('flashCards')}
              className="btn-secondary px-6 py-3 text-base"
            >
              Manage Flashcards
            </button>
          </div>
        </div>

        {/* Statistics Button */}
        <div className="flex justify-center">
          <button
            onClick={() => setAppState('statistics')}
            className="btn-secondary px-8 py-3 text-base"
            disabled={!isClient || quizSessions.length === 0}
          >
            View Statistics
          </button>
          {isLoading && (
            <div className="flex items-center justify-center py-3 ml-4">
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
      <div className="fixed top-4 right-4 z-40 flex gap-3">
        <SettingsButton onClick={handleSettingsOpen} />
        <AuthButton 
          syncing={syncing || settingsSyncing}
          lastSync={settingsLastSync}
          onManualSync={syncSettingsToFirebase}
        />
      </div>
      
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

      {appState === 'bulkGenerate' && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
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
          <BulkQuizGenerator
            onSave={handleSaveBulkQuizzes}
            onCancel={() => setAppState('home')}
          />
        </div>
      )}

      {appState === 'bulkGenerateFlashcards' && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
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
          <BulkFlashcardGenerator
            onSave={handleSaveBulkFlashcards}
            onCancel={() => setAppState('home')}
          />
        </div>
      )}

      {appState === 'flashCards' && (
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
          <FlashCardManager
            decks={flashCardDecks}
            onCreateDeck={handleCreateFlashCards}
            onEditDeck={handleEditFlashCards}
            onDeleteDeck={deleteDeck}
            onStudyDeck={handleStudyFlashCards}
            onCreateFromQuiz={() => setAppState('quizToFlashCards')}
          />
        </div>
      )}

      {appState === 'createFlashCards' && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
          <FlashCardCreator
            onSave={handleSaveFlashCards}
            onCancel={() => setAppState('flashCards')}
          />
        </div>
      )}

      {appState === 'editFlashCards' && editingDeck && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
          <FlashCardCreator
            deck={editingDeck}
            onSave={handleSaveFlashCards}
            onCancel={() => setAppState('flashCards')}
          />
        </div>
      )}

      {appState === 'studyFlashCards' && studyingDeck && (
        <div className={settings.animations ? 'animate-slide-in-right' : ''}>
          <FlashCardStudy
            deck={studyingDeck}
            onExit={() => setAppState('flashCards')}
          />
        </div>
      )}

      {appState === 'quizToFlashCards' && (
        <div className={settings.animations ? 'animate-slide-in-up' : ''}>
          <QuizToFlashCards
            quizzes={allQuizzes}
            onConvert={handleQuizToFlashCards}
            onCancel={() => setAppState('flashCards')}
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

      <SyncDialog
        isOpen={showSyncDialog}
        isNewUser={isNewUser}
        hasLocalData={hasLocalData}
        hasCloudData={hasCloudData}
        onAction={handleSyncAction}
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