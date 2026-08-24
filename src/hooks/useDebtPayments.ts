import { useState } from 'react';
import type { DebtPayment } from '../types';

export function useDebtPayments(initial: DebtPayment[] = []): {
  debtPayments: DebtPayment[];
  addDebtPayment: (debt: Omit<DebtPayment, 'id'>) => void;
  updateDebtPayment: (id: string, updates: Partial<Omit<DebtPayment, 'id'>>) => boolean;
  removeDebtPayment: (id: string) => void;
  setAll: (items: DebtPayment[]) => void;
} {
  const [debtPayments, setDebtPayments] = useState<DebtPayment[]>(initial);

  const addDebtPayment = (debt: Omit<DebtPayment, 'id'>) => {
    setDebtPayments(prev => [...prev, { ...debt, id: Math.random().toString(36).substring(7) }]);
  };

  const updateDebtPayment = (id: string, updates: Partial<Omit<DebtPayment, 'id'>>) => {
    setDebtPayments(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
    return true;
  };

  const removeDebtPayment = (id: string) => {
    setDebtPayments(prev => prev.filter(d => d.id !== id));
  };

  const setAll = (items: DebtPayment[]) => {
    setDebtPayments(items);
  };

  return { debtPayments, addDebtPayment, updateDebtPayment, removeDebtPayment, setAll };
}
