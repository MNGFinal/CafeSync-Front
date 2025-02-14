// 가맹점 리스트 불러오는 함수
export async function findFranList() {
  try {
    const response = await fetch(
      "http://localhost:8080/api/find-id/findFranList"
    );

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(
        `서버 응답 오류: ${response.status} ${response.statusText}`
      );
    }

    const text = await response.text();

    // JSON 변환
    return JSON.parse(text);
  } catch (error) {
    console.error("가맹점 정보를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// (가맹점) 가맹점 코드, 사번코드, 이메일 검증 함수
export async function verifyUser(franCode, empCode, email) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/find-id/verifyUser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeCode: franCode,
          empCode: empCode,
          email: email,
        }),
      }
    );

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(await response.text()); // 서버에서 보내는 에러 메시지 출력
    }

    return await response.text(); // 정상적인 아이디 반환
  } catch (error) {
    console.error("사용자 검증 중 오류 발생:", error);
    return null; // 실패 시 null 반환
  }
}

// (본사) 사번코드, 이메일 검증 함수
export async function HQverifyUser(empCode, email) {
  try {
    const response = await fetch(
      "http://localhost:8080/api/find-id/verifyUser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          empCode: empCode,
          email: email,
        }),
      }
    );

    // 응답 상태 확인
    if (!response.ok) {
      throw new Error(await response.text()); // 서버에서 보내는 에러 메시지 출력
    }

    return await response.text(); // 정상적인 아이디 반환
  } catch (error) {
    console.error("사용자 검증 중 오류 발생:", error);
    return null; // 실패 시 null 반환
  }
}
