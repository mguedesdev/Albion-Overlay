
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AppState, DEFAULT_STATE } from '../types';

interface AppContextType {
  state: AppState;
  updateStats: (newStats: Partial<AppState['stats']>) => void;
  updateStyle: (newStyle: Partial<AppState['style']>) => void;
  resetStats: () => void;
  resetStyle: () => void;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'albion_overlay_state_v3';

// Função auxiliar para merge profundo simples de objetos de estilo e campos
const deepMerge = (target: any, source: any) => {
  const output = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = { ...target[key], ...source[key] };
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Garante que novos campos de estilo (como animationStyle) existam mesmo em saves antigos
        return {
          ...DEFAULT_STATE,
          ...parsed,
          style: deepMerge(DEFAULT_STATE.style, parsed.style),
          stats: { ...DEFAULT_STATE.stats, ...parsed.stats }
        };
      } catch (e) {
        return DEFAULT_STATE;
      }
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setState(prev => ({
            ...newState,
            style: deepMerge(DEFAULT_STATE.style, newState.style)
          }));
        } catch (err) {
          console.error("Erro ao sincronizar estado:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const updateStats = useCallback((newStats: Partial<AppState['stats']>) => {
    setState(prev => ({
      ...prev,
      stats: { ...prev.stats, ...newStats }
    }));
  }, []);

  const updateStyle = useCallback((newStyle: Partial<AppState['style']>) => {
    setState(prev => ({
      ...prev,
      style: deepMerge(prev.style, newStyle)
    }));
  }, []);

  const resetStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      stats: { ...DEFAULT_STATE.stats },
      lostBuilds: []
    }));
  }, []);

  const resetStyle = useCallback(() => {
    setState(prev => ({
      ...prev,
      style: JSON.parse(JSON.stringify(DEFAULT_STATE.style))
    }));
  }, []);

  return (
    <AppContext.Provider value={{ state, updateStats, updateStyle, resetStats, resetStyle, setState }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext deve ser usado dentro de um AppProvider');
  }
  return context;
};
