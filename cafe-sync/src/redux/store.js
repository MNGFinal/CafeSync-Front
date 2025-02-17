// src/redux/store.js

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // ✅ authSlice 불러오기
import noteReducer from "../modules/NoteModule";

// ✅ 세션 스토리지에서 초기 상태 불러오기
const preloadedState = {
  auth: {
    accessToken: sessionStorage.getItem("accessToken") || null,
    refreshToken: sessionStorage.getItem("refreshToken") || null,
    user: sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : null,
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer, // ✅ auth 상태 추가
    noteReducer : noteReducer, // ✅ noteReducer 추가
  },
  preloadedState, // ✅ 세션 스토리지에서 Redux 상태 복원
});

export default store;
