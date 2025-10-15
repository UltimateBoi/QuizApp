'use client';

import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/settings';
import { useAuth } from '@/contexts/AuthContext';
import { encryptApiKey, hashApiKey } from '@/utils/encryption';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onResetSettings: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings
}: SettingsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [showApiLimits, setShowApiLimits] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      onUpdateSettings({ geminiApiKey: '', geminiApiKeyHash: '' });
      setApiKeySaved(false);
      return;
    }

    if (!user) {
      alert('Please sign in to save your API key securely');
      return;
    }

    setSavingApiKey(true);
    setApiKeySaved(false);
    try {
      // Encrypt the API key for local storage
      const encrypted = await encryptApiKey(apiKeyInput, user.uid);
      // Hash the API key for verification (stored in Firestore for security)
      const hashed = await hashApiKey(apiKeyInput);
      
      onUpdateSettings({ 
        geminiApiKey: encrypted,
        geminiApiKeyHash: hashed
      });
      setApiKeyInput('');
      setApiKeySaved(true);
      // Auto-hide success message after 3 seconds
      setTimeout(() => setApiKeySaved(false), 3000);
    } catch (error) {
      console.error('Error saving API key:', error);
      alert('Failed to save API key. Please try again.');
    } finally {
      setSavingApiKey(false);
    }
  };

  const handleRemoveApiKey = () => {
    if (confirm('Are you sure you want to remove your saved API key?')) {
      onUpdateSettings({ geminiApiKey: '', geminiApiKeyHash: '' });
      setApiKeyInput('');
      setApiKeySaved(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Theme Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Theme</h3>
            <div className="space-y-2">
              {[
                { value: 'system', label: 'System', icon: '🖥️' },
                { value: 'light', label: 'Light', icon: '☀️' },
                { value: 'dark', label: 'Dark', icon: '🌙' }
              ].map((theme) => (
                <label key={theme.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={settings.theme === theme.value}
                    onChange={(e) => onUpdateSettings({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-lg">{theme.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{theme.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quiz Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Quiz Behavior</h3>
            <div className="space-y-4">
              <SettingToggle
                label="Auto-submit answers"
                description="Submit answers immediately when selected"
                checked={settings.autoSubmit}
                onChange={(checked) => onUpdateSettings({ autoSubmit: checked })}
                icon="⚡"
              />
              
              <SettingToggle
                label="Show timer"
                description="Display elapsed time during quiz"
                checked={settings.showTimer}
                onChange={(checked) => onUpdateSettings({ showTimer: checked })}
                icon="⏱️"
              />
              
              <SettingToggle
                label="Confirm before submit"
                description="Ask for confirmation before submitting quiz"
                checked={settings.confirmBeforeSubmit}
                onChange={(checked) => onUpdateSettings({ confirmBeforeSubmit: checked })}
                icon="✅"
              />
            </div>
          </div>

          {/* Animation Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Animations</h3>
            <div className="space-y-4">
              <SettingToggle
                label="Enable animations"
                description="Show smooth transitions and effects"
                checked={settings.animations}
                onChange={(checked) => onUpdateSettings({ animations: checked })}
                icon="✨"
              />
              
              <SettingToggle
                label="Background animations"
                description="Animated background patterns"
                checked={settings.backgroundAnimations}
                onChange={(checked) => onUpdateSettings({ backgroundAnimations: checked })}
                icon="🌊"
              />
              
              <SettingToggle
                label="Reduced motion"
                description="Minimize animations for better performance"
                checked={settings.reducedMotion}
                onChange={(checked) => onUpdateSettings({ reducedMotion: checked })}
                icon="🚀"
              />
            </div>
          </div>

          {/* Audio Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Audio</h3>
            <SettingToggle
              label="Sound effects"
              description="Play sounds for interactions"
              checked={settings.soundEffects}
              onChange={(checked) => onUpdateSettings({ soundEffects: checked })}
              icon="🔊"
            />
          </div>

          {/* API Key Settings */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">🤖 AI Features</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Google Gemini API Key
                  {settings.geminiApiKey && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      ✓ Saved & Encrypted
                    </span>
                  )}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Save your API key to use AI-powered quiz and flashcard generation. 
                  {user ? ' Your key is encrypted and hashed before syncing to Firestore.' : ' Sign in to sync across devices.'}
                </p>
                <div className="flex space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder={settings.geminiApiKey ? '••••••••••••••••' : 'Enter API key'}
                      className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showApiKey ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <button
                    onClick={handleSaveApiKey}
                    disabled={savingApiKey}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingApiKey ? '...' : 'Save'}
                  </button>
                </div>
                {apiKeySaved && (
                  <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-xs text-green-800 dark:text-green-200">
                    ✓ API key saved and encrypted successfully! It will sync to your account.
                  </div>
                )}
                {settings.geminiApiKey && (
                  <button
                    onClick={handleRemoveApiKey}
                    className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Remove saved API key
                  </button>
                )}
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Get your free API key at{' '}
                  <a
                    href="https://makersuite.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Google AI Studio
                  </a>
                  {' · '}
                  <button
                    onClick={() => setShowApiLimits(!showApiLimits)}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {showApiLimits ? 'Hide' : 'View'} API Limits
                  </button>
                </p>

                {/* API Limits Panel */}
                {showApiLimits && (
                  <div className="mt-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      📊 Free API Key Limitations
                    </h4>
                    
                    {/* Simple Terms */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">🎯 Simple Terms:</p>
                      <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                        <li>• <strong>15 requests per minute</strong> - About 1 quiz every 4 seconds</li>
                        <li>• <strong>1,500 requests per day</strong> - Generate ~100-150 quizzes daily</li>
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
                            <li>• <strong>Input tokens:</strong> ~30,000 tokens per request (Gemini 1.5 Flash)</li>
                            <li>• <strong>Output tokens:</strong> ~8,000 tokens max per response</li>
                            <li>• <strong>File uploads:</strong> Supported (PDF, TXT, DOC) up to ~10MB</li>
                            <li>• <strong>Context window:</strong> 1 million tokens total context</li>
                          </ul>
                        </div>

                        <div>
                          <p className="font-medium">Practical Examples:</p>
                          <ul className="ml-4 space-y-0.5">
                            <li>• <strong>Quiz generation:</strong> ~5-10 quizzes per minute</li>
                            <li>• <strong>Flashcard decks:</strong> ~8-15 decks per minute</li>
                            <li>• <strong>With uploaded files:</strong> Process documents up to 10MB</li>
                            <li>• <strong>Questions per request:</strong> Typically 10-50 questions</li>
                            <li>• <strong>Bulk generation:</strong> 3-5 topic sets in one request</li>
                          </ul>
                        </div>

                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
                          <p className="text-yellow-800 dark:text-yellow-200">
                            <strong>💡 Tip:</strong> The free tier resets daily and is perfect for students. 
                            For heavy usage, consider Google&apos;s paid plans starting at $0.00015 per 1K tokens.
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
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onResetSettings}
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: string;
}

function SettingToggle({ label, description, checked, onChange, icon }: SettingToggleProps) {
  return (
    <div className="flex items-start space-x-3">
      <span className="text-lg mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
              checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            onClick={() => onChange(!checked)}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                checked ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}