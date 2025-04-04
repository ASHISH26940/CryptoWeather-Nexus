"use client";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 🌍 Predefined data
export type PredefinedCity = "New York" | "London" | "Tokyo";
export type PredefinedCrypto = "Bitcoin" | "Ethereum" | "Solana";
const predefinedCities: PredefinedCity[] = ["New York", "London", "Tokyo"];
const predefinedCryptos: PredefinedCrypto[] = ["Bitcoin", "Ethereum", "Solana"];

if(!process.env.NEXT_PUBLIC_BACKEND_URI){
  throw new Error("BACKEND_URI is not defined in .env file");
}
export const BACKEND_URI=process.env.NEXT_PUBLIC_BACKEND_URI;
console.log("backend uri",BACKEND_URI);


// News types
export type NewsArticle = {
  article_id: string;
  title: string;
  link: string;
  description?: string;
  pubDate: string;
  pubDateTZ?: string;
  category?: string[];
  country?: string[];
  creator?: string[];
  keywords?: string[] | null;
  language?: string;
  sentiment?: string;
  sentiment_stats?: string;
  image_url?: string;
  source_id: string;
  source_name: string;
  source_url?: string;
  source_icon?: string;
  source_priority?: number;
  duplicate?: boolean;
  video_url?: string | null;
  ai_org?: string;
  ai_region?: string;
  ai_tag?: string;
  content?: string;
};

export type NewsData = {
  nextPage: string;
  results: NewsArticle[];
  status: string;
  totalResults: number;
};

export type NewsAPIResponse = {
  message: string;
  data: NewsData;
};

// Weather types
export type WeatherData = {
  name: string;
  message?: string;
  coord: { lon: number; lat: number };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: { speed: number; deg: number };
};

// Crypto types
export type CryptoCurrency = {
  id: string;
  rank: string;
  symbol: string;
  name: string;
  supply: string;
  maxSupply: string | null;
  marketCapUsd: string;
  volumeUsd24Hr: string;
  priceUsd: string;
  changePercent24Hr: string;
  vwap24Hr: string;
  explorer: string;
};

// Thunk response types
// type FetchWeatherPayload = Array<{ city: PredefinedCity } & WeatherData>;
// type FetchCryptoPayload = CryptoCurrency[];
// type FetchNewsPayload = NewsArticle[];

// State type
export type PreferencesState = {
  favoriteCities: string[];
  favoriteCryptos: string[];
  weather: WeatherData[];
  crypto: CryptoCurrency[];
  news: NewsArticle[];
  loading: boolean;
  error: string | null;
};

// 🗂️ Initial State
const initialState: PreferencesState = {
  favoriteCities: [],
  favoriteCryptos: [],
  weather: [],
  crypto: [],
  news: [],
  loading: false,
  error: null,
};

// 🌤️ Fetch weather data
export const fetchWeather = createAsyncThunk("weather/fetch", async (_, { rejectWithValue }) => {
  try {
    console.log(BACKEND_URI);
    
    const responses = await Promise.all(
      predefinedCities.map(async (city) => {
        const { data } = await axios.post(`${BACKEND_URI}/weather/location/lat_lon`, { 
            location:city
         });
         //console.log(data);
         
        return { city, ...data.weather };
      })
    );
    console.log("weather data",responses);
    
    return responses;
  } catch (error) {
    console.log("error",error);
    
    return rejectWithValue("Failed to fetch weather data.");
  }
});
// type Crypto = {
//   id: string;
//   symbol: string;
//   name: string;
//   marketCapUsd: string;
//   priceUsd: string;
//   changePercent24Hr: string;
// };
// 💰 Fetch cryptocurrency data
export const fetchCrypto = createAsyncThunk("crypto/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${BACKEND_URI}/crypto/currencies`);
    console.log("crypto data : ",data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.data.filter((crypto:any) => predefinedCryptos.includes(crypto.name));
  } catch (error) {
    console.log("error",error);
    
    return rejectWithValue("Failed to fetch cryptocurrency data.");
  }
});

// 📰 Fetch news data
export const fetchNews = createAsyncThunk("news/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`${BACKEND_URI}/news/current_news`);
    console.log(" slice side",data);
    const test=data.data.results;
    console.log("test",test);
    
    return test;
  } catch (error) {
    console.log("error",error);
    
    return rejectWithValue("Failed to fetch news data. in async thug");
  }
});
  

// 🏗️ Create Slice
const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Weather
      .addCase(fetchWeather.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWeather.fulfilled, (state, action) => {
        state.loading = false;
        state.weather = action.payload;
      })
      .addCase(fetchWeather.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Crypto
      .addCase(fetchCrypto.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCrypto.fulfilled, (state, action) => {
        state.loading = false;
        state.crypto = action.payload;
      })
      .addCase(fetchCrypto.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // News
      .addCase(fetchNews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNews.fulfilled, (state, action) => {
        state.loading = false;
        state.news = action.payload;
      })
      .addCase(fetchNews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default preferencesSlice.reducer;