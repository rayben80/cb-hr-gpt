import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDUZHqCjFmiKWD2uAyaq98Kpd0p7Rf3hL0',
    authDomain: 'cb-hr-4b503.firebaseapp.com',
    projectId: 'cb-hr-4b503',
    storageBucket: 'cb-hr-4b503.firebasestorage.app',
    messagingSenderId: '689009846095',
    appId: '1:689009846095:web:9bc812ebeea291a9f9473a',
    measurementId: 'G-2R3N9GDCK6',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
