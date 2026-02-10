import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
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

// Detecta se está no overlay
const IS_OVERLAY =
  typeof window !== 'undefined' &&
  window.location.hash.includes('overlay');

// Merge profundo simples para style
const deepMerge = (target: any, source: any) => {
  const output = { ...target };
  if (source && typeof source === 'object') {
    Object.keys(source).forEach(key => {
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        output[key] = { ...target[key], ...source[key] };
      } else {
        output[key] = source[key];
      }
    });
  }
  return output;
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  /**
   * 1️⃣ Bootstrap do estado
   * - Overlay: SEMPRE busca do backend
   * - Admin: tenta localStorage primeiro, depois backend
   */
  useEffect(() => {
    const init = async () => {
      // Admin tenta local primeiro
      if (!IS_OVERLAY) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setState({
              ...DEFAULT_STATE,
              ...parsed,
              style: deepMerge(DEFAULT_STATE.style, parsed.style),
              stats: { ...DEFAULT_STATE.stats, ...parsed.stats },
            });
            return;
          } catch {}
        }
      }

      // Fallback / Overlay → backend
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;

        const remote = await res.json();
        if (!remote) return;

        setState({
          ...DEFAULT_STATE,
          ...remote,
          style: deepMerge(DEFAULT_STATE.style, remote.style),
          stats: { ...DEFAULT_STATE.stats, ...remote.stats },
        });
      } catch (err) {
        console.error('Erro ao inicializar estado remoto', err);
      }
    };

    init();
  }, []);

  /**
   * 2️⃣ Persistência
   * - Admin: salva local + backend
   * - Overlay: NÃO escreve
   */
  useEffect(() => {
    if (IS_OVERLAY) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}

    const syncRemote = async () => {
      try {
        await fetch('/api/state', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(state),
        });
      } catch (err) {
        console.error('Erro ao sincronizar estado remoto', err);
      }
    };

    syncRemote();
  }, [state]);

  /**
   * 3️⃣ Polling no Overlay (ESSENCIAL PARA OBS)
   */
  useEffect(() => {
    if (!IS_OVERLAY) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;

        const remote = await res.json();
        if (!remote) return;

        setState(prev =>
          JSON.stringify(prev) === JSON.stringify(remote)
            ? prev
            : {
                ...DEFAULT_STATE,
                ...remote,
                style: deepMerge(DEFAULT_STATE.style, remote.style),
                stats: { ...DEFAULT_STATE.stats, ...remote.stats },
              }
        );
      } catch {}
    }, 500);

    return () => clearInterval(interval);
  }, []);

  /**
   * 4️⃣ Storage sync (só Admin ↔ Admin)
   */
  useEffect(() => {
    if (IS_OVERLAY) return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newState = JSON.parse(e.newValue);
          setState({
            ...DEFAULT_STATE,
            ...newState,
            style: deepMerge(DEFAULT_STATE.style, newState.style),
            stats: { ...DEFAULT_STATE.stats, ...newState.stats },
          });
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * 5️⃣ Actions
   */
  const updateStats = useCallback(
    (newStats: Partial<AppState['stats']>) => {
      setState(prev => ({
        ...prev,
        stats: { ...prev.stats, ...newStats },
      }));
    },
    []
  );

  const updateStyle = useCallback(
    (newStyle: Partial<AppState['style']>) => {
      setState(prev => ({
        ...prev,
        style: deepMerge(prev.style, newStyle),
      }));
    },
    []
  );

  const resetStats = useCallback(() => {
    setState(prev => ({
      ...prev,
      stats: { ...DEFAULT_STATE.stats },
      lostBuilds: [],
    }));
  }, []);

  const resetStyle = useCallback(() => {
    setState(prev => ({
      ...prev,
      style: JSON.parse(JSON.stringify(DEFAULT_STATE.style)),
    }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        state,
        updateStats,
        updateStyle,
        resetStats,
        resetStyle,
        setState,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return context;
};
