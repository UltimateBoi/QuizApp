'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion, UserAnswer, QuizSession } from '@/types/quiz';
import { calculateScore, checkAnswer } from '@/utils/quiz';
import { useSettings } from '@/hooks/useSettings';
import QuestionCard from './QuestionCard';
import ResultsScreen from './ResultsScreen';

interface QuizProps {
  questions: QuizQuestion[];
  onQuizComplete: (session: QuizSession) => void;
}

export default function Quiz({ questions, onQuizComplete }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<Date>(new Date());
  const [quizStartTime] = useState<Date>(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);
  const { settings } = useSettings();

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = userAnswers.some(answer => answer.questionIndex === currentQuestionIndex);

  const handleOptionSelect = (optionIndex: number) => {
    if (currentQuestion.type === 'singleSelect') {
      const newSelection = [optionIndex];
      setSelectedOptions(newSelection);
      
      // Auto-submit for single select if enabled
      if (settings.autoSubmit) {
        setTimeout(() => handleSubmitAnswer(newSelection), 100);
      }
    } else {
      // Multi-select logic
      const newSelection = selectedOptions.includes(optionIndex) 
        ? selectedOptions.filter(opt => opt !== optionIndex)
        : [...selectedOptions, optionIndex];
      
      setSelectedOptions(newSelection);
      
      // No auto-submit for multi-select questions
    }
  };

  const handleManualSubmit = () => {
    if (selectedOptions.length > 0) {
      handleSubmitAnswer();
    }
  };

  // Timer effect
  useEffect(() => {
    if (!settings.showTimer) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [questionStartTime, settings.showTimer]);

  const handleSubmitAnswer = (optionsToSubmit?: number[]) => {
    const optionsToUse = optionsToSubmit || selectedOptions;
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    const isCorrect = checkAnswer(currentQuestion, optionsToUse);
    
    const userAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOptions: [...optionsToUse],
      isCorrect,
      timeSpent
    };

    setUserAnswers(prev => [...prev, userAnswer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Quiz complete
      const endTime = new Date();
      const score = calculateScore(questions, [...userAnswers]);
      
      const session: QuizSession = {
        id: '', // Will be set by the handler
        quizId: '', // Will be set by the handler
        quizName: '', // Will be set by the handler
        questions,
        userAnswers: [...userAnswers],
        startTime: quizStartTime,
        endTime,
        score,
        totalQuestions: questions.length
      };

      setQuizComplete(true);
      onQuizComplete(session);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptions([]);
      setShowExplanation(false);
      setQuestionStartTime(new Date());
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setSelectedOptions([]);
    setShowExplanation(false);
    setQuizComplete(false);
    setQuestionStartTime(new Date());
  };

  if (quizComplete) {
    const session: QuizSession = {
      id: '', // Will be set by the handler
      quizId: '', // Will be set by the handler
      quizName: '', // Will be set by the handler
      questions,
      userAnswers,
      startTime: quizStartTime,
      endTime: new Date(),
      score: calculateScore(questions, userAnswers),
      totalQuestions: questions.length
    };

    return (
      <ResultsScreen 
        session={session} 
        onRestartQuiz={restartQuiz}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        selectedOptions={selectedOptions}
        onOptionSelect={handleOptionSelect}
        onSubmitAnswer={handleManualSubmit}
        showExplanation={showExplanation}
        isAnswered={isAnswered}
        autoSubmit={settings.autoSubmit || false}
      />

      <div className={`mt-8 flex justify-center space-x-4 ${settings.animations ? 'animate-fade-in' : ''}`}>
        {settings.showTimer && (
          <div className="flex items-center text-gray-600 dark:text-gray-300 mr-4">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
          </div>
        )}
        
        {!isAnswered && selectedOptions.length > 0 && !settings.autoSubmit && (
          <button
            onClick={() => handleSubmitAnswer()}
            className="btn-primary px-8"
          >
            Submit Answer
          </button>
        )}

        {showExplanation && (
          <button
            onClick={handleNextQuestion}
            className="btn-primary px-8"
          >
            {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
}