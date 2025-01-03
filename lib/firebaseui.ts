import { auth } from './firebase';
import { GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import * as firebaseui from 'firebaseui';

// Initialize the FirebaseUI Widget using Firebase Auth
const ui = new firebaseui.auth.AuthUI(auth);

const uiConfig = {
  signInOptions: [
    // Add your sign-in providers here
    GoogleAuthProvider.PROVIDER_ID,
    EmailAuthProvider.PROVIDER_ID,
  ],
  signInSuccessUrl: '/dashboard', // Redirect URL after successful sign-in
  signInFlow: 'popup', // Use popup instead of redirect
};

export { ui, uiConfig };
