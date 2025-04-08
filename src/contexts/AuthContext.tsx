import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase'; // Import your Firebase configuration
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';
import { AuthContextType, User } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = getCookie('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const userData = userCredential.user;

            // Assuming you have a Firestore instance
            const therapistRef = firestore.collection('/PhysioGames/SRF/Fisioterapeutas/').doc(userData.uid).collection('Therapist').doc(email);
            const therapistDoc = await therapistRef.get();

            if (therapistDoc.exists && therapistDoc.data()?.password === password) {
                const userInfo: User = {
                    email: therapistDoc.data()?.email,
                    name: therapistDoc.data()?.name,
                    // Add other user fields as necessary
                };
                setUser(userInfo);
                setCookie('user', JSON.stringify(userInfo), 30); // Set cookie for 30 days
            } else {
                throw new Error('Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = () => {
        auth.signOut();
        setUser(null);
        deleteCookie('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};