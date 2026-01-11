'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to avoid build-time errors
let supabaseInstance: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
    if (typeof window === 'undefined') {
        return null; // Don't create client on server/build
    }

    if (!supabaseInstance) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseAnonKey) {
            console.warn('Supabase environment variables not set');
            return null;
        }

        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }

    return supabaseInstance;
}

interface User {
    id: string;
    email: string;
    name: string | null;
    plan: 'FREE' | 'PAID';
    hasApiKeys: {
        apifyApiToken: boolean;
        geminiApiKey: boolean;
        atlasCloudApiKey: boolean;
    };
}

interface AuthContextType {
    user: User | null;
    supabaseUser: SupabaseUser | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    getAccessToken: () => Promise<string | null>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const fetchUserProfile = async (accessToken: string) => {
        try {
            const response = await fetch(`${apiUrl}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            setUser(null);
        }
    };

    useEffect(() => {
        const supabase = getSupabase();

        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSupabaseUser(session?.user ?? null);
            if (session?.access_token) {
                fetchUserProfile(session.access_token);
            }
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setSupabaseUser(session?.user ?? null);
                if (session?.access_token) {
                    await fetchUserProfile(session.access_token);
                } else {
                    setUser(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error ? new Error(error.message) : null };
    };

    const signUp = async (email: string, password: string, name?: string) => {
        const supabase = getSupabase();
        if (!supabase) {
            return { error: new Error('Supabase not configured') };
        }

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: name },
            },
        });
        return { error: error ? new Error(error.message) : null };
    };

    const signOut = async () => {
        const supabase = getSupabase();
        if (supabase) {
            await supabase.auth.signOut();
        }
        setUser(null);
        setSupabaseUser(null);
    };

    const getAccessToken = async () => {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data: { session } } = await supabase.auth.getSession();
        return session?.access_token ?? null;
    };

    const refreshUser = async () => {
        const token = await getAccessToken();
        if (token) {
            await fetchUserProfile(token);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                supabaseUser,
                loading,
                signIn,
                signUp,
                signOut,
                getAccessToken,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export { getSupabase as supabase };

