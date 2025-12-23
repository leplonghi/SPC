
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
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
// const analytics = getAnalytics(app);

export default app;
