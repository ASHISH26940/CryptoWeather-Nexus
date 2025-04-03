"use client";
import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../lib/hooks";
import { fetchWeather, fetchCrypto, fetchNews } from "../lib/features/preferences/preferencesSlice";
import type { NewsArticle, NewsAPIResponse, NewsData } from "../lib/features/preferences/preferencesSlice"
export default function Home() {
  const dispatch = useAppDispatch();
  const { weather, crypto, news, loading, error } = useAppSelector((state) => state.preferences);
  console.log("weather in page", weather);

  useEffect(() => {
    dispatch(fetchWeather());
    dispatch(fetchCrypto());
    dispatch(fetchNews());
  }, [dispatch]);

  return (
    <main className="p-4 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Weather Section */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Weather</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : weather ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {weather.map((cityWeather, idx) => (
              <div key={idx} className="border p-4 rounded">
                <div key={idx} className="border p-4 rounded">
                  <h3 className="font-medium">{cityWeather.name || cityWeather.message || "Location"}</h3>
                  <div className="mt-2">
                    {/* Access temperature from the correct path */}
                    <p className="text-2xl">{cityWeather.main?.temp}°C</p>
                    {/* Weather is an array, access the first item's description */}
                    <p>{cityWeather.weather?.[0]?.description || "No description"}</p>
                    <div className="mt-2 text-sm">
                      <p>Feels like: {cityWeather.main?.feels_like}°C</p>
                      <p>Humidity: {cityWeather.main?.humidity}%</p>
                      <p>Wind: {cityWeather.wind?.speed || 0} m/s</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No weather data available</p>
        )}
      </section>

      {/* Crypto Section */}
      <section className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Cryptocurrency</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : crypto && crypto.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {crypto.map((coin) => (
              <div key={coin.id} className="border p-4 rounded">
                <strong className="font-medium">{coin.name}</strong>
                <p className="text-xl mt-1">${parseFloat(coin.priceUsd).toFixed(2)}</p>
                <p className={parseFloat(coin.changePercent24Hr) >= 0 ? "text-green-600" : "text-red-600"}>
                  {parseFloat(coin.changePercent24Hr) >= 0 ? "▲" : "▼"} {Math.abs(parseFloat(coin.changePercent24Hr)).toFixed(2)}%
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No cryptocurrency data available</p>
        )}
      </section>

      {/* News Section */}
      <section className="bg-white p-4 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">News</h2>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : news && news.length > 0 ? (
          <div className="space-y-4">
            {news.map((article, idx: number) => (
              <div key={idx} className="border-b pb-3">
                <a
                  href={article.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline font-medium"
                >
                  {article.title}
                </a>
                {article.description && (
                  <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                )}
                {article.image_url && (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="mt-2 rounded max-h-40 object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No news data available</p>
        )}
      </section>
    </main>
  );
}