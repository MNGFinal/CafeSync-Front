// 가맹점 리스트 불러오는 함수
export async function findFranList() {
  try {
    const response = await fetch(
      "https://cafesync-back-production.up.railway.app/api/find-id/findFranList"
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
      "https://cafesync-back-production.up.railway.app/api/find-id/verifyUser",
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

    console.log("서버에서 넘어온 아이디 검증 데이터", response);

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
      "https://cafesync-back-production.up.railway.app/api/find-id/verifyUser",
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

// 비밀번호 찾기 API

// 이메일로 인증번호 요청
export async function requestAuthCode(userId, email) {
  try {
    const response = await fetch(
      "https://cafesync-back-production.up.railway.app/api/find-pass/request-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, email }),
      }
    );

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return true; // 성공 시 true 반환
  } catch (error) {
    console.error("인증번호 요청 중 오류 발생:", error);
    return false;
  }
}

// 입력한 인증번호 검증
export async function verifyAuthCode(userId, email, authenticationNumber) {
  try {
    const response = await fetch(
      "https://cafesync-back-production.up.railway.app/api/find-pass/verify-auth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, email, authenticationNumber }),
      }
    );

    const data = await response.json();
    return data.verified; // 서버에서 { verified: true/false } 반환
  } catch (error) {
    console.error("인증번호 검증 중 오류 발생:", error);
    return false;
  }
}

// 비밀번호 변경경
export async function updatePassword(userId, userPass) {
  console.log("프론트에서 보내는 데이터", { userId, userPass });

  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("userPass", userPass);

  try {
    const response = await fetch(
      "https://cafesync-back-production.up.railway.app/api/find-pass/update",
      {
        method: "POST",
        body: formData, // ✅ FormData 사용 (JSON 아님)
      }
    );

    console.log("📢 updatePassword 응답 상태:", response.status);

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage);
    }

    return { success: true };
  } catch (error) {
    console.error("비밀번호 변경 중 오류 발생:", error);
    return { success: false, message: error.message };
  }
}
