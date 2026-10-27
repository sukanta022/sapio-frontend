import { useState, useRef, useEffect, useCallback } from 'react';

export const SPEEDS = [1.0, 1.25, 1.5, 2.0];
const TOTAL_SECONDS = 720; // 12 mins (same as the original script)

export function formatTime(progress) {
  const currentSeconds = Math.floor((progress / 100) * TOTAL_SECONDS);
  const mins = Math.floor(currentSeconds / 60);
  const secs = currentSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Which transcript line (0-3) is highlighted for a given progress value.
export function activeLineFor(progress) {
  if (progress <= 0) return 0;
  if (progress <= 25) return 0;
  if (progress <= 50) return 1;
  if (progress <= 75) return 2;
  return 3;
}

export function useAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedIndex, setSpeedIndex] = useState(0);
  // 28.34% of 12:00 = 03:24, which is the time the original page showed on load.
  const [progress, setProgress] = useState(28.34);
  const [autoScroll, setAutoScroll] = useState(true);
  const [barHeights, setBarHeights] = useState(null);

  const progressRef = useRef(progress);
  useEffect(() => {
  progressRef.current = progress;
}, [progress]);

  // Simulated audio loop: +0.5% every 500ms, stop and reset at the end.
  useEffect(() => {
    if (!isPlaying) return undefined;

    const id = setInterval(() => {
    setBarHeights(
      Array.from({ length: 10 }, () => Math.floor(Math.random() * 20) + 6),
    );

    if (progressRef.current < 100) {
      setProgress(progressRef.current + 0.5);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  }, 500);

  return () => clearInterval(id);
}, [isPlaying]);

  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);
  const play = useCallback(() => setIsPlaying(true), []);
  const toggleSpeed = useCallback(() => setSpeedIndex((i) => (i + 1) % SPEEDS.length), []);
  const toggleAutoScroll = useCallback(() => setAutoScroll((a) => !a), []);
  const seek = useCallback((val) => setProgress(parseFloat(val)), []);

  const skipTime = useCallback((seconds) => {
    setProgress((p) => Math.max(0, Math.min(100, p + (seconds / TOTAL_SECONDS) * 100)));
  }, []);

  const changeChapter = useCallback((val) => {
    setProgress((Number(val) - 1) * 33);
    setIsPlaying(true);
  }, []);

  return {
    isPlaying,
    speed: SPEEDS[speedIndex],
    progress,
    autoScroll,
    barHeights,
    togglePlay,
    play,
    toggleSpeed,
    toggleAutoScroll,
    seek,
    skipTime,
    changeChapter,
  };
}
