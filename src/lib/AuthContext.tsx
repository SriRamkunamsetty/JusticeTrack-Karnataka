import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role: string | null;
  setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, role: null, setRole: () => {} });

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // For demo, read role from local storage if existing, or set a default one
      if (firebaseUser) {
         const storedUser = localStorage.getItem('user');
         if (storedUser) {
           const parsed = JSON.parse(storedUser);
           setRole(parsed.role || 'Reviewing Officer');
         } else {
           setRole('Reviewing Officer'); // default
         }
      } else {
         setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, role, setRole }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
