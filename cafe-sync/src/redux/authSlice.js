import { createSlice } from "@reduxjs/toolkit";

const getSessionUser = () => {
  try {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("🚨 세션 스토리지에서 사용자 정보 불러오기 실패:", error);
    return null;
  }
};

const initialState = {
  accessToken: sessionStorage.getItem("accessToken") || null,
  refreshToken: sessionStorage.getItem("refreshToken") || null,
  user: getSessionUser(), // ✅ 안전하게 가져오기
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      console.log("🔵 [setCredentials] 액션 실행됨:", action.payload);

      const authority =
        action.payload.user.authority === 1
          ? "ADMIN"
          : action.payload.user.authority === 2
          ? "USER"
          : "UNKNOWN";

      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = {
        ...action.payload.user,
        authority, // ✅ 변환된 authority 적용
      };

      console.log("✅ Redux 상태 저장됨:", state);

      // ✅ 세션 스토리지에도 저장
      sessionStorage.setItem("accessToken", action.payload.accessToken);
      sessionStorage.setItem("refreshToken", action.payload.refreshToken);
      sessionStorage.setItem("user", JSON.stringify(state.user));

      console.log("✅ 세션 스토리지 저장 완료:", {
        accessToken: sessionStorage.getItem("accessToken"),
        refreshToken: sessionStorage.getItem("refreshToken"),
        user: sessionStorage.getItem("user"),
      });
    },
    logout: (state) => {
      console.log("🚪 [logout] 액션 실행됨");
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;

      // ✅ 로그아웃 시 세션 스토리지에서도 삭제
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("user");

      console.log("✅ 세션 스토리지 삭제 완료");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
