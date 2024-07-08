"use client"; // Add this line at the top

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuth } from '../layout';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { setIsLoggedIn, setFactionName, setFactionRespect } = useAuth();

  const handleLogin = async () => {
    try {
      const response = await fetch(`https://api.torn.com/faction/?key=${apiKey}&selections=basic`);
      const data = await response.json();
      if (data.error) {
        alert('Invalid API key');
        return;
      }
      const { name, respect } = data;
      
      Cookies.set('apiKey', apiKey, { expires: rememberMe ? 7 : undefined });
      Cookies.set('factionName', name, { expires: rememberMe ? 7 : undefined });
      Cookies.set('factionRespect', respect.toString(), { expires: rememberMe ? 7 : undefined });

      setFactionName(name);
      setFactionRespect(respect.toString());
      setIsLoggedIn(true);

      router.push('/home');
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="bg-white dark:bg-gray-800 p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl mb-6 text-center">Login</h1>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
          className="w-full p-2 mb-4 border rounded"
        />
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="mr-2"
          />
          <label>Keep me logged in</label>
        </div>
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Login
        </button>
      </div>
    </div>
  );
}
