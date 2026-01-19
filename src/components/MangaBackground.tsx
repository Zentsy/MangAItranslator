import React from 'react';

const MangaBackground: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-slate-200 relative overflow-hidden">
      {/* Camada de Retículas (Screentone dots) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
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
