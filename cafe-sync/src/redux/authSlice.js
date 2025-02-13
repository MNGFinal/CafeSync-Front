import { createSlice } from "@reduxjs/toolkit";

// ✅ 세션에서 사용자 정보 안전하게 가져오는 함수
const getSessionUser = () => {
  try {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("🚨 세션 스토리지에서 사용자 정보 불러오기 실패:", error);
    return null;
  }
};

// ✅ 초기 상태 (백엔드 데이터를 받아오기 전까지는 `null`)
const initialState = {
  accessToken: sessionStorage.getItem("accessToken") || "",
  refreshToken: sessionStorage.getItem("refreshToken") || "",
  user: getSessionUser(), // ✅ 백엔드 데이터를 그대로 유지
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log("🔵 [setCredentials] 액션 실행됨:", action.payload);

      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user; // ✅ 백엔드에서 받은 데이터를 그대로 저장

      console.log("✅ Redux 상태 저장됨 (user):", state.user);

      sessionStorage.setItem("accessToken", state.accessToken);
      sessionStorage.setItem("refreshToken", state.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(state.user));

      console.log("✅ 세션 스토리지 저장 완료:", {
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        user: sessionStorage.getItem("user"),
      });
    },
    logout: (state) => {
      console.log("🚪 [logout] 액션 실행됨");

      state.accessToken = "";
      state.refreshToken = "";
      state.user = null; // ✅ 로그아웃 시 `null`로 초기화

      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");

      console.log("✅ 세션 스토리지에서 인증 정보 삭제 완료");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
