import { configureStore } from '@reduxjs/toolkit'
import preferencesReducer from './features/preferences/preferencesSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
        preferences: preferencesReducer,
    }
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']