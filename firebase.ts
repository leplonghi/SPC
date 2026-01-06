import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyDLsZlYVXTlG0llKBp3vurlZ2RsT_SZMUg",
    authDomain: "spc-maranhao-2025-v1.firebaseapp.com",
    projectId: "spc-maranhao-2025-v1",
    storageBucket: "spc-maranhao-2025-v1.firebasestorage.app",
    messagingSenderId: "242428282674",
    appId: "1:242428282674:web:5cd60d70a02f13bccbb92b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    setLogLevel("debug");
}
// const analytics = getAnalytics(app);

export default app;

