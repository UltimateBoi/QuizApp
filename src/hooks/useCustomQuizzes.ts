'use client';

import { useState, useEffect, useCallback } from 'react';
import { CustomQuiz, QuizCreationData } from '@/types/quiz';
import { useLocalStorage } from './useLocalStorage';

export function useCustomQuizzes() {
  const [customQuizzes, setCustomQuizzes] = useLocalStorage<CustomQuiz[]>('custom-quizzes', []);
  const [defaultQuiz, setDefaultQuiz] = useState<CustomQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load default quiz from JSON file
  useEffect(() => {
    const loadDefaultQuiz = async () => {
      try {
        const response = await fetch('/default-quiz.json');
        if (!response.ok) {
          throw new Error('Failed to load default quiz');
        }
        const quiz: CustomQuiz = await response.json();
        setDefaultQuiz(quiz);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load default quiz');
      } finally {
        setIsLoading(false);
      }
    };

    loadDefaultQuiz();
  }, []);

  // Get all quizzes (default + custom)
  const getAllQuizzes = useCallback((): CustomQuiz[] => {
    const quizzes = [...customQuizzes];
    if (defaultQuiz && !quizzes.some(q => q.id === defaultQuiz.id)) {
      quizzes.unshift(defaultQuiz);
    }
    return quizzes;
  }, [customQuizzes, defaultQuiz]);

  // Get quiz by ID
  const getQuizById = useCallback((id: string): CustomQuiz | undefined => {
    if (defaultQuiz?.id === id) {
      return defaultQuiz;
    }
    return customQuizzes.find(quiz => quiz.id === id);
  }, [customQuizzes, defaultQuiz]);

  // Create new quiz
  const createQuiz = useCallback((quizData: QuizCreationData): CustomQuiz => {
    const newQuiz: CustomQuiz = {
      id: `quiz-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      ...quizData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomQuizzes(prev => [...prev, newQuiz]);
    return newQuiz;
  }, [setCustomQuizzes]);

  // Update existing quiz
  const updateQuiz = useCallback((id: string, updates: Partial<QuizCreationData>): CustomQuiz | null => {
    const existingQuiz = customQuizzes.find(q => q.id === id);
    if (!existingQuiz || existingQuiz.isDefault) {
      return null; // Cannot update default quiz or non-existent quiz
    }

    const updatedQuiz: CustomQuiz = {
      ...existingQuiz,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    setCustomQuizzes(prev => prev.map(q => q.id === id ? updatedQuiz : q));
    return updatedQuiz;
  }, [customQuizzes, setCustomQuizzes]);

  // Delete quiz
  const deleteQuiz = useCallback((id: string): boolean => {
    const quizToDelete = customQuizzes.find(q => q.id === id);
    if (!quizToDelete || quizToDelete.isDefault) {
      return false; // Cannot delete default quiz or non-existent quiz
    }

    setCustomQuizzes(prev => prev.filter(q => q.id !== id));
    return true;
  }, [customQuizzes, setCustomQuizzes]);

  // Duplicate quiz
  const duplicateQuiz = useCallback((id: string, newName?: string): CustomQuiz | null => {
    const originalQuiz = getQuizById(id);
    if (!originalQuiz) {
      return null;
    }

    const duplicatedQuiz = createQuiz({
      name: newName || `${originalQuiz.name} (Copy)`,
      description: originalQuiz.description,
      questions: originalQuiz.questions,
      tags: originalQuiz.tags,
    });

    return duplicatedQuiz;
  }, [getQuizById, createQuiz]);

  // Generate AI prompt format
  const generateAIPrompt = useCallback((quiz: CustomQuiz): string => {
    const promptData = {
      name: quiz.name,
      description: quiz.description,
      tags: quiz.tags,
      questions: quiz.questions
    };

    return `Here's a quiz in the required format for the QuizApp:

\`\`\`json
${JSON.stringify(promptData, null, 2)}
\`\`\`

Each question should follow this structure:
- type: "singleSelect" or "multiSelect"
- question: The question text
- options: Array of answer options
- answer: Array of correct answer indices (0-based)
- explanation: Detailed explanation of the correct answer

Please create a similar quiz following this exact format.`;
  }, []);

  return {
    customQuizzes,
    defaultQuiz,
    allQuizzes: getAllQuizzes(),
    isLoading,
    error,
    getQuizById,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    duplicateQuiz,
    generateAIPrompt,
    setCustomQuizzes,
  };
}