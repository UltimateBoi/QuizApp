'use client';

import { QuizSession, QuizStatistics } from '@/types/quiz';
import { formatTime, getPerformanceLevel } from '@/utils/quiz';

interface StatisticsProps {
  sessions: QuizSession[];
}

export default function Statistics({ sessions }: StatisticsProps) {
  if (sessions.length === 0) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Statistics</h2>
        <p className="text-gray-600">No quiz sessions completed yet. Take your first quiz to see statistics!</p>
      </div>
    );
  }

  // Calculate statistics
  const totalQuizzes = sessions.length;
  const averageScore = Math.round(sessions.reduce((sum, session) => sum + session.score, 0) / totalQuizzes);
  const bestScore = Math.max(...sessions.map(session => session.score));
  const totalTimeSpent = sessions.reduce((sum, session) => {
    if (session.endTime && session.startTime) {
      const endTime = typeof session.endTime === 'string' ? new Date(session.endTime) : session.endTime;
      const startTime = typeof session.startTime === 'string' ? new Date(session.startTime) : session.startTime;
      return sum + Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    }
    return sum;
  }, 0);

  const averageTimePerQuestion = Math.round(
    sessions.reduce((sum, session) => {
      const sessionTime = session.userAnswers.reduce((answerSum, answer) => answerSum + answer.timeSpent, 0);
      return sum + sessionTime / session.totalQuestions;
    }, 0) / totalQuizzes
  );

  const recentSessions = sessions.slice(-5).reverse();
  const performance = getPerformanceLevel(averageScore);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Quiz Statistics</h2>
        
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
            <h3 className="text-xl font-semibold text-gray-800">Performance Level</h3>
            <span className={`text-lg font-semibold ${performance.color}`}>
              {performance.level}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${averageScore}%` }}
            ></div>
          </div>
          <p className="text-gray-600 mt-2">{performance.message}</p>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Additional Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-800">{formatTime(averageTimePerQuestion)}</div>
              <div className="text-gray-600">Average Time per Question</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-800">
                {Math.round((sessions.filter(s => s.score >= 80).length / totalQuizzes) * 100)}%
              </div>
              <div className="text-gray-600">Sessions with 80%+ Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Recent Quiz Sessions</h3>
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
              <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${sessionPerformance.color}`}>
                      {session.score}%
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">
                        {session.userAnswers.filter(a => a.isCorrect).length}/{session.totalQuestions} correct
                      </div>
                      <div className="text-sm text-gray-600">
                        {new Date(typeof session.startTime === 'string' ? session.startTime : session.startTime).toLocaleDateString()} • {formatTime(sessionDuration)}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${sessionPerformance.color}`}>
                    {sessionPerformance.level}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}