import React, { useState } from 'react';
import { Star, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
}

const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all duration-300 ${
      expanded ? 'fixed inset-4 z-50 flex flex-col' : 'hover:scale-105'
    }`}>
      {expanded && (
        <div className="absolute inset-0 bg-black bg-opacity-75 z-40" onClick={toggleExpand}></div>
      )}
      <div className={`relative ${expanded ? 'z-50 flex flex-col h-full' : ''}`}>
        <div className={`relative ${expanded ? 'h-16' : 'h-48'} overflow-hidden`}>
          <img 
            src={game.thumbnail} 
            alt={game.title} 
            className={`w-full h-full object-cover ${expanded ? 'opacity-30' : ''}`}
          />
          <div className="absolute top-2 right-2 bg-black bg-opacity-70 rounded-full px-2 py-1 flex items-center">
            <Star className="text-yellow-400 mr-1" size={14} />
            <span className="text-sm">{game.rating}</span>
          </div>
          {expanded && (
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white">{game.title}</h3>
              <button 
                onClick={toggleExpand}
                className="p-1 bg-gray-800 rounded-full hover:bg-gray-700"
              >
                <Minimize2 size={20} />
              </button>
            </div>
          )}
        </div>
        
        {!expanded ? (
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 truncate">{game.title}</h3>
            <p className="text-gray-400 text-sm mb-3 line-clamp-2">{game.description}</p>
            <div className="flex justify-between items-center">
              <span className="bg-gray-700 text-xs px-2 py-1 rounded">{game.category}</span>
              <div className="flex space-x-2">
                <button 
                  onClick={toggleExpand}
                  className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center hover:bg-blue-700"
                >
                  Play <Maximize2 size={14} className="ml-1" />
                </button>
                <a 
                  href={game.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm flex items-center hover:bg-purple-700"
                >
                  Open <ExternalLink size={14} className="ml-1" />
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 flex flex-col bg-gray-800 overflow-hidden">
            <iframe 
              src={game.url} 
              className="flex-1 w-full border-0 rounded-lg bg-white"
              title={game.title}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCard;