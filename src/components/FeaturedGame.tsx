import React, { useState } from 'react';
import { Star, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '../types';

interface FeaturedGameProps {
  game: Game;
}

const FeaturedGame: React.FC<FeaturedGameProps> = ({ game }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent z-10"></div>
      <img 
        src={game.thumbnail} 
        alt={game.title} 
        className="w-full h-[400px] object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        <div className="flex items-center mb-2">
          <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded mr-2">Featured</span>
          <span className="bg-gray-800 text-xs px-2 py-1 rounded flex items-center">
            <Star className="text-yellow-400 mr-1" size={14} />
            {game.rating}
          </span>
        </div>
        <h2 className="text-3xl font-bold mb-2">{game.title}</h2>
        <p className="text-gray-300 mb-4 max-w-2xl">{game.description}</p>
        <div className="flex space-x-3">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full inline-flex items-center"
          >
            {expanded ? 'Close Game' : 'Play Now'} {expanded ? <Minimize2 size={16} className="ml-2" /> : <Maximize2 size={16} className="ml-2" />}
          </button>
          <a 
            href={game.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full inline-flex items-center"
          >
            Open in New Tab <ExternalLink size={16} className="ml-2" />
          </a>
        </div>
      </div>
      
      {expanded && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-6xl h-[80vh] bg-white rounded-lg overflow-hidden">
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setExpanded(false)}
                className="bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full"
              >
                <Minimize2 size={24} />
              </button>
            </div>
            <iframe 
              src={game.url} 
              className="w-full h-full border-0"
              title={game.title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedGame;