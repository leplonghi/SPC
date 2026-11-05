import { initializeApp } from "firebase/app";
import { getFirestore, setLogLevel } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

export type AppEnvironment = "development" | "homologation" | "production";

export const APP_ENV: AppEnvironment =
    (import.meta.env.VITE_APP_ENV as AppEnvironment) ||
    (import.meta.env.DEV ? "development" : "homologation");

/**
 * Configuração do Firebase Web SDK parametrizada por ambiente.
 * No ambiente de homologação, utiliza exclusivamente o projeto isolado
 * `spc-maranhao-homologacao` (configurado via variáveis VITE_FIREBASE_* em .env.local ou CI),
 * preservando o projeto original `spc-maranhao-2025-v1` intacto.
 */
const defaultProjectId = APP_ENV === "production" ? "spc-maranhao-2025-v1" : "spc-maranhao-homologacao";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-homologacao-key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${defaultProjectId}.firebaseapp.com`,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultProjectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${defaultProjectId}.firebasestorage.app`,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
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
