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

// 수량 변경된 데이터 저장
export async function updateFranInventory(updatedData) {
  if (!updatedData || updatedData.length === 0) {
    console.error("❌ 업데이트할 데이터가 없습니다!");
    return { success: false, message: "업데이트할 데이터가 없습니다." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `http://localhost:8080/api/fran/inven/update`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 재고 업데이트 성공");
    return { success: true, message: "성공적으로 저장되었습니다!" };
  } catch (error) {
    console.error("❌ 재고 데이터를 업데이트하는 중 오류 발생:", error);
    return {
      success: false,
      message: "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// 재고목록 삭제
export async function deleteFranInventory(deleteData) {
  if (!deleteData || deleteData.length === 0) {
    console.error("❌ 삭제할 데이터가 없습니다!");
    return { success: false, message: "삭제할 데이터가 없습니다." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `http://localhost:8080/api/fran/inven/delete`;

    const response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deleteData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 선택된 재고 삭제 성공");
    return { success: true, message: "삭제 성공!" };
  } catch (error) {
    console.error("❌ 재고 삭제 중 오류 발생:", error);
    return {
      success: false,
      message: "삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// 입출고 내역 조회
export async function getInOutList(franCode) {
  if (!franCode) {
    console.error("❌ franCode 없음! 데이터를 가져올 수 없습니다.");
    return [];
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `http://localhost:8080/api/fran/inout/list/${franCode}`; // ✅ franCode 추가

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
    console.log("✅ 가져온 입출고 리스트:", data);

    return data.map((item) => ({ ...item, checked: false })); // 체크박스 추가
  } catch (error) {
    console.error("❌ 입출고 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// 출고 등록 api
export async function insertOutRegister(outRegisterData) {
  try {
    const token = sessionStorage.getItem("accessToken");
    const response = await fetch(
      "http://localhost:8080/api/fran/inout/out-register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(outRegisterData),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    // ✅ JSON 응답인지 확인 후 파싱
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      console.log("✅ 출고 등록 성공:", result);
      return { success: true, data: result };
    } else {
      // JSON이 아니라면 텍스트로 읽기
      const textResult = await response.text();
      console.warn("⚠️ 예상치 못한 응답 형식:", textResult);
      return { success: false, error: "서버 응답이 JSON 형식이 아닙니다." };
    }
  } catch (error) {
    console.error("❌ 출고 등록 실패:", error);
    return { success: false, error: error.message };
  }
}
