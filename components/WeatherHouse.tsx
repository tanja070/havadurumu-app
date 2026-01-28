import React from 'react';

export const WeatherHouse: React.FC = () => {
  return (
    <div className="relative w-full h-full max-h-64 flex items-center justify-center animate-float">
      {/* 
        Using a curated 3D illustrative image that matches the "purple house" aesthetic.
        In a real production app, this would be a local asset or a 3D Canvas.
      */}
      <div className="absolute inset-0 flex items-center justify-center">
         <img 
           src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=1000&auto=format&fit=crop" 
           alt="Weather House"
           className="w-full h-full object-cover rounded-2xl opacity-0 hidden" // Preload trick if needed, but we use div bg
         />
         {/* Decorative Halo */}
         <div className="absolute w-64 h-64 bg-purple-500 rounded-full blur-[80px] opacity-40 top-10"></div>
         
         {/* The Main Illustration */}
         <div 
           className="relative z-10 w-full h-full bg-contain bg-center bg-no-repeat drop-shadow-2xl"
           style={{ 
             backgroundImage: "url('https://cdn3d.iconscout.com/3d/premium/thumb/house-3d-icon-download-in-png-blend-fbx-gltf-file-formats--home-building-real-estate-pack-buildings-icons-4966601.png?f=webp')",
             filter: "hue-rotate(240deg) brightness(0.9) contrast(1.2)" // Shift to purple/blue tones
           }}
         ></div>
         
         {/* Floating particles */}
         <div className="absolute top-1/4 left-10 w-2 h-2 bg-pink-300 rounded-full animate-ping"></div>
         <div className="absolute bottom-1/4 right-10 w-3 h-3 bg-purple-300 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};