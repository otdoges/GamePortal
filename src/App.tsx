import React, { useState } from 'react';
import { TowerControl as GameController, Globe } from 'lucide-react';
import GameCard from './components/GameCard';
import FeaturedGame from './components/FeaturedGame';
import WebProxy from './components/WebProxy';
/* Put this back when import works 
import Settings from './components/Settings';
*/
import { games } from './data/games';
import { motion,  } from 'framer-motion';
import { Settings as SettingsIcon } from 'lucide-react';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  /* Add state for settings modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  Settings state is used in openSettings, closeSettings functions and onClick handler in the header
  */
  
  
  // Settings modal
  // This function is now directly used in the onClick handler in the header
  // Function to close settings modal
  /*
  const closeSettings = () => setIsSettingsOpen(false);
  // Pass this function to the Settings component when implemented
  */
  // Persist active tab in localStorage
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'games';
  });
  
  // Update localStorage when tab changes
  const handleTabChange = (tab: 'games' | 'proxy') => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };
  
  const categories = ['All', 'Action', 'Puzzle', 'Racing', 'Strategy', 'Sports'];
  
  const filteredGames = games.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || game.category === activeCategory;
    return matchesSearch && matchesCategory;
  });
  
  const featuredGame = games[0]; // First game as featured

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <GameController size={28} className="text-purple-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              GamePortal
            </h1>
          </div>
          
          {/* Main Navigation */}
          <div className="hidden md:flex space-x-4">
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'games' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
              onClick={() => handleTabChange('games')}
            >
              <GameController size={18} className="mr-2" />
              Games
            </button>
            <button 
              className={`px-4 py-2 rounded-lg flex items-center ${activeTab === 'proxy' ? 'bg-purple-600' : 'hover:bg-gray-700'}`}
              onClick={() => handleTabChange('proxy')}
            >
              <Globe size={18} className="mr-2" />
              Web Proxy
            </button>
            
            <button 
              className="p-2 rounded-full hover:bg-gray-700"
              title="Settings"
              onClick={() => setIsSettingsOpen(true)}
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'games' ? (
          <>
            {/* Featured Game */}
            <section className="mb-12">
              <FeaturedGame game={featuredGame} />
            </section>

            {/* Categories */}
            <section className="mb-8">
              <div className="flex space-x-4 overflow-x-auto pb-2">
                {categories.map(category => (
                  <motion.button
                    key={category}
                    className={`px-4 py-2 rounded-full whitespace-nowrap ${
                      activeCategory === category 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-gray-800 text-gray-300'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </motion.button>
                ))}
              </div>
            </section>

            {/* Games Grid */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {activeCategory === 'All' ? 'All Games' : activeCategory + ' Games'}
                </h2>
                <div className="flex items-center text-sm text-gray-400">
                  <span>{filteredGames.length} games</span>
                </div>
              </div>

              {filteredGames.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredGames.map(game => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No games found matching your search.</p>
                  <button 
                    className="mt-4 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700"
                    onClick={() => {
                      setSearchTerm('');
                      setActiveCategory('All');
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </section>
          </>
        ) : (
          <WebProxy />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GameController size={24} className="text-purple-500" />
              <span className="text-xl font-bold">GamePortal</span>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 GamePortal. All games are property of their respective owners.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;