import React, { useState, useEffect, useRef } from 'react';
import { Star, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '../types';
import { motion, AnimatePresence } from 'framer-motion'; // Add framer-motion import
// Note: You need to install framer-motion package with: npm install framer-motion

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [expanded, setExpanded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
    
    // Load the game when expanded
    if (!expanded && iframeRef.current) {
      iframeRef.current.src = game.url;
    }
  };
  
  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    // Preload game if the setting is enabled
    const shouldPreload = localStorage.getItem('gamePreload') === 'true';
    if (shouldPreload && !expanded) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'document';
      preloadLink.href = game.url;
      document.head.appendChild(preloadLink);
    }
  }, []);

  return (
    <motion.div 
      className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg ${
        expanded ? 'fixed inset-4 z-50 flex flex-col' : 'hover:scale-105'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={!expanded ? { scale: 1.05, transition: { duration: 0.2 } } : {}}
      layout
    >
      {expanded && (
        <motion.div 
          className="absolute inset-0 bg-black bg-opacity-75 z-40" 
          onClick={toggleExpand}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
      <motion.div 
        className={`relative ${expanded ? 'z-50 flex flex-col h-full' : ''}`}
        layout
      >
        <motion.div 
          className={`relative ${expanded ? 'h-16' : 'h-48'} overflow-hidden`}
          layout
        >
          <motion.img 
            src={game.thumbnail} 
            alt={game.title} 
            className={`w-full h-full object-cover ${expanded ? 'opacity-30' : ''}`}
            layoutId={`game-image-${game.id}`}
          />
          <motion.div 
            className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Star className="text-yellow-400 mr-1" size={14} />
            <span className="text-sm">{game.rating}</span>
          </motion.div>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <h3 className="font-bold text-lg text-white">{game.title}</h3>
                <motion.button 
                  onClick={toggleExpand}
                  className="p-1 bg-gray-800 rounded-full hover:bg-gray-700"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minimize2 size={20} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {!expanded ? (
          <motion.div 
            className="p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="font-bold text-lg mb-1 truncate">{game.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{game.description}</p>
            <div className="flex justify-between items-center">
              <motion.span 
                className="bg-gray-700 text-xs px-2 py-1 rounded"
                whileHover={{ backgroundColor: "#4B5563" }}
              >
                {game.category}
              </motion.span>
              <div className="flex space-x-2">
                <motion.button 
                  onClick={toggleExpand}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center hover:bg-blue-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Play <Maximize2 size={14} className="ml-1" />
                </motion.button>
                <motion.a 
                  href={game.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center hover:bg-purple-700"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Open <ExternalLink size={14} className="ml-1" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex-1 p-4 flex flex-col bg-gray-800 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <AnimatePresence>
              {!isLoaded && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="text-white flex items-center"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <motion.div 
                      className="w-4 h-4 bg-blue-500 rounded-full mr-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                    />
                    Loading game...
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <iframe 
              ref={iframeRef}
              src={game.url}
              className="flex-1 w-full border-0 rounded-lg bg-white"
              title={game.title}
              onLoad={handleIframeLoad}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
              loading="lazy"
            />
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default GameCard;