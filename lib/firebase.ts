import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyDX1T3pTbIeupsZ9YB0T3Ac5Ink0cFkpoY",
  authDomain: "teconnectivity-8350e.firebaseapp.com",
  projectId: "teconnectivity-8350e",
  storageBucket: "teconnectivity-8350e.firebasestorage.app",
  messagingSenderId: "892548761903",
  appId: "1:892548761903:web:8d445565df8c299eabb9da",
  // We don't need measurementId for auth and Firestore
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { auth, db }

