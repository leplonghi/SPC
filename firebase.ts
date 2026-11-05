import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export type AppEnvironment = "development" | "homologation" | "production";

export const APP_ENV: AppEnvironment =
    (import.meta.env.VITE_APP_ENV as AppEnvironment) ||
    (import.meta.env.DEV ? "development" : "homologation");

/**
 * Configuração pública do Firebase Web SDK.
 * Os valores podem ser sobrescritos por variáveis de ambiente VITE_FIREBASE_*
 * para separar projetos de desenvolvimento, homologação e produção institucional.
 * A apiKey do Web SDK identifica o projeto Firebase no cliente; a segurança efetiva
 * depende exclusivamente das regras em firestore.rules, storage.rules e restrições de domínio no GCP.
 */
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDLsZlYVXTlG0llKBp3vurlZ2RsT_SZMUg",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "spc-maranhao-2025-v1.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "spc-maranhao-2025-v1",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "spc-maranhao-2025-v1.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "242428282674",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:242428282674:web:5cd60d70a02f13bccbb92b"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

if (
    typeof window !== "undefined" &&
    APP_ENV === "development" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")
) {
    setLogLevel("debug");
}

export default app;
