'use client';

import { useEffect, useState, useMemo, memo } from 'react';

interface AnimatedBackgroundProps {
  enabled: boolean;
  reduced?: boolean;
}

function AnimatedBackground({ enabled, reduced }: AnimatedBackgroundProps) {
  const [mounted, setMounted] = useState(false);

  // Memoize orb properties to prevent regeneration on every render
  const orbProperties = useMemo(() => {
    return [...Array(6)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      width: Math.random() * 200 + 50,
      height: Math.random() * 200 + 50,
      animationDelay: Math.random() * 5,
      animationDuration: Math.random() * 20 + 10,
    }));
  }, []); // Empty dependency array ensures this only runs once

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !enabled) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Floating Orbs */}
      <div className={`absolute inset-0 ${reduced ? 'animate-pulse' : ''}`}>
        {orbProperties.slice(0, reduced ? 3 : 6).map((orb, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r opacity-20 dark:opacity-10 ${
              reduced 
                ? 'animate-pulse' 
                : i % 2 === 0 
                  ? 'animate-float' 
                  : 'animate-float-reverse'
            } ${
              i % 3 === 0
                ? 'from-blue-400 to-purple-400'
                : i % 3 === 1
                ? 'from-green-400 to-blue-400'
                : 'from-purple-400 to-pink-400'
            }`}
            style={{
              left: `${orb.left}%`,
              top: `${orb.top}%`,
              width: `${orb.width}px`,
              height: `${orb.height}px`,
              animationDelay: `${orb.animationDelay}s`,
              animationDuration: reduced ? '2s' : `${orb.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Mesh Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-purple-50/50 dark:from-blue-900/20 dark:to-purple-900/20 ${
        reduced ? '' : 'animate-gradient-shift'
      }`} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-30 dark:opacity-10">
        <div 
          className="h-full w-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>
    </div>
  );
}

export default memo(AnimatedBackground);