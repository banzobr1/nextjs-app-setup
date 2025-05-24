import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA6hr7fBAQr7UKKbw506C3l3h6SpFvtqa0",
  authDomain: "academus-q0kxb.firebaseapp.com",
  projectId: "academus-q0kxb",
  storageBucket: "academus-q0kxb.firebasestorage.app",
  messagingSenderId: "35580383165",
  appId: "1:35580383165:web:a191429716e03df93dccd4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
export const auth = getAuth(app);
export default app;
