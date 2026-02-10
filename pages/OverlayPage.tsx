
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { calculateTotalLoss, formatSilver } from '../utils';
import { useAppContext } from '../context/AppContext';
import { AnimationType } from '../types';

const AnimatedValue: React.FC<{ value: string | number, colorClass?: string, animationStyle: AnimationType }> = ({ value, colorClass, animationStyle }) => {
  const [isChanging, setIsChanging] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (animationStyle !== 'none' && prevValue.current !== value) {
      setIsChanging(true);
      const timer = setTimeout(() => setIsChanging(false), 300);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
    prevValue.current = value;
  }, [value, animationStyle]);

  if (animationStyle === 'none') {
    return <span className={colorClass || ''}>{value}</span>;
  }

  return (
    <motion.span
      animate={isChanging ? { 
        scale: [1, 1.2, 1], 
        filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] 
      } : { scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-block ${colorClass || ''}`}
    >
      {value}
    </motion.span>
  );
};

const OverlayPage: React.FC = () => {
  const { state, setState } = useAppContext();
  const [showStatus, setShowStatus] = useState(true);
  const { style, stats, lostBuilds } = state;
  
  // Esconde o status de "Conectado" após 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => setShowStatus(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Faz polling periódico do backend para manter o overlay em sincronia
  // com o painel de administração rodando em outro navegador / máquina.
  useEffect(() => {
    const fetchRemoteState = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) return;
        const remote = await res.json();
        if (remote && typeof remote === 'object') {
          // Considera o backend como fonte de verdade para o overlay
          setState(remote);
        }
      } catch {
        // Em caso de erro (por exemplo, ambiente local sem backend),
        // simplesmente mantém o estado atual.
      }
    };

    // Busca inicial imediata
    fetchRemoteState();

    // Atualiza a cada 1 segundo
    const id = setInterval(fetchRemoteState, 1000);
    return () => clearInterval(id);
  }, [setState]);

  if (!style || !style.visibleFields) return null;

  const totalLoss = calculateTotalLoss(lostBuilds);
  const netProfitValue = stats.profit - totalLoss;
  const bgColorRgba = hexToRgba(style.bgColor, style.bgOpacity);

  const containerStyle: React.CSSProperties = {
    fontFamily: style.fontFamily || 'sans-serif',
    fontSize: `${style.fontSize || 24}px`,
    fontWeight: style.fontWeight || '700',
    color: style.textColor || '#ffffff',
    textShadow: style.textShadow ? '2px 2px 4px rgba(0,0,0,0.8), -1px -1px 0 rgba(0,0,0,0.5)' : 'none',
    backgroundColor: style.backgroundMode === 'single' ? bgColorRgba : 'transparent',
    paddingTop: style.backgroundMode === 'single' ? `${style.paddingTop}px` : '0px',
    paddingBottom: style.backgroundMode === 'single' ? `${style.paddingBottom}px` : '0px',
    paddingLeft: style.backgroundMode === 'single' ? `${style.paddingLeft}px` : '0px',
    paddingRight: style.backgroundMode === 'single' ? `${style.paddingRight}px` : '0px',
    borderRadius: style.backgroundMode === 'single' ? `${style.borderRadius}px` : '0px',
    display: 'inline-flex',
    flexDirection: style.orientation === 'horizontal' ? 'row' : 'column',
    gap: `${style.gap}px`,
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    boxShadow: style.backgroundMode === 'single' && (style.bgOpacity || 0) > 0 ? '0 4px 12px rgba(0,0,0,0.25)' : 'none',
  };

  const animationVariants: Record<AnimationType, Variants> = {
    none: { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 } },
    slide: { initial: { x: -30, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 30, opacity: 0 } },
    bounce: { initial: { scale: 0, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0, opacity: 0 } },
    fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
    flip: { initial: { rotateX: 90, opacity: 0 }, animate: { rotateX: 0, opacity: 1 }, exit: { rotateX: -90, opacity: 0 } }
  };

  const fields = [
    { key: 'win', label: style.customLabels.win, val: stats.win, icon: 'fa-trophy' },
    { key: 'lose', label: style.customLabels.lose, val: stats.lose, icon: 'fa-skull' },
    { key: 'profit', label: style.customLabels.profit, val: formatSilver(stats.profit), icon: 'fa-coins' },
    { key: 'loss', label: style.customLabels.loss, val: formatSilver(totalLoss), icon: 'fa-arrow-trend-down', colorClass: 'text-red-500' },
    { key: 'builds', label: style.customLabels.builds, val: stats.builds, icon: 'fa-tshirt' },
    { key: 'netProfit', label: style.customLabels.netProfit, val: formatSilver(netProfitValue), icon: 'fa-scale-balanced', colorClass: netProfitValue >= 0 ? 'text-green-400' : 'text-red-400' }
  ];

  return (
    <div className="fixed inset-0 overflow-hidden bg-transparent flex flex-col items-start justify-start p-4">
      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg"
          >
            <i className="fas fa-check-circle mr-2"></i> Overlay Ativo
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        layout={style.animationStyle !== 'none'}
        style={containerStyle}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <AnimatePresence mode="popLayout">
          {fields.filter(f => (style.visibleFields as any)[f.key]).map(f => (
            <motion.div 
              key={f.key} 
              layout={style.animationStyle !== 'none'}
              initial={animationVariants[style.animationStyle || 'bounce'].initial}
              animate={animationVariants[style.animationStyle || 'bounce'].animate}
              exit={animationVariants[style.animationStyle || 'bounce'].exit}
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: style.backgroundMode === 'individual' ? bgColorRgba : 'transparent',
                paddingTop: style.backgroundMode === 'individual' ? `${style.paddingTop}px` : '0px',
                paddingBottom: style.backgroundMode === 'individual' ? `${style.paddingBottom}px` : '0px',
                paddingLeft: style.backgroundMode === 'individual' ? `${style.paddingLeft}px` : '0px',
                paddingRight: style.backgroundMode === 'individual' ? `${style.paddingRight}px` : '0px',
                borderRadius: style.backgroundMode === 'individual' ? `${style.borderRadius}px` : '0px',
              }}
            >
              {style.showIcons && <i className={`fas ${f.icon}`} style={{ color: style.labelColor, marginRight: '8px', fontSize: '0.9em' }}></i>}
              {style.showLabels && <span style={{ color: style.labelColor, marginRight: '8px' }}>{f.label}</span>}
              <AnimatedValue 
                value={f.val} 
                colorClass={f.colorClass} 
                animationStyle={style.animationStyle || 'bounce'}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || hex.length < 7) return `rgba(0,0,0,${opacity})`;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default OverlayPage;
