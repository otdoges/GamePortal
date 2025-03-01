import React, { useState } from 'react';
import { Star, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '../types';
import { motion, AnimatePresence } from 'framer-motion'; // Add framer-motion import

interface FeaturedGameProps {
  game: Game;
}

const FeaturedGame: React.FC<FeaturedGameProps> = ({ game }) => {
  const [expanded, setExpanded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <motion.div 
      className="relative rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
      <motion.img 
        src={game.thumbnail} 
        alt={game.title} 
        className="w-full h-[400px] object-cover"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
      />
      <motion.div 
        className="absolute bottom-0 left-0 right-0 p-6 z-20"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div 
          className="flex items-center mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.span 
            className="bg-purple-600 text-white text-xs px-2 py-1 rounded mr-2"
            whileHover={{ scale: 1.05 }}
          >
            Featured
          </motion.span>
          <motion.span 
            className="bg-gray-800 text-xs px-2 py-1 rounded flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="text-yellow-400 mr-1" size={14} />
            {game.rating}
          </motion.span>
        </motion.div>
        <motion.h2 
          className="text-3xl font-bold mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          {game.title}
        </motion.h2>
        <motion.p 
          className="text-gray-300 mb-4 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {game.description}
        </motion.p>
        <motion.div 
          className="flex space-x-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.button 
            onClick={() => setExpanded(!expanded)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {expanded ? 'Close Game' : 'Play Now'} {expanded ? <Minimize2 size={16} className="ml-2" /> : <Maximize2 size={16} className="ml-2" />}
          </motion.button>
          <motion.a 
            href={game.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Open in New Tab <ExternalLink size={16} className="ml-2" />
          </motion.a>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <motion.div 
                className="absolute top-4 right-4 z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button 
                  onClick={() => setExpanded(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Minimize2 size={24} />
                </motion.button>
              </motion.div>
              <iframe 
                src={game.url} 
                className="w-full h-full border-0"
                title={game.title}
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
                loading="lazy"
                onLoad={() => setIsLoaded(true)}
              />
              {!isLoaded && (
                <motion.div 
                  className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: isLoaded ? 0 : 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.div 
                    className="text-white text-xl"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    Loading game...
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FeaturedGame;