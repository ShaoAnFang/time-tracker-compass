
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { toast } from '@/components/ui/sonner';

// Mock users for demo
const MOCK_USERS = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin' as UserRole
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    password: 'user123',
    role: 'user' as UserRole
  },
  {
    id: '3',
    username: 'user2',
    email: 'user2@example.com',
    password: 'user123',
    role: 'user' as UserRole
  }
];

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // For demo, we're using a synchronous check against mock data
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      const { password, ...userWithoutPassword } = user;
      setCurrentUser(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      toast.success(`Welcome back, ${userWithoutPassword.username}!`);
      return true;
    } else {
      toast.error('Invalid email or password');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      toast.error('User with this email already exists');
      return false;
    }

    // Create new user
    const newUser = {
      id: (MOCK_USERS.length + 1).toString(),
      username,
      email,
      password,
      role: 'user' as UserRole
    };

    MOCK_USERS.push(newUser);
    
    const { password: _, ...userWithoutPassword } = newUser;
    setCurrentUser(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    toast.success('Registration successful!');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    toast.info('You have been logged out');
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout, isAdmin }}>
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
