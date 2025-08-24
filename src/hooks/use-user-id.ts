
'use client';

import { useState, useEffect } from 'react';

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('memory-app-userId');
    if (!storedUserId) {
      storedUserId = generateUUID();
      localStorage.setItem('memory-app-userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  return userId;
}
