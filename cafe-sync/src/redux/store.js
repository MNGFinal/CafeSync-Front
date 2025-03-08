import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import chatReducer from "./chatSlice";
import noteReducer from "../modules/NoteModule";
import noticeReducer from "../modules/NoticeModule";

const preloadedState = {
  auth: {
    accessToken: sessionStorage.getItem("accessToken") || null,
    refreshToken: sessionStorage.getItem("refreshToken") || null,
    user: sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : null,
    expireTime: sessionStorage.getItem("expireTime")
      ? parseInt(sessionStorage.getItem("expireTime"), 10)
      : 0, // 🔥 expireTime 추가
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    noteReducer: noteReducer, // ✅ 변수명 통일
    noticeReducer: noticeReducer, // ✅ 변수명 통일
  },
  preloadedState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
