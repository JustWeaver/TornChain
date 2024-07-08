"use client"; // Add this line at the top

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const apiKey = localStorage.getItem('apiKey');
    if (apiKey) {
      router.push('/home');
    } else {
      router.push('/login');
    }
  }, [router]);

  return null;
}
