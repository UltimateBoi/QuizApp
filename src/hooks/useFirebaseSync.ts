import { useEffect, useCallback } from 'react';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, isFirebaseConfigured } from '@/lib/firebase';

export const useFirebaseSync = () => {
  const [user, loading, error] = useAuthState(auth);
  
  const syncUserData = useCallback(async (userData: any) => {
    if (!user || !db || !isFirebaseConfigured) return;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ...userData,
        lastSynced: serverTimestamp(),
        uid: user.uid,
        email: user.email
      }, { merge: true });
    } catch (error) {
      console.error('Error syncing user ', error);
    }
  }, [user]);

  const syncQuizSession = useCallback(async (sessionData: any) => {
    if (!user || !db || !isFirebaseConfigured) return;
    
    try {
      const sessionsRef = collection(db, 'users', user.uid, 'quiz_sessions');
      await addDoc(sessionsRef, {
        ...sessionData,
        timestamp: serverTimestamp(),
        userId: user.uid
      });
    } catch (error) {
      console.error('Error syncing quiz session:', error);
    }
  }, [user]);

  const syncFlashcards = useCallback(async (flashcardsData: any[]) => {
    if (!user || !db || !isFirebaseConfigured) return;
    
    try {
      const flashcardsRef = doc(db, 'users', user.uid, 'flashcards', 'data');
      await setDoc(flashcardsRef, {
        flashcards: flashcardsData,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('Error syncing flashcards:', error);
    }
  }, [user]);

  return {
    user,
    loading,
    error,
    syncUserData,
    syncQuizSession,
    syncFlashcards,
    isFirebaseReady: isFirebaseConfigured && !loading
  };
};
