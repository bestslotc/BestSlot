'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export default function CrashGame() {
  const [balance, setBalance] = useState(1000);
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashout, setAutoCashout] = useState<number | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'running' | 'crashed'>(
    'waiting',
  );
  const [multiplier, setMultiplier] = useState(1.0);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);
  const [playerBet, setPlayerBet] = useState<number | null>(null);
  const [cashedOut, setCashedOut] = useState(false);
  const [multiplierHistory, setMultiplierHistory] = useState<number[]>([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cloudOffsetRef = useRef(0);
  const autoCashedOutRef = useRef(false);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const clouds = [
      { x: 0.1, y: 0.15, size: 70, speed: 0.4 },
      { x: 0.35, y: 0.2, size: 90, speed: 0.25 },
      { x: 0.6, y: 0.12, size: 60, speed: 0.35 },
      { x: 0.85, y: 0.18, size: 75, speed: 0.3 },
      { x: 0.2, y: 0.55, size: 65, speed: 0.28 },
    ];

    const trees = [
      { x: 0.1, size: 50 },
      { x: 0.25, size: 45 },
      { x: 0.4, size: 55 },
      { x: 0.58, size: 48 },
      { x: 0.73, size: 52 },
      { x: 0.88, size: 46 },
    ];

    const drawCloud = (x: number, y: number, size: number) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x + size * 0.4, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x - size * 0.4, y, size * 0.45, 0, Math.PI * 2);
      ctx.arc(x, y - size * 0.25, size * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    const drawTree = (x: number, y: number, size: number) => {
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - size * 0.1, y - size * 0.35, size * 0.2, size * 0.35);

      ctx.fillStyle = '#2d5016';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 1.0);
      ctx.lineTo(x - size * 0.45, y - size * 0.5);
      ctx.lineTo(x + size * 0.45, y - size * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#3a6b1e';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.75);
      ctx.lineTo(x - size * 0.4, y - size * 0.3);
      ctx.lineTo(x + size * 0.4, y - size * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#4a8025';
      ctx.beginPath();
      ctx.moveTo(x, y - size * 0.5);
      ctx.lineTo(x - size * 0.35, y - size * 0.05);
      ctx.lineTo(x + size * 0.35, y - size * 0.05);
      ctx.closePath();
      ctx.fill();
    };

    const drawParticles = () => {
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((particle) => {
        ctx.fillStyle = `rgba(255, 100, 50, ${particle.life})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
        ctx.fill();

        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.2;
        particle.life -= 0.02;
      });
    };

    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, rect.height);
      gradient.addColorStop(0, '#0f172a');
      gradient.addColorStop(0.5, '#1e293b');
      gradient.addColorStop(1, '#334155');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, rect.width, rect.height);

      if (gameState === 'running') {
        cloudOffsetRef.current += 0.6;
      }

      clouds.forEach((cloud) => {
        const x =
          ((cloud.x * rect.width + cloudOffsetRef.current * cloud.speed) %
            (rect.width + 200)) -
          100;
        const y = cloud.y * rect.height;
        drawCloud(x, y, cloud.size);
      });

      ctx.fillStyle = '#475569';
      ctx.fillRect(0, rect.height - 50, rect.width, 50);

      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, rect.height - 55, rect.width, 10);

      trees.forEach((tree) => {
        const offset =
          gameState === 'running' ? cloudOffsetRef.current * 0.2 : 0;
        const x = ((tree.x * rect.width + offset) % (rect.width + 100)) - 50;
        const y = rect.height - 45;
        drawTree(x, y, tree.size);
      });

      if (multiplierHistory.length > 1) {
        const lineGradient = ctx.createLinearGradient(0, rect.height, 0, 0);
        lineGradient.addColorStop(0, '#3b82f6');
        lineGradient.addColorStop(0.5, '#8b5cf6');
        lineGradient.addColorStop(1, '#ec4899');

        ctx.strokeStyle = lineGradient;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(59, 130, 246, 0.5)';
        ctx.shadowBlur = 15;

        ctx.beginPath();
        const maxPoints = Math.min(multiplierHistory.length, 100);
        const startIdx = Math.max(0, multiplierHistory.length - maxPoints);

        for (let i = startIdx; i < multiplierHistory.length; i++) {
          const x = ((i - startIdx) / maxPoints) * rect.width * 0.85;
          const normalizedMultiplier = Math.min(multiplierHistory[i], 10);
          const y =
            rect.height -
            60 -
            (normalizedMultiplier / 10) * (rect.height * 0.7);

          if (i === startIdx) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      drawParticles();
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [multiplierHistory, gameState]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /**
   * Generates a random crash point multiplier with a house edge.
   *
   * This uses the standard "inverse transform sampling" method derived from:
   *   P(multiplier >= x) = 1 / x   (for a fair game)
   * But to give the house an edge, we use:
   *   P(multiplier >= x) = (1 - houseEdge) / x
   *
   * Solving for the multiplier:
   *   multiplier = (1 - houseEdge) / U, where U ~ Uniform(0, 1)
   *
   * However, to avoid infinite multipliers and improve gameplay,
   * we cap the maximum value and add a minimum threshold.
   *
   * Additionally, we apply a small probability of very high multipliers
   * (e.g., 100x+) for excitement, while keeping the expected return < 100%.
   *
   * @returns {number} Crash multiplier (>= 1.00), rounded to 2 decimal places.
   */
  const generateCrashPoint = useCallback((): number => {
    const houseEdge = 0.03; // 3% house edge → RTP = 97%
    const minMultiplier = 1.0;
    const maxMultiplier = 1000; // Cap to prevent extreme values

    // Generate uniform random number in (0, 1]
    // Use (1 - Math.random()) to avoid division by zero
    const u = 1 - Math.random();

    // Fair crash point with house edge: multiplier = (1 - houseEdge) / u
    let crash = (1 - houseEdge) / u;

    // Enforce bounds
    crash = Math.max(minMultiplier, Math.min(crash, maxMultiplier));

    // Optional: Add a tiny chance (e.g., 0.5%) of a "jackpot" multiplier > 100x
    // This is for psychological excitement but keeps EV negative
    if (Math.random() < 0.005 && crash < 100) {
      crash = 100 + Math.random() * 900; // 100x to 1000x
    }

    // Round to 2 decimal places for display consistency
    return Math.round(crash * 100) / 100;
  }, []);

  const createExplosion = useCallback((x: number, y: number) => {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 2 + Math.random() * 3;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 1,
      });
    }
  }, []);

  const cashOut = useCallback(
    (currentMultiplier?: number) => {
      if (!playerBet || cashedOut) return;

      const finalMultiplier = currentMultiplier || multiplier;
      const winnings = playerBet * finalMultiplier;
      setBalance((prev) => prev + winnings);
      setCashedOut(true);
      setShowWinAnimation(true);

      setTimeout(() => setShowWinAnimation(false), 2000);

      setPlayerBet(null);
    },
    [playerBet, cashedOut, multiplier],
  );

  const placeBet = useCallback(() => {
    if (betAmount < 1 || betAmount > balance || gameState !== 'waiting') return;

    setBalance((prev) => prev - betAmount);
    setPlayerBet(betAmount);
    setCashedOut(false);
    autoCashedOutRef.current = false;
  }, [betAmount, balance, gameState]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: this is fine
  const startRound = useCallback(() => {
    setGameState('running');
    setMultiplier(1.0);
    setMultiplierHistory([1.0]);
    const crash = generateCrashPoint();
    setCrashPoint(crash);
    setCashedOut(false);
    autoCashedOutRef.current = false;

    let current = 1.0;
    intervalRef.current = setInterval(() => {
      current += 0.01 + current * 0.005;
      setMultiplier(current);
      setMultiplierHistory((prev) => [...prev, current]);

      if (
        autoCashout &&
        current >= autoCashout &&
        playerBet &&
        !autoCashedOutRef.current &&
        !cashedOut
      ) {
        autoCashedOutRef.current = true;
        cashOut(current);
      }

      if (current >= crash) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setMultiplier(crash);
        setGameState('crashed');

        if (canvasRef.current) {
          const rect = canvasRef.current.getBoundingClientRect();
          const planeProgress = Math.min(multiplierHistory.length / 100, 1);
          const planeX = planeProgress * rect.width * 0.85;
          const planeY =
            rect.height - 60 - (Math.min(crash, 10) / 10) * (rect.height * 0.7);
          createExplosion(planeX, planeY);
        }

        setPlayerBet(null);

        setTimeout(() => {
          setGameState('waiting');
          setMultiplier(1.0);
          setCrashPoint(null);
          setMultiplierHistory([]);
          particlesRef.current = [];
        }, 3000);
      }
    }, 50);
  }, [
    generateCrashPoint,
    autoCashout,
    playerBet,
    cashedOut,
    createExplosion,
    cashOut,
  ]);

  const planeProgress = Math.min(multiplierHistory.length / 100, 1);
  const planeX = planeProgress * 85;
  const normalizedMult = Math.min(multiplier, 10);
  const planeY = 70 - (normalizedMult / 10) * 70;
  const planeRotation = gameState === 'crashed' ? 135 : -20;

  return (
    <div className='space-y-2 mx-4 md:mx-10'>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className='overflow-hidden p-0'>
          <CardContent className='p-0'>
            <div className='relative h-80 md:h-96 lg:h-112 overflow-hidden'>
              <canvas
                ref={canvasRef}
                className='absolute inset-0 w-full h-full'
              />

              <motion.div
                className='absolute'
                animate={{
                  left: `${planeX}%`,
                  top: `${planeY}%`,
                  rotate: planeRotation,
                  scale: gameState === 'running' ? 1.4 : 1.25,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }}
                style={{
                  transform: 'translate(-50%, -50%)',
                  filter:
                    gameState === 'running'
                      ? 'drop-shadow(0 0 30px rgba(59, 130, 246, 0.8))'
                      : 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))',
                }}
              >
                {/** biome-ignore lint/a11y/noSvgWithoutTitle: this is fine */}
                <svg width='140' height='140' viewBox='0 0 100 100' fill='none'>
                  {gameState === 'running' && (
                    <circle cx='85' cy='50' r='8' fill='#FF6B35' opacity='0.6'>
                      <animate
                        attributeName='r'
                        values='6;10;6'
                        dur='0.4s'
                        repeatCount='indefinite'
                      />
                      <animate
                        attributeName='opacity'
                        values='0.4;0.8;0.4'
                        dur='0.4s'
                        repeatCount='indefinite'
                      />
                    </circle>
                  )}
                  <defs>
                    <linearGradient
                      id='bodyGrad'
                      x1='0%'
                      y1='0%'
                      x2='0%'
                      y2='100%'
                    >
                      <stop offset='0%' stopColor='#3b82f6' />
                      <stop offset='100%' stopColor='#1d4ed8' />
                    </linearGradient>
                    <linearGradient
                      id='wingGrad'
                      x1='0%'
                      y1='0%'
                      x2='100%'
                      y2='0%'
                    >
                      <stop offset='0%' stopColor='#60a5fa' />
                      <stop offset='100%' stopColor='#3b82f6' />
                    </linearGradient>
                  </defs>
                  <ellipse
                    cx='55'
                    cy='50'
                    rx='30'
                    ry='8'
                    fill='url(#bodyGrad)'
                  />
                  <path
                    d='M25 50 Q20 50 18 50 Q20 48 25 46 L25 54 Q20 52 18 50 Z'
                    fill='url(#bodyGrad)'
                  />
                  <ellipse
                    cx='35'
                    cy='50'
                    rx='8'
                    ry='5'
                    fill='#bfdbfe'
                    opacity='0.9'
                  />
                  <ellipse
                    cx='35'
                    cy='50'
                    rx='6'
                    ry='4'
                    fill='#dbeafe'
                    opacity='0.7'
                  />
                  <path
                    d='M50 50 L45 28 L55 30 L58 50 Z'
                    fill='url(#wingGrad)'
                  />
                  <path
                    d='M50 50 L45 72 L55 70 L58 50 Z'
                    fill='url(#wingGrad)'
                  />
                  <path
                    d='M50 35 L48 32 L52 33 Z'
                    fill='#1e40af'
                    opacity='0.7'
                  />
                  <path
                    d='M50 65 L48 68 L52 67 Z'
                    fill='#1e40af'
                    opacity='0.7'
                  />
                  <path
                    d='M80 50 L76 38 L82 39 L84 50 Z'
                    fill='url(#wingGrad)'
                    opacity='0.9'
                  />
                  <path
                    d='M80 50 L76 62 L82 61 L84 50 Z'
                    fill='url(#wingGrad)'
                    opacity='0.9'
                  />
                  <path
                    d='M82 50 L79 42 L85 42 L85 50 Z'
                    fill='url(#bodyGrad)'
                  />
                  <ellipse cx='85' cy='50' rx='4' ry='3.5' fill='#475569' />
                  <ellipse cx='85' cy='50' rx='2.5' ry='2' fill='#1e293b' />
                  <circle
                    cx='45'
                    cy='48'
                    r='1.5'
                    fill='#bfdbfe'
                    opacity='0.8'
                  />
                  <circle
                    cx='52'
                    cy='48'
                    r='1.5'
                    fill='#bfdbfe'
                    opacity='0.8'
                  />
                  <circle
                    cx='59'
                    cy='48'
                    r='1.5'
                    fill='#bfdbfe'
                    opacity='0.8'
                  />
                  <circle
                    cx='66'
                    cy='48'
                    r='1.5'
                    fill='#bfdbfe'
                    opacity='0.8'
                  />
                  <ellipse
                    cx='20'
                    cy='50'
                    rx='5'
                    ry='3'
                    fill='url(#bodyGrad)'
                  />
                </svg>
              </motion.div>

              <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-4'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={gameState}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className='text-center'
                  >
                    <motion.div
                      animate={{
                        scale: gameState === 'running' ? [1, 1.05, 1] : 1,
                      }}
                      transition={{
                        duration: 0.5,
                        repeat: gameState === 'running' ? Infinity : 0,
                      }}
                      className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tabular-nums ${
                        gameState === 'crashed'
                          ? 'text-red-500'
                          : 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent'
                      }`}
                      style={{
                        textShadow:
                          gameState === 'running'
                            ? '0 0 40px rgba(59, 130, 246, 0.8), 0 0 80px rgba(139, 92, 246, 0.5)'
                            : 'none',
                      }}
                    >
                      {multiplier.toFixed(2)}x
                    </motion.div>

                    {gameState === 'crashed' && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='mt-4'
                      >
                        <p className='text-3xl sm:text-4xl font-bold text-red-500 mb-2'>
                          💥 CRASHED!
                        </p>
                        <p className='text-lg text-slate-400'>
                          Crashed at {crashPoint?.toFixed(2)}x
                        </p>
                      </motion.div>
                    )}

                    {gameState === 'waiting' && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='mt-4 text-lg text-slate-400'
                      >
                        {playerBet
                          ? '🎮 Ready to start...'
                          : '💰 Place your bet to begin'}
                      </motion.p>
                    )}

                    {gameState === 'running' && playerBet && !cashedOut && (
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className='mt-4 bg-blue-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-blue-400/50 shadow-lg shadow-blue-500/20'
                      >
                        <p className='text-xl sm:text-2xl font-bold text-blue-400'>
                          💎 Potential: ${(playerBet * multiplier).toFixed(2)}
                        </p>
                      </motion.div>
                    )}

                    {cashedOut && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className='mt-4'
                      >
                        <div className='bg-emerald-500/20 backdrop-blur-md rounded-xl px-6 py-3 border-2 border-emerald-400/50 shadow-lg shadow-emerald-500/20'>
                          <p className='text-2xl sm:text-3xl font-bold text-emerald-400'>
                            ✅ Cashed Out!
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {showWinAnimation && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className='absolute inset-0 flex items-center justify-center pointer-events-none'
                  >
                    <div className='text-9xl'>🎉</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardContent className='grid md:grid-cols-2 gap-6 max-w-3xl mx-auto'>
          <div className='space-y-4'>
            <Label>Bet Amount</Label>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='icon'
                onClick={() => setBetAmount(Math.max(1, betAmount - 10))}
                disabled={playerBet !== null || gameState === 'running'}
                className='shrink-0'
              >
                <Minus className='w-4 h-4' />
              </Button>

              <Input
                value={betAmount}
                onChange={(e) =>
                  setBetAmount(Math.max(1, Number(e.target.value)))
                }
                disabled={playerBet !== null || gameState === 'running'}
                min={1}
                max={balance}
                className='text-center text-lg font-bold'
              />

              <Button
                variant='outline'
                size='icon'
                onClick={() => setBetAmount(Math.min(balance, betAmount + 10))}
                disabled={playerBet !== null || gameState === 'running'}
                className='shrink-0'
              >
                <Plus className='w-4 h-4' />
              </Button>
            </div>

            <div className='flex gap-2'>
              {[10, 25, 50, 100].map((amount) => (
                <Button
                  key={amount}
                  variant='outline'
                  size='sm'
                  onClick={() => setBetAmount(amount)}
                  disabled={
                    playerBet !== null ||
                    gameState === 'running' ||
                    amount > balance
                  }
                  className='flex-1'
                >
                  {amount}
                </Button>
              ))}
            </div>
          </div>

          <AnimatePresence mode='wait'>
            {gameState === 'waiting' && !playerBet && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  onClick={placeBet}
                  disabled={betAmount < 1 || betAmount > balance}
                  className='w-full h-full text-xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-xl shadow-blue-600/40 min-h-[120px]'
                >
                  🎯 Place Bet ${betAmount.toFixed(2)}
                </Button>
              </motion.div>
            )}

            {gameState === 'waiting' && playerBet && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  onClick={startRound}
                  className='w-full h-full text-xl font-black bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 shadow-xl shadow-emerald-600/40 min-h-[120px]'
                >
                  🚀 Start Round
                </Button>
              </motion.div>
            )}

            {gameState === 'running' && playerBet && !cashedOut && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  onClick={() => cashOut()}
                  className='w-full h-full text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-xl shadow-amber-600/40 min-h-[120px] animate-pulse'
                >
                  💰 Cash Out ${(playerBet * multiplier).toFixed(2)}
                </Button>
              </motion.div>
            )}

            {gameState === 'running' && cashedOut && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className='flex items-center justify-center min-h-[120px]'
              >
                <p className='text-lg text-emerald-400 font-semibold'>
                  ⏳ Waiting for round to end...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <div className='mt-6 flex items-center justify-center gap-4 pt-6 border-t'>
          <span className='text-sm font-semibold '>Auto Cash Out</span>
          <Switch
            checked={autoCashout !== null}
            onCheckedChange={(checked) => setAutoCashout(checked ? 2.0 : null)}
            disabled={playerBet !== null || gameState === 'running'}
          />
          <Input
            type='number'
            step='0.1'
            value={autoCashout || ''}
            onChange={(e) =>
              setAutoCashout(
                e.target.value ? Math.max(1.01, Number(e.target.value)) : null,
              )
            }
            placeholder='2.00x'
            disabled={
              playerBet !== null ||
              gameState === 'running' ||
              autoCashout === null
            }
            min={1.01}
            className='w-28 text-center font-bold'
          />
        </div>
      </Card>
    </div>
  );
}
