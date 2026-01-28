import React from 'react';

export const Background: React.FC = () => {
  // Generate static random stars to avoid re-render flicker
  const stars = React.useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`,
      delay: `${Math.random() * 5}s`
    }));
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#1a103c] via-[#2d1b54] to-[#4c2d75] overflow-hidden pointer-events-none">
      {stars.map((star, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white opacity-60 animate-pulse-slow"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
      {/* Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-600 rounded-full blur-[120px] opacity-20"></div>
    </div>
  );
};