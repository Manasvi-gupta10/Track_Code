import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyDLKGOJT00KrFRYnHbn_BDl4hVvDFdaSvc',
  authDomain: 'track-code-a75f0.firebaseapp.com',
  projectId: 'track-code-a75f0',
  storageBucket: 'track-code-a75f0.firebasestorage.app',
  messagingSenderId: '985299003437',
  appId: '1:985299003437:web:557699686f2148843d70a4',
  measurementId: 'G-FC8M8DP5N9',
}

const app = initializeApp(firebaseConfig)
export const analytics = getAnalytics(app)
export const auth = getAuth(app)
