// 로그인한 가맹점의 재고조회
export async function getFranInventoryList(franCode) {
  if (!franCode) {
    console.error("❌ franCode가 없음!");
    return [];
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `http://localhost:8080/api/fran/inven/${franCode}`;

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 가져온 재고 데이터:", data);
    return data; // 데이터 반환
  } catch (error) {
    console.error("❌ 재고 데이터를 가져오는 중 오류 발생:", error);
    return []; // 오류 시 빈 배열 반환
  }
}
