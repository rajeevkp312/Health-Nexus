import { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info } from 'lucide-react';

export function NewsTicker() {
  const getStoredNews = () => {
    try {
      const stored = localStorage.getItem('healthnexus_ticker_news');
      // Only use items explicitly saved by Admin. Do not inject defaults.
      if (stored) {
        const parsed = JSON.parse(stored);
        // Filter out any legacy sample texts that may still be present in localStorage
        const legacySamples = new Set([
          'Important: New COVID-19 safety protocols in effect. Please wear masks in all hospital areas.',
          'HealthNexus introduces advanced robotic surgery facility - Now available for cardiac and orthopedic procedures.',
          'Emergency services temporarily relocated to Building B due to renovation work. Follow the signs for directions.',
          'Free health checkup camp scheduled for December 15-17, 2024. Register online or call our helpline.',
          'Pharmacy services extended to 24/7. Prescription delivery available within 5km radius.'
        ]);
        // Keep only admin-created items; for backward compatibility, items without createdBy also pass if not legacy samples
        const adminOnly = (parsed || [])
          .filter(it => !legacySamples.has(it.text))
          .filter(it => (it.createdBy ? it.createdBy === 'admin' : true));
        return adminOnly.map(item => ({
          ...item,
          icon: item.type === 'notice' ? AlertCircle : item.type === 'news' ? Info : Bell
        }));
      }
    } catch (error) {
      console.error('Error loading stored news:', error);
    }
    // If nothing is stored, show nothing (no defaults)
    return [];
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [newsItems, setNewsItems] = useState(getStoredNews);
  const [showFullNews, setShowFullNews] = useState(false);

  // Auto-scroll through news items
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === newsItems.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [newsItems.length]);

  // Listen for localStorage changes (when admin updates news)
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('Storage change detected, updating ticker...');
      const updatedNews = getStoredNews();
      console.log('Updated news:', updatedNews);
      setNewsItems(updatedNews);
      setCurrentIndex(0); // Reset to first item
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom events (from same tab)
    window.addEventListener('tickerNewsUpdated', handleStorageChange);

    // Also check for updates every 2 seconds as fallback
    const interval = setInterval(() => {
      const currentStored = localStorage.getItem('healthnexus_ticker_news');
      const currentItemsString = JSON.stringify(newsItems.map(({ icon, ...item }) => item));
      if (currentStored && currentStored !== currentItemsString) {
        console.log('Periodic check: News updated, refreshing ticker...');
        handleStorageChange();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tickerNewsUpdated', handleStorageChange);
      clearInterval(interval);
    };
  }, [newsItems]);

  // Function to update news from admin dashboard (will be connected to backend)
  const updateNewsFromAdmin = (newNewsItems) => {
    setNewsItems(newNewsItems);
    setCurrentIndex(0);
  };

  const currentNews = newsItems[currentIndex];
  const IconComponent = currentNews?.icon || Info;

  if (!newsItems.length) return null;

  return (
    <div className="relative bg-gradient-to-r from-red-600/60 via-red-500/60 to-red-600/60 text-white py-1.5 md:py-2 px-2 md:px-4 border-t-2 border-red-700/60 border-b-2 border-red-400/60 shadow-lg w-full">
      <div className="w-full px-2 md:px-4">
        <div className="flex items-center justify-center space-x-2 md:space-x-3">
          {/* News Icon */}
          <div className="flex-shrink-0">
            <div className="bg-white/20 rounded-full p-1 md:p-1.5">
              <IconComponent className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
          </div>

          {/* Scrolling News Content */}
          <div className="flex-1 overflow-hidden">
            <div className="text-center">
              <div className="relative">  
                <p 
                  className={`text-xs md:text-sm font-medium leading-relaxed cursor-pointer transition-colors news-ticker-text ${
                    currentNews.text.length > 60 ? 'animate-scroll' : ''
                  } ${showFullNews ? 'whitespace-normal' : 'whitespace-nowrap'}`}
                  onClick={() => setShowFullNews(!showFullNews)}
                  title="Click to expand/collapse full news"
                >
                  {currentNews.text}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Dots */}
          <div className="hidden lg:flex items-center space-x-1">
            {newsItems.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-white w-4' 
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* News Counter */}
          <div className="flex-shrink-0 text-xs bg-white/20 px-2 py-1 rounded">
            {currentIndex + 1}/{newsItems.length}
          </div>
        </div>
      </div>

      {/* Animated Border Effect */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
    </div>
  );
}

// CSS for animations (add to your global CSS or component styles)
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out;
  }
`;
