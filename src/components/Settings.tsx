import React, { useState,  } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe, Shield, Save, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [settings, setSettings] = useState({
    theme: localStorage.getItem('theme') || 'dark',
    proxyMode: localStorage.getItem('proxyMode') || 'normal',
    gamePreload: localStorage.getItem('gamePreload') === 'true',
    notifications: localStorage.getItem('notifications') === 'true',
    saveHistory: localStorage.getItem('saveHistory') === 'true'
  });

  const saveSettings = () => {
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value.toString());
    });
    onClose();
    window.location.reload(); // Reload to apply changes
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: 'dark',
      proxyMode: 'normal',
      gamePreload: true,
      notifications: true,
      saveHistory: true
    };
    setSettings(defaultSettings);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                <SettingsIcon className="mr-2" size={24} />
                Settings
              </h2>
            </div>

            <div className="space-y-6">
              {/* Theme Setting */}
              <div>
                <label className="text-sm font-medium mb-2 block">Theme</label>
                <div className="flex space-x-4">
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      settings.theme === 'light' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, theme: 'light' })}
                  >
                    <Sun size={18} className="mr-2" />
                    Light
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      settings.theme === 'dark' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, theme: 'dark' })}
                  >
                    <Moon size={18} className="mr-2" />
                    Dark
                  </button>
                </div>
              </div>

              {/* Proxy Mode Setting */}
              <div>
                <label className="text-sm font-medium mb-2 block">Proxy Mode</label>
                <div className="flex space-x-4">
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      settings.proxyMode === 'normal' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, proxyMode: 'normal' })}
                  >
                    <Globe size={18} className="mr-2" />
                    Normal
                  </button>
                  <button
                    className={`flex items-center px-4 py-2 rounded-lg ${
                      settings.proxyMode === 'stealth' ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, proxyMode: 'stealth' })}
                  >
                    <Shield size={18} className="mr-2" />
                    Stealth
                  </button>
                </div>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Preload Games</label>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.gamePreload ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, gamePreload: !settings.gamePreload })}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        settings.gamePreload ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Show Notifications</label>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.notifications ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, notifications: !settings.notifications })}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        settings.notifications ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Save History</label>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.saveHistory ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    onClick={() => setSettings({ ...settings, saveHistory: !settings.saveHistory })}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full transform transition-transform ${
                        settings.saveHistory ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 mt-8">
                <button
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  onClick={saveSettings}
                >
                  <Save size={18} className="mr-2" />
                  Save Changes
                </button>
                <button
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center justify-center"
                  onClick={resetSettings}
                >
                  <RotateCcw size={18} className="mr-2" />
                  Reset
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Settings;