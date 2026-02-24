/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Timer, Trophy, RefreshCw, Info, ChevronRight, Zap, Eye, AlertCircle, Languages } from 'lucide-react';

// --- Types ---

type GameState = 'START' | 'PLAYING' | 'GAMEOVER';
type Language = 'en' | 'zh';

interface Color {
  h: number;
  s: number;
  l: number;
}

// --- Translations ---

const translations = {
  en: {
    title: 'Chroma',
    titleSuffix: 'Vision',
    subtitle: 'Art Student Precision Challenge v1.0',
    highScore: 'High Score',
    current: 'Current',
    calibrationRequired: 'Calibration Required',
    description: 'Identify the outlier in the grid. As your score increases, the color variance decreases. Precision is key. Speed is secondary but necessary.',
    initialTimer: '15s Initial Timer',
    bonusTime: '+2s per correct hit',
    penaltyTime: '-3s per error',
    maxDensity: '5x5 Max Grid Density',
    initiateTest: 'Initiate Test',
    testTerminated: 'Test Terminated',
    analysisComplete: 'Sensitivity Analysis Complete',
    finalScore: 'Final Score',
    rank: 'Rank',
    technicalSummary: 'Technical Summary',
    summaryText: (score: number, gridSize: number, time: string) => 
      `Your color perception threshold reached level ${score}. Final grid density: ${gridSize}x${gridSize}. Average response time: ${time}s per unit.`,
    restart: 'Restart Calibration',
    precision: 'Precision: High',
    environment: 'Environment: Studio',
    ranks: {
      novice: 'Novice',
      apprentice: 'Apprentice',
      artisan: 'Artisan',
      master: 'Master',
      visionary: 'Visionary'
    }
  },
  zh: {
    title: '色彩',
    titleSuffix: '视觉',
    subtitle: '艺术生色彩敏感度挑战 v1.0',
    highScore: '最高分',
    current: '当前得分',
    calibrationRequired: '需要校准',
    description: '在网格中找出差异色块。随着得分增加，色彩差异会逐渐减小。精准度是核心，速度同样重要。',
    initialTimer: '15秒初始时间',
    bonusTime: '正确点击 +2秒',
    penaltyTime: '错误点击 -3秒',
    maxDensity: '最高 5x5 网格密度',
    initiateTest: '开始测试',
    testTerminated: '测试终止',
    analysisComplete: '敏感度分析完成',
    finalScore: '最终得分',
    rank: '等级',
    technicalSummary: '技术摘要',
    summaryText: (score: number, gridSize: number, time: string) => 
      `你的色彩感知阈值达到了第 ${score} 级。最终网格密度：${gridSize}x${gridSize}。平均响应时间：每单元 ${time} 秒。`,
    restart: '重新校准',
    precision: '精准度：高',
    environment: '环境：工作室',
    ranks: {
      novice: '新手',
      apprentice: '学徒',
      artisan: '工匠',
      master: '大师',
      visionary: '幻视者'
    }
  }
};

// --- Utilities ---

const generateRandomColor = (): Color => ({
  h: Math.floor(Math.random() * 360),
  s: 40 + Math.floor(Math.random() * 40), // 40-80% saturation
  l: 40 + Math.floor(Math.random() * 20), // 40-60% lightness
});

const getDiffColor = (base: Color, difficulty: number): Color => {
  const minDiff = 1;
  const maxDiff = 15;
  const diff = Math.max(minDiff, maxDiff - Math.floor(difficulty / 2));
  
  const type = Math.floor(Math.random() * 3);
  const newColor = { ...base };
  
  const sign = Math.random() > 0.5 ? 1 : -1;
  
  if (type === 0) {
    newColor.h = (newColor.h + diff * sign + 360) % 360;
  } else if (type === 1) {
    newColor.s = Math.min(100, Math.max(0, newColor.s + diff * sign));
  } else {
    newColor.l = Math.min(100, Math.max(0, newColor.l + diff * sign));
  }
  
  return newColor;
};

const colorToCSS = (c: Color) => `hsl(${c.h}, ${c.s}%, ${c.l}%)`;

// --- Components ---

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [lang, setLang] = useState<Language>('zh');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gridSize, setGridSize] = useState(2);
  const [baseColor, setBaseColor] = useState<Color>(generateRandomColor());
  const [diffColor, setDiffColor] = useState<Color>({ h: 0, s: 0, l: 0 });
  const [targetIndex, setTargetIndex] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastDiffInfo, setLastDiffInfo] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const t = translations[lang];

  const startNewLevel = useCallback((currentScore: number) => {
    let newSize = 2;
    if (currentScore >= 2) newSize = 3;
    if (currentScore >= 5) newSize = 4;
    if (currentScore >= 10) newSize = 5;
    
    const newBase = generateRandomColor();
    const newDiff = getDiffColor(newBase, currentScore);
    const newTarget = Math.floor(Math.random() * (newSize * newSize));
    
    setGridSize(newSize);
    setBaseColor(newBase);
    setDiffColor(newDiff);
    setTargetIndex(newTarget);
  }, []);

  const startGame = () => {
    setGameState('PLAYING');
    setScore(0);
    setTimeLeft(15);
    startNewLevel(0);
  };

  const handleBlockClick = (index: number) => {
    if (gameState !== 'PLAYING') return;

    if (index === targetIndex) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeLeft(prev => Math.min(prev + 2, 30));
      
      const hDiff = Math.abs(baseColor.h - diffColor.h);
      const sDiff = Math.abs(baseColor.s - diffColor.s);
      const lDiff = Math.abs(baseColor.l - diffColor.l);
      setLastDiffInfo(`ΔH: ${hDiff.toFixed(1)}° | ΔS: ${sDiff.toFixed(1)}% | ΔL: ${lDiff.toFixed(1)}%`);
      
      startNewLevel(newScore);
    } else {
      setTimeLeft(prev => Math.max(0, prev - 3));
    }
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 0.1) {
            setGameState('GAMEOVER');
            return 0;
          }
          return prev - 0.1;
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score, highScore]);

  const toggleLang = () => setLang(prev => prev === 'en' ? 'zh' : 'en');

  const getRank = (s: number) => {
    if (s < 10) return t.ranks.novice;
    if (s < 20) return t.ranks.apprentice;
    if (s < 35) return t.ranks.artisan;
    if (s < 50) return t.ranks.master;
    return t.ranks.visionary;
  };

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0] p-4 md:p-8 flex flex-col items-center justify-center">
      {/* Header Section */}
      <header className="w-full max-w-2xl mb-8 flex flex-col md:flex-row items-end justify-between border-b-2 border-[#141414] pb-4 relative">
        <div className="text-left">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none mb-2">
            {t.title}<br />{t.titleSuffix}
          </h1>
          <p className="font-mono text-xs uppercase tracking-widest opacity-60">
            {t.subtitle}
          </p>
        </div>
        
        <div className="flex flex-col items-end mt-4 md:mt-0">
          <button 
            onClick={toggleLang}
            className="mb-4 flex items-center gap-2 px-3 py-1 border border-[#141414] hover:bg-[#141414] hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <Languages size={14} />
            {lang === 'en' ? '中文' : 'EN'}
          </button>
          
          <div className="flex items-center gap-4 mb-2">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase opacity-50">{t.highScore}</span>
              <span className="font-mono text-2xl font-bold">{highScore}</span>
            </div>
            <div className="h-10 w-[1px] bg-[#141414] opacity-20" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold uppercase opacity-50">{t.current}</span>
              <span className="font-mono text-2xl font-bold">{score}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        <AnimatePresence mode="wait">
          {gameState === 'START' && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)]"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-[#141414] text-white">
                  <Eye size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold uppercase mb-1 italic">{t.calibrationRequired}</h2>
                  <p className="text-sm opacity-80 leading-relaxed">
                    {t.description}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="border border-[#141414] p-4 flex items-center gap-3">
                  <Timer size={20} className="shrink-0" />
                  <span className="text-xs font-bold uppercase">{t.initialTimer}</span>
                </div>
                <div className="border border-[#141414] p-4 flex items-center gap-3">
                  <Zap size={20} className="shrink-0" />
                  <span className="text-xs font-bold uppercase">{t.bonusTime}</span>
                </div>
                <div className="border border-[#141414] p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0 text-red-600" />
                  <span className="text-xs font-bold uppercase">{t.penaltyTime}</span>
                </div>
                <div className="border border-[#141414] p-4 flex items-center gap-3">
                  <Trophy size={20} className="shrink-0" />
                  <span className="text-xs font-bold uppercase">{t.maxDensity}</span>
                </div>
              </div>

              <button
                onClick={startGame}
                className="w-full group relative overflow-hidden bg-[#141414] text-white py-6 flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
              >
                <span className="text-xl font-black uppercase tracking-widest">{t.initiateTest}</span>
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {gameState === 'PLAYING' && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              {/* Game HUD */}
              <div className="w-full flex justify-between items-center mb-6 bg-white border-2 border-[#141414] p-4 shadow-[4px_4px_0px_0px_rgba(20,20,20,1)]">
                <div className="flex items-center gap-2">
                  <Timer size={18} />
                  <div className="w-48 h-3 bg-[#E4E3E0] border border-[#141414] relative overflow-hidden">
                    <motion.div 
                      className={`h-full ${timeLeft < 5 ? 'bg-red-500' : 'bg-[#141414]'}`}
                      animate={{ width: `${(timeLeft / 30) * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <span className="font-mono text-sm font-bold w-12">{timeLeft.toFixed(1)}s</span>
                </div>
                {lastDiffInfo && (
                  <div className="hidden md:block font-mono text-[10px] uppercase opacity-60">
                    {lastDiffInfo}
                  </div>
                )}
              </div>

              {/* Grid Container */}
              <div 
                className="grid gap-2 w-full aspect-square bg-white border-2 border-[#141414] p-2 shadow-[12px_12px_0px_0px_rgba(20,20,20,1)]"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                  gridTemplateRows: `repeat(${gridSize}, 1fr)`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 0.98 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBlockClick(i)}
                    className="w-full h-full border border-[#141414]/10"
                    style={{ 
                      backgroundColor: i === targetIndex ? colorToCSS(diffColor) : colorToCSS(baseColor)
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {gameState === 'GAMEOVER' && (
            <motion.div
              key="gameover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full bg-white border-2 border-[#141414] p-8 shadow-[8px_8px_0px_0px_rgba(20,20,20,1)] text-center"
            >
              <div className="mb-6">
                <h2 className="text-4xl font-black uppercase mb-2">{t.testTerminated}</h2>
                <p className="font-mono text-sm opacity-60 uppercase">{t.analysisComplete}</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 border-2 border-[#141414] p-6">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.finalScore}</span>
                  <span className="text-6xl font-black">{score}</span>
                </div>
                <div className="flex-1 border-2 border-[#141414] p-6 bg-[#141414] text-white">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">{t.rank}</span>
                  <span className="text-3xl font-black uppercase italic">
                    {getRank(score)}
                  </span>
                </div>
              </div>

              <div className="text-left mb-8 p-4 bg-[#E4E3E0] border border-[#141414] font-mono text-xs">
                <div className="flex items-center gap-2 mb-2 font-bold uppercase">
                  <Info size={14} />
                  <span>{t.technicalSummary}</span>
                </div>
                <p className="opacity-80">
                  {t.summaryText(score, gridSize, ((15 + score * 2 - timeLeft) / score || 0).toFixed(2))}
                </p>
              </div>

              <button
                onClick={startGame}
                className="w-full bg-[#141414] text-white py-4 flex items-center justify-center gap-3 hover:bg-zinc-800 transition-colors"
              >
                <RefreshCw size={20} />
                <span className="text-lg font-bold uppercase tracking-widest">{t.restart}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Meta */}
      <footer className="mt-16 w-full max-w-2xl flex justify-between items-center border-t border-[#141414]/20 pt-4 font-mono text-[10px] uppercase tracking-widest opacity-40">
        <span>{t.precision}</span>
        <span>{t.environment}</span>
        <span>© 2026 Chroma Vision</span>
      </footer>
    </div>
  );
}
