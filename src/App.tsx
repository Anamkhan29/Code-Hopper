/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, HelpCircle, Pause, AlertCircle, Bird, Sparkles, Smartphone } from 'lucide-react';
import { questions, Question } from './data/questions';

// Constants
const GRAVITY = 0.4;
const JUMP_STRENGTH = -7;
const PIPE_WIDTH = 60;
const PIPE_GAP = 160;
const PIPE_SPEED = 3;
const BIRD_SIZE = 34;
const GAME_WIDTH = 400;
const GAME_HEIGHT = 600;
const PIPES_PER_LEVEL = 1;

type Language = 'JavaScript' | 'Python' | 'HTML/CSS' | 'C++' | 'Java' | 'SQL';

// Sound Service
let audioCtx: AudioContext | null = null;

const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

const playBGMNote = (ctx: AudioContext, time: number, step: number) => {
  // Doraemon Theme (Simplified)
  // G4 G4 G4 A4 G4 C5 B4 (Phrase 1)
  // G4 G4 G4 A4 G4 D5 C5 (Phrase 2)
  const melody = [
    392.00, 392.00, 392.00, 440.00, 392.00, 523.25, 493.88, 0,
    392.00, 392.00, 392.00, 440.00, 392.00, 587.33, 523.25, 0
  ];
  const bass = [
    196.00, 196.00, 220.00, 196.00, 261.63, 261.63, 246.94, 246.94,
    196.00, 196.00, 220.00, 196.00, 293.66, 293.66, 261.63, 261.63
  ];

  const currentNote = melody[step % 16];
  const currentBass = bass[step % 16];
  
  // Bass
  if (currentBass > 0) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.connect(bassGain);
    bassGain.connect(ctx.destination);
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(currentBass / 2, time); // One octave lower
    bassGain.gain.setValueAtTime(0.015, time);
    bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    bassOsc.start(time);
    bassOsc.stop(time + 0.3);
  }

  // Melody
  if (currentNote > 0) {
    const melOsc = ctx.createOscillator();
    const melGain = ctx.createGain();
    melOsc.connect(melGain);
    melGain.connect(ctx.destination);
    melOsc.type = 'sine';
    melOsc.frequency.setValueAtTime(currentNote, time);
    melGain.gain.setValueAtTime(0.02, time);
    melGain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);
    melOsc.start(time);
    melOsc.stop(time + 0.2);
  }
};

const playSound = (type: 'jump' | 'score' | 'correct' | 'wrong' | 'gameover' | 'countdown') => {
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
  
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;

  switch (type) {
    case 'jump':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);
      gain.gain.setValueAtTime(0.3, now); // Increased volume
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'score':
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(600, now + 0.05);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'correct':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.setValueAtTime(400, now + 0.1);
      osc.frequency.setValueAtTime(500, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'wrong':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'gameover':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'countdown':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
  }
};

interface PipeData {
  id: number;
  x: number;
  topHeight: number;
  passed: boolean;
}

export default function App() {
  const [birdY, setBirdY] = useState(GAME_HEIGHT / 2);
  const [velocity, setVelocity] = useState(0);
  const [pipes, setPipes] = useState<PipeData[]>([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'LANGUAGE_SELECT' | 'PLAYING' | 'QUIZ' | 'COUNTDOWN' | 'GAME_OVER'>('START');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('JavaScript');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [lastQuizScore, setLastQuizScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [completedQuestionIds, setCompletedQuestionIds] = useState<number[]>([]);
  const [isAudioResumed, setIsAudioResumed] = useState(false);

  const gameLoopRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bgmStepRef = useRef(0);

  // Load high score and completed questions
  useEffect(() => {
    try {
      const savedHighScore = localStorage.getItem('codehopper-highscore') || localStorage.getItem('codeflap-highscore');
      if (savedHighScore) setHighScore(parseInt(savedHighScore, 10));
      
      const savedCompleted = localStorage.getItem('codehopper-completed-questions') || localStorage.getItem('codeflap-completed-questions');
      if (savedCompleted) {
        const parsed = JSON.parse(savedCompleted);
        if (Array.isArray(parsed)) {
          setCompletedQuestionIds(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load saved data", e);
    }
  }, []);

  // Save completed questions whenever they change
  useEffect(() => {
    if (completedQuestionIds.length > 0) {
      localStorage.setItem('codehopper-completed-questions', JSON.stringify(completedQuestionIds));
    }
  }, [completedQuestionIds]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('codehopper-highscore', score.toString());
    }
  }, [score, highScore]);

  const resumeAudio = useCallback(() => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => setIsAudioResumed(true));
    } else {
      setIsAudioResumed(true);
    }
  }, []);

  const jump = useCallback(() => {
    resumeAudio();

    if (gameState === 'PLAYING') {
      setVelocity(JUMP_STRENGTH);
      playSound('jump');
    } else if (gameState === 'START') {
      startGame();
    } else if (gameState === 'GAME_OVER') {
      resetGame();
    }
  }, [gameState]);

  const startGame = () => {
    resumeAudio();
    setGameState('PLAYING');
    setLastQuizScore(0);
  };

  const selectLanguage = (lang: Language) => {
    resumeAudio();
    setSelectedLanguage(lang);
    setGameState('START');
  };

  const resetGame = () => {
    setBirdY(GAME_HEIGHT / 2);
    setVelocity(0);
    setPipes([]);
    setScore(0);
    setGameState('START');
    setLastQuizScore(0);
    // Note: completedQuestionIds is NOT reset here so it persists after losing
  };

  const triggerQuiz = useCallback(() => {
    setGameState('QUIZ');
    const filteredQuestions = questions.filter(q => q.language === selectedLanguage);
    
    // Filter out already completed questions
    let availableQuestions = filteredQuestions.filter(q => !completedQuestionIds.includes(q.id));
    
    // If all questions in this language are completed, we have to allow repeats
    // but we'll try to avoid the most recently answered ones if possible
    if (availableQuestions.length === 0) {
      availableQuestions = filteredQuestions;
    }

    // Pick a random question from available ones
    const randomQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    setCurrentQuestion(randomQuestion);
    setShowHint(false);
  }, [selectedLanguage, completedQuestionIds]);

  const handleAnswer = (index: number) => {
    resumeAudio();
    if (currentQuestion && index === currentQuestion.correctAnswer) {
      playSound('correct');
      
      // Mark question as completed
      setCompletedQuestionIds(prev => {
        if (prev.includes(currentQuestion.id)) return prev;
        return [...prev, currentQuestion.id];
      });

      setGameState('COUNTDOWN');
      setCountdown(3);
      setCurrentQuestion(null);
    } else {
      playSound('wrong');
      setGameState('GAME_OVER');
      playSound('gameover');
    }
  };

  // Countdown effect
  useEffect(() => {
    if (gameState !== 'COUNTDOWN') return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
        playSound('countdown');
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setGameState('PLAYING');
      setLastQuizScore(score);
    }
  }, [gameState, countdown, score]);

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [jump]);

  // BGM Loop
  useEffect(() => {
    if (gameState === 'QUIZ' || gameState === 'GAME_OVER') return;
    if (!isAudioResumed) return;

    const bgmInterval = setInterval(() => {
      const ctx = getAudioCtx();
      playBGMNote(ctx, ctx.currentTime, bgmStepRef.current);
      bgmStepRef.current = (bgmStepRef.current + 1) % 16;
    }, 250);

    return () => clearInterval(bgmInterval);
  }, [gameState, isAudioResumed]);

  // Game Loop
  useEffect(() => {
    if (gameState !== 'PLAYING') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      return;
    }

    const update = () => {
      // Check for quiz trigger (every 5 pipes)
      if (score > 0 && score % PIPES_PER_LEVEL === 0 && score !== lastQuizScore) {
        triggerQuiz();
        return;
      }

      // Update Bird
      setBirdY((y) => {
        const nextY = y + velocity;
        if (nextY < 0 || nextY > GAME_HEIGHT - BIRD_SIZE) {
          setGameState('GAME_OVER');
          return y;
        }
        return nextY;
      });
      setVelocity((v) => v + GRAVITY);

      // Update Pipes
      setPipes((prevPipes) => {
        // Move pipes
        let newPipes = prevPipes.map((p) => ({ ...p, x: p.x - PIPE_SPEED }));

        // Remove off-screen pipes
        newPipes = newPipes.filter((p) => p.x + PIPE_WIDTH > 0);

        // Add new pipes
        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < GAME_WIDTH - 200) {
          const topHeight = Math.random() * (GAME_HEIGHT - PIPE_GAP - 100) + 50;
          newPipes.push({
            id: Date.now(),
            x: GAME_WIDTH,
            topHeight,
            passed: false,
          });
        }

        // Check collisions and scoring
        newPipes.forEach((p) => {
          // Collision check
          const birdLeft = 50;
          const birdRight = 50 + BIRD_SIZE;
          const birdTop = birdY;
          const birdBottom = birdY + BIRD_SIZE;

          const pipeLeft = p.x;
          const pipeRight = p.x + PIPE_WIDTH;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < p.topHeight || birdBottom > p.topHeight + PIPE_GAP) {
              setGameState('GAME_OVER');
            }
          }

          // Scoring
          if (!p.passed && p.x + PIPE_WIDTH < birdLeft) {
            p.passed = true;
            setScore((s) => s + 1);
            playSound('score');
          }
        });

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState, velocity, birdY, score, lastQuizScore, triggerQuiz]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans text-zinc-100">
      <div 
        className="relative overflow-hidden bg-sky-400 border-4 border-zinc-800 shadow-2xl rounded-xl"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        ref={containerRef}
        onClick={jump}
      >
        {/* Background Elements */}
        <div className="absolute bottom-0 w-full h-24 bg-emerald-500 border-t-4 border-emerald-600">
          <div className="flex justify-around mt-2 opacity-50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-8 h-8 bg-emerald-400 rounded-full" />
            ))}
          </div>
        </div>

        {/* Pipes */}
        {pipes.map((pipe) => (
          <React.Fragment key={pipe.id}>
            {/* Top Pipe */}
            <div 
              className="absolute bg-emerald-600 border-x-4 border-b-4 border-zinc-900"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
              }}
            >
              <div className="absolute bottom-0 -left-2 w-[calc(100%+16px)] h-6 bg-emerald-600 border-4 border-zinc-900" />
            </div>
            {/* Bottom Pipe */}
            <div 
              className="absolute bg-emerald-600 border-x-4 border-t-4 border-zinc-900"
              style={{
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                width: PIPE_WIDTH,
                height: GAME_HEIGHT - (pipe.topHeight + PIPE_GAP),
              }}
            >
              <div className="absolute top-0 -left-2 w-[calc(100%+16px)] h-6 bg-emerald-600 border-4 border-zinc-900" />
            </div>
          </React.Fragment>
        ))}

        {/* Bird (Ababil Bird Style) */}
        <motion.div 
          className="absolute left-[50px] w-[40px] h-[20px] flex items-center justify-center"
          animate={{ 
            top: birdY,
            rotate: velocity * 3
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.5 }}
        >
          {/* Main Body */}
          <div className="w-full h-full bg-zinc-800 rounded-full relative">
            {/* Wing Top */}
            <motion.div 
              className="absolute -top-4 left-2 w-8 h-4 bg-zinc-700 rounded-full origin-bottom"
              animate={{ rotate: velocity < 0 ? -45 : 0 }}
            />
            {/* Wing Bottom */}
            <motion.div 
              className="absolute -bottom-1 left-2 w-8 h-4 bg-zinc-700 rounded-full origin-top"
              animate={{ rotate: velocity < 0 ? 45 : 0 }}
            />
            {/* Forked Tail */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1">
              <div className="w-4 h-1.5 bg-zinc-800 -rotate-12 rounded-full" />
              <div className="w-4 h-1.5 bg-zinc-800 rotate-12 rounded-full" />
            </div>
            {/* Eye */}
            <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1.5 right-2" />
            {/* Beak */}
            <div className="w-2 h-1 bg-amber-600 absolute top-2.5 -right-1.5 rounded-full" />
          </div>
        </motion.div>

        {/* Score Display */}
        {(gameState === 'PLAYING' || gameState === 'QUIZ' || gameState === 'GAME_OVER') && (
          <div className="absolute top-8 w-full text-center pointer-events-none">
            <span className="text-6xl font-black text-white drop-shadow-[0_4px_0_rgba(0,0,0,1)]">
              {score}
            </span>
          </div>
        )}

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'START' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#00529B] flex flex-col items-center justify-center p-6 text-center"
            >
              {/* Main Card */}
              <div className="relative bg-white text-zinc-900 w-full max-w-[340px] p-8 rounded-[2.5rem] border-[6px] border-zinc-950 shadow-[12px_12px_0_rgba(0,0,0,1)] flex flex-col items-center">
                
                {/* Top Left Birds */}
                <div className="absolute -top-12 -left-4 flex flex-col gap-2">
                  <Bird size={48} className="text-zinc-800 -rotate-12 drop-shadow-md" fill="#E4E4E4" />
                  <Bird size={40} className="text-zinc-800 rotate-12 drop-shadow-md ml-4" fill="#E4E4E4" />
                </div>

                {/* Top Right Sparkles */}
                <div className="absolute -top-10 -right-6">
                  <Sparkles size={80} className="text-amber-400 drop-shadow-lg" />
                </div>

                {/* Title Section */}
                <h1 className="text-5xl font-black mb-1 uppercase italic tracking-tighter text-zinc-900 leading-none">
                  Code Hopper
                </h1>
                
                <div className="flex flex-col items-center mb-8">
                  <p className="text-lg font-bold text-zinc-500">
                    Language: <span className="text-emerald-500">{selectedLanguage}</span>
                  </p>
                  <p className="text-sm font-medium text-zinc-400 italic">
                    Quiz every {PIPES_PER_LEVEL} pipe!
                  </p>
                </div>

                {/* Start Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); startGame(); }}
                  className="w-full bg-emerald-500 text-white py-5 rounded-3xl font-black text-2xl flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all border-b-[8px] border-emerald-700 active:border-b-0 active:translate-y-2 shadow-lg mb-6"
                >
                  <Play size={32} fill="currentColor" /> START GAME
                </button>

                {/* Bottom Section */}
                <div className="w-full flex items-end justify-between mt-2">
                  {/* Left Phone Graphic */}
                  <div className="flex flex-col items-center gap-1 opacity-80">
                    <div className="w-12 h-20 bg-zinc-100 border-2 border-zinc-300 rounded-lg relative overflow-hidden">
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-zinc-300 rounded-full" />
                      <div className="mt-4 flex flex-col gap-1 px-1">
                        <div className="h-2 w-full bg-rose-400 rounded-sm" />
                        <div className="h-2 w-2/3 bg-amber-400 rounded-sm" />
                        <div className="h-2 w-full bg-emerald-400 rounded-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Middle Info */}
                  <div className="flex flex-col items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setGameState('LANGUAGE_SELECT'); }}
                      className="text-zinc-400 font-black text-sm uppercase tracking-wider hover:text-zinc-900 transition-colors"
                    >
                      Change Language
                    </button>
                    <div className="flex items-center gap-2 text-zinc-500 font-black text-sm uppercase">
                      <Trophy size={18} className="text-amber-500" /> High Score: {highScore}
                    </div>
                  </div>

                  {/* Right Birds */}
                  <div className="flex flex-col gap-1 items-end">
                    <Bird size={24} className="text-sky-500" fill="currentColor" />
                    <div className="flex gap-1">
                      <Bird size={20} className="text-sky-500" fill="currentColor" />
                      <Bird size={18} className="text-sky-500" fill="currentColor" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Text */}
              <div className="mt-12">
                <p className="text-white font-black text-2xl uppercase tracking-widest drop-shadow-lg">
                  Press Space or Click to Jump
                </p>
              </div>

              {/* Bottom Banner */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-emerald-700 border-t-4 border-zinc-900 overflow-hidden flex items-center justify-center">
                <div className="flex gap-8 items-end translate-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative">
                      <div className="w-24 h-24 bg-amber-200 rounded-full border-4 border-zinc-900 overflow-hidden">
                        <div className="absolute inset-0 bg-rose-200 translate-y-12" />
                        <div className="absolute top-8 left-6 w-2 h-2 bg-zinc-900 rounded-full" />
                        <div className="absolute top-8 right-6 w-2 h-2 bg-zinc-900 rounded-full" />
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-6 h-3 border-b-4 border-zinc-900 rounded-full" />
                      </div>
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-zinc-900 rounded-full opacity-20" />
                    </div>
                  ))}
                </div>
                {/* Colorful Shapes */}
                <div className="absolute inset-0 pointer-events-none opacity-30">
                  <div className="absolute top-4 left-10 w-4 h-4 bg-rose-500 rotate-45" />
                  <div className="absolute top-10 right-20 w-3 h-3 bg-amber-500 rounded-full" />
                  <div className="absolute bottom-4 left-1/4 w-5 h-2 bg-sky-500 -rotate-12" />
                  <div className="absolute top-6 right-1/3 w-4 h-4 border-2 border-emerald-400 rounded-sm" />
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'LANGUAGE_SELECT' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white text-zinc-900 w-full rounded-2xl border-4 border-zinc-900 shadow-[8px_8px_0_rgba(0,0,0,1)] p-8">
                <h2 className="text-2xl font-black mb-6 uppercase italic tracking-tighter text-center">Select Language</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(['JavaScript', 'Python', 'HTML/CSS', 'C++', 'Java', 'SQL'] as Language[]).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => selectLanguage(lang)}
                      className={`p-3 rounded-xl border-2 font-bold transition-all text-center text-sm ${
                        selectedLanguage === lang 
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700' 
                          : 'border-zinc-200 hover:border-zinc-400'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'COUNTDOWN' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <div className="text-white text-9xl font-black drop-shadow-[0_8px_0_rgba(0,0,0,1)]">
                {countdown}
              </div>
            </motion.div>
          )}

          {gameState === 'QUIZ' && currentQuestion && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 bg-zinc-950/90 flex items-center justify-center p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white text-zinc-900 w-full rounded-2xl border-4 border-zinc-900 shadow-[8px_8px_0_rgba(0,0,0,1)] p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-600 font-black uppercase text-xs tracking-widest">
                  <Pause size={14} /> GAME PAUSED • QUIZ TIME
                </div>
                <h2 className="text-xl font-bold mb-6 leading-tight">
                  {currentQuestion.text}
                </h2>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(idx)}
                      className="w-full text-left p-4 rounded-xl border-2 border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-bold text-sm flex items-center gap-3 group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      {option}
                    </button>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t-2 border-zinc-100">
                  {showHint ? (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm font-medium flex gap-3 items-start border-2 border-amber-200">
                      <AlertCircle size={18} className="shrink-0 mt-0.5" />
                      <p>{currentQuestion.hint}</p>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setShowHint(true)}
                      className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 font-bold text-sm transition-colors mx-auto"
                    >
                      <HelpCircle size={16} /> NEED A HINT?
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'GAME_OVER' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-red-500/20 backdrop-blur-sm flex items-center justify-center p-8"
            >
              <div className="bg-white text-zinc-900 p-8 rounded-2xl border-4 border-zinc-900 shadow-[8px_8px_0_rgba(0,0,0,1)] text-center w-full max-w-xs">
                <h2 className="text-4xl font-black mb-2 text-red-600 uppercase italic tracking-tighter">GAME OVER</h2>
                <div className="flex justify-center gap-8 my-6">
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Score</p>
                    <p className="text-3xl font-black">{score}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Best</p>
                    <p className="text-3xl font-black">{highScore}</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); resetGame(); }}
                  className="w-full bg-zinc-900 text-white py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors border-b-4 border-zinc-950 active:border-b-0 active:translate-y-1"
                >
                  <RotateCcw size={20} /> TRY AGAIN
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Instructions Sidebar (Desktop) */}
      <div className="hidden lg:block ml-12 max-w-xs">
        <h3 className="text-2xl font-black mb-4 italic uppercase tracking-tighter">How to Play</h3>
        <ul className="space-y-4">
          <li className="flex gap-4 items-start">
            <div className="bg-zinc-800 p-2 rounded-lg shrink-0">
              <div className="w-6 h-6 border-2 border-white rounded flex items-center justify-center text-[10px] font-bold">SPC</div>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Press <span className="text-zinc-100 font-bold">Space</span> or <span className="text-zinc-100 font-bold">Click</span> to jump and avoid the pipes.
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="bg-zinc-800 p-2 rounded-lg shrink-0">
              <HelpCircle size={24} className="text-emerald-500" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Every <span className="text-zinc-100 font-bold">{PIPES_PER_LEVEL} pipe</span>, the game pauses for a programming quiz.
            </p>
          </li>
          <li className="flex gap-4 items-start">
            <div className="bg-zinc-800 p-2 rounded-lg shrink-0">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Answer correctly to continue. A wrong answer ends the game!
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
