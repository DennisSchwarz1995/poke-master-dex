import { Injectable, signal, computed, inject } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  
  // Reactive state with Signals
  user = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.user());
  
  constructor() {
    // Subscribe to Firebase auth state changes
    authState(this.auth).subscribe(user => {
      this.user.set(user);
    });
  }
  
  /**
   * Sign in with Google OAuth popup
   */
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(this.auth, provider);
  }
  
  /**
   * Sign out current user
   */
  async signOut(): Promise<void> {
    return signOut(this.auth);
  }
  
  /**
   * Get auth state as Observable (for guards)
   */
  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }
}
