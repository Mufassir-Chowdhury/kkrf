// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {

    apiKey: "AIzaSyBy8i9BLWzUMulNQJkJsbDX8m6MFYz6T_k",
    
    authDomain: "kkrf-sylhet.firebaseapp.com",
    
    projectId: "kkrf-sylhet",
    
    storageBucket: "kkrf-sylhet.appspot.com",
    
    messagingSenderId: "973839955936",
    
    appId: "1:973839955936:web:eefd07d1a4b7be73b91d85"
    
    };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);