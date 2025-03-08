import { createSlice } from "@reduxjs/toolkit";

// 세션에서 사용자 정보 안전하게 가져오는 함수
const getSessionUser = () => {
  try {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    return null;
  }
};

// 세션에서 만료 시각(expireTime)을 안전하게 가져오는 함수
const getSessionExpireTime = () => {
  const stored = sessionStorage.getItem("expireTime");
  return stored ? parseInt(stored, 10) : 0;
};

const initialState = {
  accessToken: sessionStorage.getItem("accessToken") || "",
  refreshToken: sessionStorage.getItem("refreshToken") || "",
  user: getSessionUser(),
  expireTime: getSessionExpireTime(), // 토큰 만료 시각 (밀리초 단위)
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.expireTime = action.payload.expireTime; // 새 만료 시각 저장

      sessionStorage.setItem("accessToken", state.accessToken);
      sessionStorage.setItem("refreshToken", state.refreshToken);
      sessionStorage.setItem("expireTime", state.expireTime.toString());
      sessionStorage.setItem("user", JSON.stringify(state.user));
    },
    logout: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      state.user = null;
      state.expireTime = 0;

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("expireTime");
      sessionStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
