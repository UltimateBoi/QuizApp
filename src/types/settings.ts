export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSubmit: boolean;
  animations: boolean;
  reducedMotion: boolean;
  backgroundAnimations: boolean;
  soundEffects: boolean;
  showTimer: boolean;
  confirmBeforeSubmit: boolean;
  geminiApiKey?: string; // Encrypted API key for Gemini AI
}

export const defaultSettings: AppSettings = {
  theme: 'system',
  autoSubmit: false,
  animations: true,
  reducedMotion: false,
  backgroundAnimations: true,
  soundEffects: false,
  showTimer: true,
  confirmBeforeSubmit: true,
  geminiApiKey: '',
};