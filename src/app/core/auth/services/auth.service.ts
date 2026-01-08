import { Injectable, signal, computed, inject } from '@angular/core';
import { Auth, authState, GoogleAuthProvider, signInWithPopup, signOut, User, UserCredential } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  
  user = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.user());
  
  constructor() {
    authState(this.auth).subscribe(user => {
      this.user.set(user);
    });
  }
  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(this.auth, provider);
  }
  
  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }
}
