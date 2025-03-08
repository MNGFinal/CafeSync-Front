import { setCredentials, logout } from "../../redux/authSlice";
import store from "../../redux/store";

// 🔹 보호된 API 요청 함수 (JWT 포함 + 자동 갱신 기능)
export const fetchWithAuth = async (url, options = {}) => {
  let { accessToken, refreshToken } = store.getState().auth;
  console.log("🛠 Redux에서 가져온 토큰:", { accessToken, refreshToken });

  try {
    let headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`, // ✅ JWT Access Token 포함
      "Content-Type": "application/json",
    };

    console.log("🛠 요청 헤더:", headers);

    let response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`📡 요청 URL: ${url}`);
    console.log("🔍 초기 응답 상태:", response.status);

    // ✅ Access Token 만료 시 Refresh Token을 이용한 재발급 요청
    if (response.status === 401) {
      console.warn("🔄 Access Token 만료됨, 자동 갱신 요청");

      const refreshResponse = await fetch(
        "http://localhost:8080/api/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (refreshResponse.ok) {
        const newTokenData = await refreshResponse.json();
        console.log("✅ Access Token 갱신 완료:", newTokenData);

        // ✅ Redux에 새로운 Access Token 저장
        store.dispatch(
          setCredentials({
            accessToken: newTokenData.accessToken,
            refreshToken, // ✅ 기존 Refresh Token 유지
            user: store.getState().auth.user, // ✅ 기존 사용자 정보 유지
          })
        );

        // ✅ 새로운 토큰을 sessionStorage에 저장
        sessionStorage.setItem("accessToken", newTokenData.accessToken);

        // ✅ 갱신된 토큰으로 다시 요청 실행
        headers.Authorization = `Bearer ${newTokenData.accessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } else {
        console.error("🚨 Refresh Token도 만료됨, 다시 로그인 필요");
        store.dispatch(logout()); // ✅ Redux 상태 초기화 (로그아웃 처리)
        sessionStorage.clear(); // ✅ 세션 스토리지 초기화
        throw new Error("토큰 갱신 실패, 다시 로그인하세요.");
      }
    }

    return response;
  } catch (error) {
    console.error("🚨 요청 중 오류 발생:", error);
    throw error;
  }
};
