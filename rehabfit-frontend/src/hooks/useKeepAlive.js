import { useEffect } from 'react';
import API from '../api/axios';

/**
 * Custom hook to keep the backend warm by pinging it every 10 minutes.
 * Prevents Render free tier cold starts.
 */
const useKeepAlive = () => {
  useEffect(() => {
    // Initial ping after 30 seconds (to avoid immediate ping on page load)
    const initialTimeout = setTimeout(() => {
      pingBackend();
    }, 30000);

    // Ping every 10 minutes (600,000 ms)
    const interval = setInterval(() => {
      pingBackend();
    }, 600000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  const pingBackend = async () => {
    try {
      await API.get('/api/rag/health');
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[Keep-Alive] ${timestamp} - Backend pinged successfully`);
    } catch (error) {
      // Silently fail - don't show errors to user
      console.debug('[Keep-Alive] Ping failed:', error.message);
    }
  };
};

export default useKeepAlive;
