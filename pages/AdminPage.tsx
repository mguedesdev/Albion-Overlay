
import React, { useState, useRef } from 'react';
import { LostBuild, THEMES, PRESETS, OverlayStyle, AnimationType } from '../types';
import StatControl from '../components/StatControl';
import { calculateTotalLoss, formatSilver, parseSilverShorthand } from '../utils';
import { translations } from '../translations';
import { useAppContext } from '../context/AppContext';

const AdminPage: React.FC = () => {
  const { state, updateStats, updateStyle, resetStats, resetStyle, setState } = useAppContext();
  const [newBuildName, setNewBuildName] = useState('');
  const [newBuildValue, setNewBuildValue] = useState('');
  const [quickDeathValue, setQuickDeathValue] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'style'>('stats');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const t = translations[state.language];
  const totalLoss = calculateTotalLoss(state.lostBuilds);
  const netProfitValue = state.stats.profit - totalLoss;

  const addLostBuild = () => {
    if (!newBuildValue) return;
    const parsedValue = parseSilverShorthand(newBuildValue);
    const newBuild: LostBuild = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBuildName.trim() || t.unnamedBuild,
      value: parsedValue,
      timestamp: Date.now(),
    };
    setState(prev => ({ ...prev, lostBuilds: [newBuild, ...prev.lostBuilds] }));
    setNewBuildName('');
    setNewBuildValue('');
  };

  const handleQuickDeath = () => {
    if (!quickDeathValue) return;
    const parsedValue = parseSilverShorthand(quickDeathValue);
    
    const newBuild: LostBuild = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Morte (${new Date().toLocaleTimeString()})`,
      value: parsedValue,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        lose: prev.stats.lose + 1,
        builds: prev.stats.builds + 1
      },
      lostBuilds: [newBuild, ...prev.lostBuilds]
    }));

    setQuickDeathValue('');
  };

  const updateLostBuild = (id: string, updates: Partial<LostBuild>) => {
    setState(prev => ({
      ...prev,
      lostBuilds: prev.lostBuilds.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const handleInlineValueEdit = (id: string, valStr: string) => {
    const numericValue = parseSilverShorthand(valStr);
    updateLostBuild(id, { value: numericValue });
  };

  const removeLostBuild = (id: string) => {
    setState(prev => ({
      ...prev,
      lostBuilds: prev.lostBuilds.filter(b => b.id !== id)
    }));
  };

  const handleResetDay = () => {
    if (confirm(t.resetDayConfirm)) {
      resetStats();
    }
  };

  const handleResetStyles = () => {
    if (confirm(t.resetConfirm)) {
      resetStyle();
    }
  };

  const copyOverlayUrl = () => {
    // Pega a URL atual sem o que vem depois do #
    const currentUrl = window.location.href.split('#')[0];
    // Remove barras extras no final e adiciona a rota do overlay
    const cleanUrl = currentUrl.replace(/\/$/, '');
    const url = `${cleanUrl}/#/overlay`;
    
    navigator.clipboard.writeText(url);
    alert(t.copiedAlert + "\n\nURL: " + url);
  };

  const toggleLanguage = () => {
    setState(prev => ({ ...prev, language: prev.language === 'pt' ? 'en' : 'pt' }));
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `albion_overlay_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        setState(json);
        alert(t.importSuccess);
      } catch (err) {
        alert(t.importError);
      }
    };
    reader.readAsText(file);
  };

  const applyTheme = (themeName: keyof typeof THEMES) => {
    updateStyle(THEMES[themeName as keyof typeof THEMES]);
  };

  const applyPreset = (presetName: string) => {
    updateStyle(PRESETS[presetName]);
  };

  const toggleFieldVisibility = (field: keyof OverlayStyle['visibleFields']) => {
    updateStyle({
      visibleFields: {
        ...state.style.visibleFields,
        [field]: !state.style.visibleFields[field]
      }
    });
  };

  const updateLabel = (field: keyof OverlayStyle['customLabels'], value: string) => {
    updateStyle({
      customLabels: {
        ...state.style.customLabels,
        [field]: value
      }
    });
  };

  const updatePaddingXY = (axis: 'x' | 'y', value: number) => {
    if (axis === 'x') {
      updateStyle({ paddingLeft: value, paddingRight: value });
    } else {
      updateStyle({ paddingTop: value, paddingBottom: value });
    }
  };

  const fieldInfo = [
    { key: 'win', label: t.fieldWin, icon: 'fa-trophy' },
    { key: 'lose', label: t.fieldLose, icon: 'fa-skull' },
    { key: 'profit', label: t.fieldProfit, icon: 'fa-coins' },
    { key: 'loss', label: t.fieldLoss, icon: 'fa-arrow-trend-down' },
    { key: 'builds', label: t.fieldBuilds, icon: 'fa-tshirt' },
    { key: 'netProfit', label: t.fieldNetProfit, icon: 'fa-scale-balanced' },
  ];

  const animationOptions = [
    { value: 'none', label: t.animNone, icon: 'fa-slash' },
    { value: 'slide', label: t.animSlide, icon: 'fa-arrow-right-long' },
    { value: 'bounce', label: t.animBounce, icon: 'fa-circle-up' },
    { value: 'fade', label: t.animFade, icon: 'fa-eye' },
    { value: 'flip', label: t.animFlip, icon: 'fa-arrows-rotate' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col md:flex-row overflow-hidden">
      <input type="file" ref={fileInputRef} onChange={importData} className="hidden" accept=".json" />
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <i className="fas fa-shield-halved text-blue-500"></i>
            Albion Overlay
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>
            <i className="fas fa-chart-line"></i>{t.dashboard}
          </button>
          <button onClick={() => setActiveTab('style')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'style' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800'}`}>
            <i className="fas fa-palette"></i>{t.styleLayout}
          </button>
        </nav>
        
        <div className="p-4 space-y-2 border-t border-gray-800">
          <div className="flex items-center justify-between px-2 text-[10px] text-gray-500 font-bold uppercase mb-2">
            <span>{t.lang}</span>
            <button onClick={toggleLanguage} className="px-2 py-0.5 rounded bg-gray-800 text-blue-400 border border-gray-700">{state.language.toUpperCase()}</button>
          </div>
          <button onClick={copyOverlayUrl} className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs py-2 rounded-lg flex items-center justify-center gap-2 border border-blue-500/30 transition-colors">
            <i className="fas fa-copy"></i>{t.copyUrl}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={exportData} className="bg-gray-800 hover:bg-gray-700 text-[10px] py-2 rounded border border-gray-700">{t.exportData}</button>
            <button onClick={() => fileInputRef.current?.click()} className="bg-gray-800 hover:bg-gray-700 text-[10px] py-2 rounded border border-gray-700">{t.importData}</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-gray-900/50 backdrop-blur-md p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-300">{activeTab === 'stats' ? t.statsEditor : t.styleCustomizer}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {activeTab === 'stats' && (
              <button 
                onClick={handleResetDay}
                className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border border-red-600/50 transition-all text-[10px] font-bold py-1 px-3 rounded-full flex items-center gap-2 shadow-lg hover:shadow-red-600/20 active:scale-95"
              >
                <i className="fas fa-rotate"></i> {t.resetDay}
              </button>
            )}
            <span>{t.obsStatus}: <span className="text-green-500 font-bold">{t.active}</span></span>
          </div>
        </header>

        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          <div className="flex-1 p-6 admin-scroll overflow-y-auto">
            {activeTab === 'stats' ? (
              <div className="space-y-8">
                {/* QUICK DEATH PANEL */}
                <div className="bg-red-600/10 border border-red-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <i className="fas fa-skull text-8xl"></i>
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-red-500 font-black text-xl mb-1 uppercase italic tracking-tighter">{t.quickDeath}</h3>
                    <p className="text-gray-400 text-xs mb-4">{t.quickDeathDesc}</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <i className="fas fa-coins absolute left-3 top-1/2 -translate-y-1/2 text-red-500/50 text-sm"></i>
                        <input 
                          type="text" 
                          placeholder={t.valuePlaceholder}
                          value={quickDeathValue}
                          onChange={e => setQuickDeathValue(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleQuickDeath()}
                          className="w-full bg-gray-950 border border-red-500/20 focus:border-red-500 rounded-xl py-3 pl-10 pr-4 text-white font-bold transition-all outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleQuickDeath}
                        className="bg-red-600 hover:bg-red-500 text-white font-black px-6 rounded-xl transition-all shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <i className="fas fa-skull"></i> {t.quickDeathConfirm}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <StatControl label={state.style.customLabels.win} value={state.stats.win} onChange={(win) => updateStats({ win })} icon="fa-trophy" color="bg-green-500" />
                  <StatControl label={state.style.customLabels.lose} value={state.stats.lose} onChange={(lose) => updateStats({ lose })} icon="fa-skull" color="bg-red-500" />
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-yellow-500/20"><i className="fas fa-coins text-yellow-500"></i></div>
                      <span className="font-semibold text-gray-300 uppercase text-xs tracking-wider">{state.style.customLabels.profit}</span>
                    </div>
                    <input 
                      type="text" 
                      placeholder={t.profitPlaceholder} 
                      value={state.stats.profit === 0 ? '' : formatSilver(state.stats.profit)} 
                      onChange={(e) => updateStats({ profit: parseSilverShorthand(e.target.value) })} 
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-white font-bold" 
                    />
                  </div>
                  <StatControl label={state.style.customLabels.builds} value={state.stats.builds} onChange={(builds) => updateStats({ builds })} icon="fa-tshirt" color="bg-purple-500" />
                </div>

                <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                  <div className="p-4 border-b border-gray-800 bg-gray-800/50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-200">{t.historyTitle}</h3>
                    <div className="flex gap-2">
                       <div className="text-[10px] px-3 py-1 bg-red-900/30 text-red-400 rounded-full border border-red-900/50 font-bold uppercase">{state.style.customLabels.loss}: {formatSilver(totalLoss)}</div>
                       <div className={`text-[10px] px-3 py-1 ${netProfitValue >= 0 ? 'bg-green-900/30 text-green-400 border-green-900/50' : 'bg-red-900/30 text-red-400 border-red-900/50'} rounded-full border font-bold uppercase`}>{state.style.customLabels.netProfit}: {formatSilver(netProfitValue)}</div>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/30">
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                      <input placeholder={t.buildNamePlaceholder} value={newBuildName} onChange={e => setNewBuildName(e.target.value)} className="flex-1 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm" />
                      <input type="text" placeholder={t.valuePlaceholder} value={newBuildValue} onChange={e => setNewBuildValue(e.target.value)} className="w-full sm:w-32 bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 text-sm" />
                      <button onClick={addLostBuild} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold">{t.addLoss}</button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 sticky top-0 bg-gray-900">
                          <tr><th className="pb-2 font-medium px-2">{t.colBuild}</th><th className="pb-2 font-medium px-2">{t.colValue}</th><th className="pb-2 font-medium text-right px-2">{t.colActions}</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {state.lostBuilds.length === 0 ? (
                            <tr><td colSpan={3} className="py-8 text-center text-gray-500">{t.noLosses}</td></tr>
                          ) : (
                            state.lostBuilds.map(build => (
                              <tr key={build.id} className="hover:bg-gray-800/50 transition-colors">
                                <td className="py-2 px-2"><input className="bg-transparent border-none focus:ring-1 focus:ring-blue-500 rounded px-1 w-full text-gray-300" value={build.name} onChange={(e) => updateLostBuild(build.id, { name: e.target.value })} /></td>
                                <td className="py-2 px-2"><input type="text" className="bg-transparent border-none focus:ring-1 focus:ring-red-500 rounded px-1 w-full text-red-400 font-medium" defaultValue={build.value} onBlur={(e) => handleInlineValueEdit(build.id, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleInlineValueEdit(build.id, (e.target as HTMLInputElement).value)} /></td>
                                <td className="py-2 text-right px-2"><button onClick={() => removeLostBuild(build.id)} className="text-gray-500 hover:text-red-500 p-1"><i className="fas fa-trash-can"></i></button></td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-20">
                {/* PRESETS */}
                <section className="bg-blue-600/5 p-5 rounded-2xl border border-blue-600/20">
                  <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-magic"></i> {t.presets}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.keys(PRESETS).map(preset => (
                      <button key={preset} onClick={() => applyPreset(preset)} className="group flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500 transition-all">
                        <div className="w-full h-8 bg-gray-800 rounded flex items-center justify-center text-[10px] text-gray-500 group-hover:text-blue-400">
                          <i className="fas fa-trophy mr-1"></i> 10
                        </div>
                        <span className="text-[10px] font-bold uppercase">{(t as any)[`preset${preset.charAt(0).toUpperCase() + preset.slice(1)}`]}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* ANIMATION STYLE */}
                <section className="bg-purple-600/5 p-5 rounded-2xl border border-purple-600/20">
                  <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-play"></i> {t.animations}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {animationOptions.map(opt => (
                      <button 
                        key={opt.value} 
                        onClick={() => updateStyle({ animationStyle: opt.value as AnimationType })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${state.style.animationStyle === opt.value ? 'bg-purple-600 border-purple-400 text-white shadow-lg' : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-purple-500'}`}
                      >
                        <i className={`fas ${opt.icon} text-lg`}></i>
                        <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </section>

                {/* FIELD CONFIG */}
                <section className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">{t.fieldConfig}</h3>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-2">
                          <input type="checkbox" id="showIcons" checked={state.style.showIcons} onChange={(e) => updateStyle({ showIcons: e.target.checked })} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600" />
                          <label htmlFor="showIcons" className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer">{t.showIcons}</label>
                       </div>
                       <div className="flex items-center gap-2">
                          <input type="checkbox" id="showLabels" checked={state.style.showLabels} onChange={(e) => updateStyle({ showLabels: e.target.checked })} className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600" />
                          <label htmlFor="showLabels" className="text-[10px] font-bold text-gray-500 uppercase cursor-pointer">{t.showLabels}</label>
                       </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {fieldInfo.map((f) => {
                      const visible = (state.style.visibleFields as any)[f.key];
                      const label = (state.style.customLabels as any)[f.key];
                      return (
                        <div key={f.key} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${visible ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-900/30 border-gray-800 opacity-60'}`}>
                          <button onClick={() => toggleFieldVisibility(f.key as any)} className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${visible ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                            <i className={`fas ${visible ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                          </button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <i className={`fas ${f.icon} text-[10px] text-gray-500`}></i>
                              <span className="text-[10px] font-bold text-gray-500 uppercase">{f.label}</span>
                            </div>
                            <input 
                              type="text" 
                              value={label} 
                              onChange={(e) => updateLabel(f.key as any, e.target.value)}
                              className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm font-bold text-white"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{t.themes}</h3>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Object.keys(THEMES).map((name) => (
                      <button key={name} onClick={() => applyTheme(name as any)} className="flex flex-col items-center gap-1 p-2 rounded-lg border border-gray-800 hover:border-blue-500 transition-all bg-gray-900">
                        <div className="w-8 h-8 rounded-full" style={{ backgroundColor: (THEMES as any)[name as keyof typeof THEMES].labelColor }}></div>
                        <span className="text-[10px] capitalize">{name}</span>
                      </button>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{t.layout}</h3>
                  <div className="bg-gray-900/40 p-5 rounded-2xl border border-gray-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.orientation}</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                          <button onClick={() => updateStyle({ orientation: 'horizontal' })} className={`flex-1 py-1 px-3 rounded text-xs transition-all ${state.style.orientation === 'horizontal' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t.horizontal}</button>
                          <button onClick={() => updateStyle({ orientation: 'vertical' })} className={`flex-1 py-1 px-3 rounded text-xs transition-all ${state.style.orientation === 'vertical' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t.vertical}</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.gap} ({state.style.gap}px)</label>
                        <input type="range" min="0" max="100" value={state.style.gap} onChange={(e) => updateStyle({ gap: parseInt(e.target.value) })} className="w-full" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{t.background}</h3>
                  <div className="space-y-6 bg-gray-900/40 p-5 rounded-2xl border border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.backgroundMode}</label>
                        <div className="flex bg-gray-800 p-1 rounded-lg">
                          <button onClick={() => updateStyle({ backgroundMode: 'single' })} className={`flex-1 py-1 px-3 rounded text-xs transition-all ${state.style.backgroundMode === 'single' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t.bgSingle}</button>
                          <button onClick={() => updateStyle({ backgroundMode: 'individual' })} className={`flex-1 py-1 px-3 rounded text-xs transition-all ${state.style.backgroundMode === 'individual' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>{t.bgIndividual}</button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.bgColor}</label>
                        <input type="color" value={state.style.bgColor} onChange={(e) => updateStyle({ bgColor: e.target.value })} className="w-full h-10 rounded-lg bg-gray-800 p-1" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">Padding X</label>
                        <input type="number" value={state.style.paddingLeft} onChange={(e) => updatePaddingXY('x', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">Padding Y</label>
                        <input type="number" value={state.style.paddingTop} onChange={(e) => updatePaddingXY('y', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-xs" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.opacity} ({Math.round(state.style.bgOpacity * 100)}%)</label>
                        <input type="range" min="0" max="1" step="0.01" value={state.style.bgOpacity} onChange={(e) => updateStyle({ bgOpacity: parseFloat(e.target.value) })} className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-gray-400">{t.borderRadius} ({state.style.borderRadius}px)</label>
                        <input type="range" min="0" max="50" value={state.style.borderRadius} onChange={(e) => updateStyle({ borderRadius: parseInt(e.target.value) })} className="w-full" />
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">{t.typography}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-900/40 p-5 rounded-2xl border border-gray-800">
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">{t.font}</label>
                      <select value={state.style.fontFamily} onChange={(e) => updateStyle({ fontFamily: e.target.value as any })} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm">
                        <option value="Bebas Neue">Bebas Neue</option>
                        <option value="Inter">Inter</option>
                        <option value="system-ui">System</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">{t.fontSize} ({state.style.fontSize}px)</label>
                      <input type="range" min="12" max="100" value={state.style.fontSize} onChange={(e) => updateStyle({ fontSize: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">{t.textColor}</label>
                      <input type="color" value={state.style.textColor} onChange={(e) => updateStyle({ textColor: e.target.value })} className="w-full h-10 rounded-lg bg-gray-800 p-1" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-gray-400">{t.labelColor}</label>
                      <input type="color" value={state.style.labelColor} onChange={(e) => updateStyle({ labelColor: e.target.value })} className="w-full h-10 rounded-lg bg-gray-800 p-1" />
                    </div>
                  </div>
                </section>

                <div className="pt-6 border-t border-gray-800">
                  <button onClick={handleResetStyles} className="text-red-400 text-xs hover:underline uppercase font-bold tracking-widest">{t.resetStyles}</button>
                </div>
              </div>
            )}
          </div>

          {/* Preview Panel (Side) */}
          <div className="w-full lg:w-[400px] border-l border-gray-800 bg-gray-950 p-6 flex flex-col shrink-0">
            <div className="flex items-center gap-2 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider"><i className="fas fa-eye"></i>{t.livePreview}</div>
            <div className="flex-1 bg-gray-900 rounded-2xl border border-gray-800 border-dashed relative overflow-hidden flex items-center justify-center min-h-[300px]">
              {/* Preview content uses logic similar to OverlayPage but scoped/scaled */}
              <div style={{ 
                transform: 'scale(0.8)',
                display: 'inline-flex',
                flexDirection: state.style.orientation === 'horizontal' ? 'row' : 'column',
                gap: `${state.style.gap}px`,
                backgroundColor: state.style.backgroundMode === 'single' ? hexToRgba(state.style.bgColor, state.style.bgOpacity) : 'transparent',
                padding: state.style.backgroundMode === 'single' ? `${state.style.paddingTop}px ${state.style.paddingRight}px ${state.style.paddingBottom}px ${state.style.paddingLeft}px` : '0px',
                borderRadius: state.style.backgroundMode === 'single' ? `${state.style.borderRadius}px` : '0px',
                fontFamily: state.style.fontFamily,
                fontSize: `${state.style.fontSize}px`,
                color: state.style.textColor,
                textShadow: state.style.textShadow ? '2px 2px 4px rgba(0,0,0,0.8)' : 'none',
              }}>
                {fieldInfo.filter(f => (state.style.visibleFields as any)[f.key]).map(f => (
                  <div key={f.key} style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: state.style.backgroundMode === 'individual' ? hexToRgba(state.style.bgColor, state.style.bgOpacity) : 'transparent',
                    padding: state.style.backgroundMode === 'individual' ? `${state.style.paddingTop}px ${state.style.paddingRight}px ${state.style.paddingBottom}px ${state.style.paddingLeft}px` : '0px',
                    borderRadius: state.style.backgroundMode === 'individual' ? `${state.style.borderRadius}px` : '0px',
                  }}>
                    {state.style.showIcons && <i className={`fas ${f.icon}`} style={{ color: state.style.labelColor, marginRight: '8px' }}></i>}
                    {state.style.showLabels && <span style={{ color: state.style.labelColor, marginRight: '8px' }}>{(state.style.customLabels as any)[f.key]}</span>}
                    <span className={f.key === 'loss' ? 'text-red-400' : ''}>
                      {f.key === 'profit' ? formatSilver(state.stats.profit) : 
                       f.key === 'loss' ? formatSilver(totalLoss) : 
                       f.key === 'netProfit' ? formatSilver(netProfitValue) : 
                       (state.stats as any)[f.key] || 0}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
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

export default AdminPage;
