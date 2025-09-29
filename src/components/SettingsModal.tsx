'use client';

import { useState, useEffect } from 'react';
import { AppSettings } from '@/types/settings';

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

  useEffect(() => {
    setMounted(true);
  }, []);

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