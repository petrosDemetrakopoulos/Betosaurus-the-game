import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Key, Moon } from 'lucide-react';
import './index.css'

interface Position {
  x: number;
  y: number;
}

interface Door {
  x: number;
  y: number;
  color: string;
  open: boolean;
}

interface Key {
  x: number;
  y: number;
  color: string;
}

interface Enemy {
  start: Position;
  path: Position[];
  type?: 'normal' | 'boss';
  health?: number;
}

interface EnemyState extends Enemy {
  pos: Position;
  pathIndex: number;
  currentHealth?: number;
}

interface Powerup {
  x: number;
  y: number;
  type: 'speed' | 'invincible' | 'time' | 'magnet';
}

interface MovingPlatform {
  id: number;
  path: Position[];
  currentIndex: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  type: 'sparkle' | 'snow' | 'bubble' | 'lava';
}

interface Level {
  name: string;
  theme: 'forest' | 'ice' | 'underwater' | 'volcano' | 'space';
  width: number;
  height: number;
  start: Position;
  bed: Position;
  walls: Position[];
  pillows: Position[];
  dreams: Position[];
  doors: Door[];
  keys: Key[];
  enemies: Enemy[];
  powerups: Powerup[];
  platforms?: MovingPlatform[];
}

const BetosaurusGame: React.FC = () => {
  const TILE_SIZE = 50;
  
  // Sound effects using Web Audio API
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioEnabled(true);
      } catch (e) {
        console.log('Audio not supported');
      }
    }
  }, []);

  const playSound = useCallback((frequency: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!audioContextRef.current || !audioEnabled) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (e) {
      console.log('Sound playback failed');
    }
  }, [audioEnabled]);

  const playRoar = useCallback(() => {
    if (!audioContextRef.current || !audioEnabled) return;
    
    try {
      // Create a dinosaur roar effect with multiple oscillators
      const frequencies = [80, 120, 200, 150, 100];
      const durations = [0.3, 0.4, 0.2, 0.3, 0.5];
      
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = audioContextRef.current!.createOscillator();
          const gainNode = audioContextRef.current!.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContextRef.current!.destination);
          
          oscillator.frequency.value = freq;
          oscillator.type = 'sawtooth';
          
          gainNode.gain.setValueAtTime(0.4, audioContextRef.current!.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + durations[i]);
          
          oscillator.start(audioContextRef.current!.currentTime);
          oscillator.stop(audioContextRef.current!.currentTime + durations[i]);
        }, i * 100);
      });
    } catch (e) {
      console.log('Roar sound failed');
    }
  }, [audioEnabled]);
  
  // Level definitions
  const levels: Level[] = [
    {
      name: "Forest Awakening",
      theme: 'forest',
      width: 15,
      height: 10,
      start: { x: 1, y: 8 },
      bed: { x: 13, y: 1 },
      walls: [
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 9 })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 14, y: i })),
        { x: 5, y: 3 }, { x: 5, y: 4 }, { x: 5, y: 5 }, { x: 5, y: 6 },
        { x: 9, y: 3 }, { x: 9, y: 4 }, { x: 9, y: 5 }, { x: 9, y: 6 },
      ],
      pillows: [
        { x: 3, y: 3 }, { x: 7, y: 7 }
      ],
      dreams: [
        { x: 2, y: 2 }, { x: 11, y: 7 }
      ],
      doors: [],
      keys: [],
      enemies: [],
      powerups: []
    },
    {
      name: "Frozen Caverns",
      theme: 'ice',
      width: 15,
      height: 10,
      start: { x: 1, y: 1 },
      bed: { x: 13, y: 8 },
      walls: [
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 9 })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 14, y: i })),
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
        { x: 6, y: 5 }, { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 6, y: 8 },
        { x: 9, y: 1 }, { x: 9, y: 2 }, { x: 9, y: 3 },
      ],
      pillows: [
        { x: 2, y: 5 }, { x: 12, y: 3 }
      ],
      dreams: [
        { x: 5, y: 2 }, { x: 8, y: 7 }, { x: 11, y: 2 }
      ],
      doors: [
        { x: 6, y: 4, color: 'red', open: false },
        { x: 11, y: 6, color: 'blue', open: false }
      ],
      keys: [
        { x: 2, y: 7, color: 'red' },
        { x: 10, y: 5, color: 'blue' }
      ],
      enemies: [
        { start: { x: 4, y: 7 }, path: [{x: 4, y: 7}, {x: 5, y: 7}, {x: 5, y: 8}, {x: 4, y: 8}] }
      ],
      powerups: [
        { x: 8, y: 3, type: 'speed' }
      ]
    },
    {
      name: "Deep Ocean",
      theme: 'underwater',
      width: 15,
      height: 10,
      start: { x: 1, y: 1 },
      bed: { x: 13, y: 8 },
      walls: [
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 15 }, (_, i) => ({ x: i, y: 9 })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 10 }, (_, i) => ({ x: 14, y: i })),
        { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 },
        { x: 7, y: 5 }, { x: 8, y: 5 }, { x: 9, y: 5 },
        { x: 11, y: 2 }, { x: 11, y: 3 }, { x: 11, y: 4 },
      ],
      pillows: [
        { x: 2, y: 2 }, { x: 6, y: 7 }, { x: 12, y: 2 }
      ],
      dreams: [
        { x: 3, y: 6 }, { x: 7, y: 2 }, { x: 10, y: 7 }, { x: 12, y: 5 }
      ],
      doors: [
        { x: 7, y: 4, color: 'red', open: false },
        { x: 10, y: 6, color: 'blue', open: false }
      ],
      keys: [
        { x: 2, y: 4, color: 'red' },
        { x: 5, y: 3, color: 'blue' }
      ],
      enemies: [
        { start: { x: 6, y: 2 }, path: [{x: 6, y: 2}, {x: 6, y: 3}, {x: 6, y: 4}] },
        { start: { x: 9, y: 7 }, path: [{x: 9, y: 7}, {x: 10, y: 7}, {x: 11, y: 7}, {x: 12, y: 7}] },
        { start: { x: 2, y: 8 }, path: [{x: 2, y: 8}, {x: 3, y: 8}, {x: 4, y: 8}, {x: 5, y: 8}] }
      ],
      powerups: [
        { x: 4, y: 4, type: 'invincible' }
      ]
    },
    {
      name: "Volcanic Maze",
      theme: 'volcano',
      width: 17,
      height: 12,
      start: { x: 1, y: 1 },
      bed: { x: 15, y: 10 },
      walls: [
        ...Array.from({ length: 17 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 17 }, (_, i) => ({ x: i, y: 11 })),
        ...Array.from({ length: 12 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 12 }, (_, i) => ({ x: 16, y: i })),
        { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 }, { x: 3, y: 4 },
        { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 },
        { x: 10, y: 1 }, { x: 10, y: 2 }, { x: 10, y: 3 }, { x: 10, y: 4 }, { x: 10, y: 5 },
        { x: 12, y: 3 }, { x: 13, y: 3 }, { x: 14, y: 3 },
        { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 7, y: 5 }, { x: 7, y: 6 }, { x: 7, y: 7 }, { x: 7, y: 8 },
        { x: 12, y: 6 }, { x: 12, y: 7 }, { x: 12, y: 8 }, { x: 12, y: 9 },
        { x: 14, y: 5 }, { x: 14, y: 6 }, { x: 14, y: 7 }
      ],
      pillows: [
        { x: 2, y: 2 }, { x: 8, y: 4 }, { x: 15, y: 2 }, { x: 6, y: 9 }
      ],
      dreams: [
        { x: 1, y: 5 }, { x: 9, y: 3 }, { x: 11, y: 8 }, { x: 15, y: 5 }, { x: 5, y: 10 }
      ],
      doors: [
        { x: 5, y: 4, color: 'red', open: false },
        { x: 9, y: 6, color: 'blue', open: false },
        { x: 13, y: 8, color: 'green', open: false }
      ],
      keys: [
        { x: 1, y: 3, color: 'red' },
        { x: 11, y: 2, color: 'blue' },
        { x: 6, y: 8, color: 'green' }
      ],
      enemies: [
        { start: { x: 8, y: 6 }, path: [{x: 8, y: 6}, {x: 9, y: 6}, {x: 9, y: 7}, {x: 8, y: 7}] },
        { start: { x: 13, y: 5 }, path: [{x: 13, y: 5}, {x: 13, y: 6}] },
        { start: { x: 4, y: 9 }, path: [{x: 4, y: 9}, {x: 5, y: 9}, {x: 6, y: 9}, {x: 7, y: 9}] }
      ],
      powerups: [
        { x: 3, y: 8, type: 'time' },
        { x: 14, y: 4, type: 'invincible' }
      ]
    },
    {
      name: "Space Station",
      theme: 'space',
      width: 20,
      height: 8,
      start: { x: 1, y: 6 },
      bed: { x: 18, y: 1 },
      walls: [
        ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 7 })),
        ...Array.from({ length: 8 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 8 }, (_, i) => ({ x: 19, y: i })),
        { x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }, { x: 4, y: 5 },
        { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 },
        { x: 12, y: 4 }, { x: 12, y: 5 }, { x: 12, y: 6 },
        { x: 16, y: 2 }, { x: 16, y: 3 }, { x: 16, y: 4 }
      ],
      pillows: [
        { x: 6, y: 5 }, { x: 14, y: 2 }
      ],
      dreams: [
        { x: 2, y: 2 }, { x: 10, y: 1 }, { x: 18, y: 5 }
      ],
      doors: [],
      keys: [],
      enemies: [
        { start: { x: 6, y: 2 }, path: [{x: 6, y: 2}, {x: 7, y: 2}, {x: 7, y: 3}, {x: 6, y: 3}] },
        { start: { x: 10, y: 4 }, path: [{x: 10, y: 4}, {x: 11, y: 4}, {x: 11, y: 5}, {x: 10, y: 5}] },
        { start: { x: 14, y: 6 }, path: [{x: 14, y: 6}, {x: 15, y: 6}, {x: 15, y: 5}, {x: 14, y: 5}] }
      ],
      powerups: [
        { x: 9, y: 2, type: 'speed' },
        { x: 16, y: 4, type: 'time' }
      ]
    },
    {
      name: "Crystal Caverns",
      theme: 'ice',
      width: 18,
      height: 14,
      start: { x: 1, y: 12 },
      bed: { x: 16, y: 1 },
      walls: [
        ...Array.from({ length: 18 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 18 }, (_, i) => ({ x: i, y: 13 })),
        ...Array.from({ length: 14 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 14 }, (_, i) => ({ x: 17, y: i })),
        { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 },
        { x: 8, y: 4 }, { x: 9, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 },
        { x: 13, y: 6 }, { x: 14, y: 6 }, { x: 15, y: 6 },
        { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 },
        { x: 7, y: 10 }, { x: 8, y: 10 }, { x: 9, y: 10 }, { x: 10, y: 10 }
      ],
      pillows: [
        { x: 2, y: 4 }, { x: 12, y: 8 }, { x: 15, y: 3 }
      ],
      dreams: [
        { x: 7, y: 2 }, { x: 1, y: 6 }, { x: 16, y: 9 }, { x: 11, y: 12 }
      ],
      doors: [
        { x: 6, y: 6, color: 'red', open: false },
        { x: 12, y: 2, color: 'blue', open: false }
      ],
      keys: [
        { x: 1, y: 2, color: 'red' },
        { x: 15, y: 11, color: 'blue' }
      ],
      enemies: [
        { start: { x: 7, y: 6 }, path: [{x: 7, y: 6}, {x: 8, y: 6}, {x: 8, y: 7}, {x: 7, y: 7}] },
        { start: { x: 13, y: 10 }, path: [{x: 13, y: 10}, {x: 14, y: 10}, {x: 14, y: 11}, {x: 13, y: 11}] }
      ],
      powerups: [
        { x: 6, y: 8, type: 'invincible' },
        { x: 11, y: 6, type: 'speed' }
      ]
    },
    {
      name: "Boss Arena",
      theme: 'volcano',
      width: 16,
      height: 16,
      start: { x: 8, y: 14 },
      bed: { x: 8, y: 1 },
      walls: [
        ...Array.from({ length: 16 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 7 }, (_, i) => ({ x: i, y: 15 })),
        ...Array.from({ length: 7 }, (_, i) => ({ x: i + 9, y: 15 })),
        ...Array.from({ length: 16 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 16 }, (_, i) => ({ x: 15, y: i })),
        { x: 4, y: 4 }, { x: 5, y: 4 }, { x: 10, y: 4 }, { x: 11, y: 4 },
        { x: 4, y: 11 }, { x: 5, y: 11 }, { x: 10, y: 11 }, { x: 11, y: 11 }
      ],
      pillows: [
        { x: 3, y: 7 }, { x: 12, y: 7 }
      ],
      dreams: [
        { x: 2, y: 2 }, { x: 13, y: 2 }, { x: 2, y: 13 }, { x: 13, y: 13 }
      ],
      doors: [],
      keys: [],
      enemies: [
        { start: { x: 8, y: 8 }, path: [{x: 8, y: 8}, {x: 9, y: 8}, {x: 9, y: 9}, {x: 8, y: 9}, {x: 7, y: 9}, {x: 7, y: 8}], type: 'boss', health: 3 }
      ],
      powerups: [
        { x: 6, y: 6, type: 'invincible' },
        { x: 9, y: 6, type: 'invincible' },
        { x: 7, y: 12, type: 'speed' }
      ]
    },
    {
      name: "Time Trial",
      theme: 'space',
      width: 25,
      height: 6,
      start: { x: 1, y: 3 },
      bed: { x: 23, y: 3 },
      walls: [
        ...Array.from({ length: 25 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 25 }, (_, i) => ({ x: i, y: 5 })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 6 }, (_, i) => ({ x: 24, y: i })),
        { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 5, y: 3 }, { x: 5, y: 4 },
        { x: 10, y: 1 }, { x: 10, y: 4 },
        { x: 15, y: 1 }, { x: 15, y: 2 }, { x: 15, y: 3 }, { x: 15, y: 4 },
        { x: 20, y: 1 }, { x: 20, y: 4 }
      ],
      pillows: [
        { x: 8, y: 2 }, { x: 18, y: 4 }
      ],
      dreams: [
        { x: 3, y: 1 }, { x: 12, y: 2 }, { x: 22, y: 1 }
      ],
      doors: [],
      keys: [],
      enemies: [
        { start: { x: 7, y: 3 }, path: [{x: 7, y: 3}, {x: 8, y: 3}] },
        { start: { x: 13, y: 2 }, path: [{x: 13, y: 2}, {x: 14, y: 2}] },
        { start: { x: 17, y: 3 }, path: [{x: 17, y: 3}, {x: 18, y: 3}] }
      ],
      powerups: [
        { x: 6, y: 3, type: 'speed' },
        { x: 11, y: 3, type: 'time' },
        { x: 16, y: 2, type: 'speed' },
        { x: 21, y: 3, type: 'invincible' }
      ]
    },
    {
      name: "Magnetic Factory",
      theme: 'space',
      width: 20,
      height: 12,
      start: { x: 1, y: 10 },
      bed: { x: 18, y: 1 },
      walls: [
        ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 0 })),
        ...Array.from({ length: 20 }, (_, i) => ({ x: i, y: 11 })),
        ...Array.from({ length: 12 }, (_, i) => ({ x: 0, y: i })),
        ...Array.from({ length: 12 }, (_, i) => ({ x: 19, y: i })),
        { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 },
        { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
        { x: 3, y: 4 }, { x: 4, y: 4 }, { x: 5, y: 4 },
        { x: 15, y: 3 }, { x: 16, y: 3 }, { x: 17, y: 3 }
      ],
      pillows: [
        { x: 9, y: 9 }, { x: 11, y: 2 }
      ],
      dreams: [
        { x: 2, y: 6 }, { x: 8, y: 4 }, { x: 17, y: 8 }
      ],
      doors: [
        { x: 10, y: 5, color: 'red', open: false }
      ],
      keys: [
        { x: 1, y: 2, color: 'red' }
      ],
      enemies: [
        { start: { x: 8, y: 7 }, path: [{x: 8, y: 7}, {x: 9, y: 7}, {x: 10, y: 7}] }
      ],
      powerups: [
        { x: 3, y: 9, type: 'magnet' },
        { x: 15, y: 9, type: 'speed' }
      ],
      platforms: [
        { id: 1, path: [{x: 7, y: 10}, {x: 7, y: 6}, {x: 11, y: 6}, {x: 11, y: 10}], currentIndex: 0 },
        { id: 2, path: [{x: 14, y: 8}, {x: 18, y: 8}, {x: 18, y: 4}, {x: 14, y: 4}], currentIndex: 0 }
      ]
    }
  ];

  const [currentLevel, setCurrentLevel] = useState(0);
  const [player, setPlayer] = useState(levels[0].start);
  const [collectedPillows, setCollectedPillows] = useState<number[]>([]);
  const [collectedDreams, setCollectedDreams] = useState<number[]>([]);
  const [collectedKeys, setCollectedKeys] = useState<number[]>([]);
  const [doors, setDoors] = useState<Door[]>(levels[0].doors.map(d => ({...d})));
  const [enemies, setEnemies] = useState<EnemyState[]>(
    levels[0].enemies.map(e => ({ ...e, pos: e.start, pathIndex: 0, currentHealth: e.health || 1 }))
  );
  const [moves, setMoves] = useState(0);
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);
  const [sleepAnimation, setSleepAnimation] = useState(false);
  const [playerDirection, setPlayerDirection] = useState<'up' | 'down' | 'left' | 'right'>('down');
  const [isMoving, setIsMoving] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [bestTimes, setBestTimes] = useState<number[]>(() => {
    const saved = localStorage.getItem('betosaurus-best-times');
    return saved ? JSON.parse(saved) : Array(levels.length).fill(Infinity);
  });
  const [newRecord, setNewRecord] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [leaderboard, setLeaderboard] = useState<{name: string, time: number, level: number}[]>(() => {
    const saved = localStorage.getItem('betosaurus-leaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [collectedPowerups, setCollectedPowerups] = useState<number[]>([]);
  const [activePowerups, setActivePowerups] = useState<{type: string, endTime: number}[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showPillowMessage, setShowPillowMessage] = useState(false);
  const [platforms, setPlatforms] = useState<MovingPlatform[]>(levels[0].platforms || []);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(0);

  const level = levels[currentLevel];

  const isWall = (x: number, y: number) => {
    return level.walls.some(w => w.x === x && w.y === y);
  };

  const isDoor = (x: number, y: number) => {
    const door = doors.find(d => d.x === x && d.y === y);
    return door && !door.open;
  };

  const isPillow = (x: number, y: number) => {
    return level.pillows.some((p, i) => 
      p.x === x && p.y === y && !collectedPillows.includes(i)
    );
  };

  const isDream = (x: number, y: number) => {
    return level.dreams.some((d, i) => 
      d.x === x && d.y === y && !collectedDreams.includes(i)
    );
  };

  const isKey = (x: number, y: number) => {
    return level.keys.some((k, i) => 
      k.x === x && k.y === y && !collectedKeys.includes(i)
    );
  };

  const isEnemy = (x: number, y: number) => {
    return enemies.some(e => e.pos.x === x && e.pos.y === y);
  };

  const checkCollision = useCallback((x: number, y: number) => {
    if (isEnemy(x, y)) {
      setGameLost(true);
      return true;
    }
    return false;
  }, [enemies]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (gameWon || gameLost) return;
    
    initAudio(); // Initialize audio on first interaction
    
    const newX = player.x + dx;
    const newY = player.y + dy;

    if (!isWall(newX, newY) && !isDoor(newX, newY)) {
      // Set direction and movement animation
      if (dx > 0) setPlayerDirection('right');
      else if (dx < 0) setPlayerDirection('left');
      else if (dy > 0) setPlayerDirection('down');
      else if (dy < 0) setPlayerDirection('up');
      
      setIsMoving(true);
      setTimeout(() => setIsMoving(false), 200);
      
      setPlayer({ x: newX, y: newY });
      setMoves(m => m + 1);

      // Play move sound
      playSound(200, 0.1, 'triangle');

      // Check for pillow collection
      const pillowIndex = level.pillows.findIndex(p => p.x === newX && p.y === newY);
      if (pillowIndex !== -1 && !collectedPillows.includes(pillowIndex)) {
        setCollectedPillows([...collectedPillows, pillowIndex]);
        playSound(400, 0.3, 'sine');
        createParticles(newX * TILE_SIZE, newY * TILE_SIZE, 'sparkle', 3);
      }

      // Check for dream collection
      const dreamIndex = level.dreams.findIndex(d => d.x === newX && d.y === newY);
      if (dreamIndex !== -1 && !collectedDreams.includes(dreamIndex)) {
        setCollectedDreams([...collectedDreams, dreamIndex]);
        playSound(600, 0.4, 'sine');
        createParticles(newX * TILE_SIZE, newY * TILE_SIZE, 'sparkle', 4);
      }

      // Check for key collection
      const keyIndex = level.keys.findIndex(k => k.x === newX && k.y === newY);
      if (keyIndex !== -1 && !collectedKeys.includes(keyIndex)) {
        const key = level.keys[keyIndex];
        setCollectedKeys([...collectedKeys, keyIndex]);
        playSound(800, 0.5, 'square');
        createParticles(newX * TILE_SIZE, newY * TILE_SIZE, 'sparkle', 5);
        
        // Open corresponding door
        setDoors(prevDoors => 
          prevDoors.map(d => d.color === key.color ? {...d, open: true} : d)
        );
      }

      // Check for powerup collection
      const powerupIndex = level.powerups.findIndex(p => p.x === newX && p.y === newY);
      if (powerupIndex !== -1 && !collectedPowerups.includes(powerupIndex)) {
        const powerup = level.powerups[powerupIndex];
        setCollectedPowerups([...collectedPowerups, powerupIndex]);
        playSound(1000, 0.3, 'sine');
        createParticles(newX * TILE_SIZE, newY * TILE_SIZE, 'sparkle', 8);
        
        // Activate powerup
        const endTime = Date.now() + 10000; // 10 seconds
        setActivePowerups(prev => [...prev, { type: powerup.type, endTime }]);
        
        // Magnet effect - collect nearby items
        if (powerup.type === 'magnet') {
          const magnetRange = 3;
          level.pillows.forEach((pillow, i) => {
            if (!collectedPillows.includes(i) && 
                Math.abs(pillow.x - newX) <= magnetRange && 
                Math.abs(pillow.y - newY) <= magnetRange) {
              setCollectedPillows(prev => [...prev, i]);
              createParticles(pillow.x * TILE_SIZE, pillow.y * TILE_SIZE, 'sparkle', 3);
            }
          });
          level.dreams.forEach((dream, i) => {
            if (!collectedDreams.includes(i) && 
                Math.abs(dream.x - newX) <= magnetRange && 
                Math.abs(dream.y - newY) <= magnetRange) {
              setCollectedDreams(prev => [...prev, i]);
              createParticles(dream.x * TILE_SIZE, dream.y * TILE_SIZE, 'sparkle', 4);
            }
          });
        }
      }

      // Check for bed
      if (newX === level.bed.x && newY === level.bed.y) {
        // Check if all pillows are collected
        if (collectedPillows.length < level.pillows.length) {
          playSound(300, 0.5, 'square');
          setShowPillowMessage(true);
          setTimeout(() => setShowPillowMessage(false), 3000);
          // Move player back to prevent staying on bed
          setPlayer({ x: player.x, y: player.y });
          return;
        }
        
        setSleepAnimation(true);
        playRoar(); // Play dinosaur roar sound
        
        const baseTime = Date.now() - startTime;
        const dreamBonus = collectedDreams.length * 1000; // 1 second bonus per dream
        const finalTime = Math.max(baseTime - dreamBonus, 1000); // Minimum 1 second
        setCurrentTime(finalTime);
        
        // Check for new record
        if (finalTime < bestTimes[currentLevel]) {
          const newBestTimes = [...bestTimes];
          newBestTimes[currentLevel] = finalTime;
          setBestTimes(newBestTimes);
          localStorage.setItem('betosaurus-best-times', JSON.stringify(newBestTimes));
          setNewRecord(true);
        }
        
        setTimeout(() => {
          setGameWon(true);
          setSleepAnimation(false);
          // Show name input if completed all levels
          if (currentLevel === levels.length - 1) {
            setShowNameInput(true);
          }
        }, 1000);
      }

      // Check enemy collision (only if not invincible)
      if (isEnemy(newX, newY) && !activePowerups.some(p => p.type === 'invincible' && p.endTime > Date.now())) {
        setGameLost(true);
        playSound(150, 0.8, 'square');
      }
    }
  }, [player, gameWon, gameLost, level, collectedPillows, collectedDreams, collectedKeys, doors, playSound, playRoar, initAudio]);

  // Game loop for enemy and platform movement
  useEffect(() => {
    if (gameWon || gameLost) return;

    const interval = setInterval(() => {
      setEnemies(prevEnemies => 
        prevEnemies.map(enemy => {
          const nextIndex = (enemy.pathIndex + 1) % enemy.path.length;
          const newPos = enemy.path[nextIndex];
          
          // Check if player is on the new position (only if not invincible)
          if (newPos.x === player.x && newPos.y === player.y && !activePowerups.some(p => p.type === 'invincible' && p.endTime > Date.now())) {
            setGameLost(true);
            playSound(150, 0.8, 'square');
          }
          
          return {
            ...enemy,
            pos: newPos,
            pathIndex: nextIndex
          };
        })
      );
      
      // Move platforms
      setPlatforms(prevPlatforms => 
        prevPlatforms.map(platform => ({
          ...platform,
          currentIndex: (platform.currentIndex + 1) % platform.path.length
        }))
      );
    }, 800);

    return () => clearInterval(interval);
  }, [gameWon, gameLost, player]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch(e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [movePlayer]);

  const createParticles = (x: number, y: number, type: Particle['type'], count: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x: x + Math.random() * TILE_SIZE,
        y: y + Math.random() * TILE_SIZE,
        type
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
    
    // Remove particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1000);
  };

  const resetLevel = () => {
    setPlayer(level.start);
    setCollectedPillows([]);
    setCollectedDreams([]);
    setCollectedKeys([]);
    setCollectedPowerups([]);
    setActivePowerups([]);
    setParticles([]);
    setPlatforms(level.platforms || []);
    setDoors(level.doors.map(d => ({...d})));
    setEnemies(level.enemies.map(e => ({ ...e, pos: e.start, pathIndex: 0, currentHealth: e.health || 1 })));
    setMoves(0);
    setGameWon(false);
    setGameLost(false);
    setSleepAnimation(false);
    setStartTime(Date.now());
    setNewRecord(false);
  };

  const addToLeaderboard = () => {
    if (playerName.trim()) {
      const newEntry = {
        name: playerName.trim(),
        time: Math.floor(currentTime / 1000),
        level: currentLevel + 1
      };
      const updatedLeaderboard = [...leaderboard, newEntry]
        .sort((a, b) => a.time - b.time)
        .slice(0, 10); // Keep top 10
      setLeaderboard(updatedLeaderboard);
      localStorage.setItem('betosaurus-leaderboard', JSON.stringify(updatedLeaderboard));
      setShowNameInput(false);
      setPlayerName('');
    }
  };

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      const newLevel = currentLevel + 1;
      setCurrentLevel(newLevel);
      setPlayer(levels[newLevel].start);
      setCollectedPillows([]);
      setCollectedDreams([]);
      setCollectedKeys([]);
      setCollectedPowerups([]);
      setActivePowerups([]);
      setParticles([]);
      setPlatforms(levels[newLevel].platforms || []);
      setDoors(levels[newLevel].doors.map(d => ({...d})));
      setEnemies(levels[newLevel].enemies.map(e => ({ ...e, pos: e.start, pathIndex: 0, currentHealth: e.health || 1 })));
      setMoves(0);
      setGameWon(false);
      setGameLost(false);
      setSleepAnimation(false);
      setStartTime(Date.now());
      setNewRecord(false);
    }
  };

  const getDoorColor = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-600 border-red-700',
      blue: 'bg-blue-600 border-blue-700',
      green: 'bg-green-600 border-green-700',
      yellow: 'bg-yellow-600 border-yellow-700'
    };
    return colors[color] || 'bg-gray-600 border-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-green-200 to-lime-300 p-2 flex animate-gradient-x" style={{fontFamily: 'Fredoka, cursive'}}>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto">
        {/* Game Info Panel */}
        <div className="lg:w-80 bg-amber-50 rounded-lg shadow-2xl p-4 h-fit border-4 border-amber-600">
          <h1 className="text-3xl font-bold text-center mb-2 text-green-800" style={{fontFamily: 'Bungee, cursive'}}>
            🦕 BETOSAURUS
          </h1>
          <p className="text-center text-amber-700 mb-4 text-sm font-semibold">
            Find the perfect nap spot!
          </p>
          
          <div className="space-y-3 text-green-800 text-sm font-semibold">
            <div>
              <span className="font-bold">Level:</span> {currentLevel + 1}
              <div className="text-amber-700">{level.name}</div>
            </div>
            <div>
              <span className="font-bold">Time:</span> {Math.floor((Date.now() - startTime) / 1000)}s
            </div>
            <div>
              <span className="font-bold">Moves:</span> {moves}
            </div>
            <div>
              <span className="font-bold">🛋️ Pillows:</span> {collectedPillows.length}/{level.pillows.length}
            </div>
            <div>
              <span className="font-bold">💭 Dreams:</span> {collectedDreams.length}/{level.dreams.length}
            </div>
            {bestTimes[currentLevel] !== Infinity && (
              <div>
                <span className="font-bold">Best:</span> {Math.floor(bestTimes[currentLevel] / 1000)}s
              </div>
            )}
          </div>

          {/* Inventory */}
          {collectedKeys.length > 0 && (
            <div className="mt-4 bg-amber-200 p-2 rounded text-green-800 text-sm border-2 border-amber-600">
              <span className="font-bold">Keys:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {collectedKeys.map(idx => (
                  <span key={idx} className={`inline-block px-2 py-1 rounded ${
                    level.keys[idx].color === 'red' ? 'bg-red-600' :
                    level.keys[idx].color === 'blue' ? 'bg-blue-600' :
                    level.keys[idx].color === 'green' ? 'bg-green-600' :
                    'bg-yellow-600'
                  }`}>
                    🔑
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboard.length > 0 && (
            <div className="mt-4 bg-amber-200 p-3 rounded text-green-800 text-xs border-2 border-amber-600">
              <div className="font-bold mb-2">🏆 Leaderboard:</div>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {leaderboard.slice(0, 5).map((entry, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{i + 1}. {entry.name}</span>
                    <span>L{entry.level} - {entry.time}s</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 bg-amber-200 p-3 rounded text-green-800 text-xs border-2 border-amber-600">
            <div className="font-bold mb-2">Legend:</div>
            <div className="space-y-1">
              <div>🛋️ Pillows (required!)</div>
              <div>💭 Dreams (collect all!)</div>
              <div>🔑 Keys (unlock doors)</div>
              <div>🚪 Doors (need keys)</div>
              <div>👻 Nightmares (avoid!)</div>
              <div>🛏️ Bed (goal)</div>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-4">
            <div className="flex justify-center gap-1 mb-2">
              <button
                onClick={() => movePlayer(0, -1)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 font-bold"
                disabled={gameWon || gameLost}
              >
                <ArrowUp size={16} />
              </button>
            </div>
            <div className="flex justify-center gap-1 mb-2">
              <button
                onClick={() => movePlayer(-1, 0)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 font-bold"
                disabled={gameWon || gameLost}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={() => movePlayer(0, 1)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 font-bold"
                disabled={gameWon || gameLost}
              >
                <ArrowDown size={16} />
              </button>
              <button
                onClick={() => movePlayer(1, 0)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded disabled:opacity-50 font-bold"
                disabled={gameWon || gameLost}
              >
                <ArrowRight size={16} />
              </button>
            </div>
            <p className="text-amber-700 text-xs mb-2 text-center font-semibold">
              Use arrow keys or WASD
            </p>
            <button
              onClick={resetLevel}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white px-3 py-2 rounded inline-flex items-center justify-center gap-2 text-sm font-bold"
            >
              <RotateCcw size={14} />
              Reset Level
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center">
          <div 
            className={`relative border-4 rounded-lg shadow-2xl ${
              level.theme === 'forest' ? 'bg-green-100 border-green-600' :
              level.theme === 'ice' ? 'bg-blue-50 border-blue-400' :
              level.theme === 'underwater' ? 'bg-cyan-100 border-cyan-500' :
              level.theme === 'volcano' ? 'bg-red-100 border-red-600' :
              'bg-purple-100 border-purple-600'
            }`}
            style={{ 
              width: level.width * TILE_SIZE, 
              height: level.height * TILE_SIZE
            }}
          >
          {/* Grid */}
          {Array.from({ length: level.height }).map((_, y) =>
            Array.from({ length: level.width }).map((_, x) => (
              <div
                key={`${x}-${y}`}
                className="absolute border border-green-300/40"
                style={{
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              />
            ))
          )}

          {/* Walls */}
          {level.walls.map((wall, i) => (
            <div
              key={`wall-${i}`}
              className="absolute bg-amber-800 border-2 border-amber-900 shadow-lg"
              style={{
                left: wall.x * TILE_SIZE,
                top: wall.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
              }}
            />
          ))}

          {/* Doors */}
          {doors.map((door, i) => (
            !door.open && (
              <div
                key={`door-${i}`}
                className={`absolute border-2 ${getDoorColor(door.color)}`}
                style={{
                  left: door.x * TILE_SIZE,
                  top: door.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs">
                  🚪
                </div>
              </div>
            )
          ))}

          {/* Keys */}
          {level.keys.map((key, i) => (
            !collectedKeys.includes(i) && (
              <div
                key={`key-${i}`}
                className="absolute flex items-center justify-center text-2xl animate-bounce"
                style={{
                  left: key.x * TILE_SIZE,
                  top: key.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  filter: 'drop-shadow(0 0 8px #F59E0B)',
                  animation: 'bounce 1s infinite, glow 2s ease-in-out infinite alternate'
                }}
              >
                🔑
              </div>
            )
          ))}

          {/* Pillows */}
          {level.pillows.map((pillow, i) => (
            !collectedPillows.includes(i) && (
              <div
                key={`pillow-${i}`}
                className="absolute flex items-center justify-center text-2xl animate-pulse bg-orange-200 border-2 border-orange-600 rounded"
                style={{
                  left: pillow.x * TILE_SIZE,
                  top: pillow.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  filter: 'drop-shadow(0 0 6px #EA580C)'
                }}
              >
                🛋️
              </div>
            )
          ))}

          {/* Dreams */}
          {level.dreams.map((dream, i) => (
            !collectedDreams.includes(i) && (
              <div
                key={`dream-${i}`}
                className="absolute flex items-center justify-center text-2xl"
                style={{
                  left: dream.x * TILE_SIZE,
                  top: dream.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  filter: 'drop-shadow(0 0 10px #3B82F6)',
                  animation: 'float 3s ease-in-out infinite, glow 2s ease-in-out infinite alternate'
                }}
              >
                💭
              </div>
            )
          ))}

          {/* Enemies */}
          {enemies.map((enemy, i) => (
            <div
              key={`enemy-${i}`}
              className={`absolute flex items-center justify-center transition-all duration-700 ${
                enemy.type === 'boss' ? 'text-4xl' : 'text-2xl'
              }`}
              style={{
                left: enemy.pos.x * TILE_SIZE,
                top: enemy.pos.y * TILE_SIZE,
                width: enemy.type === 'boss' ? TILE_SIZE * 1.5 : TILE_SIZE,
                height: enemy.type === 'boss' ? TILE_SIZE * 1.5 : TILE_SIZE,
                filter: enemy.type === 'boss' ? 'drop-shadow(0 0 20px #FF0000)' : 'drop-shadow(0 0 12px #EF4444)',
                animation: enemy.type === 'boss' ? 'shake 0.3s ease-in-out infinite alternate' : 'shake 0.5s ease-in-out infinite alternate',
                zIndex: enemy.type === 'boss' ? 5 : 2
              }}
            >
              {enemy.type === 'boss' ? '👹' : '👻'}
              {enemy.type === 'boss' && enemy.currentHealth && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-xs font-bold text-red-500">
                  ❤️{enemy.currentHealth}
                </div>
              )}
            </div>
          ))}

          {/* Bed */}
          <div
            className="absolute flex items-center justify-center text-3xl animate-pulse"
            style={{
              left: level.bed.x * TILE_SIZE,
              top: level.bed.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              filter: 'drop-shadow(0 0 15px #059669)'
            }}
          >
            🛏️
          </div>

          {/* Powerups */}
          {level.powerups.map((powerup, i) => (
            !collectedPowerups.includes(i) && (
              <div
                key={`powerup-${i}`}
                className={`absolute powerup powerup-${powerup.type}`}
                style={{
                  left: powerup.x * TILE_SIZE,
                  top: powerup.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  filter: 'drop-shadow(0 0 10px currentColor)'
                }}
              >
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                  {powerup.type === 'speed' ? '⚡' : powerup.type === 'invincible' ? '🛡️' : powerup.type === 'time' ? '⏰' : '🧢'}
                </div>
              </div>
            )
          ))}

          {/* Moving Platforms */}
          {platforms.map(platform => {
            const currentPos = platform.path[platform.currentIndex];
            return (
              <div
                key={`platform-${platform.id}`}
                className="absolute bg-gray-400 border-2 border-gray-600 rounded"
                style={{
                  left: currentPos.x * TILE_SIZE,
                  top: currentPos.y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  zIndex: 1
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-500 rounded flex items-center justify-center text-xs">
                  🟨
                </div>
              </div>
            );
          })}

          {/* Particles */}
          {particles.map(particle => (
            <div
              key={particle.id}
              className={`particle ${particle.type}-particle`}
              style={{
                left: particle.x,
                top: particle.y
              }}
            />
          ))}

          {/* Player (Betosaurus) */}
          <div
            className={`absolute transition-all duration-200 ${
              sleepAnimation ? 'animate-bounce' : ''
            } ${isMoving ? 'scale-110' : ''} ${gameLost ? 'opacity-50 grayscale' : ''} ${
              activePowerups.some(p => p.type === 'invincible') ? 'animate-pulse' : ''
            }`}
            style={{
              left: player.x * TILE_SIZE,
              top: player.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              transform: `${playerDirection === 'left' ? 'scaleX(-1)' : ''}`,
              filter: gameWon ? 'drop-shadow(0 0 20px #F59E0B)' : 
                     activePowerups.some(p => p.type === 'invincible') ? 'drop-shadow(0 0 15px #FFD700)' :
                     'drop-shadow(0 0 8px #16A34A)',
              zIndex: 10
            }}
          >
            <img src="/tyrannosaurus-rex.png" alt="Betosaurus" className="w-full h-full object-contain" />
          </div>
          </div>
        </div>
      </div>

      {/* Pillow Requirement Message */}
      {showPillowMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white p-4 rounded-lg shadow-2xl z-50 animate-bounce">
          <p className="font-bold text-center" style={{fontFamily: 'Bangers, cursive'}}>
            🛋️ Collect ALL pillows first! 🛋️
          </p>
          <p className="text-sm text-center mt-1">
            {collectedPillows.length}/{level.pillows.length} pillows collected
          </p>
        </div>
      )}

      {/* Win Modal */}
      {gameWon && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-amber-50 p-8 rounded-lg text-center max-w-md border-4 border-green-600">
            <h2 className="text-3xl font-bold text-green-800 mb-4" style={{fontFamily: 'Bangers, cursive'}}>
              💤 Betosaurus is Sleepy! 💤
            </h2>
            {newRecord && (
              <p className="text-2xl font-bold text-amber-600 mb-2 animate-bounce">
                🏆 NEW RECORD! 🏆
              </p>
            )}
            <p className="text-green-700 mb-2 font-semibold">
              Time: {Math.floor(currentTime / 1000)}s
            </p>
            <p className="text-green-700 mb-2 font-semibold">
              Moves: {moves}
            </p>
            <p className="text-green-700 mb-2 font-semibold">
              Pillows: {collectedPillows.length}/{level.pillows.length}
            </p>
            <p className="text-green-700 mb-2 font-semibold">
              Dreams: {collectedDreams.length}/{level.dreams.length}
            </p>
            {collectedDreams.length > 0 && (
              <p className="text-blue-600 mb-4 font-semibold text-sm">
                💭 Dream Bonus: -{collectedDreams.length}s time reduction!
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={resetLevel}
                className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded font-bold"
              >
                Retry Level
              </button>
              {currentLevel < levels.length - 1 && (
                <button
                  onClick={nextLevel}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold"
                >
                  Next Level
                </button>
              )}
            </div>
            {currentLevel === levels.length - 1 && !showNameInput && (
              <p className="text-green-800 mt-4 font-bold">
                🎉 You've completed all levels! 🎉
              </p>
            )}
          </div>
        </div>
      )}

      {/* Name Input Modal */}
      {showNameInput && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-amber-50 p-8 rounded-lg text-center max-w-md border-4 border-green-600">
            <h2 className="text-2xl font-bold text-green-800 mb-4" style={{fontFamily: 'Bangers, cursive'}}>
              🏆 Game Complete! 🏆
            </h2>
            <p className="text-green-700 mb-4 font-semibold">
              Enter your name for the leaderboard:
            </p>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full p-2 border-2 border-green-600 rounded mb-4 text-center font-bold"
              placeholder="Your name"
              maxLength={20}
              onKeyPress={(e) => e.key === 'Enter' && addToLeaderboard()}
            />
            <div className="flex gap-3 justify-center">
              <button
                onClick={addToLeaderboard}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold"
                disabled={!playerName.trim()}
              >
                Add to Leaderboard
              </button>
              <button
                onClick={() => setShowNameInput(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded font-bold"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lose Modal */}
      {gameLost && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
          <div className="bg-amber-50 p-8 rounded-lg text-center max-w-md border-4 border-red-600">
            <h2 className="text-3xl font-bold text-red-600 mb-4" style={{fontFamily: 'Creepster, cursive'}}>
              😱 Nightmare Caught You! 😱
            </h2>
            <p className="text-green-700 mb-4 font-semibold">
              Betosaurus got spooked by a nightmare!
            </p>
            <button
              onClick={resetLevel}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BetosaurusGame;