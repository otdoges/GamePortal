import React, { useState, useRef, useEffect } from 'react';
import { Search, RefreshCw, ArrowLeft, ArrowRight, Home, X, AlertTriangle, Globe, Shield } from 'lucide-react';

const WebProxy: React.FC = () => {
  const [inputUrl, setInputUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentUrl, setCurrentUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const [retryDelay, setRetryDelay] = useState(0);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-load Google when component mounts
  useEffect(() => {
    if (!currentUrl) {
      loadHomePage();
    }
    
    // Cleanup function for any timers
    return () => {
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
      }
    };
  }, []);

  const loadHomePage = () => {
    const homeUrl = 'https://www.google.com';
    setInputUrl(homeUrl);
    setCurrentUrl(homeUrl);
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setRetryCount(0);
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(homeUrl)}`;
    if (iframeRef.current) {
      iframeRef.current.src = proxyUrl;
    }
    
    // Add to history if not already there
    if (history.length === 0 || history[historyIndex] !== homeUrl) {
      setHistory([homeUrl]);
      setHistoryIndex(0);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputUrl.trim()) return;
    
    let processedUrl = inputUrl.trim();
    
    // Check if the input is a search query or URL
    if (!processedUrl.includes('.') || processedUrl.includes(' ')) {
      // Treat as a Google search query
      processedUrl = `https://www.google.com/search?q=${encodeURIComponent(processedUrl)}`;
    } else if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      // Add https:// prefix if missing
      processedUrl = `https://${processedUrl}`;
    }
    
    // Create the proxy URL
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(processedUrl)}`;
    
    setLoading(true);
    setCurrentUrl(processedUrl);
    setError(null);
    setErrorDetails(null);
    setRetryCount(0);
    setIsRetrying(false);
    
    // Clear any existing retry timers
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
    
    // Update iframe src
    if (iframeRef.current) {
      iframeRef.current.src = proxyUrl;
    }
    
    // Add to history
    if (historyIndex === history.length - 1) {
      setHistory([...history, processedUrl]);
      setHistoryIndex(historyIndex + 1);
    } else {
      // If we navigated back and then to a new URL, truncate the forward history
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(processedUrl);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleRefresh = () => {
    if (currentUrl) {
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      setRetryCount(0);
      setIsRetrying(false);
      
      // Clear any existing retry timers
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
      
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
      if (iframeRef.current) {
        iframeRef.current.src = proxyUrl;
      }
    }
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      const previousUrl = history[historyIndex - 1];
      setCurrentUrl(previousUrl);
      setInputUrl(previousUrl);
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      setRetryCount(0);
      setIsRetrying(false);
      
      // Clear any existing retry timers
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
      
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(previousUrl)}`;
      if (iframeRef.current) {
        iframeRef.current.src = proxyUrl;
      }
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      const nextUrl = history[historyIndex + 1];
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      setLoading(true);
      setError(null);
      setErrorDetails(null);
      setRetryCount(0);
      setIsRetrying(false);
      
      // Clear any existing retry timers
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
      
      const proxyUrl = `/api/proxy?url=${encodeURIComponent(nextUrl)}`;
      if (iframeRef.current) {
        iframeRef.current.src = proxyUrl;
      }
    }
  };

  const handleHome = () => {
    loadHomePage();
  };

  const handleClear = () => {
    setInputUrl('');
  };

  const handleIframeLoad = () => {
    setLoading(false);
    setIsRetrying(false);
    
    // If we successfully loaded, reset retry count
    setRetryCount(0);
    
    // Clear any existing retry timers
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
    
    // Check if the iframe content indicates an error
    try {
      if (iframeRef.current && iframeRef.current.contentDocument) {
        const contentType = iframeRef.current.contentDocument.contentType;
        
        // If we got JSON instead of HTML/CSS/etc, it might be an error response
        if (contentType === 'application/json') {
          const text = iframeRef.current.contentDocument.body.textContent;
          if (text) {
            try {
              const errorData = JSON.parse(text);
              if (errorData.error) {
                setError(errorData.error);
                setErrorDetails(errorData.details || null);
                
                // If it's a rate limit error with retry-after, set up automatic retry
                if (errorData.retryAfter && errorData.error.includes('rate limit')) {
                  const delay = Math.min(errorData.retryAfter * 1000, 60000); // Max 1 minute
                  setRetryDelay(delay);
                  setIsRetrying(true);
                  
                  const timer = window.setTimeout(() => {
                    handleRefresh();
                  }, delay);
                  
                  setRetryTimer(timer);
                }
                
                return;
              }
            } catch (e) {
              // Not valid JSON or doesn't have expected structure
            }
          }
        }
      }
    } catch (e) {
      // Security error accessing iframe content, which is normal for cross-origin frames
    }
  };

  const handleIframeError = () => {
    // If we get an error and haven't exceeded max retries, try again
    if (retryCount < maxRetries) {
      const nextRetryCount = retryCount + 1;
      setRetryCount(nextRetryCount);
      
      // Exponential backoff: 1s, 2s, 4s, etc.
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
      setRetryDelay(delay);
      setIsRetrying(true);
      
      const timer = window.setTimeout(() => {
        if (currentUrl) {
          const proxyUrl = `/api/proxy?url=${encodeURIComponent(currentUrl)}`;
          if (iframeRef.current) {
            iframeRef.current.src = proxyUrl;
          }
        }
      }, delay);
      
      setRetryTimer(timer);
    } else {
      setLoading(false);
      setIsRetrying(false);
      setError(`Failed to load ${currentUrl}`);
      setErrorDetails('The site may be blocking proxy access or experiencing issues.');
      
      // Clear any existing retry timers
      if (retryTimer !== null) {
        clearTimeout(retryTimer);
        setRetryTimer(null);
      }
    }
  };

  // Handle alternative sites if Google is blocked
  const alternativeSites = [
    { name: "DuckDuckGo", url: "https://duckduckgo.com" },
    { name: "Bing", url: "https://www.bing.com" },
    { name: "Yahoo", url: "https://search.yahoo.com" },
    { name: "Baidu", url: "https://www.baidu.com" },
    { name: "Yandex", url: "https://yandex.com" },
    { name: "Ecosia", url: "https://www.ecosia.org" }
  ];

  const popularSites = [
    { name: "YouTube", url: "https://www.youtube.com" },
    { name: "Wikipedia", url: "https://www.wikipedia.org" },
    { name: "Reddit", url: "https://www.reddit.com" },
    { name: "Twitter", url: "https://twitter.com" },
    { name: "GitHub", url: "https://github.com" },
    { name: "Stack Overflow", url: "https://stackoverflow.com" }
  ];

  const loadAlternativeSite = (url: string) => {
    setInputUrl(url);
    setCurrentUrl(url);
    setLoading(true);
    setError(null);
    setErrorDetails(null);
    setRetryCount(0);
    setIsRetrying(false);
    
    // Clear any existing retry timers
    if (retryTimer !== null) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
    }
    
    const proxyUrl = `/api/proxy?url=${encodeURIComponent(url)}`;
    if (iframeRef.current) {
      iframeRef.current.src = proxyUrl;
    }
    
    // Add to history
    if (historyIndex === history.length - 1) {
      setHistory([...history, url]);
      setHistoryIndex(historyIndex + 1);
    } else {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(url);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  // Format time for retry countdown
  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden shadow-xl">
      {/* Browser Controls */}
      <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center space-x-2">
        <button 
          onClick={handleBack}
          disabled={historyIndex <= 0}
          className={`p-2 rounded-full ${historyIndex <= 0 ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700'}`}
          title="Go back"
        >
          <ArrowLeft size={18} />
        </button>
        
        <button 
          onClick={handleForward}
          disabled={historyIndex >= history.length - 1}
          className={`p-2 rounded-full ${historyIndex >= history.length - 1 ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700'}`}
          title="Go forward"
        >
          <ArrowRight size={18} />
        </button>
        
        <button 
          onClick={handleRefresh}
          disabled={isRetrying}
          className={`p-2 rounded-full ${isRetrying ? 'text-gray-600' : 'text-gray-300 hover:bg-gray-700'}`}
          title={isRetrying ? `Retrying in ${formatTime(retryDelay)}...` : "Refresh"}
        >
          <RefreshCw size={18} className={loading || isRetrying ? 'animate-spin' : ''} />
        </button>
        
        <button 
          onClick={handleHome}
          className="p-2 rounded-full text-gray-300 hover:bg-gray-700"
          title="Home"
        >
          <Home size={18} />
        </button>
        
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-gray-700 px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
            placeholder="Search or enter website URL"
          />
          {inputUrl && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-12 top-2.5 text-gray-400 hover:text-gray-200"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-200"
          >
            <Search size={18} />
          </button>
        </form>
      </div>
      
      {/* Status Bar */}
      {(loading || isRetrying || currentUrl) && (
        <div className="bg-gray-900 px-3 py-1 text-xs text-gray-400 flex items-center">
          {loading ? (
            <span className="flex items-center">
              <RefreshCw size={12} className="animate-spin mr-1" /> Loading...
            </span>
          ) : isRetrying ? (
            <span className="flex items-center text-yellow-400">
              <RefreshCw size={12} className="animate-spin mr-1" /> 
              Retrying in {formatTime(retryDelay)}...
            </span>
          ) : currentUrl ? (
            <span className="flex items-center overflow-hidden">
              <Shield size={12} className="text-green-500 mr-1" /> 
              <span className="truncate">{currentUrl}</span>
            </span>
          ) : null}
        </div>
      )}
      
      {/* Browser Content */}
      <div className="relative" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
        {loading && !isRetrying && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10">
            <div className="flex flex-col items-center">
              <RefreshCw size={40} className="text-purple-500 animate-spin mb-4" />
              <p className="text-gray-300">Loading...</p>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <div className="text-center max-w-md p-6">
              <AlertTriangle size={48} className="mx-auto mb-4 text-yellow-500" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Page</h2>
              <p className="text-gray-400 mb-2">{error}</p>
              {errorDetails && <p className="text-gray-500 mb-6 text-sm">{errorDetails}</p>}
              
              {isRetrying && (
                <div className="mb-6 bg-gray-800 p-4 rounded-lg">
                  <p className="text-yellow-400 flex items-center justify-center">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Automatically retrying in {formatTime(retryDelay)}...
                  </p>
                </div>
              )}
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Try these search engines:</h3>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {alternativeSites.slice(0, 3).map(site => (
                    <button 
                      key={site.name}
                      onClick={() => loadAlternativeSite(site.url)}
                      className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium">{site.name}</p>
                    </button>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium mb-2">Popular websites:</h3>
                <div className="grid grid-cols-3 gap-3">
                  {popularSites.slice(0, 3).map(site => (
                    <button 
                      key={site.name}
                      onClick={() => loadAlternativeSite(site.url)}
                      className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <p className="font-medium">{site.name}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              {!isRetrying && (
                <button 
                  onClick={handleRefresh}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        ) : !currentUrl ? (
          <div className="flex flex-col items-center justify-center h-full bg-gray-900">
            <div className="text-center max-w-md p-6">
              <Globe size={48} className="mx-auto mb-4 text-purple-500" />
              <h2 className="text-2xl font-bold mb-2">Start Browsing</h2>
              <p className="text-gray-400 mb-6">
                Enter a URL in the search bar above or search for something to get started.
              </p>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button 
                  onClick={() => loadAlternativeSite('https://www.google.com')}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium">Google</p>
                </button>
                <button 
                  onClick={() => loadAlternativeSite('https://www.youtube.com')}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium">YouTube</p>
                </button>
                <button 
                  onClick={() => loadAlternativeSite('https://www.wikipedia.org')}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium">Wikipedia</p>
                </button>
                <button 
                  onClick={() => loadAlternativeSite('https://www.reddit.com')}
                  className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <p className="font-medium">Reddit</p>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={`/api/proxy?url=${encodeURIComponent(currentUrl)}`}
            className="w-full h-full border-0"
            title="Web Proxy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        )}
      </div>
      
      <div className="bg-gray-800 p-3 border-t border-gray-700 text-xs text-gray-400">
        <p>Note: Some websites may not display correctly due to security policies or rate limiting. The proxy helps bypass restrictions while maintaining privacy.</p>
      </div>
    </div>
  );
};

export default WebProxy;