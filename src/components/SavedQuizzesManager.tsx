'use client';

import { useState } from 'react';
import { CustomQuiz } from '@/types/quiz';
import { useCustomQuizzes } from '@/hooks/useCustomQuizzes';
import { formatTime } from '@/utils/quiz';

interface SavedQuizzesManagerProps {
  onEditQuiz: (quiz: CustomQuiz) => void;
  onSelectQuiz: (quiz: CustomQuiz) => void;
}

export default function SavedQuizzesManager({ onEditQuiz, onSelectQuiz }: SavedQuizzesManagerProps) {
  const { allQuizzes, deleteQuiz, duplicateQuiz, generateAIPrompt } = useCustomQuizzes();
  const [selectedQuiz, setSelectedQuiz] = useState<CustomQuiz | null>(null);
  const [showAIPrompt, setShowAIPrompt] = useState(false);

  const handleDelete = async (quiz: CustomQuiz) => {
    if (quiz.isDefault) {
      alert('Cannot delete the default quiz');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${quiz.name}"?`)) {
      const success = deleteQuiz(quiz.id);
      if (success) {
        if (selectedQuiz?.id === quiz.id) {
          setSelectedQuiz(null);
        }
      } else {
        alert('Failed to delete quiz');
      }
    }
  };

  const handleDuplicate = (quiz: CustomQuiz) => {
    const newName = prompt(`Enter a name for the duplicated quiz:`, `${quiz.name} (Copy)`);
    if (newName && newName.trim()) {
      duplicateQuiz(quiz.id, newName.trim());
    }
  };

  const copyAIPrompt = (quiz: CustomQuiz) => {
    const prompt = generateAIPrompt(quiz);
    navigator.clipboard.writeText(prompt);
    alert('AI prompt copied to clipboard!');
  };

  const QuizCard = ({ quiz }: { quiz: CustomQuiz }) => (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
        selectedQuiz?.id === quiz.id
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
      onClick={() => setSelectedQuiz(quiz)}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{quiz.name}</h3>
        {quiz.isDefault && (
          <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
            Default
          </span>
        )}
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
        {quiz.description}
      </p>

      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
        <span>{quiz.questions.length} questions</span>
        <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
        {quiz.updatedAt !== quiz.createdAt && (
          <span>Updated {new Date(quiz.updatedAt).toLocaleDateString()}</span>
        )}
      </div>

      {quiz.tags && quiz.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {quiz.tags.map((tag) => (
            <span
              key={tag}
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectQuiz(quiz);
          }}
          className="btn-primary px-3 py-1 text-sm"
        >
          Take Quiz
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditQuiz(quiz);
          }}
          className="btn-secondary px-3 py-1 text-sm"
        >
          {quiz.isDefault ? 'View' : 'Edit'}
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicate(quiz);
          }}
          className="btn-secondary px-3 py-1 text-sm"
        >
          Duplicate
        </button>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            copyAIPrompt(quiz);
          }}
          className="btn-secondary px-3 py-1 text-sm"
        >
          Copy AI Prompt
        </button>
        
        {!quiz.isDefault && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(quiz);
            }}
            className="text-red-600 hover:text-red-800 px-3 py-1 text-sm border border-red-200 hover:border-red-300 rounded"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Saved Quizzes ({allQuizzes.length})
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your quiz collection, edit questions, or copy formats for AI assistance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Library</h3>
          {allQuizzes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No quizzes available</p>
              <p className="text-sm mt-1">Create your first quiz to get started!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {allQuizzes.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} />
              ))}
            </div>
          )}
        </div>

        <div>
          {selectedQuiz ? (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Details</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">{selectedQuiz.name}</h4>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedQuiz.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Questions:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {selectedQuiz.questions.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Created:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {new Date(selectedQuiz.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedQuiz.updatedAt !== selectedQuiz.createdAt && (
                    <div className="col-span-2">
                      <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {new Date(selectedQuiz.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {selectedQuiz.tags && selectedQuiz.tags.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedQuiz.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-2">Questions Preview:</h5>
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {selectedQuiz.questions.map((question, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded p-2 text-sm"
                      >
                        <div className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {index + 1}. {question.question}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs">
                          Type: {question.type}, Options: {question.options.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAIPrompt(!showAIPrompt);
                    }}
                    className="btn-secondary w-full mb-2"
                  >
                    {showAIPrompt ? 'Hide' : 'Show'} AI Prompt Format
                  </button>
                  
                  {showAIPrompt && (
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-xs">
                      <pre className="whitespace-pre-wrap text-gray-900 dark:text-white overflow-x-auto">
                        {generateAIPrompt(selectedQuiz)}
                      </pre>
                      <button
                        onClick={() => copyAIPrompt(selectedQuiz)}
                        className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        Copy to Clipboard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="card text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                Select a quiz from the library to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}