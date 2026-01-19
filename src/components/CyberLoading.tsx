import React from 'react';
import { motion } from 'framer-motion';

const CyberLoading: React.FC = () => {
  return (
    <div className="flex gap-1">
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ height: 4, opacity: 0.2 }}
          animate={{ 
            height: [4, 12, 4],
            opacity: [0.2, 1, 0.2]
          }}
          transition={{ 
            duration: 0.6, 
            repeat: Infinity, 
            delay: i * 0.1 
          }}
          className="w-1 bg-current rounded-full"
        />
      ))}
    </div>
  );
};

export default CyberLoading;
