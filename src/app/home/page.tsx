"use client"; // Add this line at the top

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [factionName, setFactionName] = useState('');
  const [factionRespect, setFactionRespect] = useState('');

  useEffect(() => {
    setFactionName(localStorage.getItem('factionName') || '');
    setFactionRespect(localStorage.getItem('factionRespect') || '');
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="flex-1 p-4">
        <h1 className="text-2xl">Welcome to the Home Page</h1>
      </div>
    </div>
  );
};

export default Home;
