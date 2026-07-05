import { useState } from 'react';
import type { ProjectedMilestone } from '../types';

export function useMilestones(initial: ProjectedMilestone[] = []): {
  projectedMilestones: ProjectedMilestone[];
  addProjectedMilestone: (milestone: Omit<ProjectedMilestone, 'id'>) => void;
  updateProjectedMilestone: (id: string, updates: Partial<Omit<ProjectedMilestone, 'id'>>) => boolean;
  removeProjectedMilestone: (id: string) => void;
} {
  const [projectedMilestones, setProjectedMilestones] = useState<ProjectedMilestone[]>(initial);

  const addProjectedMilestone = (milestone: Omit<ProjectedMilestone, 'id'>) => {
    setProjectedMilestones(prev => [...prev, { ...milestone, id: Math.random().toString(36).substring(7) }]);
  };

  const updateProjectedMilestone = (id: string, updates: Partial<Omit<ProjectedMilestone, 'id'>>) => {
    setProjectedMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    return true;
  };

  const removeProjectedMilestone = (id: string) => {
    setProjectedMilestones(prev => prev.filter(m => m.id !== id));
  };

  return { projectedMilestones, addProjectedMilestone, updateProjectedMilestone, removeProjectedMilestone };
}
