// ✅ 공급업체(거래처) 등록
export async function insertVendor(newVendorData) {
  try {
    const token = sessionStorage.getItem("accessToken"); // 액세스 토큰
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/vendor"; // 백엔드 POST 경로

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newVendorData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    // 서버에서 응답받은 JSON 파싱
    const result = await response.json();

    console.log("✅ 거래처 등록 성공:", result);
    return { success: true, message: "거래처 등록 성공!", data: result.data };
  } catch (error) {
    console.error("❌ 거래처 등록 중 오류 발생:", error);
    return {
      success: false,
      message: "거래처 등록 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// ✅ 공급업체(거래처) 업데이트
// ✅ 업체 정보 수정 API 요청
export async function updateVendor(updatedVendorData) {
  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/vendor/${updatedVendorData.venCode}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedVendorData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ 거래처 정보 수정 성공:", result);
    return {
      success: true,
      message: "거래처 정보 수정 성공!",
      data: result.data,
    };
  } catch (error) {
    console.error("❌ 거래처 정보 수정 중 오류 발생:", error);
    return {
      success: false,
      message: "거래처 정보 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}
