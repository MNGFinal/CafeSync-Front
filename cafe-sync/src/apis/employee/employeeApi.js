// 가맹점별 직원정보 수정
export async function updateEmployee(updatedData) {
  console.log("업데이트할 직원", updateEmployee);

  if (!updatedData || !updatedData.empCode) {
    console.error("❌ 업데이트할 직원 데이터가 없습니다!");
    return { success: false, message: "업데이트할 직원 데이터가 없습니다." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = "http://localhost:8080/api/fran/employee"; // API URL

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

    console.log("✅ 직원 정보 업데이트 성공");
    return { success: true, message: "업데이트 성공!" };
  } catch (error) {
    console.error("❌ 직원 정보 업데이트 실패:", error);
    return { success: false, message: "업데이트 실패. 다시 시도해주세요." };
  }
}

// 가맹점별 직원 등록 API
export async function createEmployee(employeeData) {
  console.log("등록할 직원 데이터:", employeeData);

  if (!employeeData || !employeeData.empName) {
    console.error("❌ 직원 등록 데이터가 없습니다!");
    return { success: false, message: "직원 정보를 입력해주세요." };
  }

  try {
    const token = sessionStorage.getItem("accessToken");
    const apiUrl = "http://localhost:8080/api/fran/employee"; // 백엔드 API 주소

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(employeeData),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 직원 등록 성공");
    return { success: true, message: "직원 등록 완료!" };
  } catch (error) {
    console.error("❌ 직원 등록 실패:", error);
    return { success: false, message: "등록 실패. 다시 시도해주세요." };
  }
}
