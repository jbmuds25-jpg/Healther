import React from 'react';
import type HealtherAIClient from '../utils/healtherAIClient';

export interface AIContextType {
  client: HealtherAIClient | null;
  sendMessage: (message: string) => Promise<any>;
  getCapabilities: () => Promise<any>;
}

export const AIContext = React.createContext<AIContextType | undefined>(undefined);
