"use client"; // Add this line at the top

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Header = () => {
  const router = useRouter();
  const [factionName, setFactionName] = useState('');
  const [factionRespect, setFactionRespect] = useState('');

  useEffect(() => {
    setFactionName(localStorage.getItem('factionName') || '');
    setFactionRespect(localStorage.getItem('factionRespect') || '');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('apiKey');
    localStorage.removeItem('factionName');
    localStorage.removeItem('factionRespect');
    router.push('/login');
  };

  return (
    <header className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Link href="/home">
          <a className="hover:text-blue-500">Home</a>
        </Link>
        <Link href="/members">
          <a className="hover:text-blue-500">Members</a>
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <div>
          <span className="font-bold">{factionName}</span> ({factionRespect} respect)
        </div>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
