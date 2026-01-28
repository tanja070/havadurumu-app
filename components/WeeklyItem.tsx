import React from 'react';
import { IconMap } from './IconMap';

interface WeeklyItemProps {
  day: string;
  high: number;
  low: number;
  icon: string;
}

export const WeeklyItem: React.FC<WeeklyItemProps> = ({ day, high, low, icon }) => {
  return (
    <div className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/5 mb-2 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-4">
        <div className="bg-white/10 p-2 rounded-full">
           <IconMap iconName={icon} className="w-6 h-6" />
        </div>
        <span className="text-white font-medium text-lg">{day}</span>
      </div>
      <div className="flex gap-4">
        <span className="text-white font-bold text-lg">{high}°</span>
        <span className="text-white/50 text-lg">{low}°</span>
      </div>
    </div>
  );
};