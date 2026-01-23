
import { OrchestrationLogEntry } from '../types';

let logs: OrchestrationLogEntry[] = [];

export const logOrchestrationEvent = (entry: Omit<OrchestrationLogEntry, 'id'>) => {
  const newLog = {
    ...entry,
    id: `orch-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
  };
  // Keep last 1000 logs
  logs = [newLog, ...logs].slice(0, 1000);
  return newLog;
};

export const getOrchestrationLogs = () => {
  return logs;
};

export const clearOrchestrationLogs = () => {
  logs = [];
};
