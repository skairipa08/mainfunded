'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CorporateUser {
    id: string;
    companyName: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    tier: 'starter' | 'growth' | 'enterprise' | 'pending';
    createdAt: string;
}

interface CorporateAuthContextType {
    user: CorporateUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

export interface RegisterData {
    companyName: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    password: string;
    tier?: 'starter' | 'growth' | 'enterprise' | 'pending';
}

const CORPORATE_AUTH_KEY = 'funded-corporate-auth';
const CORPORATE_USERS_KEY = 'funded-corporate-users';

const CorporateAuthContext = createContext<CorporateAuthContextType | undefined>(undefined);

// Helper to generate a simple ID
function generateId(): string {
    return 'corp_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function CorporateAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<CorporateUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        try {
            const saved = localStorage.getItem(CORPORATE_AUTH_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setUser(parsed);
            }
        } catch {
            // Invalid data
            localStorage.removeItem(CORPORATE_AUTH_KEY);
        }
        setIsLoading(false);
    }, []);

    const getUsers = (): Array<CorporateUser & { password: string }> => {
        try {
            const saved = localStorage.getItem(CORPORATE_USERS_KEY);
            if (saved) return JSON.parse(saved);
        } catch { }
        // Default demo user
        return [{
            id: 'corp_demo',
            companyName: 'TechVentures A.Ş.',
            email: 'admin@techventures.com',
            firstName: 'Ahmet',
            lastName: 'Yılmaz',
            phone: '+90 555 123 4567',
            tier: 'enterprise',
            password: 'demo123',
            createdAt: new Date().toISOString(),
        }];
    };

    const saveUsers = (users: Array<CorporateUser & { password: string }>) => {
        localStorage.setItem(CORPORATE_USERS_KEY, JSON.stringify(users));
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        const users = getUsers();
        const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

        if (!found) {
            return { success: false, error: 'E-posta veya şifre hatalı.' };
        }

        const { password: _, ...userData } = found;
        setUser(userData);
        localStorage.setItem(CORPORATE_AUTH_KEY, JSON.stringify(userData));
        return { success: true };
    };

    const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
        const users = getUsers();
        const exists = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());

        if (exists) {
            return { success: false, error: 'Bu e-posta adresi zaten kayıtlı.' };
        }

        const newUser = {
            id: generateId(),
            companyName: data.companyName,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            tier: data.tier || 'pending' as const,
            password: data.password,
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsers(users);

        const { password: _, ...userData } = newUser;
        setUser(userData);
        localStorage.setItem(CORPORATE_AUTH_KEY, JSON.stringify(userData));
        return { success: true };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(CORPORATE_AUTH_KEY);
    };

    return (
        <CorporateAuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </CorporateAuthContext.Provider>
    );
}

export function useCorporateAuth() {
    const context = useContext(CorporateAuthContext);
    if (!context) {
        throw new Error('useCorporateAuth must be used within CorporateAuthProvider');
    }
    return context;
}
