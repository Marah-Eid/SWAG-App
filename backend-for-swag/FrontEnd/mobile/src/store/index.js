import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import customerReducer from './slices/customerSlice';
import vendorReducer from './slices/vendorSlice';
import postsReducer from './slices/postsSlice';
import carsReducer from './slices/carsSlice';
import chatsReducer from './slices/chatsSlice';
import notificationsReducer from './slices/notificationsSlice';
import categoriesReducer from './slices/categoriesSlice';
import adminReducer from './slices/adminSlice';
import assistantReducer from './slices/assistantSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    customer: customerReducer,
    vendor: vendorReducer,
    posts: postsReducer,
    cars: carsReducer,
    chats: chatsReducer,
    notifications: notificationsReducer,
    categories: categoriesReducer,
    admin: adminReducer,
    assistant: assistantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'auth/login/fulfilled',
          'auth/register/fulfilled',
        ],
      },
    }),
});

export default store;
