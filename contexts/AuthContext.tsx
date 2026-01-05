import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User as FirebaseUser,
    signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { User, UserRole } from '../types';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    isEditor: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setLoading(true);
            if (firebaseUser) {
                try {
                    // Fetch user record for role from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            id: firebaseUser.uid,
                            name: userData.name || firebaseUser.displayName || firebaseUser.email || 'Usuário SPC',
                            role: userData.role as UserRole,
                            department: userData.department
                        });
                    } else {
                        // If user exists in Auth but not in Firestore, default to Viewer
                        // In a real scenario, we might want to create the record or restriction
                        setUser({
                            id: firebaseUser.uid,
                            name: firebaseUser.displayName || firebaseUser.email || 'Usuário SPC',
                            role: UserRole.VIEWER
                        });
                    }
                } catch (error) {
                    console.error("Erro ao buscar perfil do usuário:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const logout = async () => {
        await firebaseSignOut(auth);
    };

    const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN_SPC;
    const isEditor = isAdmin || (user?.role && [
        UserRole.EDITOR_DPE,
        UserRole.EDITOR_DPHAP,
        UserRole.EDITOR_DPI
    ].includes(user.role));

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin, isEditor, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};
