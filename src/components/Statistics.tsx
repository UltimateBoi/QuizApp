'use client';

import { useState } from 'react';
import { QuizSession, QuizStatistics } from '@/types/quiz';
import { formatTime, getPerformanceLevel } from '@/utils/quiz';
import QuizHistoryViewer from './QuizHistoryViewer';

interface StatisticsProps {
  sessions: QuizSession[];
}

export default function Statistics({ sessions }: StatisticsProps) {
  const [selectedSession, setSelectedSession] = useState<QuizSession | null>(null);
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');

  if (sessions.length === 0) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Statistics</h2>
        <p className="text-gray-600 dark:text-gray-400">No quiz sessions completed yet. Take your first quiz to see statistics!</p>
      </div>
    );
  }

  // Get unique quizzes from sessions
  const uniqueQuizzes = Array.from(new Set(sessions.map(s => s.quizId)))
    .map(quizId => {
      const session = sessions.find(s => s.quizId === quizId);
      return {
        id: quizId,
        name: session?.quizName || 'Unknown Quiz',
        sessionCount: sessions.filter(s => s.quizId === quizId).length
      };
    })
    .filter(quiz => quiz.id !== 'unknown');

  // Filter sessions based on selected quiz
  const filteredSessions = selectedQuizId === 'all' 
    ? sessions 
    : sessions.filter(s => s.quizId === selectedQuizId);

  // Calculate statistics for filtered sessions
  const totalQuizzes = filteredSessions.length;
  const averageScore = totalQuizzes > 0 ? Math.round(filteredSessions.reduce((sum, session) => sum + session.score, 0) / totalQuizzes) : 0;
  const bestScore = totalQuizzes > 0 ? Math.max(...filteredSessions.map(session => session.score)) : 0;
  const totalTimeSpent = filteredSessions.reduce((sum, session) => {
    if (session.endTime && session.startTime) {
      const endTime = typeof session.endTime === 'string' ? new Date(session.endTime) : session.endTime;
      const startTime = typeof session.startTime === 'string' ? new Date(session.startTime) : session.startTime;
      return sum + Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }
    return sum;
  }, 0);

  const averageTimePerQuestion = totalQuizzes > 0 ? Math.round(
    filteredSessions.reduce((sum, session) => {
      const sessionTime = session.userAnswers.reduce((answerSum, answer) => answerSum + answer.timeSpent, 0);
      return sum + sessionTime / session.totalQuestions;
    }, 0) / totalQuizzes
  ) : 0;

  const recentSessions = filteredSessions.slice(-5).reverse();
  const performance = getPerformanceLevel(averageScore);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">Your Quiz Statistics</h2>
          
          {uniqueQuizzes.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Filter by Quiz:
              </label>
              <select
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="all">All Quizzes ({sessions.length})</option>
                {uniqueQuizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.name} ({quiz.sessionCount})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">{totalQuizzes}</div>
            <div className="text-blue-100">Quizzes Completed</div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">{averageScore}%</div>
            <div className="text-green-100">Average Score</div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">{bestScore}%</div>
            <div className="text-purple-100">Best Score</div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6">
            <div className="text-3xl font-bold">{formatTime(totalTimeSpent)}</div>
            <div className="text-orange-100">Total Time</div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Performance Level</h3>
            <span className={`text-lg font-semibold ${performance.color}`}>
              {performance.level}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>
          <p className="text-gray-700 dark:text-gray-200 mt-2">{performance.message}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">{formatTime(averageTimePerQuestion)}</div>
              <div className="text-gray-700 dark:text-gray-200">Average Time per Question</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-900 dark:text-white">
                {totalQuizzes > 0 ? Math.round((filteredSessions.filter(s => s.score >= 80).length / totalQuizzes) * 100) : 0}%
              </div>
              <div className="text-gray-700 dark:text-gray-200">Sessions with 80%+ Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Recent Quiz Sessions</h3>
        <div className="space-y-4">
          {recentSessions.map((session, index) => {
            const sessionPerformance = getPerformanceLevel(session.score);
            const sessionDuration = session.endTime && session.startTime
              ? (() => {
                  const endTime = typeof session.endTime === 'string' ? new Date(session.endTime) : session.endTime;
                  const startTime = typeof session.startTime === 'string' ? new Date(session.startTime) : session.startTime;
                  return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
                })()
              : 0;

            return (
              <button 
                key={index} 
                onClick={() => setSelectedSession(session)}
                className="w-full border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-md cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${sessionPerformance.color}`}>
                      {session.score}%
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {session.quizName || 'Unknown Quiz'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {session.userAnswers.filter(a => a.isCorrect).length}/{session.totalQuestions} correct • {new Date(typeof session.startTime === 'string' ? session.startTime : session.startTime).toLocaleDateString()} • {formatTime(sessionDuration)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`text-sm font-medium ${sessionPerformance.color}`}>
                      {sessionPerformance.level}
                    </span>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-4 text-center">
          💡 Click on any session to view detailed results
        </p>
      </div>

      {/* Quiz History Viewer */}
      {selectedSession && (
        <QuizHistoryViewer 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
}