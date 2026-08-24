import { useState } from 'react';
import type { AnnualActuals } from '../types';

export function useActuals(initial: AnnualActuals[] = []): {
  actuals: AnnualActuals[];
  addActual: (actual: AnnualActuals) => void;
  updateActual: (age: number, updates: Partial<Omit<AnnualActuals, 'age'>>) => boolean;
  removeActual: (age: number) => void;
  setAll: (items: AnnualActuals[]) => void;
} {
  const [actuals, setActuals] = useState<AnnualActuals[]>(initial);

  const addActual = (actual: AnnualActuals) => {
    setActuals(prev => {
      // Prevent duplicate ages
      if (prev.some(a => a.age === actual.age)) {
        return prev.map(a => a.age === actual.age ? { ...a, ...actual } : a);
      }
      return [...prev, actual];
    });
  };

  const updateActual = (age: number, updates: Partial<Omit<AnnualActuals, 'age'>>) => {
    setActuals(prev => prev.map(a => a.age === age ? { ...a, ...updates } : a));
    return true;
  };

  const removeActual = (age: number) => {
    setActuals(prev => prev.filter(a => a.age !== age));
  };

  const setAll = (items: AnnualActuals[]) => {
    setActuals(items);
  };

  return { actuals, addActual, updateActual, removeActual, setAll };
}
