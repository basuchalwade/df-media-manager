
import { BotExecutionEvent } from '../types';

let events: BotExecutionEvent[] = [];
const listeners: ((events: BotExecutionEvent[]) => void)[] = [];

export const emitExecutionEvent = (event: BotExecutionEvent) => {
  events = [event, ...events].slice(0, 500); // Keep last 500 events
  notifyListeners();
};

export const getExecutionEvents = (botId?: string) => {
  if (botId) return events.filter(e => e.botId === botId);
  return events;
};

export const clearEvents = () => {
  events = [];
  notifyListeners();
};

export const subscribeToTelemetry = (callback: (events: BotExecutionEvent[]) => void) => {
  listeners.push(callback);
  return () => {
    const index = listeners.indexOf(callback);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l(events));
};
