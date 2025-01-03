// import { initializeApp, getApp, getApps } from 'firebase/app';
import { initializeApp} from 'firebase/app';

import { getAuth } from 'firebase/auth';

import { GoogleAuthProvider } from 'firebase/auth';
export const googleProvider = new GoogleAuthProvider();
// const firebaseConfig = {
//   // apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   // authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   // projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   // messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   // appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };


const firebaseConfig = {
  apiKey: "AIzaSyC8d2avSxxmDEenKDPAQixDsn_vwTdwOxE",
  authDomain: "influx-18581.firebaseapp.com",
  projectId: "influx-18581",
  storageBucket: "influx-18581.firebasestorage.app",
  messagingSenderId: "564106467962",
  appId: "1:564106467962:web:bd7ec2cc690a3a9d2039c3",
  measurementId: "G-LD3YFW2MK7"
};
// Initialize Firebase
// const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };
