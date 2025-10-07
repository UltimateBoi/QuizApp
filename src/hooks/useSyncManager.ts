'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';
import { SyncAction } from '@/components/SyncDialog';

interface SyncData {
  quizzes: any[];
  sessions: any[];
  flashcards: any[];
  settings: any;
}

interface UseSyncManagerProps {
  localQuizzes: any[];
  localSessions: any[];
  localFlashcards: any[];
  localSettings: any;
  setLocalQuizzes: (data: any[]) => void;
  setLocalSessions: (data: any[]) => void;
  setLocalFlashcards: (data: any[]) => void;
  setLocalSettings: (data: any) => void;
}

export function useSyncManager({
  localQuizzes,
  localSessions,
  localFlashcards,
  localSettings,
  setLocalQuizzes,
  setLocalSessions,
  setLocalFlashcards,
  setLocalSettings,
}: UseSyncManagerProps) {
  const { user, isConfigured } = useAuth();
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [hasCloudData, setHasCloudData] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);

  // Check if user has local data
  const hasLocalData = useCallback(() => {
    return (
      localQuizzes.filter(q => !q.isDefault).length > 0 ||
      localSessions.length > 0 ||
      localFlashcards.length > 0 ||
      JSON.stringify(localSettings) !== JSON.stringify({})
    );
  }, [localQuizzes, localSessions, localFlashcards, localSettings]);

  // Check if cloud data exists
  const checkCloudDataExists = useCallback(async (): Promise<boolean> => {
    if (!user || !db) return false;

    try {
      const collections = ['quizzes', 'sessions', 'flashcards'];
      
      for (const collectionName of collections) {
        const collectionRef = collection(db, `users/${user.uid}/${collectionName}`);
        const snapshot = await getDocs(collectionRef);
        if (!snapshot.empty) {
          return true;
        }
      }
      
      // Check settings
      const settingsDoc = await getDoc(doc(db, `users/${user.uid}/settings/app`));
      if (settingsDoc.exists()) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking cloud data:', error);
      return false;
    }
  }, [user]);

  // Check user sync status on login
  useEffect(() => {
    const checkSyncStatus = async () => {
      if (!user || !db || !isConfigured || syncComplete) return;

      try {
        // Check if user metadata exists
        const userDocRef = doc(db, `users/${user.uid}`);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // New user
          setIsNewUser(true);
          setHasCloudData(false);
          
          // Show dialog if has local data or just mark as complete
          if (hasLocalData()) {
            setShowSyncDialog(true);
          } else {
            // Create user metadata
            await setDoc(userDocRef, {
              createdAt: Timestamp.now(),
              lastSync: Timestamp.now(),
            });
            setSyncComplete(true);
          }
        } else {
          // Returning user - check if cloud data exists
          setIsNewUser(false);
          
          const hasData = await checkCloudDataExists();
          setHasCloudData(hasData);
          
          if (hasData || hasLocalData()) {
            setShowSyncDialog(true);
          } else {
            setSyncComplete(true);
          }
        }
      } catch (error) {
        console.error('Error checking sync status:', error);
        setSyncComplete(true); // Continue anyway
      }
    };

    checkSyncStatus();
  }, [user, isConfigured, syncComplete, hasLocalData, checkCloudDataExists]);

  // Upload local data to Firebase
  const uploadToCloud = async () => {
    if (!user) {
      console.error('Cannot sync: User not authenticated');
      throw new Error('User must be signed in to sync data');
    }
    
    if (!db || !isConfigured) {
      console.error('Cannot sync: Firebase not configured');
      throw new Error('Firebase not configured');
    }

    console.log('Syncing for user:', user.uid);

    setSyncing(true);
    try {
      const batch = writeBatch(db);

      // Upload quizzes (excluding default)
      const customQuizzes = localQuizzes.filter(q => !q.isDefault);
      for (const quiz of customQuizzes) {
        const quizRef = doc(db, `users/${user.uid}/quizzes/${quiz.id}`);
        batch.set(quizRef, { ...quiz, updatedAt: Timestamp.now() });
      }

      // Upload sessions
      for (const session of localSessions) {
        const sessionRef = doc(db, `users/${user.uid}/sessions/${session.id}`);
        batch.set(sessionRef, { ...session, updatedAt: Timestamp.now() });
      }

      // Upload flashcards
      for (const deck of localFlashcards) {
        const deckRef = doc(db, `users/${user.uid}/flashcards/${deck.id}`);
        batch.set(deckRef, { ...deck, updatedAt: Timestamp.now() });
      }

      await batch.commit();

      // Upload settings separately
      if (localSettings && Object.keys(localSettings).length > 0) {
        await setDoc(doc(db, `users/${user.uid}/settings/app`), {
          ...localSettings,
          updatedAt: Timestamp.now(),
        });
      }

      // Update user metadata
      await setDoc(doc(db, `users/${user.uid}`), {
        lastSync: Timestamp.now(),
        createdAt: Timestamp.now(),
      }, { merge: true });

    } catch (error) {
      console.error('Error uploading to cloud:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Download cloud data
  const downloadFromCloud = async () => {
    if (!user) {
      console.error('Cannot sync: User not authenticated');
      throw new Error('User must be signed in to sync data');
    }
    
    if (!db || !isConfigured) {
      console.error('Cannot sync: Firebase not configured');
      throw new Error('Firebase not configured');
    }

    console.log('Syncing for user:', user.uid);

    setSyncing(true);
    try {
      const cloudData: SyncData = {
        quizzes: [],
        sessions: [],
        flashcards: [],
        settings: {},
      };

      // Download quizzes
      const quizzesSnapshot = await getDocs(collection(db, `users/${user.uid}/quizzes`));
      quizzesSnapshot.forEach((doc) => {
        cloudData.quizzes.push({ ...doc.data(), id: doc.id });
      });

      // Download sessions
      const sessionsSnapshot = await getDocs(collection(db, `users/${user.uid}/sessions`));
      sessionsSnapshot.forEach((doc) => {
        cloudData.sessions.push({ ...doc.data(), id: doc.id });
      });

      // Download flashcards
      const flashcardsSnapshot = await getDocs(collection(db, `users/${user.uid}/flashcards`));
      flashcardsSnapshot.forEach((doc) => {
        cloudData.flashcards.push({ ...doc.data(), id: doc.id });
      });

      // Download settings
      const settingsDoc = await getDoc(doc(db, `users/${user.uid}/settings/app`));
      if (settingsDoc.exists()) {
        cloudData.settings = settingsDoc.data();
      }

      // Update local data
      const defaultQuiz = localQuizzes.find(q => q.isDefault);
      setLocalQuizzes(defaultQuiz ? [defaultQuiz, ...cloudData.quizzes] : cloudData.quizzes);
      setLocalSessions(cloudData.sessions);
      setLocalFlashcards(cloudData.flashcards);
      if (Object.keys(cloudData.settings).length > 0) {
        setLocalSettings(cloudData.settings);
      }

    } catch (error) {
      console.error('Error downloading from cloud:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Merge local and cloud data
  const mergeData = async () => {
    if (!user) {
      console.error('Cannot sync: User not authenticated');
      throw new Error('User must be signed in to sync data');
    }
    
    if (!db || !isConfigured) {
      console.error('Cannot sync: Firebase not configured');
      throw new Error('Firebase not configured');
    }

    console.log('Syncing for user:', user.uid);

    setSyncing(true);
    try {
      const cloudData: SyncData = {
        quizzes: [],
        sessions: [],
        flashcards: [],
        settings: {},
      };

      // Download cloud data
      const quizzesSnapshot = await getDocs(collection(db, `users/${user.uid}/quizzes`));
      quizzesSnapshot.forEach((doc) => {
        cloudData.quizzes.push({ ...doc.data(), id: doc.id });
      });

      const sessionsSnapshot = await getDocs(collection(db, `users/${user.uid}/sessions`));
      sessionsSnapshot.forEach((doc) => {
        cloudData.sessions.push({ ...doc.data(), id: doc.id });
      });

      const flashcardsSnapshot = await getDocs(collection(db, `users/${user.uid}/flashcards`));
      flashcardsSnapshot.forEach((doc) => {
        cloudData.flashcards.push({ ...doc.data(), id: doc.id });
      });

      const settingsDoc = await getDoc(doc(db, `users/${user.uid}/settings/app`));
      if (settingsDoc.exists()) {
        cloudData.settings = settingsDoc.data();
      }

      // Merge quizzes (excluding default)
      const localCustomQuizzes = localQuizzes.filter(q => !q.isDefault);
      const quizMap = new Map(cloudData.quizzes.map(q => [q.id, q]));
      localCustomQuizzes.forEach(q => {
        if (!quizMap.has(q.id)) {
          quizMap.set(q.id, q);
        }
      });
      const mergedQuizzes = Array.from(quizMap.values());

      // Merge sessions
      const sessionMap = new Map(cloudData.sessions.map(s => [s.id, s]));
      localSessions.forEach(s => {
        if (!sessionMap.has(s.id)) {
          sessionMap.set(s.id, s);
        }
      });
      const mergedSessions = Array.from(sessionMap.values());

      // Merge flashcards
      const flashcardMap = new Map(cloudData.flashcards.map(f => [f.id, f]));
      localFlashcards.forEach(f => {
        if (!flashcardMap.has(f.id)) {
          flashcardMap.set(f.id, f);
        }
      });
      const mergedFlashcards = Array.from(flashcardMap.values());

      // Merge settings (local takes precedence if set)
      const mergedSettings = { ...cloudData.settings, ...localSettings };

      // Upload merged data back to cloud
      const batch = writeBatch(db);

      for (const quiz of mergedQuizzes) {
        const quizRef = doc(db, `users/${user.uid}/quizzes/${quiz.id}`);
        batch.set(quizRef, { ...quiz, updatedAt: Timestamp.now() });
      }

      for (const session of mergedSessions) {
        const sessionRef = doc(db, `users/${user.uid}/sessions/${session.id}`);
        batch.set(sessionRef, { ...session, updatedAt: Timestamp.now() });
      }

      for (const deck of mergedFlashcards) {
        const deckRef = doc(db, `users/${user.uid}/flashcards/${deck.id}`);
        batch.set(deckRef, { ...deck, updatedAt: Timestamp.now() });
      }

      await batch.commit();

      // Upload merged settings
      if (Object.keys(mergedSettings).length > 0) {
        await setDoc(doc(db, `users/${user.uid}/settings/app`), {
          ...mergedSettings,
          updatedAt: Timestamp.now(),
        });
      }

      // Update local data
      const defaultQuiz = localQuizzes.find(q => q.isDefault);
      setLocalQuizzes(defaultQuiz ? [defaultQuiz, ...mergedQuizzes] : mergedQuizzes);
      setLocalSessions(mergedSessions);
      setLocalFlashcards(mergedFlashcards);
      setLocalSettings(mergedSettings);

      // Update user metadata
      await setDoc(doc(db, `users/${user.uid}`), {
        lastSync: Timestamp.now(),
      }, { merge: true });

    } catch (error) {
      console.error('Error merging data:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  // Handle sync action
  const handleSyncAction = async (action: SyncAction) => {
    try {
      if (action === 'cancel') {
        // User skipped sync
        if (isNewUser && user && db) {
          // Still create user metadata for new users
          await setDoc(doc(db, `users/${user.uid}`), {
            createdAt: Timestamp.now(),
            lastSync: Timestamp.now(),
          });
        }
        setShowSyncDialog(false);
        setSyncComplete(true);
        return;
      }

      if (action === 'upload') {
        await uploadToCloud();
      } else if (action === 'download') {
        await downloadFromCloud();
      } else if (action === 'merge') {
        await mergeData();
      }

      setShowSyncDialog(false);
      setSyncComplete(true);
    } catch (error: any) {
      console.error('Sync action failed:', error);
      
      if (error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        alert('Sync failed: Please disable your ad blocker for this site and try again. Common ad blockers: uBlock Origin, AdBlock Plus, Brave Shield');
      } else if (error.code === 'permission-denied') {
        alert('Please sign in to sync your data.');
      } else {
        alert('Sync failed: ' + (error.message || 'Unknown error'));
      }
    }
  };

  return {
    showSyncDialog,
    isNewUser,
    hasLocalData: hasLocalData(),
    hasCloudData,
    syncing,
    syncComplete,
    handleSyncAction,
  };
}
