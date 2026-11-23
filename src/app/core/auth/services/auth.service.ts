import { Injectable, signal, computed, inject } from '@angular/core';
import {
  Auth,
  authState,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  deleteUser,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  updateProfile,
  User,
  UserCredential,
} from '@angular/fire/auth';
import { Observable, Subject } from 'rxjs';

const EMAIL_LINK_KEY = 'emailForSignIn';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private beforeSignOutSubject = new Subject<void>();
  readonly beforeSignOut$ = this.beforeSignOutSubject.asObservable();

  user = signal<User | null>(null);
  isDemoUser = signal<boolean>(false);
  isAuthenticated = computed(() => !!this.user());
  needsDisplayName = computed(() => {
    const u = this.user();
    return u ? !u.displayName : false;
  });

  constructor() {
    authState(this.auth).subscribe((user) => {
      this.user.set(user);
      this.isDemoUser.set(!!user?.isAnonymous);
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

  async signInAsDemo(): Promise<UserCredential> {
    const result = await signInAnonymously(this.auth);
    await updateProfile(result.user, { displayName: 'Demo Trainer' });
    this.isDemoUser.set(true);
    this.user.set({
      ...result.user,
      uid: result.user.uid,
      displayName: 'Demo Trainer',
      email: result.user.email,
      photoURL: result.user.photoURL,
      emailVerified: result.user.emailVerified,
      isAnonymous: true,
    } as User);
    return result;
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

  prepareSignOut(): void {
    this.beforeSignOutSubject.next();
  }

  async signOut(): Promise<void> {
    this.prepareSignOut();
    return signOut(this.auth);
  }

  async signOutAndCleanup(): Promise<void> {
    this.prepareSignOut();
    const currentUser = this.auth.currentUser;
    if (currentUser?.isAnonymous) {
      try {
        await deleteUser(currentUser);
      } catch {
        await signOut(this.auth);
      }
    } else {
      await signOut(this.auth);
    }
    this.isDemoUser.set(false);
  }

  getAuthState(): Observable<User | null> {
    return authState(this.auth);
  }
}
