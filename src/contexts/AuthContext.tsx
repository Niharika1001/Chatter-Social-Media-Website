import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  fullName: string;
  profile?: UserProfile;
}

interface UserProfile {
  alternateEmail?: string;
  mobileNumber?: string;
  gender?: string;
  religion?: string;
  nationality?: string;
  citizenship?: string;
  qualification?: string;
  location?: string;
  address?: string;
  pinCode?: string;
  state?: string;
  country?: string;
}

interface CareerSuggestion {
  id: string;
  userId: string;
  level: string;
  interests: string[];
  strengths: string[];
  fears: string[];
  fieldOfStudy?: string;
  preferredJobType?: string;
  aiResponse: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, fullName: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: UserProfile) => void;
  addSuggestion: (suggestion: Omit<CareerSuggestion, 'id' | 'userId' | 'createdAt'>) => CareerSuggestion;
  getSuggestions: () => CareerSuggestion[];
  getLastSuggestion: () => CareerSuggestion | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on app start
    const savedUser = localStorage.getItem('careervice_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call
    const users = JSON.parse(localStorage.getItem('careervice_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('careervice_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const signup = async (email: string, password: string, fullName: string): Promise<boolean> => {
    // In a real app, this would make an API call
    const users = JSON.parse(localStorage.getItem('careervice_users') || '[]');
    
    // Check if user already exists
    if (users.some((u: any) => u.email === email)) {
      return false;
    }
    
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      fullName,
      profile: {}
    };
    
    users.push(newUser);
    localStorage.setItem('careervice_users', JSON.stringify(users));
    
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem('careervice_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('careervice_user');
  };

  const updateProfile = (profile: UserProfile) => {
    if (!user) return;
    
    const updatedUser = { ...user, profile: { ...user.profile, ...profile } };
    setUser(updatedUser);
    localStorage.setItem('careervice_user', JSON.stringify(updatedUser));
    
    // Update in users list
    const users = JSON.parse(localStorage.getItem('careervice_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], profile: updatedUser.profile };
      localStorage.setItem('careervice_users', JSON.stringify(users));
    }
  };

  const addSuggestion = (suggestionData: Omit<CareerSuggestion, 'id' | 'userId' | 'createdAt'>): CareerSuggestion => {
    if (!user) throw new Error('User not authenticated');
    
    const suggestion: CareerSuggestion = {
      ...suggestionData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    
    const suggestions = JSON.parse(localStorage.getItem('careervice_suggestions') || '[]');
    suggestions.unshift(suggestion);
    localStorage.setItem('careervice_suggestions', JSON.stringify(suggestions));
    
    return suggestion;
  };

  const getSuggestions = (): CareerSuggestion[] => {
    if (!user) return [];
    
    const suggestions = JSON.parse(localStorage.getItem('careervice_suggestions') || '[]');
    return suggestions.filter((s: CareerSuggestion) => s.userId === user.id);
  };

  const getLastSuggestion = (): CareerSuggestion | null => {
    const suggestions = getSuggestions();
    return suggestions.length > 0 ? suggestions[0] : null;
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    addSuggestion,
    getSuggestions,
    getLastSuggestion
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};