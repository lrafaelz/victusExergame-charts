import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDLl_wQrSJRFzeYNLUSQEm8xOxmPKT2iA4',
  authDomain: 'victus-exergame.firebaseapp.com',
  databaseURL: 'https://victus-exergame-default-rtdb.firebaseio.com',
  projectId: 'victus-exergame',
  storageBucket: 'victus-exergame.appspot.com',
  messagingSenderId: '495418887892',
  appId: '1:495418887892:web:d84c5f2ceee988d273f541',
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const auth = getAuth();

export default getFirestore();
