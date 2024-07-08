"use client"; // Add this line at the top

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import '../app/globals.css';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export default function RootLayout({ children }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [factionName, setFactionName] = useState('');
  const [factionRespect, setFactionRespect] = useState('');

  useEffect(() => {
    const apiKey = Cookies.get('apiKey');
    if (apiKey) {
      setIsLoggedIn(true);
      setFactionName(Cookies.get('factionName') || '');
      setFactionRespect(Cookies.get('factionRespect') || '');
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    Cookies.remove('apiKey');
    Cookies.remove('factionName');
    Cookies.remove('factionRespect');
    setIsLoggedIn(false);
    router.push('/login');
  };

  const authContextValue = {
    isLoggedIn,
    setIsLoggedIn,
    setFactionName,
    setFactionRespect,
    handleLogout
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      <html lang="en">
        <body>
          {isLoggedIn ? (
            <>
              <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Link href="/home" className="hover:text-gray-400">Home</Link>
                  <Link href="/members" className="hover:text-gray-400">Members</Link>
                  <Link href="/chain-reports" className="hover:text-gray-400">Chain Reports</Link>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="font-bold">{factionName}</span>
                  <span>({factionRespect} respect)</span>
                </div>
                <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
                  Logout
                </button>
              </header>
              <main>{children}</main>
            </>
          ) : (
            <main>{children}</main>
          )}
        </body>
      </html>
    </AuthContext.Provider>
  );
}
