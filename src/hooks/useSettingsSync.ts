'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot, Timestamp } from 'firebase/firestore';
import { AppSettings } from '@/types/settings';

export function useSettingsSync(
  localSettings: AppSettings,
  setLocalSettings: (settings: AppSettings) => void,
  enabled: boolean = true
) {
  const { user, isConfigured } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const prevSettingsRef = useRef<string>('');
  const isLoadingRef = useRef<boolean>(false);

  // Sync settings to Firebase
  const syncToFirebase = useCallback(async () => {
    if (!user || !db || !isConfigured || !enabled) return;

    setSyncing(true);
    try {
      await setDoc(
        doc(db, `users/${user.uid}/settings/app`),
        {
          ...localSettings,
          updatedAt: Timestamp.now(),
        },
        { merge: true }
      );
      setLastSync(new Date());
    } catch (error) {
      console.error('Error syncing settings to Firebase:', error);
    } finally {
      setSyncing(false);
    }
  }, [user, isConfigured, localSettings, enabled]);

  // Load settings from Firebase
  const loadFromFirebase = useCallback(async () => {
    if (!user || !db || !isConfigured || !enabled) return;

    isLoadingRef.current = true;
    setSyncing(true);
    try {
      const settingsDoc = await getDoc(doc(db, `users/${user.uid}/settings/app`));
      if (settingsDoc.exists()) {
        const firebaseSettings = settingsDoc.data() as AppSettings;
        // Remove Firebase metadata
        const { updatedAt, ...cleanSettings } = firebaseSettings as any;
        
        // Update ref to track loaded settings
        prevSettingsRef.current = JSON.stringify(cleanSettings);
        
        setLocalSettings(cleanSettings as AppSettings);
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Error loading settings from Firebase:', error);
    } finally {
      setSyncing(false);
      isLoadingRef.current = false;
    }
  }, [user, isConfigured, setLocalSettings, enabled]);

  // Real-time sync listener
  useEffect(() => {
    if (!user || !db || !isConfigured || !enabled) return;

    const unsubscribe = onSnapshot(
      doc(db, `users/${user.uid}/settings/app`),
      (doc) => {
        if (doc.exists()) {
          const firebaseSettings = doc.data() as AppSettings;
          const { updatedAt, ...cleanSettings } = firebaseSettings as any;
          
          const newSettingsStr = JSON.stringify(cleanSettings);
          
          // Only update if different and not during loading
          if (!isLoadingRef.current && newSettingsStr !== prevSettingsRef.current) {
            prevSettingsRef.current = newSettingsStr;
            setLocalSettings(cleanSettings as AppSettings);
            setLastSync(new Date());
          }
        }
      },
      (error) => {
        console.error('Error in settings snapshot listener:', error);
        
        // Stop retrying on permission errors
        if (error.code === 'permission-denied') {
          console.error('❌ Permission denied - check Firebase security rules');
        }
      }
    );

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isConfigured, enabled]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user && isConfigured && !lastSync && enabled) {
      loadFromFirebase();
    }
  }, [user, isConfigured, lastSync, loadFromFirebase, enabled]);

  // Sync when settings actually change (not on timer)
  useEffect(() => {
    if (!user || !isConfigured || !lastSync || !enabled || isLoadingRef.current) return;
    
    const currentSettingsStr = JSON.stringify(localSettings);
    
    // Only sync if settings have actually changed
    if (currentSettingsStr !== prevSettingsRef.current) {
      prevSettingsRef.current = currentSettingsStr;
      syncToFirebase();
    }
  }, [user, isConfigured, localSettings, lastSync, syncToFirebase, enabled]);

  return { syncing, lastSync, syncToFirebase, loadFromFirebase };
}
