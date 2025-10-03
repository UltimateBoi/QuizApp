'use client';

import { useState } from 'react';
import { QuizCreationData } from '@/types/quiz';

interface BulkQuizGeneratorProps {
  onSave: (quizzes: QuizCreationData[]) => void;
  onCancel: () => void;
}

export default function BulkQuizGenerator({ onSave, onCancel }: BulkQuizGeneratorProps) {
  const [specification, setSpecification] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedQuizzes, setGeneratedQuizzes] = useState<QuizCreationData[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    if (!specification.trim()) {
      setError('Please enter a specification');
      return;
    }

    if (!apiKey.trim()) {
      setError('Please enter your Google Gemini API key');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedQuizzes([]);

    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate multiple quizzes for the following subject/specification. Create separate quizzes for each major topic, with each quiz having a unique topic number, title, and 5-10 questions.

Specification: ${specification}

Return ONLY a JSON array with the following structure (no markdown formatting, no code blocks):
[
  {
    "name": "Topic 1: [Title]",
    "description": "[Description of this topic]",
    "tags": ["tag1", "tag2"],
    "questions": [
      {
        "type": "singleSelect",
        "question": "[Question text]",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "answer": [0],
        "explanation": "[Detailed explanation]"
      }
    ]
  }
]

Important:
- Generate at least 3-5 separate quizzes covering different topics
- Each quiz should have 5-10 questions
- Use descriptive topic numbers and titles (e.g., "Topic 1: Introduction", "Topic 2: Advanced Concepts")
- Mix singleSelect and multiSelect question types
- For multiSelect, answer should be an array with multiple indices
- All questions must have detailed explanations
- Return ONLY valid JSON, no additional text or formatting`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate quizzes');
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No content generated');
      }

      // Clean up the response - remove markdown code blocks if present
      let jsonText = generatedText.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      // Parse the JSON
      const quizzes = JSON.parse(jsonText);

      if (!Array.isArray(quizzes)) {
        throw new Error('Generated content is not an array of quizzes');
      }

      // Validate the structure
      const validatedQuizzes = quizzes.map((quiz, index) => {
        if (!quiz.name || !quiz.questions || !Array.isArray(quiz.questions)) {
          throw new Error(`Invalid quiz structure at index ${index}`);
        }

        return {
          name: quiz.name,
          description: quiz.description || '',
          tags: quiz.tags || [],
          questions: quiz.questions.map((q: any) => ({
            type: q.type || 'singleSelect',
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation || '',
          })),
        };
      });

      setGeneratedQuizzes(validatedQuizzes);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate quizzes');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = () => {
    onSave(generatedQuizzes);
  };

  if (showPreview && generatedQuizzes.length > 0) {
    return (
      <div className="card max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview Generated Quizzes
          </h2>
          <button
            onClick={() => setShowPreview(false)}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-800 dark:text-blue-200">
            Generated {generatedQuizzes.length} quiz{generatedQuizzes.length !== 1 ? 'zes' : ''} with{' '}
            {generatedQuizzes.reduce((sum, q) => sum + q.questions.length, 0)} total questions
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
          {generatedQuizzes.map((quiz, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{quiz.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{quiz.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {quiz.questions.length} questions
                </span>
                {quiz.tags && quiz.tags.length > 0 && (
                  <div className="flex gap-1">
                    {quiz.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="btn-secondary px-6 py-2">
            Cancel
          </button>
          <button onClick={handleSaveAll} className="btn-primary px-6 py-2">
            Save All Quizzes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bulk Quiz Generator
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">API Key Required</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              You need a Google Gemini API key to use this feature. Get one at{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                Google AI Studio
              </a>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Your API key is only used for this session and is not stored
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject/Specification
          </label>
          <textarea
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            placeholder="Enter the subject or specification for which you want to generate quizzes. For example: 'Computer Science Data Structures - covering arrays, linked lists, stacks, queues, trees, and graphs' or 'World History - Ancient Civilizations'"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Be specific about the topics you want covered. The AI will create multiple quizzes, one for each major topic.
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="btn-secondary px-6 py-2" disabled={isGenerating}>
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            className="btn-primary px-6 py-2 flex items-center space-x-2"
            disabled={isGenerating || !specification.trim() || !apiKey.trim()}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Quizzes</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
