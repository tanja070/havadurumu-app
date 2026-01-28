import React, { useState, useEffect, useRef } from 'react';
import { Background } from './components/Background';
import { WeatherHouse } from './components/WeatherHouse';
import { ForecastItem } from './components/ForecastItem';
import { WeeklyItem } from './components/WeeklyItem';
import { IconMap } from './components/IconMap';
import { fetchWeather } from './services/geminiService';
import { WeatherData, TabView } from './types';
import { MapPin, List, Plus, Search, Loader2, X, Trash2, AlertCircle, Wifi } from 'lucide-react';

export default function App() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [savedCities, setSavedCities] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabView>(TabView.HOURLY);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [showList, setShowList] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Başlangıç - Konum izni iste
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          loadWeather(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.warn("Konum alınamadı:", error);
          loadWeather("Istanbul"); // Varsayılan
        }
      );
    } else {
      loadWeather("Istanbul");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Arama açılınca inputa odaklan
  useEffect(() => {
    if (showSearch && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [showSearch]);

  const loadWeather = async (location: string) => {
    setLoading(true);
    setError(null);
    setShowSearch(false);
    setShowList(false);
    try {
      const data = await fetchWeather(location);
      setWeather(data);
      
      // Kayıtlı şehirleri güncelle
      setSavedCities(prev => {
        const existingIndex = prev.findIndex(c => c.city.toLowerCase() === data.city.toLowerCase());
        if (existingIndex >= 0) {
          const newCities = [...prev];
          newCities[existingIndex] = data;
          return newCities;
        }
        return [data, ...prev];
      });

    } catch (err: any) {
      console.error("Hava durumu yüklenemedi:", err);
      setError(err.message || "Veri alınamadı");
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
      setSearchQuery("");
    }
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      setShowList(false);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          loadWeather(`${latitude}, ${longitude}`);
        },
        (error) => {
          console.error(error);
          setLoading(false);
          setError("Konum erişimi reddedildi.");
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

      <main className="relative z-10 flex-1 flex flex-col p-4 pb-6 max-w-md mx-auto w-full h-full justify-between">
        
        {/* Header */}
        <header className="flex flex-col items-center mt-4 space-y-1 flex-shrink-0 transition-opacity duration-300">
          {loading ? (
             <div className="h-20 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-300" />
             </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-4 bg-red-500/20 rounded-2xl border border-red-500/30 backdrop-blur-sm animate-pulse-slow">
              <AlertCircle className="w-8 h-8 text-red-200 mb-2" />
              <p className="text-center text-red-100 text-sm font-medium">{error}</p>
              <button 
                onClick={() => loadWeather("Istanbul")}
                className="mt-3 px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded-full text-xs font-semibold transition-colors"
              >
                Varsayılanı Dene
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-semibold tracking-wide">{weather?.city || "Bilinmiyor"}</h2>
                {weather && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-green-500/20 text-green-300 px-2 py-0.5 rounded-full border border-green-500/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                    <Wifi className="w-3 h-3" /> CANLI
                  </span>
                )}
              </div>
              <div className="text-[5rem] font-light leading-none tracking-tight my-2">
                {weather?.temp ?? "--"}°
              </div>
              <p className="text-lg text-purple-200 font-medium">{weather?.condition || "Yükleniyor..."}</p>
              <div className="flex gap-3 text-sm font-medium text-white/80">
                <span>Y:{weather?.high ?? "-"}°</span>
                <span>D:{weather?.low ?? "-"}°</span>
              </div>
            </>
          )}
        </header>

        {/* 3D House Visual */}
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
              Saatlik
            </button>
            <button 
              onClick={() => setActiveTab(TabView.WEEKLY)}
              className={`text-sm font-medium transition-colors duration-200 ${activeTab === TabView.WEEKLY ? 'text-white border-b-2 border-pink-400 pb-1' : 'text-white/40'}`}
            >
              Haftalık
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[160px]">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                 <Loader2 className="w-6 h-6 animate-spin text-white/30" />
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-32 text-white/30 text-sm">
                Veri yok
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
              </>
            )}
          </div>

          {/* Search Overlay */}
          <div 
            className={`absolute inset-0 bg-[#2d1b54] p-6 z-20 flex flex-col items-center justify-center transition-all duration-500 ease-in-out ${
              showSearch 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Şehir Ara</h3>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input 
                ref={inputRef}
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Şehir adı girin..."
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
              İptal
            </button>
          </div>

          {/* List Overlay */}
          <div 
            className={`absolute inset-0 bg-[#2d1b54] z-20 flex flex-col transition-all duration-500 ease-in-out ${
              showList
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between p-6 pb-2">
              <h3 className="text-xl font-bold">Kaydedilenler</h3>
              <button onClick={() => setShowList(false)} className="p-2 bg-white/10 rounded-full hover:bg-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-3 hide-scrollbar">
              {savedCities.length === 0 ? (
                <div className="text-center text-white/40 mt-10">
                  <p>Henüz şehir kaydedilmedi.</p>
                  <p className="text-sm mt-2">Eklemek için arama yapın.</p>
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
              title="Konumum"
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