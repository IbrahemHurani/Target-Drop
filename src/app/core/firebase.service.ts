import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth, Auth, onAuthStateChanged, User,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { firebaseConfig } from './firebase.config';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  app: FirebaseApp | null = null;
  auth: Auth | null = null;
  db:   Firestore | null = null;

  private _user$ = new BehaviorSubject<User | null>(null);
  readonly user$ = this._user$.asObservable();

  constructor() {
    if (this.isBrowser) {
      this.app  = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);
      this.auth = getAuth(this.app);
      this.db   = getFirestore(this.app);
      onAuthStateChanged(this.auth, (u) => this._user$.next(u));
    }
  }

  get uid(): string | null { return this._user$.value?.uid ?? null; }

  async signUp(email: string, password: string) {
    if (!this.auth) throw new Error('Auth not available on server');
    await createUserWithEmailAndPassword(this.auth, email, password);
  }
  async signIn(email: string, password: string) {
    if (!this.auth) throw new Error('Auth not available on server');
    await signInWithEmailAndPassword(this.auth, email, password);
  }
  async signOut() {
    if (!this.auth) return;
    await signOut(this.auth);
  }
}
