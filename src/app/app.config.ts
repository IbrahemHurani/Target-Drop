import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideClientHydration(withEventReplay()), provideFirebaseApp(() => initializeApp({ projectId: "target-drop-87b57", appId: "1:198439537495:web:1242f5216bcaea0d974c12", storageBucket: "target-drop-87b57.firebasestorage.app", apiKey: "AIzaSyDE7sBtCOEquXdSB8JGxQrUQDqEkWIlBqM", authDomain: "target-drop-87b57.firebaseapp.com", messagingSenderId: "198439537495" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};
