# 🚀 Next.js + Redux + TypeScript Crypto App

## 📌 Overview
This is a **Next.js** project that fetches cryptocurrency data from a backend API and manages state using **Redux Toolkit**. The project is fully typed with **TypeScript** and follows best practices for state management and API integration.

## 🛠️ Tech Stack
- **Next.js** (React Framework)
- **TypeScript** (Strictly typed for safety)
- **Redux Toolkit** (State management)
- **Axios** (API requests)
- **ESLint & Prettier** (Code quality)

## 📂 Folder Structure
```
📦 src
 ┣ 📂 components    # UI Components
 ┣ 📂 lib
 ┃ ┣ 📂 api         # API Calls
 ┃ ┣ 📂 features    # Redux Slices
 ┃ ┃ ┗ 📜 preferencesSlice.ts
 ┣ 📂 pages        # Next.js pages
 ┣ 📂 store        # Redux Store Setup
 ┣ 📜 types.ts     # TypeScript types
```

## 🚀 Getting Started
### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

### 2️⃣ **Install Dependencies**
```sh
npm install  # or yarn install
```


Copy
## Environment Setup

Create a `.env.local` file in your project root with the following variables:

```env
# Backend API Configuration
NEXT_PUBLIC_BACKEND_URI=https://crypto-backend-bjk7.onrender.com

# Weather API Configuration - Get from OpenWeatherMap
WEATHER_API=your_openweathermap_api_key_here

# Cryptocurrency API Configuration - Get from CoinCap
CRYPTO_API=your_coincap_api_key_here

# News API Configuration - Get from NewsData.io
NEWS_API=your_newsdata_api_key_here

### 4️⃣ **Run the Development Server**
```sh
npm run dev  # or yarn dev
```

## 📡 API Integration
The app fetches cryptocurrency data from the backend using `axios`:
```ts
import axios from "axios";
import { BACKEND_URI } from "@/config";

export const fetchCrypto = async () => {
  const { data } = await axios.get(`${BACKEND_URI}/crypto/currencies`);
  return data;
};
```

## 📌 Redux Store Example
The app uses **Redux Toolkit** for state management:
```ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URI } from "@/config";

export const fetchCrypto = createAsyncThunk("crypto/fetch", async () => {
  const { data } = await axios.get(`${BACKEND_URI}/crypto/currencies`);
  return data.data;
});

const cryptoSlice = createSlice({
  name: "crypto",
  initialState: { list: [], status: "idle" },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCrypto.fulfilled, (state, action) => {
      state.list = action.payload;
      state.status = "success";
    });
  },
});

export default cryptoSlice.reducer;
```

## ✅ Linting & Formatting
To check for linting errors:
```sh
npm run lint
```
To format code:
```sh
npm run format
```

## 🔥 Deployment
To build the app for production:
```sh
npm run build
```
To start the production server:
```sh
npm start
```

## 📜 License
This project is licensed under the **MIT License**.

---
Feel free to contribute and raise issues! 🚀

