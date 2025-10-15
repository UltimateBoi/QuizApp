'use client';

import { useState, useEffect } from 'react';
import { FlashCard } from '@/types/quiz';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { decryptApiKey } from '@/utils/encryption';
import { processLargeDocument } from '@/utils/embeddings';
import { processLargeDocumentSmart, estimateTokenUsage } from '@/utils/largeDocumentProcessor';

interface FlashcardCreationData {
  name: string;
  description: string;
  cards: Omit<FlashCard, 'id' | 'deckId' | 'createdAt' | 'updatedAt'>[];
  tags?: string[];
}

interface BulkFlashcardGeneratorProps {
  onSave: (decks: FlashcardCreationData[]) => void;
  onCancel: () => void;
}

export default function BulkFlashcardGenerator({ onSave, onCancel }: BulkFlashcardGeneratorProps) {
  const [specification, setSpecification] = useState('');
  const [context, setContext] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedDecks, setGeneratedDecks] = useState<FlashcardCreationData[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showApiLimits, setShowApiLimits] = useState(false);
  const [processingInfo, setProcessingInfo] = useState<string>('');
  const { settings } = useSettings();
  const { user } = useAuth();

  // Load saved API key on mount
  useEffect(() => {
    const loadSavedApiKey = async () => {
      if (settings.geminiApiKey && user) {
        try {
          const decrypted = await decryptApiKey(settings.geminiApiKey, user.uid);
          setApiKey(decrypted);
        } catch (error) {
          console.error('Failed to decrypt API key:', error);
        }
      }
    };
    loadSavedApiKey();
  }, [settings.geminiApiKey, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setFileContent(content);
      };
      reader.readAsText(file);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileContent('');
  };

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
    setGeneratedDecks([]);
    setProcessingInfo('');

    try {
      // Use the new smart processor for large documents
      let processedContent = fileContent;
      
      if (fileContent && fileContent.length > 15000) {
        setProcessingInfo(`📄 Processing large document (${(fileContent.length / 1024).toFixed(2)}KB)...`);
        
        try {
          const result = await processLargeDocumentSmart(
            fileContent,
            specification,
            15000 // Conservative limit
          );
          
          processedContent = result.processedText;
          
          const reduction = ((1 - result.processedSize / result.originalSize) * 100).toFixed(1);
          setProcessingInfo(
            `✅ Optimized: ${(result.originalSize / 1024).toFixed(2)}KB → ${(result.processedSize / 1024).toFixed(2)}KB (${reduction}% reduction)\n` +
            `📊 Strategy: ${result.strategy}\n` +
            `${result.topics ? `🎯 Found ${result.topics.length} key topics` : ''}`
          );
          
          console.log('Document processing result:', result);
        } catch (processingError) {
          console.warn('Smart processing failed, using simple truncation:', processingError);
          processedContent = fileContent.substring(0, 15000) + '\n... [content truncated]';
          setProcessingInfo('⚠️ Using simple truncation due to processing error');
        }
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate multiple flashcard decks for the following subject/specification. Create separate decks for each major topic, with each deck having a unique topic number, title, and 10-20 flashcards.

Specification: ${specification}

${context ? `Additional Context/Instructions: ${context}` : ''}

${processedContent ? `Reference Material/Content:\n${processedContent}\n` : ''}

Return ONLY a JSON array with the following structure (no markdown formatting, no code blocks):
[
  {
    "name": "Topic 1: [Title]",
    "description": "[Description of this topic]",
    "tags": ["tag1", "tag2"],
    "cards": [
      {
        "front": "[Question or term]",
        "back": "[Answer or definition]",
        "difficulty": "easy"
      }
    ]
  }
]

Important:
- Generate at least 3-5 separate flashcard decks covering different topics
- Each deck should have 10-20 flashcards
- Use descriptive topic numbers and titles (e.g., "Topic 1: Introduction", "Topic 2: Advanced Concepts")
- For difficulty, use "easy", "medium", or "hard"
- Cards should be clear and concise
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
        const errorMessage = errorData.error?.message || 'Failed to generate flashcard decks';
        
        // Check for rate limit or quota errors
        if (response.status === 429 || errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
          throw new Error('API quota exceeded. Please try again later or check your API key billing details. Visit https://ai.google.dev/gemini-api/docs/rate-limits for more information.');
        }
        
        throw new Error(errorMessage);
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
      const decks = JSON.parse(jsonText);

      if (!Array.isArray(decks)) {
        throw new Error('Generated content is not an array of flashcard decks');
      }

      // Validate the structure
      const validatedDecks = decks.map((deck, index) => {
        if (!deck.name || !deck.cards || !Array.isArray(deck.cards)) {
          throw new Error(`Invalid deck structure at index ${index}`);
        }

        return {
          name: deck.name,
          description: deck.description || '',
          tags: deck.tags || [],
          cards: deck.cards.map((card: any) => ({
            front: card.front,
            back: card.back,
            difficulty: card.difficulty || 'medium',
          })),
        };
      });

      setGeneratedDecks(validatedDecks);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcard decks');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAll = () => {
    onSave(generatedDecks);
  };

  if (showPreview && generatedDecks.length > 0) {
    return (
      <div className="card max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Preview Generated Flashcard Decks
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
            Generated {generatedDecks.length} flashcard deck{generatedDecks.length !== 1 ? 's' : ''} with{' '}
            {generatedDecks.reduce((sum, d) => sum + d.cards.length, 0)} total cards
          </p>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
          {generatedDecks.map((deck, index) => (
            <div
              key={index}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800"
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{deck.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{deck.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  {deck.cards.length} cards
                </span>
                {deck.tags && deck.tags.length > 0 && (
                  <div className="flex gap-1">
                    {deck.tags.map((tag, i) => (
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
            Save All Decks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bulk Flashcard Generator
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
              {' · '}
              <button
                onClick={() => setShowApiLimits(!showApiLimits)}
                className="underline hover:text-yellow-900 dark:hover:text-yellow-100"
              >
                {showApiLimits ? 'Hide' : 'View'} Free Tier Limits
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* API Limits Panel */}
      {showApiLimits && (
        <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
            📊 Free API Key Limitations
          </h4>
          
          {/* Simple Terms */}
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">🎯 Simple Terms:</p>
            <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
              <li>• <strong>15 requests per minute</strong> - About 1 flashcard deck every 4 seconds</li>
              <li>• <strong>1,500 requests per day</strong> - Generate ~100-150 flashcard decks daily</li>
              <li>• <strong>1 million tokens per day</strong> - Roughly 750,000 words of content</li>
              <li>• <strong>Perfect for personal use</strong> - More than enough for studying!</li>
            </ul>
          </div>

          {/* Advanced Details */}
          <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">🔬 Technical Details:</p>
            <div className="text-xs text-gray-700 dark:text-gray-300 space-y-2">
              <div>
                <p className="font-medium">Rate Limits:</p>
                <ul className="ml-4 space-y-0.5">
                  <li>• 15 RPM (requests per minute)</li>
                  <li>• 1,500 RPD (requests per day)</li>
                  <li>• 1 million TPM (tokens per minute)</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium">Content Processing:</p>
                <ul className="ml-4 space-y-0.5">
                  <li>• <strong>Model:</strong> Gemini 2.5 Flash with text-embedding-004 for semantic chunking</li>
                  <li>• <strong>Input tokens:</strong> ~30,000 tokens per request</li>
                  <li>• <strong>Output tokens:</strong> ~8,000 tokens max per response</li>
                  <li>• <strong>File uploads:</strong> Text files up to ~10MB (automatically chunked for large files)</li>
                  <li>• <strong>Context window:</strong> 1 million tokens total context</li>
                </ul>
              </div>

              <div>
                <p className="font-medium">Flashcard Generation Examples:</p>
                <ul className="ml-4 space-y-0.5">
                  <li>• <strong>Per minute:</strong> ~8-15 flashcard decks (each with 10-20 cards)</li>
                  <li>• <strong>Per request:</strong> 3-5 topic decks with 50-100 total cards</li>
                  <li>• <strong>With uploaded files:</strong> Process study materials up to 10MB</li>
                  <li>• <strong>Bulk generation:</strong> Multiple topic decks in one request</li>
                  <li>• <strong>Daily capacity:</strong> Hundreds of flashcard decks for study</li>
                </ul>
              </div>

              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                <p className="text-green-800 dark:text-green-200">
                  <strong>💡 Pro Tip:</strong> Generate multiple flashcard decks in one request by describing all topics 
                  in the specification field. This maximizes efficiency and stays within rate limits!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
            <a
              href="https://ai.google.dev/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              View official pricing & limits →
            </a>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Google Gemini API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={settings.geminiApiKey ? "Using saved API key" : "Enter your Gemini API key"}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {settings.geminiApiKey 
              ? '✓ Using your saved API key from settings' 
              : 'Your API key is only used for this session and is not stored unless you save it in Settings'
            }
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject/Specification
          </label>
          <textarea
            value={specification}
            onChange={(e) => setSpecification(e.target.value)}
            placeholder="Enter the subject or specification for which you want to generate flashcards. For example: 'Computer Science Data Structures - covering arrays, linked lists, stacks, queues, trees, and graphs' or 'World History - Ancient Civilizations'"
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Be specific about the topics you want covered. The AI will create multiple flashcard decks, one for each major topic.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Context (Optional)
          </label>
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Provide additional instructions or context. For example: 'Generate 20 cards for each topic', 'Focus on definitions and key concepts', 'Include beginner-friendly explanations'"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Add specific instructions like number of cards per deck, difficulty level, or any special requirements.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reference Material (Optional)
          </label>
          {!uploadedFile ? (
            <div>
              <input
                type="file"
                id="file-upload"
                accept=".txt,.md,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors bg-white dark:bg-gray-800"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Click to upload a file or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                    TXT, MD, PDF, DOC up to 10MB
                  </p>
                </div>
              </label>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-8 h-8 text-blue-500 dark:text-blue-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveFile}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Upload reference material like lecture notes, textbook chapters, or study guides to generate more relevant flashcards. Large documents (&gt;10MB) are automatically optimized using intelligent compression and semantic analysis.
          </p>
        </div>

        {/* Processing Info Display */}
        {processingInfo && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <pre className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap font-mono">
              {processingInfo}
            </pre>
          </div>
        )}

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
              <span>Generate Flashcard Decks</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
