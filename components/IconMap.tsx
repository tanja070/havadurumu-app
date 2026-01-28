import React from 'react';
import { 
  Cloud, 
  CloudRain, 
  Sun, 
  CloudSun, 
  CloudLightning, 
  Snowflake, 
  Moon, 
  CloudMoon 
} from 'lucide-react';

interface IconMapProps {
  iconName: string;
  className?: string;
}

export const IconMap: React.FC<IconMapProps> = ({ iconName, className = "w-6 h-6" }) => {
  const name = iconName.toLowerCase();
  
  if (name.includes('rain')) return <CloudRain className={`${className} text-blue-300`} />;
  if (name.includes('storm')) return <CloudLightning className={`${className} text-yellow-300`} />;
  if (name.includes('snow')) return <Snowflake className={`${className} text-white`} />;
  if (name.includes('partly')) return <CloudSun className={`${className} text-yellow-100`} />;
  if (name.includes('sun') || name.includes('clear')) return <Sun className={`${className} text-yellow-400`} />;
  if (name.includes('moon')) return <Moon className={`${className} text-gray-200`} />;
  
  return <Cloud className={`${className} text-gray-300`} />;
};