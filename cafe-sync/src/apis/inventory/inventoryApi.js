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
