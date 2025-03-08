import { setCredentials } from "../../redux/authSlice";
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
      throw new Error("일치하는 정보가 없습니다");
    }

    const data = await response.json();
    console.log("✅ 로그인 성공 (백엔드 응답 데이터):", data);

    // ✅ 1) expiresIn을 가져와 만료 시각 계산
    const expiresIn = data.expiresIn || 0;
    const expireTime = Date.now() + expiresIn;
    console.log("⏰ expireTime:", expireTime);

    // ✅ 2) authority 변환
    const authorityMap = { 1: "ADMIN", 2: "USER" };
    const authority = authorityMap[data.user.authority] || "UNKNOWN";

    // ✅ 3) userData 구성
    const userData = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      expireTime, // 🔥 만료 시각 추가
      user: {
        userId: data.user.userId,
        authority,
        jobCode: data.user?.job?.jobCode || 0,
        job: data.user?.job || { jobCode: 0, jobName: "직급 없음" },
        employee: data.user?.employee || null,
        franchise: data.user?.franchise || null,
      },
    };

    // ✅ 4) Redux에 저장
    store.dispatch(setCredentials(userData));

    // ✅ 5) 세션 스토리지에 저장
    sessionStorage.setItem("accessToken", data.accessToken);
    sessionStorage.setItem("refreshToken", data.refreshToken);
    sessionStorage.setItem("expireTime", expireTime); // 🔥 추가
    sessionStorage.setItem("user", JSON.stringify(userData.user));

    // ✅ 사용자 정보 가져오기 (fetchWithAuth)
    const userInfoResponse = await fetchWithAuth(
      "http://localhost:8080/api/user-info"
    );
    // ...

    return userData.user;
  } catch (error) {
    console.error("🚨 로그인 요청 중 오류 발생:", error.message);
    throw error;
  }
};
