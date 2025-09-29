'use client';

import { useState, useEffect } from 'react';
import { AppSettings, defaultSettings } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('quiz-app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (isLoaded) {
      const root = document.documentElement;
      
      if (settings.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', prefersDark);
      } else {
        root.classList.toggle('dark', settings.theme === 'dark');
      }

      // Apply reduced motion
      root.classList.toggle('reduce-motion', settings.reducedMotion);
    }
  }, [settings.theme, settings.reducedMotion, isLoaded]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('quiz-app-settings', JSON.stringify(updated));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.setItem('quiz-app-settings', JSON.stringify(defaultSettings));
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded
  };
}