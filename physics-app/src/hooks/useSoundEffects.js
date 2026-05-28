import { useCallback, useRef, useEffect } from 'react';

export default function useSoundEffects() {
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // We only create AudioContext on user interaction to comply with browser policies
    const initAudio = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('touchstart', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
  }, []);

  const playTone = useCallback((freq, type, duration, vol = 0.1) => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    
    if (ctx.state === 'suspended') {
        ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  const playPop = useCallback(() => {
    playTone(400, 'sine', 0.1, 0.2);
    setTimeout(() => playTone(600, 'sine', 0.1, 0.2), 50);
  }, [playTone]);

  const playSnap = useCallback(() => {
    playTone(800, 'triangle', 0.1, 0.1);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(523.25, 'sine', 0.2, 0.2); // C5
    setTimeout(() => playTone(659.25, 'sine', 0.2, 0.2), 150); // E5
    setTimeout(() => playTone(783.99, 'sine', 0.4, 0.2), 300); // G5
  }, [playTone]);

  const playError = useCallback(() => {
    playTone(300, 'sawtooth', 0.2, 0.1);
    setTimeout(() => playTone(250, 'sawtooth', 0.3, 0.1), 150);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50].forEach((freq, i) => {
      setTimeout(() => playTone(freq, 'sine', 0.15, 0.2), i * 100);
    });
  }, [playTone]);

  // Physical synthesized sounds for immersive lab interactions
  const playBuzz = useCallback(() => {
    playTone(120, 'triangle', 0.25, 0.15);
  }, [playTone]);

  const playSpark = useCallback(() => {
    // Crackling sparks: multiple extremely fast sawtooth sweeps
    playTone(1800, 'sawtooth', 0.05, 0.2);
    setTimeout(() => playTone(2400, 'sawtooth', 0.04, 0.2), 30);
    setTimeout(() => playTone(1200, 'sawtooth', 0.06, 0.15), 60);
  }, [playTone]);

  const playBoom = useCallback(() => {
    // Explosive bass drop
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, []);

  const playTick = useCallback(() => {
    playTone(3000, 'sine', 0.02, 0.25);
  }, [playTone]);

  return { playPop, playSnap, playSuccess, playError, playLevelUp, playBuzz, playSpark, playBoom, playTick };
}
