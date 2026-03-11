import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCulDa1c-f_vKIPgHSSr6Deht9ORHCgWx4",
  authDomain: "tiffmon-88345.firebaseapp.com",
  projectId: "tiffmon-88345",
  storageBucket: "tiffmon-88345.firebasestorage.app",
  messagingSenderId: "679818483001",
  appId: "1:679818483001:web:42052a59bb31a3506004e8"
};
console.log("Firebase projectId:", firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

console.log("Firebase app name:", app.name);
console.log("Firestore db object:", db);

export { auth, db, provider };