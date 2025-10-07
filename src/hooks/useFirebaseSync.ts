'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';

export function useFirebaseSync<T extends { id: string }>(
  collectionName: string,
  localData: T[],
  setLocalData: (data: T[]) => void,
  enabled: boolean = true
) {
  const { user, isConfigured } = useAuth();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Sync local data to Firebase when user is authenticated
  const syncToFirebase = useCallback(async () => {
    if (!user) {
      console.error('Cannot sync: User not authenticated');
      return;
    }

    if (!db || !isConfigured || localData.length === 0 || !enabled) return;

    setSyncing(true);
    try {
      const userCollectionRef = collection(db, `users/${user.uid}/${collectionName}`);
      
      // Upload all local data
      for (const item of localData) {
        await setDoc(doc(userCollectionRef, item.id), {
          ...item,
          updatedAt: Timestamp.now(),
        });
      }
      
      setLastSync(new Date());
    } catch (error) {
      console.error(`Error syncing ${collectionName} to Firebase:`, error);
    } finally {
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isConfigured, localData, collectionName, enabled]);

  // Load data from Firebase when user signs in
  const loadFromFirebase = useCallback(async () => {
    if (!user) {
      console.error('Cannot sync: User not authenticated');
      return;
    }

    if (!db || !isConfigured || !enabled) return;

    setSyncing(true);
    try {
      const userCollectionRef = collection(db, `users/${user.uid}/${collectionName}`);
      const querySnapshot = await getDocs(userCollectionRef);
      
      const firebaseData: T[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        firebaseData.push({
          ...data,
          id: doc.id,
        } as T);
      });

      // Merge with local data (Firebase data takes precedence)
      const localMap = new Map(localData.map(item => [item.id, item]));
      firebaseData.forEach(item => localMap.set(item.id, item));
      
      const mergedData = Array.from(localMap.values());
      setLocalData(mergedData);
      setLastSync(new Date());
    } catch (error) {
      console.error(`Error loading ${collectionName} from Firebase:`, error);
    } finally {
      setSyncing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isConfigured, collectionName, localData, setLocalData, enabled]);

  // Real-time sync listener
  useEffect(() => {
    if (!user || !db || !isConfigured || !enabled) return;

    const userCollectionRef = collection(db, `users/${user.uid}/${collectionName}`);
    const unsubscribe = onSnapshot(userCollectionRef, (snapshot) => {
      const firebaseData: T[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firebaseData.push({
          ...data,
          id: doc.id,
        } as T);
      });

      // Only update if data changed
      if (JSON.stringify(firebaseData) !== JSON.stringify(localData)) {
        setLocalData(firebaseData);
        setLastSync(new Date());
      }
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isConfigured, collectionName, enabled]);

  // Initial sync when user logs in
  useEffect(() => {
    if (user && isConfigured && !lastSync && enabled) {
      loadFromFirebase();
    }
  }, [user, isConfigured, lastSync, loadFromFirebase, enabled]);

  // Auto-sync when local data changes
  useEffect(() => {
    if (user && isConfigured && localData.length > 0 && lastSync && enabled) {
      const timeoutId = setTimeout(() => {
        syncToFirebase();
      }, 2000); // Debounce syncing

      return () => clearTimeout(timeoutId);
    }
  }, [user, isConfigured, localData, lastSync, syncToFirebase, enabled]);

  return { syncing, lastSync, syncToFirebase, loadFromFirebase };
}
