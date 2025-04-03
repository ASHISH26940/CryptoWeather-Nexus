import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

// 🌍 Predefined data
const predefinedCities = ["New York", "London", "Tokyo"];
const predefinedCryptos = ["Bitcoin", "Ethereum", "Solana"];

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


// 🌤️ Fetch weather data
export const fetchWeather = createAsyncThunk("weather/fetch", async (_, { rejectWithValue }) => {
  try {
    const responses = await Promise.all(
      predefinedCities.map(async (city) => {
        const { data } = await axios.post(`http://localhost:3001/weather/location/lat_lon`, { 
            location:city
         });
         //console.log(data);
         
        return { city, ...data.weather };
      })
    );
    return responses;
  } catch (error) {
    return rejectWithValue("Failed to fetch weather data.");
  }
});

// 💰 Fetch cryptocurrency data
export const fetchCrypto = createAsyncThunk("crypto/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`http://localhost:3001/crypto/currencies`);
    //console.log(data);
    return data.data.filter((crypto: any) => predefinedCryptos.includes(crypto.name));
  } catch (error) {
    return rejectWithValue("Failed to fetch cryptocurrency data.");
  }
});

// 📰 Fetch news data
export const fetchNews = createAsyncThunk("news/fetch", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axios.get(`http://localhost:3001/news/current_news`);
    console.log(" slice side",data);
    const test=data.data.results;
    console.log("test",test);
    
    return test;
  } catch (error) {
    return rejectWithValue("Failed to fetch news data. in async thug");
  }
});

// 🗂️ Initial State
const initialState = {
    favoriteCities: [] as string[],
    favoriteCryptos: [] as string[],
    weather: [] as {
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
      }[],
    crypto: [] as {
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
    }[],
    news:[] as unknown as NewsArticle[],
    loading: false,
    error: null as string | null,
  };
  

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
