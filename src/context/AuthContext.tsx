import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User;
  switchRole: (role: UserRole) => Promise<void>;
  switchUser: (user: User) => void;
  allDemoUsers: User[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isOrganizer: boolean;
  isLoading: boolean;
}

const defaultUser: User = {
  id: 'usr_devotee',
  email: 'devotee@annsetu.in',
  name: 'Pooja Sharma',
  role: 'USER',
  city: 'Delhi NCR',
  createdAt: '2026-03-10T00:00:00.000Z'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(defaultUser);
  const [allDemoUsers, setAllDemoUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAuth() {
      try {
        const users = await api.getAllUsers();
        setAllDemoUsers(users);

        const savedId = localStorage.getItem('annsetu_user_id');
        if (savedId) {
          const matched = users.find(u => u.id === savedId);
          if (matched) {
            setUser(matched);
            api.setUserContext(matched);
            setIsLoading(false);
            return;
          }
        }

        const me = await api.getCurrentUser();
        setUser(me);
        api.setUserContext(me);
      } catch (err) {
        console.error('Failed to load user state:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAuth();
  }, []);

  const switchRole = async (newRole: UserRole) => {
    try {
      const updated = await api.switchRole(newRole, user.id);
      setUser(updated);
      api.setUserContext(updated);
    } catch (err) {
      console.error('Failed to switch role:', err);
    }
  };

  const switchUser = (selectedUser: User) => {
    setUser(selectedUser);
    api.setUserContext(selectedUser);
  };

  const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
  const isSuperAdmin = user.role === 'SUPER_ADMIN';
  const isOrganizer = user.role === 'ORGANIZER' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        switchRole,
        switchUser,
        allDemoUsers,
        isAdmin,
        isSuperAdmin,
        isOrganizer,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
