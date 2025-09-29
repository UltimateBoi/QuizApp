'use client';

import { useState, useEffect } from 'react';
import { CustomQuiz, QuizCreationData, QuizQuestion } from '@/types/quiz';
import { useSettings } from '@/hooks/useSettings';

interface QuizCreatorProps {
  quiz?: CustomQuiz;
  onSave: (quizData: QuizCreationData) => void;
  onCancel: () => void;
}

export default function QuizCreator({ quiz, onSave, onCancel }: QuizCreatorProps) {
  const { settings } = useSettings();
  const [formData, setFormData] = useState<QuizCreationData>({
    name: quiz?.name || '',
    description: quiz?.description || '',
    questions: quiz?.questions || [],
    tags: quiz?.tags || [],
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    type: 'singleSelect',
    question: '',
    options: ['', '', '', ''],
    answer: [],
    explanation: '',
  });
  
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showJsonImport, setShowJsonImport] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const addOrUpdateQuestion = () => {
    if (!currentQuestion.question.trim() || 
        currentQuestion.options.some(opt => !opt.trim()) ||
        currentQuestion.answer.length === 0 ||
        !currentQuestion.explanation.trim()) {
      alert('Please fill in all fields for the question');
      return;
    }

    const newQuestions = [...formData.questions];
    if (editingIndex !== null) {
      newQuestions[editingIndex] = currentQuestion;
      setEditingIndex(null);
    } else {
      newQuestions.push(currentQuestion);
    }

    setFormData(prev => ({ ...prev, questions: newQuestions }));
    resetCurrentQuestion();
  };

  const resetCurrentQuestion = () => {
    setCurrentQuestion({
      type: 'singleSelect',
      question: '',
      options: ['', '', '', ''],
      answer: [],
      explanation: '',
    });
  };

  const editQuestion = (index: number) => {
    setCurrentQuestion(formData.questions[index]);
    setEditingIndex(index);
  };

  const deleteQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateOption = (optionIndex: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optionIndex] = value;
    setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (currentQuestion.options.length < 6) {
      setCurrentQuestion(prev => ({
        ...prev,
        options: [...prev.options, '']
      }));
    }
  };

  const removeOption = (index: number) => {
    if (currentQuestion.options.length > 2) {
      const newOptions = currentQuestion.options.filter((_, i) => i !== index);
      const newAnswer = currentQuestion.answer.filter(a => a !== index).map(a => a > index ? a - 1 : a);
      setCurrentQuestion(prev => ({
        ...prev,
        options: newOptions,
        answer: newAnswer
      }));
    }
  };

  const toggleAnswer = (optionIndex: number) => {
    if (currentQuestion.type === 'singleSelect') {
      setCurrentQuestion(prev => ({ ...prev, answer: [optionIndex] }));
    } else {
      const newAnswer = currentQuestion.answer.includes(optionIndex)
        ? currentQuestion.answer.filter(a => a !== optionIndex)
        : [...currentQuestion.answer, optionIndex];
      setCurrentQuestion(prev => ({ ...prev, answer: newAnswer }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.description.trim() || formData.questions.length === 0) {
      alert('Please fill in all required fields (name, description, and at least one question)');
      return;
    }
    onSave(formData);
  };

  const generateJsonPreview = () => {
    return JSON.stringify(formData, null, 2);
  };

  const handleJsonImport = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput);
      
      let questionsToImport: any[] = [];
      let quizMetadata: { name?: string; description?: string; tags?: string[] } = {};
      
      // Check if it's a complete quiz object or just questions array
      if (Array.isArray(parsed)) {
        // It's just an array of questions
        questionsToImport = parsed;
      } else if (parsed && typeof parsed === 'object') {
        // It's a complete quiz object
        if (Array.isArray(parsed.questions)) {
          questionsToImport = parsed.questions;
          quizMetadata = {
            name: parsed.name,
            description: parsed.description,
            tags: parsed.tags
          };
        } else {
          throw new Error('Invalid format: Expected either an array of questions or an object with a "questions" array');
        }
      } else {
        throw new Error('Invalid format: Expected either an array of questions or a quiz object');
      }

      const validatedQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < questionsToImport.length; i++) {
        const question = questionsToImport[i];
        
        // Validate each question
        if (!question.type || !['singleSelect', 'multiSelect'].includes(question.type)) {
          throw new Error(`Question ${i + 1}: Invalid or missing type. Must be 'singleSelect' or 'multiSelect'`);
        }
        
        if (!question.question || typeof question.question !== 'string') {
          throw new Error(`Question ${i + 1}: Missing or invalid question text`);
        }
        
        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new Error(`Question ${i + 1}: Must have at least 2 options`);
        }
        
        if (!Array.isArray(question.answer) || question.answer.length === 0) {
          throw new Error(`Question ${i + 1}: Must have at least one correct answer`);
        }
        
        // Validate answer indices
        for (const answerIndex of question.answer) {
          if (typeof answerIndex !== 'number' || answerIndex < 0 || answerIndex >= question.options.length) {
            throw new Error(`Question ${i + 1}: Invalid answer index ${answerIndex}`);
          }
        }
        
        if (!question.explanation || typeof question.explanation !== 'string') {
          throw new Error(`Question ${i + 1}: Missing or invalid explanation`);
        }
        
        validatedQuestions.push({
          type: question.type,
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation
        });
      }
      
      // Update form data with questions and metadata
      setFormData(prev => ({
        ...prev,
        name: quizMetadata.name || prev.name,
        description: quizMetadata.description || prev.description,
        tags: quizMetadata.tags || prev.tags,
        questions: [...prev.questions, ...validatedQuestions]
      }));
      
      setJsonInput('');
      setShowJsonImport(false);
      
      // Show success message
      const metadataMessage = quizMetadata.name ? ` with metadata` : '';
      alert(`Successfully imported ${validatedQuestions.length} questions${metadataMessage}!`);
      
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const handleJsonImportReplace = () => {
    setJsonError('');
    try {
      const parsed = JSON.parse(jsonInput);
      
      let questionsToImport: any[] = [];
      let quizMetadata: { name?: string; description?: string; tags?: string[] } = {};
      
      // Check if it's a complete quiz object or just questions array
      if (Array.isArray(parsed)) {
        // It's just an array of questions
        questionsToImport = parsed;
      } else if (parsed && typeof parsed === 'object') {
        // It's a complete quiz object
        if (Array.isArray(parsed.questions)) {
          questionsToImport = parsed.questions;
          quizMetadata = {
            name: parsed.name,
            description: parsed.description,
            tags: parsed.tags
          };
        } else {
          throw new Error('Invalid format: Expected either an array of questions or an object with a "questions" array');
        }
      } else {
        throw new Error('Invalid format: Expected either an array of questions or a quiz object');
      }

      const validatedQuestions: QuizQuestion[] = [];
      
      for (let i = 0; i < questionsToImport.length; i++) {
        const question = questionsToImport[i];
        
        if (!question.type || !['singleSelect', 'multiSelect'].includes(question.type)) {
          throw new Error(`Question ${i + 1}: Invalid or missing type. Must be 'singleSelect' or 'multiSelect'`);
        }
        
        if (!question.question || typeof question.question !== 'string') {
          throw new Error(`Question ${i + 1}: Missing or invalid question text`);
        }
        
        if (!Array.isArray(question.options) || question.options.length < 2) {
          throw new Error(`Question ${i + 1}: Must have at least 2 options`);
        }
        
        if (!Array.isArray(question.answer) || question.answer.length === 0) {
          throw new Error(`Question ${i + 1}: Must have at least one correct answer`);
        }
        
        for (const answerIndex of question.answer) {
          if (typeof answerIndex !== 'number' || answerIndex < 0 || answerIndex >= question.options.length) {
            throw new Error(`Question ${i + 1}: Invalid answer index ${answerIndex}`);
          }
        }
        
        if (!question.explanation || typeof question.explanation !== 'string') {
          throw new Error(`Question ${i + 1}: Missing or invalid explanation`);
        }
        
        validatedQuestions.push({
          type: question.type,
          question: question.question,
          options: question.options,
          answer: question.answer,
          explanation: question.explanation
        });
      }
      
      // Replace all data with imported content
      setFormData(prev => ({
        ...prev,
        name: quizMetadata.name || prev.name,
        description: quizMetadata.description || prev.description,
        tags: quizMetadata.tags || prev.tags,
        questions: validatedQuestions
      }));
      
      setJsonInput('');
      setShowJsonImport(false);
      
      const metadataMessage = quizMetadata.name ? ` with metadata` : '';
      alert(`Successfully replaced with ${validatedQuestions.length} questions${metadataMessage}!`);
      
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON format');
    }
  };

  const generateSampleJson = () => {
    const sampleFullQuiz = {
      "name": "Sample Quiz",
      "description": "A sample quiz with basic questions to demonstrate the format",
      "tags": ["Sample", "Education", "Basic"],
      "questions": [
        {
          "type": "singleSelect",
          "question": "What is the capital of France?",
          "options": [
            "London",
            "Berlin",
            "Paris",
            "Madrid"
          ],
          "answer": [2],
          "explanation": "Paris is the capital and most populous city of France."
        },
        {
          "type": "multiSelect", 
          "question": "Which of the following are programming languages?",
          "options": [
            "JavaScript",
            "HTML",
            "Python",
            "CSS"
          ],
          "answer": [0, 2],
          "explanation": "JavaScript and Python are programming languages, while HTML and CSS are markup and styling languages respectively."
        }
      ]
    };
    
    setJsonInput(JSON.stringify(sampleFullQuiz, null, 2));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {quiz ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowJsonImport(!showJsonImport)}
            className="btn-secondary px-4 py-2"
          >
            Import JSON
          </button>
          <button
            onClick={() => setShowJsonPreview(!showJsonPreview)}
            className="btn-secondary px-4 py-2"
          >
            {showJsonPreview ? 'Hide' : 'Show'} JSON Preview
          </button>
          <button onClick={onCancel} className="btn-secondary px-4 py-2">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary px-4 py-2">
            Save Quiz
          </button>
        </div>
      </div>

      {/* JSON Import Modal */}
      {showJsonImport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Import Questions from JSON</h3>
              <button
                onClick={() => {
                  setShowJsonImport(false);
                  setJsonInput('');
                  setJsonError('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Paste your JSON (complete quiz or questions array):
                  </label>
                  <button
                    onClick={generateSampleJson}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                  >
                    Load Sample Format
                  </button>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={12}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                  placeholder="Paste your JSON array of questions here..."
                />
              </div>

              {jsonError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-red-800 dark:text-red-200 text-sm font-medium">Error:</p>
                  <p className="text-red-700 dark:text-red-300 text-sm">{jsonError}</p>
                </div>
              )}

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Format 1: Complete Quiz Object (Recommended)</h4>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`{
  "name": "Quiz Title",
  "description": "Quiz description",
  "tags": ["tag1", "tag2"],
  "questions": [
    {
      "type": "singleSelect",
      "question": "Your question?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "answer": [2],
      "explanation": "Explanation here"
    }
  ]
}`}
                  </pre>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Format 2: Questions Array Only</h4>
                  <pre className="text-xs text-gray-600 dark:text-gray-400 overflow-x-auto">
{`[
  {
    "type": "singleSelect",
    "question": "Your question?",
    "options": ["Option 1", "Option 2", "Option 3"],
    "answer": [2],
    "explanation": "Explanation here"
  }
]`}
                  </pre>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <strong>Field Descriptions:</strong><br/>
                  • <strong>type</strong>: &quot;singleSelect&quot; or &quot;multiSelect&quot;<br/>
                  • <strong>options</strong>: Array of answer choices<br/>
                  • <strong>answer</strong>: Array of correct option indices (0-based)<br/>
                  • <strong>explanation</strong>: Text explaining the correct answer<br/>
                  • <strong>name/description/tags</strong>: Optional quiz metadata (Format 1 only)
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowJsonImport(false);
                    setJsonInput('');
                    setJsonError('');
                  }}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={handleJsonImport}
                  disabled={!jsonInput.trim()}
                  className="btn-secondary px-4 py-2 disabled:opacity-50"
                >
                  Add to Existing Questions
                </button>
                <button
                  onClick={handleJsonImportReplace}
                  disabled={!jsonInput.trim()}
                  className="btn-primary px-4 py-2 disabled:opacity-50"
                >
                  Replace All Questions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Quiz Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter quiz name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Describe your quiz"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Add a tag"
                  />
                  <button onClick={addTag} className="btn-secondary px-3 py-2">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Editor */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingIndex !== null ? 'Edit Question' : 'Add Question'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Question Type
                </label>
                <select
                  value={currentQuestion.type}
                  onChange={(e) => setCurrentQuestion(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'singleSelect' | 'multiSelect',
                    answer: [] // Reset answer when type changes
                  }))}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="singleSelect">Single Select</option>
                  <option value="multiSelect">Multi Select</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Question *
                </label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, question: e.target.value }))}
                  rows={2}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your question"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Options * (Check correct answers)
                </label>
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type={currentQuestion.type === 'singleSelect' ? 'radio' : 'checkbox'}
                        name="correct-answer"
                        checked={currentQuestion.answer.includes(index)}
                        onChange={() => toggleAnswer(index)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder={`Option ${index + 1}`}
                      />
                      {currentQuestion.options.length > 2 && (
                        <button
                          onClick={() => removeOption(index)}
                          className="text-red-600 hover:text-red-800 px-2"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {currentQuestion.options.length < 6 && (
                    <button
                      onClick={addOption}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                    >
                      + Add Option
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Explanation *
                </label>
                <textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Explain why this answer is correct"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={addOrUpdateQuestion} className="btn-primary px-4 py-2">
                  {editingIndex !== null ? 'Update Question' : 'Add Question'}
                </button>
                {editingIndex !== null && (
                  <button 
                    onClick={() => {
                      setEditingIndex(null);
                      resetCurrentQuestion();
                    }}
                    className="btn-secondary px-4 py-2"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Questions List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Questions ({formData.questions.length})
            </h3>
            {formData.questions.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No questions added yet.</p>
            ) : (
              <div className="space-y-3">
                {formData.questions.map((question, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Question {index + 1} ({question.type})
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => editQuestion(index)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteQuestion(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {question.question}
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Correct: {question.answer.map(a => question.options[a]).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* JSON Preview */}
          {showJsonPreview && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">JSON Preview</h3>
              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-xs overflow-auto max-h-96 text-gray-900 dark:text-white">
                {generateJsonPreview()}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(generateJsonPreview())}
                className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 text-sm"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}