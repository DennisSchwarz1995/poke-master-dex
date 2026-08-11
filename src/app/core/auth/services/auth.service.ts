import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

const EMAIL_LINK_KEY = 'emailForSignIn';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);

  user = signal<User | null>(null);
  isAuthenticated = computed(() => !!this.user());
  needsDisplayName = computed(() => {
    const u = this.user();
    return u ? !u.displayName : false;
  });

  constructor() {
    authState(this.auth).subscribe((user) => {
      this.user.set(user);
    });
  }

  async signInWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    return signInWithPopup(this.auth, provider);
  }

  async signInWithGitHub(): Promise<UserCredential> {
    const provider = new GithubAuthProvider();
    return signInWithPopup(this.auth, provider);
  }

  async sendSignInLink(email: string): Promise<void> {
    const actionCodeSettings = {
      url: window.location.origin + '/auth/email-callback',
      handleCodeInApp: true,
    };
    await sendSignInLinkToEmail(this.auth, email, actionCodeSettings);
    window.localStorage.setItem(EMAIL_LINK_KEY, email);
  }

  isEmailSignInLink(url: string): boolean {
    return isSignInWithEmailLink(this.auth, url);
  }

  async completeSignInWithLink(email: string, link: string): Promise<UserCredential> {
    const result = await signInWithEmailLink(this.auth, email, link);
    window.localStorage.removeItem(EMAIL_LINK_KEY);
    return result;
  }

  getStoredEmail(): string | null {
    return window.localStorage.getItem(EMAIL_LINK_KEY);
  }

  async updateDisplayName(name: string): Promise<void> {
    const currentUser = this.auth.currentUser;
    if (currentUser) {
      await updateProfile(currentUser, { displayName: name });
      // Re-emit the updated user to refresh signals
      this.user.set({ ...currentUser } as User);
    }
  }

  async signOut(): Promise<void> {
    return signOut(this.auth);
  }

  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }
}
