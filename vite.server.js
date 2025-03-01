import express from 'express';
import { createServer as createViteServer } from 'vite';
import cors from 'cors';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Advanced rate limiter with per-domain tracking
const requestCounts = {};
const domainCounts = {};
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // 30 requests per minute per IP
const DOMAIN_LIMIT_MAX = 10; // 10 requests per minute per domain

// User agent rotation
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:90.0) Gecko/20100101 Firefox/90.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36'
];

// Get a random user agent
const getRandomUserAgent = () => {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Cache for successful responses to reduce repeated requests
const responseCache = new Map();
const CACHE_TTL = 30000; // 30 seconds

async function createServer() {
  const app = express();
  
  // Create Vite server in middleware mode
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  // Use Vite's connect instance as middleware
  app.use(vite.middlewares);
  
  // Enable CORS
  app.use(cors());
  
  // Parse JSON bodies
  app.use(express.json());
  
  // Rate limiter middleware
  const rateLimiter = (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const url = req.query.url;
    
    // Extract domain from URL if available
    let domain = null;
    if (url) {
      try {
        domain = new URL(url).hostname;
      } catch (e) {
        // Invalid URL, will be caught later
      }
    }
    
    // IP-based rate limiting
    if (!requestCounts[ip] || now - requestCounts[ip].timestamp > RATE_LIMIT_WINDOW) {
      requestCounts[ip] = {
        count: 0,
        timestamp: now
      };
    }
    
    requestCounts[ip].count++;
    
    if (requestCounts[ip].count > RATE_LIMIT_MAX) {
      return res.status(429).json({
        error: 'Too many requests from your IP',
        details: 'Please try again later',
        retryAfter: Math.ceil((requestCounts[ip].timestamp + RATE_LIMIT_WINDOW - now) / 1000)
      });
    }
    
    // Domain-based rate limiting (to prevent overwhelming a single site)
    if (domain) {
      const domainKey = `${ip}:${domain}`;
      
      if (!domainCounts[domainKey] || now - domainCounts[domainKey].timestamp > RATE_LIMIT_WINDOW) {
        domainCounts[domainKey] = {
          count: 0,
          timestamp: now
        };
      }
      
      domainCounts[domainKey].count++;
      
      if (domainCounts[domainKey].count > DOMAIN_LIMIT_MAX) {
        return res.status(429).json({
          error: 'Too many requests to this domain',
          details: `You've made too many requests to ${domain}. Please try again later or try a different site.`,
          retryAfter: Math.ceil((domainCounts[domainKey].timestamp + RATE_LIMIT_WINDOW - now) / 1000)
        });
      }
    }
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance on each request
      const cutoff = now - RATE_LIMIT_WINDOW;
      
      Object.keys(requestCounts).forEach(key => {
        if (requestCounts[key].timestamp < cutoff) {
          delete requestCounts[key];
        }
      });
      
      Object.keys(domainCounts).forEach(key => {
        if (domainCounts[key].timestamp < cutoff) {
          delete domainCounts[key];
        }
      });
    }
    
    next();
  };
  
  // Apply rate limiter to proxy routes
  app.use('/api/proxy', rateLimiter);
  
  // Simple proxy endpoint with improved error handling and caching
  app.get('/api/proxy', async (req, res) => {
    const url = req.query.url;
    
    if (!url) {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Check cache first
    const cacheKey = url;
    const cachedResponse = responseCache.get(cacheKey);
    
    if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
      // Set the same headers as the cached response
      if (cachedResponse.contentType) {
        res.setHeader('Content-Type', cachedResponse.contentType);
      }
      
      return res.send(cachedResponse.data);
    }
    
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Referer': 'https://www.google.com/'
        },
        timeout: 15000, // 15 second timeout
        maxRedirects: 5,
        validateStatus: function (status) {
          return status < 500; // Accept all status codes less than 500
        }
      });
      
      // Set the same headers as the response
      const contentType = response.headers['content-type'];
      if (contentType) {
        res.setHeader('Content-Type', contentType);
      }
      
      // Cache successful responses
      if (response.status >= 200 && response.status < 300) {
        responseCache.set(cacheKey, {
          data: response.data,
          contentType: contentType,
          timestamp: Date.now()
        });
        
        // Clean up old cache entries periodically
        if (responseCache.size > 100) {
          const now = Date.now();
          for (const [key, value] of responseCache.entries()) {
            if (now - value.timestamp > CACHE_TTL) {
              responseCache.delete(key);
            }
          }
        }
      }
      
      res.status(response.status).send(response.data);
    } catch (error) {
      console.error('Proxy error:', error.message);
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const status = error.response.status;
        if (status === 429) {
          res.status(429).json({
            error: 'The target website is rate limiting requests',
            details: 'Too many requests to the target website. Please try again later or try a different site.',
            retryAfter: parseInt(error.response.headers['retry-after'] || '60', 10)
          });
        } else {
          res.status(status).json({
            error: `The target website returned a ${status} error`,
            details: error.message
          });
        }
      } else if (error.code === 'ECONNABORTED') {
        res.status(504).json({
          error: 'Request timeout',
          details: 'The target website took too long to respond'
        });
      } else if (error.request) {
        // The request was made but no response was received
        res.status(504).json({
          error: 'Gateway timeout',
          details: 'The target website did not respond'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        res.status(500).json({
          error: 'Failed to fetch the requested URL',
          details: error.message
        });
      }
    }
  });
  
  // Root endpoint for testing API
  app.get('/api', (req, res) => {
    res.json({
      message: 'Proxy server is running. Use /api/proxy?url=YOUR_URL to proxy requests.'
    });
  });
  
  // For production: serve static files from the dist directory
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    // For all other routes, serve the index.html file
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }
  
  return { app, vite };
}

// Start the server
createServer().then(({ app }) => {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});