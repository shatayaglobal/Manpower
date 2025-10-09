import { configureStore, combineReducers, Middleware } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./authSlice";
import postsReducer from "./postSlice";
import applicationsReducer from "./applicationsSlice";
import profileReducer from "./profileSlice";
import businessReducer from "./businessSlice";
import messagingReducer from "./messagingSlice";
import websocketMiddleware from "./websocketMiddleware";
import { setupInterceptors } from "./axios";
import workforceReducer from './workforceSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  applications: applicationsReducer,
  profile: profileReducer,
  business: businessReducer,
  messaging: messagingReducer,
  workforce: workforceReducer,
});

const persistConfig = {
  key: "root",
  storage,
  version: 1,
  whitelist: ["auth"],
};

const persistedRootReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedRootReducer,
  middleware: (getDefaultMiddleware) => {
    const middlewares = getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'messaging/setSocket'],
        ignoredPaths: ['messaging.socket'],
      },
    });
    return middlewares.concat(websocketMiddleware as Middleware);
  },
  devTools: process.env.NODE_ENV !== "production",
});

setupInterceptors(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
