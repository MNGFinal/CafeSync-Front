import axios from "axios";


// 직원 목록 불러오기
export async function getEmployeeList() {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl = "http://localhost:8080/api/fran/employees"; // 백엔드 API 주소

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 🔹 403 (Forbidden)인 경우, Access Token이 만료된 것으로 판단하고 Refresh Token으로 갱신 시도
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "http://localhost:8080/api/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("❌ Refresh Token 갱신 실패! 다시 로그인해야 합니다.");
      }

      const newTokenData = await refreshResponse.json();
      token = newTokenData.accessToken;
      sessionStorage.setItem("accessToken", token);

      // 새 Access Token으로 다시 요청
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 직원 목록 조회 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 직원 목록 조회 중 오류 발생:", error);
    return [];
  }
}

// 채팅방 생성하기
export async function createChatRoom(roomName, members) {
  try {
    let token = sessionStorage.getItem("accessToken");
    const apiUrl = "http://localhost:8080/api/chat/room"; // 채팅방 생성 API

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        roomName: roomName,
        memberEmpCodes: members.map((emp) => emp.empCode), // 사번 배열만 보냄
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 채팅방 생성 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 채팅방 생성 중 오류 발생:", error);
    return null;
  }
}

// 채팅방 조회
export async function getUserChatRooms(empCode) {
  console.log("잘넘어왔니?", empCode);
  try {
    let token = sessionStorage.getItem("accessToken");
    const apiUrl = `http://localhost:8080/api/chat/rooms/${empCode}`;

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

    const result = await response.json();
    console.log("✅ 채팅방 목록 조회 성공:", result);
    // 만약 API 응답이 { data: [...] } 형태라면:
    return result.data || [];
  } catch (error) {
    console.error("❌ 채팅방 목록 조회 중 오류 발생:", error);
    return [];
  }
}


// 안읽은 메세지 조회
export const getUnreadCount = async (roomId, empCode) => {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    const apiUrl = `http://localhost:8080/api/chat/unread/${roomId}/${empCode}`;

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 🔹 403 (Forbidden) 발생 시 토큰 갱신 시도
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "http://localhost:8080/api/refresh-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("❌ Refresh Token 갱신 실패! 다시 로그인해야 합니다.");
      }

      const newTokenData = await refreshResponse.json();
      token = newTokenData.accessToken;
      sessionStorage.setItem("accessToken", token);

      // 새 Access Token으로 다시 요청
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const unreadCount = await response.json();
    return unreadCount;
  } catch (error) {
    console.error("❌ 안 읽은 메시지 개수 불러오기 실패", error);
    return 0; // 오류 발생 시 기본값 0 반환
  }
};
