import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const MangaBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useTheme();
  const dotColor = theme === 'paper-light' ? '#000000' : '#ffffff';

  return (
    <div className={`min-h-screen w-full bg-app-bg text-app-text-primary relative overflow-hidden transition-colors duration-500 ${theme === 'paper-light' ? 'bg-paper-grain opacity-100' : ''}`}>
      {/* Camada de Retículas (Screentone dots) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
          backgroundSize: '12px 12px'
        }}
      />
      
      {/* Camada de Textura de Papel/Grão */}
      <div 
        className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `url('https://www.transparenttextures.com/patterns/stardust.png')`
        }}
      />

      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default MangaBackground;
