import { Injectable } from '@angular/core';
import {
  addDoc, collection, serverTimestamp,
  query, where, orderBy, limit, onSnapshot,
  doc, setDoc, increment
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FirebaseService } from '../core/firebase.service'; 

export interface GameEntry {
  uid: string;
  score: number;
  createdAt: any; // Firestore Timestamp
}

@Injectable({ providedIn: 'root' })
export class GameService {
  constructor(private fb: FirebaseService) {}


  async saveScoreAndAccumulate(score: number) {
    if (!this.fb.db) throw new Error('Firestore not available');
    const db  = this.fb.db;
    const uid = this.fb.uid;
    if (!uid) throw new Error('No user (not authenticated)');

    await addDoc(collection(db, 'games'), {
      uid,
      score,
      createdAt: serverTimestamp(),
    });

    const statsRef = doc(db, 'userStats', uid);
    await setDoc(
      statsRef,
      { totalScore: increment(score), updatedAt: serverTimestamp() },
      { merge: true }
    );
  }

  myRecentGames$(count = 10): Observable<GameEntry[]> {
    return new Observable(sub => {
      const db = this.fb.db, uid = this.fb.uid;
      if (!db || !uid) { sub.next([]); sub.complete(); return; }
      const q = query(
        collection(db, 'games'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      return onSnapshot(q,
        snap => sub.next(snap.docs.map(d => d.data() as GameEntry)),
        err  => sub.error(err)
      );
    });
  }

  userTotalScore$(): Observable<number> {
    return new Observable(sub => {
      const db = this.fb.db, uid = this.fb.uid;
      if (!db || !uid) { sub.next(0); sub.complete(); return; }
      const ref = doc(db, 'userStats', uid);
      return onSnapshot(ref,
        s   => sub.next(Number((s.data() as any)?.totalScore ?? 0)),
        err => sub.error(err)
      );
    });
  }
}
