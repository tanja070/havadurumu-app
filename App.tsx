import React, { useState, useEffect, useRef } from 'react';
import { Background } from './components/Background';
import { WeatherHouse } from './components/WeatherHouse';
import { ForecastItem } from './components/ForecastItem';
import { WeeklyItem } from './components/WeeklyItem';
import { IconMap } from './components/IconMap'; // Import IconMap for the list view
import { fetchWeather } from './services/geminiService';
import { WeatherData, TabView } from './types';
import { MapPin, List, Plus, Search, Loader2, X, Trash2 } from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [savedCities, setSavedCities] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.HOURLY);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showList, setShowList] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial load - Try Geolocation first
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          loadWeather(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.warn("Geolocation failed or denied on startup:", error);
          loadWeather("Istanbul"); // Fallback for Turkish context
        }
      );
    } else {
      loadWeather("Istanbul");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showSearch]);

  const loadWeather = async (location: string) => {
    setLoading(true);
    setShowSearch(false);
    setShowList(false); // Close list if open
    try {
      const data = await fetchWeather(location);
      setWeather(data);
      
      // Update saved cities list
      setSavedCities(prev => {
        const existingIndex = prev.findIndex(c => c.city.toLowerCase() === data.city.toLowerCase());
        if (existingIndex >= 0) {
          const newCities = [...prev];
          newCities[existingIndex] = data; // Update existing with fresh data
          return newCities;
        }
        return [data, ...prev]; // Add to top
      });

    } catch (err) {
      console.error("Weather load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteCity = (e: React.MouseEvent, cityName: string) => {
    e.stopPropagation();
    setSavedCities(prev => prev.filter(c => c.city !== cityName));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      loadWeather(searchQuery);
      setSearchQuery(""); // Clear input after search
    }
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setShowList(false);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          loadWeather(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error(error);
          setLoading(false);
        }
      );
    }
  };

  const toggleList = () => {
    setShowSearch(false);
    setShowList(!showList);
  };

  const toggleSearch = () => {
    setShowList(false);
    setShowSearch(!showSearch);
  };

  return (
    <div className="relative h-[100dvh] w-full flex flex-col font-sans text-white select-none overflow-hidden">
      <Background />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col p-4 pb-6 max-w-md mx-auto w-full h-full justify-between">
        
        {/* Header */}
        <header className="flex flex-col items-center mt-4 space-y-1 flex-shrink-0 transition-opacity duration-300">
          {loading ? (
             <div className="h-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
             </div>
          ) : (
            <>
              <h2 className="text-3xl font-semibold tracking-wide">{weather?.city || "Unknown"}</h2>
              <div className="text-[5rem] font-light leading-none tracking-tight my-2">
                {weather?.temp ?? "--"}°
              </div>
              <p className="text-lg text-purple-200 font-medium">{weather?.condition || "Loading..."}</p>
              <div className="flex gap-3 text-sm font-medium text-white/80">
                <span>H:{weather?.high ?? "-"}°</span>
                <span>L:{weather?.low ?? "-"}°</span>
              </div>
            </>
          )}
        </header>

        {/* 3D House Visual - Flexible Container */}
        <div className="flex-1 min-h-0 flex items-center justify-center py-2">
          <WeatherHouse />
        </div>

        {/* Bottom Sheet / Panel */}
        <div className="relative bg-gradient-to-br from-[#452c77]/80 to-[#271b4d]/90 backdrop-blur-xl rounded-[2.5rem] border border-white/10 p-6 pb-24 shadow-2xl overflow-hidden flex-shrink-0">
          
          {/* Tabs */}
          <div className="flex justify-between items-center mb-6 px-2">
            <button 
              onClick={() => setActiveTab(TabView.HOURLY)}
              className={`text-sm font-medium transition-colors duration-200 ${activeTab === TabView.HOURLY ? 'text-white border-b-2 border-pink-400 pb-1' : 'text-white/40'}`}
            >
              Hourly Forecast
            </button>
            <button 
              onClick={() => setActiveTab(TabView.WEEKLY)}
              className={`text-sm font-medium transition-colors duration-200 ${activeTab === TabView.WEEKLY ? 'text-white border-b-2 border-pink-400 pb-1' : 'text-white/40'}`}
            >
              Weekly Forecast
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[160px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                 <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : (
              <>
                {activeTab === TabView.HOURLY ? (
                  <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
                    {weather?.hourly?.map((item, index) => (
                      <ForecastItem 
                        key={index}
                        time={item.time}
                        temp={item.temp}
                        icon={item.icon}
                        isActive={item.isNow}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto hide-scrollbar">
                    {weather?.weekly?.map((item, index) => (
                       <WeeklyItem
                         key={index}
                         day={item.day}
                         high={item.high}
                         low={item.low}
                         icon={item.icon}
                       />
                    ))}
                  </div>
                )}
                
                {/* Sources Footer Removed */}
              </>
            )}
          </div>

          {/* Search Overlay - Animated */}
          <div 
            className={`absolute inset-0 bg-[#2d1b54] p-6 z-20 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
              showSearch 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Find City</h3>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input 
                ref={inputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter city name..."
                className="w-full bg-white/10 border border-white/20 rounded-full px-5 py-3 text-white placeholder-white/40 focus:outline-none focus:border-pink-400"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-pink-500 rounded-full">
                <Search className="w-4 h-4 text-white" />
              </button>
            </form>
            <button 
              onClick={() => setShowSearch(false)}
              className="mt-4 text-sm text-white/50 hover:text-white"
            >
              Cancel
            </button>
          </div>

          {/* List Overlay - Animated */}
          <div 
            className={`absolute inset-0 bg-[#2d1b54] z-20 flex flex-col transition-all duration-500 ease-in-out ${
              showList
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between p-6 pb-2">
              <h3 className="text-xl font-bold">Saved Cities</h3>
              <button onClick={() => setShowList(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 hide-scrollbar">
              {savedCities.length === 0 ? (
                <div className="text-center text-white/40 mt-10">
                  <p>No cities saved yet.</p>
                  <p className="text-sm mt-2">Search for a city to add it here.</p>
                </div>
              ) : (
                savedCities.map((cityData, idx) => (
                  <div 
                    key={`${cityData.city}-${idx}`}
                    onClick={() => loadWeather(cityData.city)}
                    className="flex items-center justify-between bg-white/10 p-4 rounded-2xl border border-white/5 active:scale-95 transition-transform cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-lg">{cityData.city}</span>
                      <span className="text-xs text-white/60">{cityData.condition}</span>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-light">{cityData.temp}°</span>
                      <IconMap iconName={cityData.hourly[0]?.icon || 'sun'} className="w-8 h-8" />
                      <button 
                        onClick={(e) => deleteCity(e, cityData.city)}
                        className="p-2 hover:bg-red-500/20 rounded-full group transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-white/30 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bottom Navigation Bar */}
          <div className="absolute bottom-6 left-0 right-0 flex justify-between items-center px-10 z-30 pointer-events-auto">
            <button 
              onClick={handleGeoLocation}
              className="p-2 text-white/70 hover:text-white transition-colors"
              title="Locate Me"
            >
              <MapPin className="w-6 h-6" />
            </button>
            
            <div className="relative -top-6">
              <button 
                onClick={toggleSearch}
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-transform active:scale-95"
              >
                <Plus className="w-8 h-8 text-[#241042]" strokeWidth={3} />
              </button>
            </div>

            <button 
              onClick={toggleList}
              className={`p-2 transition-colors ${showList ? 'text-pink-400' : 'text-white/70 hover:text-white'}`}
            >
              <List className="w-6 h-6" />
            </button>
          </div>
          
        </div>
      </main>
    </div>
  );
}