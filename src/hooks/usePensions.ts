import { useState } from 'react';
import type { Pension } from '../types';

export function usePensions(initial: Pension[] = []): {
  pensions: Pension[];
  addPension: (pension: Omit<Pension, 'id'>) => void;
  updatePension: (id: string, updates: Partial<Omit<Pension, 'id'>>) => boolean;
  removePension: (id: string) => void;
} {
  const [pensions, setPensions] = useState<Pension[]>(initial);

  const addPension = (pension: Omit<Pension, 'id'>) => {
    setPensions(prev => [...prev, { ...pension, id: Math.random().toString(36).substring(7) }]);
  };

  const updatePension = (id: string, updates: Partial<Omit<Pension, 'id'>>) => {
    setPensions(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    return true;
  };

  const removePension = (id: string) => {
    setPensions(prev => prev.filter(p => p.id !== id));
  };

  return { pensions, addPension, updatePension, removePension };
}
