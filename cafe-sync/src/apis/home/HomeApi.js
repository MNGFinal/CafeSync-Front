import { setCredentials, logout } from "../../redux/authSlice";
import store from "../../redux/store";
import { fetchWithAuth } from "./fetchWithAuth"; // ✅ fetchWithAuth 추가

export const loginUser = async (form) => {
  try {
    const response = await fetch("http://localhost:8080/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🚨 로그인 실패 응답:", errorText);
      throw new Error("일치하는 정보가 없습니다!");
    }

    const data = await response.json();
    console.log("✅ 로그인 성공 (백엔드 응답 데이터):", data);

    // ✅ authority 변환 적용
    if (typeof data.authority === "undefined") {
      console.error("🚨 authority 값이 없습니다! 백엔드 응답을 확인하세요.");
    }

    const authority =
      data.authority === 1
        ? "ADMIN"
        : data.authority === 2
        ? "USER"
        : "UNKNOWN"; // ✅ 변환 로직 확인

    console.log("🔄 변환된 authority:", authority);

    const userData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        authority: authority,
        jobCode: data.jobCode,
      },
    };

    // ✅ Redux 상태 업데이트
    store.dispatch(setCredentials(userData));

    // ✅ 세션 스토리지 저장
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("user", JSON.stringify(userData.user));

    console.log("✅ 세션 스토리지 저장 완료:", {
      accessToken: sessionStorage.getItem("accessToken"),
      refreshToken: sessionStorage.getItem("refreshToken"),
      user: sessionStorage.getItem("user"),
    });

    // ✅ 로그인 후 자동으로 사용자 정보 가져오기 (토큰 검증)
    const userInfoResponse = await fetchWithAuth(
      "http://localhost:8080/api/user-info"
    );

    if (!userInfoResponse.ok) {
      console.error("🚨 사용자 정보 가져오기 실패!");
      throw new Error("사용자 정보를 불러올 수 없습니다.");
    }

    const userInfo = await userInfoResponse.json();
    console.log("👤 가져온 사용자 정보:", userInfo);

    return userData.user; // ✅ 변환된 사용자 정보 반환
  } catch (error) {
    console.error("🚨 로그인 요청 중 오류 발생:", error.message);
    throw error;
  }
};
