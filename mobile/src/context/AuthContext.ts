import React from 'react';

export interface AuthContextType {
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (fullName: string, username: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithBiometrics: () => Promise<void>;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);
