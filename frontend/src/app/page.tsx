"use client";
import { useState, useEffect, useRef } from "react";

import { Bell, CloudSun, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast, ToastPosition } from "react-hot-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { fetchWeather, fetchCrypto, fetchNews } from "../lib/features/preferences/preferencesSlice";
import type {
  NewsArticle,
  WeatherData,
  CryptoCurrency
} from "../lib/features/preferences/preferencesSlice";

// Enhanced Notification type with severity tracking
type NotificationSeverity = "low" | "moderate" | "high" | "extreme";

interface Notification {
  id: string;
  type: "price_alert" | "weather_alert" | "news_alert";
  message: string;
  severity: NotificationSeverity;
  timestamp: Date;
  read: boolean;
  icon?: string;
  relatedData?: WeatherData | CryptoCurrency | NewsArticle;
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { weather, crypto, news, loading, error } = useAppSelector((state) => state.preferences);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [active, setActive] = useState<string>("dashboard");
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState("all");
  
  // Properly typed refs for data comparison
  const prevWeather = useRef<WeatherData[] | null>(null);
  const prevCryptoPrices = useRef<Record<string, number>>({});
  const prevNewsIds = useRef<Set<string>>(new Set());

  


  // Fetch data initially when component mounts
  useEffect(() => {
    fetchAllData();
    // Set up interval for periodic data fetching - every 30 seconds
    const intervalId = setInterval(() => {
      fetchAllData();
    }, 21600000); // 6 hrs

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  // Function to fetch all data
  const fetchAllData = () => {
    dispatch(fetchWeather());
    dispatch(fetchCrypto());
    dispatch(fetchNews());
  };
  const scrollToSection = (id: string) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  // Weather monitoring with improved change detection
  useEffect(() => {
    if (weather && weather.length > 0) {
      if (prevWeather.current && prevWeather.current.length > 0) {
        weather.forEach((cityWeather, index) => {
          const prevCityWeather = prevWeather.current?.[index];
          if (prevCityWeather && prevCityWeather.main && cityWeather.main) {
            const tempChange = cityWeather.main.temp - prevCityWeather.main.temp;
            
            // Only notify if there's an actual change and it's significant
            if (Math.abs(tempChange) > 0.5) {
              const severity = isSignificantWeatherChange(tempChange) ? "high" : "moderate";
              
              createNotification({
                type: "weather_alert",
                severity,
                message: `Temperature in ${cityWeather.name} changed by ${tempChange.toFixed(1)}°C`,
                icon: getWeatherIcon(cityWeather.weather[0]?.main),
                relatedData: cityWeather
              });
            }
          }
        });
      }
    }
    // Update previous weather data for next comparison
    prevWeather.current = JSON.parse(JSON.stringify(weather));
  }, [weather]);

  // Enhanced crypto monitoring with price change detection
  useEffect(() => {
    if (crypto && crypto.length > 0) {
      crypto.forEach((coin) => {
        const currentPrice = parseFloat(coin.priceUsd);
        const prevPrice = prevCryptoPrices.current[coin.id];
        
        // Only check if we have a previous price to compare against
        if (prevPrice !== undefined) {
          const change = ((currentPrice - prevPrice) / prevPrice) * 100;
          
          // Only notify if the change is significant
          if (isSignificantPriceChange(change)) {
            const severity = Math.abs(change) >= 5 ? "high" : "moderate";
            
            createNotification({
              type: "price_alert",
              severity,
              message: `${coin.symbol} ${change > 0 ? "▲" : "▼"} ${Math.abs(change).toFixed(2)}%`,
              icon: change > 0 ? "📈" : "📉",
              relatedData: coin
            });
          }
        }
        
        // Always update the previous price
        prevCryptoPrices.current[coin.id] = currentPrice;
      });
    }
  }, [crypto]);

  // Enhanced news monitoring
  useEffect(() => {
    if (news && news.length > 0) {
      // Look for new articles that we haven't seen before
      news.forEach((article) => {
        if (article.article_id && !prevNewsIds.current.has(article.article_id)) {
          createNotification({
            type: "news_alert",
            severity: "moderate",
            message: `New article: ${article.title}`,
            icon: "📰",
            relatedData: article
          });
          
          // Add to our set of known article IDs
          prevNewsIds.current.add(article.article_id);
        }
      });
    }
  }, [news]);

  const createNotification = ({
    type,
    severity,
    message,
    icon = '',
    relatedData
  }: {
    type: Notification["type"];
    severity: NotificationSeverity;
    message: string;
    icon?: string;
    relatedData?: WeatherData | CryptoCurrency | NewsArticle;
  }) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      type,
      severity,
      message: `${icon} ${message}`,
      timestamp: new Date(),
      read: false,
      icon,
      relatedData
    };
    

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    const toastOptions = {
      duration: severity === "extreme" ? 10000 : severity === "high" ? 7000 : 5000,
      position: severity === "extreme" ? "top-center" : "top-right" as ToastPosition
    };

    toast(message, toastOptions);
  };

  const getWeatherIcon = (condition?: string): string => {
    const icons: Record<string, string> = {
      clear: "☀️",
      clouds: "☁️",
      rain: "🌧️",
      snow: "❄️",
      thunderstorm: "⛈️",
      atmosphere: "🌫️",
      extreme: "⚠️"
    };
    return condition ? icons[condition.toLowerCase()] || "🌡️" : "🌡️";
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  // Type-guard functions with improved thresholds
  const isSignificantWeatherChange = (tempChange: number): boolean => Math.abs(tempChange) > 3;
  const isSignificantPriceChange = (percentage: number): boolean => Math.abs(percentage) >= 1;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 border-r bg-white h-screen sticky top-0">
          {/* Logo */}
          <div className="flex items-center gap-2 p-4 border-b">
            <CloudSun className="h-6 w-6 text-blue-500" />
            <span className="font-bold text-lg">CryptoWeather</span>
          </div>
          
          {/* Nav Menu */}
          <nav className="flex-1 p-2">
      <ul className="space-y-1">
        <li onClick={() => scrollToSection("dashboard")}
          className={` cursor-pointer  rounded-md ${
            active === "dashboard" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-md"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            Dashboard
          </a>
        </li>
        
        <li
          onClick={() => scrollToSection("weather")}
          className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
            active === "weather" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
            <circle cx="12" cy="12" r="5" />
          </svg>
          Weather
        </li>

        <li onClick={() => scrollToSection("crypto")}>
          <a
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
              active === "crypto" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Crypto
          </a>
        </li>

        <li onClick={() => scrollToSection("news")}>
          <a
            href="#"
            className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${
              active === "news" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
              <path d="M18 14h-8" />
              <path d="M15 18h-5" />
              <path d="M10 6h8v4h-8V6Z" />
            </svg>
            News
          </a>
        </li>

        <li>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Settings
          </a>
        </li>
      </ul>
    </nav>
          
          {/* User Profile */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="font-medium text-blue-700">JD</span>
              </div>
              <div>
                <p className="font-medium">Ashish Gupta</p>
                <p className="text-xs text-gray-500">gupta.ashish2694@gmail.com</p>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {/* Header */}
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="flex items-center justify-between px-4 py-3">
              <button className="md:hidden p-2 rounded-md hover:bg-gray-100">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <div className="flex items-center gap-3 ml-auto">
                {/* Notifications */}
                <div className="relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="relative">
                        <Bell className="h-5 w-5 text-gray-600" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80">
                      <DropdownMenuLabel className="flex items-center justify-between">
                        <span>Notifications</span>
                        {unreadCount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllNotificationsAsRead}
                            className="h-auto text-xs py-1"
                          >
                            Mark all as read
                          </Button>
                        )}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">No notifications</div>
                      ) : (
                        <div className="max-h-80 overflow-auto">
                          {notifications.map((notification, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              className={`flex flex-col items-start p-3 ${notification.read ? "" : "bg-blue-50"}`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex w-full items-start gap-2">
                                <div
                                  className={`mt-0.5 h-2 w-2 rounded-full ${
                                    notification.severity === "high" || notification.severity === "extreme" 
                                      ? "bg-red-500" 
                                      : notification.type === "price_alert" 
                                        ? "bg-green-500" 
                                        : "bg-amber-500"
                                  }`}
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {notification.type === "price_alert" 
                                      ? "Price Alert" 
                                      : notification.type === "weather_alert" 
                                        ? "Weather Alert" 
                                        : "News Alert"}
                                  </p>
                                  <p className="text-sm text-gray-600">{notification.message}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {new Date(notification.timestamp).toLocaleTimeString()} -{" "}
                                    {new Date(notification.timestamp).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                      <span className="font-medium">Ashish Gupta</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
      <div className="bg-gray-50 min-h-screen">
        {/* Dashboard Content */}
        <div className="p-6 max-w-7xl mx-auto">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Dashboard</h1>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === "all" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab("favorites")}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      activeTab === "favorites" ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Favorites
                  </button>
                </div>
              </div>
            </div>
        {/* Weather Section */}
        <section  className="mb-8">
          <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Weather</h2>
                  <Button variant="outline" size="sm" className="text-sm">
                    View All
                  </Button>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex items-center">
                  <div className="h-16 w-16 bg-gray-200 rounded-full mr-4"></div>
                  <div>
                    <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <div>
                    <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 w-12 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-8 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : weather && weather.length > 0 ? (
            
            <div id="weather" >
              <div  className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {weather.map((cityWeather, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      
                      <div className="flex justify-between items-center px-4 pt-4 pb-2">
                        <h3 className="font-semibold text-gray-900">
                          {cityWeather.name || cityWeather.message || "Location"}
                        </h3>
                        <button className="text-gray-400 hover:text-amber-500 p-1">
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="flex items-center">
                          {cityWeather.weather?.[0]?.icon && (
                            <div className="mr-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                               <img
                                 src={`https://openweathermap.org/img/wn/${cityWeather.weather[0].icon}@2x.png`}
                                 alt={cityWeather.weather[0].description || "Weather icon"}
                                 width={64}
                                height={64}
                                 className="h-16 w-16"
                               />
                            </div>
                          )}
                          <div>
                            <p className="text-3xl font-bold text-gray-900">{cityWeather.main?.temp}°C</p>
                            <p className="capitalize text-gray-500">
                              {cityWeather.weather?.[0]?.description || "No description"}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-sm border-t pt-3">
                          <div>
                            <p className="text-gray-500">Feels like</p>
                            <p className="font-medium">{cityWeather.main?.feels_like}°C</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Humidity</p>
                            <p className="font-medium">{cityWeather.main?.humidity}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Wind</p>
                            <p className="font-medium">{cityWeather.wind?.speed || 0} m/s</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <p className="text-gray-500">No weather data available</p>
            </div>
          )}
        </section>
    
        {/* Crypto Section */}
        <section className="mb-8" id="crypto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Cryptocurrency</h2>
                <Button variant="outline" size="sm" className="text-sm">
                  View All
                </Button>
              </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex justify-between mb-4">
                  <div>
                    <div className="h-6 w-24 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="flex justify-between items-baseline mb-4">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                  <div className="h-5 w-16 bg-gray-200 rounded"></div>
                </div>
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-1"></div>
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : crypto && crypto.length > 0 ? (
          <div >
              <div  className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {crypto.map((coin) => (
                    <div key={coin.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="flex justify-between items-start px-4 pt-4 pb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{coin.name}</h3>
                          <p className="text-sm text-gray-500">{coin.symbol}</p>
                        </div>
                        <button className="text-gray-400 hover:text-amber-500 p-1">
                          <Star className="h-5 w-5" />
                        </button>
                      </div>
                      <div className="px-4 pb-4">
                        <div className="flex items-baseline justify-between mb-4">
                          <p className="text-2xl font-bold text-gray-900">${Number.parseFloat(coin.priceUsd).toFixed(2)}</p>
                          <p
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              Number.parseFloat(coin.changePercent24Hr) >= 0 
                                ? "bg-green-100 text-green-800"    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {Number.parseFloat(coin.changePercent24Hr) >= 0 ? "▲" : "▼"}{" "}
                            {Math.abs(Number.parseFloat(coin.changePercent24Hr)).toFixed(2)}%
                          </p>
                          </div>
                          
                          

                          <div>
                          <p className="text-sm text-gray-500">Market Cap</p>
                          <p className="font-medium">
                            ${(Number.parseFloat(coin.marketCapUsd) / 1e9).toFixed(2)}B
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
          </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <p className="text-gray-500">No cryptocurrency data available</p>
            </div>
          )}
        </section>

        {/* News Section */}
        <section >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Latest News</h2>
            <Button variant="outline" size="sm" className="text-sm">
              View All
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 w-1/2 bg-gray-200 rounded mb-3"></div>
                      <div className="h-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <p className="text-red-500">{error}</p>
            </div>
          ) : news && news.length > 0 ? (
            <div  id="news" className="space-y-4">
              {news.map((article, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-4">
                  <div className="flex gap-4">
                    {article.image_url ? (
                      <div className="h-20 w-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        <img
                                src={article.image_url || "/placeholder.svg"}
                                alt={article.title}
                                className="w-full h-32 object-cover rounded-lg relative"
                              />
                      </div>
                    ) : (
                      <div className="h-20 w-20 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <svg className="h-8," xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-1">{article.title}</h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">{article.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
              <p className="text-gray-500">No news available</p>
            </div>
          )}
        </section>
      </div>
    </div>
  </main>
</div>
</div>
 );
}