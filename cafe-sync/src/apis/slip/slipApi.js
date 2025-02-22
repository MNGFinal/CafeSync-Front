export async function getFranSlipList(franCode, startDate, endDate) {
  if (!franCode || !startDate || !endDate) {
    console.error("❌ 필요한 데이터가 없습니다!");
    return [];
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl = `http://localhost:8080/api/fran/slip/${franCode}?startDate=${startDate}&endDate=${endDate}`;

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 🔹 403 (Forbidden)이면 Access Token이 만료된 경우이므로 Refresh Token을 사용하여 재발급
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "http://localhost:8080/api/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }), // ✅ Refresh Token 전달
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("❌ Refresh Token 갱신 실패! 다시 로그인해야 합니다.");
      }

      const newTokenData = await refreshResponse.json();
      const newAccessToken = newTokenData.accessToken;

      sessionStorage.setItem("accessToken", newAccessToken); // ✅ 새 Access Token 저장

      // ✅ 새 Access Token으로 다시 요청
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${newAccessToken}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ [프론트] 조회된 전표 데이터:", data);
    return data;
  } catch (error) {
    console.error("❌ 전표 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
}
