'use client';

import { useState, useEffect } from 'react';
import { QuizQuestion, UserAnswer, QuizSession } from '@/types/quiz';
import { calculateScore, checkAnswer } from '@/utils/quiz';
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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = userAnswers.some(answer => answer.questionIndex === currentQuestionIndex);

  const handleOptionSelect = (optionIndex: number) => {
    if (currentQuestion.type === 'singleSelect') {
      setSelectedOptions([optionIndex]);
    } else {
      // Multi-select logic
      setSelectedOptions(prev => 
        prev.includes(optionIndex) 
          ? prev.filter(opt => opt !== optionIndex)
          : [...prev, optionIndex]
      );
    }
  };

  const handleSubmitAnswer = () => {
    const timeSpent = Math.floor((new Date().getTime() - questionStartTime.getTime()) / 1000);
    const isCorrect = checkAnswer(currentQuestion, selectedOptions);
    
    const userAnswer: UserAnswer = {
      questionIndex: currentQuestionIndex,
      selectedOptions: [...selectedOptions],
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
        showExplanation={showExplanation}
        isAnswered={isAnswered}
      />

      <div className="mt-8 flex justify-center space-x-4">
        {!isAnswered && selectedOptions.length > 0 && (
          <button
            onClick={handleSubmitAnswer}
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