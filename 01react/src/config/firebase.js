import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAmjDj53XNB8zHSc6qOzlH2eMPJS9F9EcU",
  authDomain: "zpin-e-commerce-9ab55.firebaseapp.com",
  projectId: "zpin-e-commerce-9ab55",
  storageBucket: "zpin-e-commerce-9ab55.firebasestorage.app",
  messagingSenderId: "19891056241",
  appId: "1:19891056241:web:3b2a7a45af843c9ff9b5d0",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
