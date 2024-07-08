import React, { createContext, useState, useContext, useEffect } from 'react';

interface AuthContextType {
  apiKey: string | null;
  login: (key: string, factionName: string, factionRespect: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [factionName, setFactionName] = useState<string>('');
  const [factionRespect, setFactionRespect] = useState<string>('');

  useEffect(() => {
    const storedApiKey = localStorage.getItem('apiKey');
    const storedFactionName = localStorage.getItem('factionName');
    const storedFactionRespect = localStorage.getItem('factionRespect');
    if (storedApiKey) {
      setApiKey(storedApiKey);
      setFactionName(storedFactionName || '');
      setFactionRespect(storedFactionRespect || '');
    }
  }, []);

  const login = (key: string, factionName: string, factionRespect: string) => {
    localStorage.setItem('apiKey', key);
    localStorage.setItem('factionName', factionName);
    localStorage.setItem('factionRespect', factionRespect);
    setApiKey(key);
    setFactionName(factionName);
    setFactionRespect(factionRespect);
  };

  const logout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('factionName');
    localStorage.removeItem('factionRespect');
    setApiKey(null);
    setFactionName('');
    setFactionRespect('');
  };

  return (
    <AuthContext.Provider value={{ apiKey, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
