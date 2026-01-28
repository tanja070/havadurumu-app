import React from 'react';
import { IconMap } from './IconMap';

interface ForecastItemProps {
  time: string;
  temp: number;
  icon: string;
  isActive?: boolean;
}

export const ForecastItem: React.FC<ForecastItemProps> = ({ time, temp, icon, isActive }) => {
  return (
    <div 
      className={`
        flex flex-col items-center justify-between p-3 rounded-full h-36 w-16 flex-shrink-0 transition-all duration-300
        ${isActive 
          ? 'bg-gradient-to-b from-[#5c4a96] to-[#3a2a6b] shadow-lg shadow-purple-900/50 scale-105 border border-white/20' 
          : 'bg-white/5 border border-white/5 hover:bg-white/10'}
      `}
    >
      <span className="text-xs font-medium text-white/90 mt-1">{time}</span>
      <div className="my-2">
        <IconMap iconName={icon} className="w-8 h-8" />
      </div>
      <span className="text-lg font-semibold text-white mb-2">{temp}°</span>
    </div>
  );
};