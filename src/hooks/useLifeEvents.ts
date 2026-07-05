import { useState } from 'react';
import type { LifeEvent } from '../types';

export function useLifeEvents(initial: LifeEvent[] = []): {
  lifeEvents: LifeEvent[];
  addLifeEvent: (event: Omit<LifeEvent, 'id'>) => void;
  updateLifeEvent: (id: string, updates: Partial<Omit<LifeEvent, 'id'>>) => boolean;
  removeLifeEvent: (id: string) => void;
} {
  const [lifeEvents, setLifeEvents] = useState<LifeEvent[]>(initial);

  const addLifeEvent = (event: Omit<LifeEvent, 'id'>) => {
    setLifeEvents(prev => [...prev, { ...event, id: Math.random().toString(36).substring(7) }]);
  };

  const updateLifeEvent = (id: string, updates: Partial<Omit<LifeEvent, 'id'>>) => {
    setLifeEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    return true;
  };

  const removeLifeEvent = (id: string) => {
    setLifeEvents(prev => prev.filter(e => e.id !== id));
  };

  return { lifeEvents, addLifeEvent, updateLifeEvent, removeLifeEvent };
}
