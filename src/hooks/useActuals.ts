import { useState } from 'react';

export interface AnnualActuals {
  year: number;
  age: number;
  portfolio: number;
  savings: number;
  spending: number;
}

export function useActuals(initial: AnnualActuals[] = []): {
  actuals: AnnualActuals[];
  addActual: (actual: Omit<AnnualActuals, 'id'>) => void;
  updateActual: (year: number, updates: Partial<Omit<AnnualActuals, 'year' | 'age'>>) => boolean;
  removeActual: (year: number) => void;
} {
  const [actuals, setActuals] = useState<AnnualActuals[]>(initial);

  const addActual = (actual: Omit<AnnualActuals, 'id'>) => {
    setActuals(prev => [...prev, { ...actual, id: Math.random().toString(36).substring(7) }]);
  };

  const updateActual = (year: number, updates: Partial<Omit<AnnualActuals, 'year' | 'age'>>) => {
    setActuals(prev => prev.map(a => a.year === year ? { ...a, ...updates } : a));
    return true;
  };

  const removeActual = (year: number) => {
    setActuals(prev => prev.filter(a => a.year !== year));
  };

  return { actuals, addActual, updateActual, removeActual };
}
