// 로그인한 가맹점의 재고조회
export async function getFranInventoryList(franCode) {
  if (!franCode) {
    console.error("❌ franCode가 없음!");
    return [];
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/inven/${franCode}`;

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
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/inven/update`;

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
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/inven/delete`;

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
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/inout/list/${franCode}`; // ✅ franCode 추가

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
      "cafesync-back-production.up.railway.app/api/fran/inout/out-register",
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

    // ✅ JSON 응답 여부 확인 후 안전하게 처리
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    } else {
      return { success: false, error: "서버 응답이 JSON 형식이 아닙니다." };
    }
  } catch (error) {
    console.error("❌ 출고 등록 실패:", error);
    return { success: false, error: error.message };
  }
}

// ✅ 입고 승인 API
export async function approveInoutItems(approveData) {
  if (!approveData || approveData.length === 0) {
    console.error("❌ 승인할 데이터가 없습니다!");
    return { success: false, message: "승인할 데이터를 선택해주세요." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl =
      "cafesync-back-production.up.railway.app/api/fran/inout/approve";

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(approveData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 입고 승인 성공");
    return { success: true, message: "입고 승인 완료!" };
  } catch (error) {
    console.error("❌ 입고 승인 중 오류 발생:", error);
    return {
      success: false,
      message: "입고 승인 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// ✅ 입고 취소 API
export async function cancelInoutItems(cancelData) {
  if (!cancelData || cancelData.length === 0) {
    console.error("❌ 취소할 데이터가 없습니다!");
    return { success: false, message: "취소할 데이터를 선택해주세요." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl =
      "cafesync-back-production.up.railway.app/api/fran/inout/cancel";

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cancelData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 입고 취소 성공");
    return { success: true, message: "입고 취소 완료!" };
  } catch (error) {
    console.error("❌ 입고 취소 중 오류 발생:", error);
    return {
      success: false,
      message: "입고 취소 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// ✅ 발주 신청 API
export async function insertOrderRequest(orderData) {
  if (!orderData || orderData.length === 0) {
    console.error("❌ 발주할 데이터가 없습니다!");
    return { success: false, message: "발주할 데이터를 선택해주세요." };
  }

  console.log(
    "📤 서버로 보낼 발주 데이터:",
    JSON.stringify(orderData, null, 2)
  );

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl =
      "cafesync-back-production.up.railway.app/api/fran/order/request";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 발주 신청 성공");
    return { success: true, message: "발주 신청 되었습니다." };
  } catch (error) {
    console.error("❌ 발주 신청 중 오류 발생:", error);
    return {
      success: false,
      message: "발주 신청 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// ✅ 발주 신청 내역 조회
export async function findOrderList(franCode) {
  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/order/${franCode}`; // ✅ Path Variable 적용

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
    console.log("✅ 발주 신청 내역 조회 완료:", data);
    return data.data; // ResponseDTO에서 실제 데이터 추출
  } catch (error) {
    console.error("❌ 발주 신청 내역 조회 오류:", error);
    return [];
  }
}

export async function updateFranOrder(updatedData) {
  console.log("저장할 목록", updatedData);

  if (!updatedData || updatedData.length === 0) {
    console.error("❌ 업데이트할 데이터가 없습니다!");
    return { success: false, message: "업데이트할 데이터가 없습니다." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/order/update`;

    // ✅ orderDetailId가 이상한 숫자거나 없으면 제거
    const refinedData = updatedData.map((item) => {
      if (!item.orderDetailId || item.orderDetailId > 2147483647) {
        const { orderDetailId, ...newItem } = item; // orderDetailId 제거
        return newItem;
      }
      return item;
    });

    console.log("📌 정제된 데이터 전송:", refinedData);

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(refinedData),
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

// ✅ 발주 상세 항목 삭제 API (오른쪽 화면)
export async function deleteFranOrderDetail(deleteData) {
  console.log("📝 삭제할 발주 상세 내역:", deleteData);

  if (!deleteData || deleteData.length === 0) {
    console.error("❌ 삭제할 데이터가 없습니다!");
    return { success: false, message: "삭제할 데이터를 선택해주세요." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/order/delete`;

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

    console.log("✅ 선택된 발주 상세 항목 삭제 성공");
    return { success: true, message: "삭제 성공!" };
  } catch (error) {
    console.error("❌ 발주 삭제 중 오류 발생:", error);
    return {
      success: false,
      message: "삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// ✅ 발주 내역 삭제 API (tbl_order + tbl_order_detail 함께 삭제)
export async function deleteFranOrders(deleteData) {
  if (!deleteData || deleteData.length === 0) {
    console.error("❌ 삭제할 발주를 선택해주세요!");
    return { success: false, message: "삭제할 발주를 선택해주세요." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/fran/order/fran-order`;

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

    console.log("✅ 선택된 발주 삭제 성공");
    return { success: true, message: "삭제 성공!" };
  } catch (error) {
    console.error("❌ 발주 삭제 중 오류 발생:", error);
    return {
      success: false,
      message: "삭제 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}

// 본사(모든 가맹점 발주 내역 조회) API
export async function findHQOrderList() {
  try {
    const token = sessionStorage.getItem("accessToken");
    // 본사용 API 엔드포인트 (서버에서 해당 URL에 맞춰 구현되어 있어야 함)
    const apiUrl = `cafesync-back-production.up.railway.app/api/hq/order`;
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
    console.log("✅ 본사 발주 내역 조회 완료:", data);
    // ResponseDTO 구조에 따라 실제 데이터 추출 (예: data.data)
    return data.data;
  } catch (error) {
    console.error("❌ 본사 발주 내역 조회 오류:", error);
    return [];
  }
}

// ✅ 본사 발주 승인/반려 API
export async function updateOrderStatus(orderCode, status) {
  console.log("프론트에서 넘어온 값 확인", orderCode, status);

  if (!orderCode || (status !== 1 && status !== 2)) {
    console.error("❌ 올바른 발주 코드 또는 상태값이 없습니다!");
    return {
      success: false,
      message: "올바른 발주 코드 또는 상태값을 입력해주세요.",
    };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = `cafesync-back-production.up.railway.app/api/hq/orders/${orderCode}/${status}`;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }), // ✅ 상태값(1: 승인, 2: 반려) 전달
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const result = await response.json();
    console.log(
      `✅ 발주 상태 업데이트 성공 (${status === 1 ? "승인" : "반려"})`
    );
    return result;
  } catch (error) {
    console.error("❌ 발주 상태 업데이트 중 오류 발생:", error);
    return {
      success: false,
      message: "발주 상태 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.",
    };
  }
}
