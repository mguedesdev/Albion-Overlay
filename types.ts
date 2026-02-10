
export interface LostBuild {
  id: string;
  name: string;
  value: number;
  timestamp: number;
}

export type AnimationType = 'none' | 'slide' | 'bounce' | 'fade' | 'flip';

export interface OverlayStyle {
  fontSize: number;
  textColor: string;
  labelColor: string;
  bgColor: string;
  bgOpacity: number;
  gap: number;
  orientation: 'horizontal' | 'vertical';
  paddingMode: 'xy' | 'individual';
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  borderRadius: number;
  fontFamily: 'Inter' | 'Bebas Neue' | 'system-ui';
  showLabels: boolean;
  showIcons: boolean;
  textShadow: boolean;
  fontWeight: string;
  backgroundMode: 'single' | 'individual';
  animationStyle: AnimationType;
  visibleFields: {
    win: boolean;
    lose: boolean;
    profit: boolean;
    loss: boolean;
    builds: boolean;
    netProfit: boolean;
  };
  customLabels: {
    win: string;
    lose: string;
    profit: string;
    loss: string;
    builds: string;
    netProfit: string;
  };
}

export const DEFAULT_STATE: AppState = {
  stats: {
    win: 0,
    lose: 0,
    profit: 0,
    builds: 1,
  },
  lostBuilds: [],
  style: {
    fontSize: 24,
    textColor: '#ffffff',
    labelColor: '#fbbf24',
    bgColor: '#000000',
    bgOpacity: 0.6,
    gap: 20,
    orientation: 'horizontal',
    paddingMode: 'xy',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 16,
    borderRadius: 8,
    fontFamily: 'Bebas Neue',
    showLabels: true,
    showIcons: false,
    textShadow: true,
    fontWeight: '700',
    backgroundMode: 'single',
    animationStyle: 'bounce',
    visibleFields: {
      win: true,
      lose: true,
      profit: true,
      loss: true,
      builds: true,
      netProfit: true,
    },
    customLabels: {
      win: 'W',
      lose: 'L',
      profit: 'PROFIT',
      loss: 'PERDA',
      builds: 'BUILDS',
      netProfit: 'SALDO',
    },
  },
  language: 'pt',
};

export const THEMES = {
  caerleon: { bgColor: '#1a1a1a', textColor: '#ffffff', labelColor: '#e11d48' },
  lymhurst: { bgColor: '#064e3b', textColor: '#ecfdf5', labelColor: '#10b981' },
  bridgewatch: { bgColor: '#451a03', textColor: '#fff7ed', labelColor: '#f97316' },
  martlock: { bgColor: '#1e3a8a', textColor: '#eff6ff', labelColor: '#3b82f6' },
  fortsterling: { bgColor: '#334155', textColor: '#f8fafc', labelColor: '#94a3b8' },
  thetford: { bgColor: '#4c1d95', textColor: '#f5f3ff', labelColor: '#a78bfa' },
};

export const PRESETS: Record<string, Partial<OverlayStyle>> = {
  minimalist: {
    showLabels: false,
    showIcons: true,
    backgroundMode: 'single',
    bgOpacity: 0,
    fontSize: 20,
    gap: 15,
    fontFamily: 'Inter',
    fontWeight: '700',
    textShadow: true,
    animationStyle: 'fade'
  },
  albionClassic: {
    fontFamily: 'Bebas Neue',
    bgColor: '#3a2a1a',
    bgOpacity: 0.9,
    labelColor: '#d4af37',
    textColor: '#ffffff',
    showLabels: true,
    showIcons: false,
    borderRadius: 4,
    backgroundMode: 'single',
    animationStyle: 'bounce'
  },
  gamerNeon: {
    fontFamily: 'Inter',
    textColor: '#00ffff',
    labelColor: '#ff00ff',
    bgOpacity: 0.7,
    bgColor: '#000000',
    textShadow: true,
    backgroundMode: 'individual',
    borderRadius: 12,
    showIcons: true,
    showLabels: true,
    fontWeight: '900',
    animationStyle: 'flip'
  },
  compact: {
    fontSize: 18,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    gap: 8,
    showIcons: true,
    showLabels: false,
    backgroundMode: 'individual',
    bgOpacity: 0.5,
    animationStyle: 'slide'
  }
};

export interface AppState {
  stats: {
    win: number;
    lose: number;
    profit: number;
    builds: number;
  };
  lostBuilds: LostBuild[];
  style: OverlayStyle;
  language: 'en' | 'pt';
}
