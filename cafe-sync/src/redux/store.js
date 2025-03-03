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
  },
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    noteReducer: noteReducer,
    noticeReducer: noticeReducer,
  },
  preloadedState,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
