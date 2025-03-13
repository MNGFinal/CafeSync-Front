// 가맹점별 전표 데이터 조회
export async function getFranSlipList(franCode, startDate, endDate) {
  if (!franCode || !startDate || !endDate) {
    console.error("❌ 필요한 데이터가 없습니다!");
    return [];
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/slip/${franCode}?startDate=${startDate}&endDate=${endDate}`;

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
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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

// 거래처 정보 조회
export async function getVendorList() {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    // 실제 API 엔드포인트에 맞게 수정
    const apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/vendor`;

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 403이면 Access Token 만료 처리
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
    console.log("✅ 거래처 데이터 조회 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 거래처 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// 계정과목 조회
export async function getAccountList() {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    // 실제 API 엔드포인트(계정과목 조회용)으로 변경
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/act";

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 🔹 403 (Forbidden)이면 Access Token 만료 → Refresh Token으로 갱신
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
    console.log("✅ 계정과목 데이터 조회 성공:", data);
    return data; // ← 배열(또는 객체) 형태라고 가정
  } catch (error) {
    console.error("❌ 계정과목 데이터를 가져오는 중 오류 발생:", error);
    return []; // 오류 시 빈 배열 반환
  }
}

// 적요 조회
export async function getSummaryList() {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    // 실제 API 엔드포인트(적요 조회용)으로 변경
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/summary";

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 🔹 403 (Forbidden)이면 Access Token 만료 → Refresh Token으로 갱신
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
    console.log("✅ 적요 데이터 조회 성공:", data);
    return data; // ← 서버에서 { data: [...]} 형태면 data.data 를 반환해야 할 수도 있음
  } catch (error) {
    console.error("❌ 적요 데이터를 가져오는 중 오류 발생:", error);
    return []; // 오류 시 빈 배열 반환
  }
}

// 전표(체크된 행) 일괄 저장(Insert/Update)
export async function saveSlipList(slipArray) {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    // 실제 API 엔드포인트 (예: POST /api/fran/slip)
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/slip";

    // slipArray: [ { slipCode, slipDate, venCode, slipDivision, ... }, ... ]
    let response = await fetch(apiUrl, {
      method: "POST", // POST나 PUT 등 서버 규칙에 맞게
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(slipArray), // 배열 형태로 전송
    });

    // 403이면 토큰 만료 처리
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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

      // 새 토큰으로 다시 요청
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slipArray),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 전표 저장(Insert/Update) 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 전표 저장 중 오류 발생:", error);
    return null;
  }
}

// 전표 삭제 기능
// 전표 삭제 기능
export async function deleteSlipList(slipIdArray) {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    // API 엔드포인트는 DELETE 메서드를 지원하는 /api/fran/slip 로 가정
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/slip";

    let response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      // 삭제할 전표의 ID 배열을 JSON으로 전송
      body: JSON.stringify(slipIdArray),
    });

    // 403 (Forbidden)일 경우, 토큰 만료 처리
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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

      // 새 토큰으로 다시 요청
      response = await fetch(apiUrl, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slipIdArray),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 전표 삭제 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 전표 삭제 중 오류 발생:", error);
    return null;
  }
}

// 세금 계산서 생성
export async function createTaxInvoices(taxDataArray) {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/tax"; // 실제 엔드포인트

    // 예: taxDataArray = [ { slipCode, taxDate, taxVal }, ... ]
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taxDataArray),
    });

    // 토큰 만료 처리 (403)
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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

      // 새 토큰으로 재요청
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taxDataArray),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 세금 계산서 생성 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 세금 계산서 생성 중 오류 발생:", error);
    return null;
  }
}

// 손익 계산서 생성
// 손익 계산서 생성 API 요청
export async function createPnl(pnlData) {
  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/pnl"; // 엔드포인트 수정

    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pnlData),
    });

    // 403이면 토큰 만료 처리
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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

      // 새 토큰으로 다시 요청
      response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pnlData),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ 손익 계산서 생성 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ 손익 계산서 생성 중 오류 발생:", error);
    return null;
  }
}

// 세금 계산서 조회(가맹점별)
export async function getFranTaxList(franCode, startDate, endDate) {
  if (!franCode || !startDate || !endDate) {
    console.error("❌ 필요한 데이터가 없습니다!");
    return [];
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/tax/${franCode}?startDate=${startDate}&endDate=${endDate}`;

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 403 응답인 경우 리프레시 토큰을 사용하여 액세스 토큰 갱신 후 재요청
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
      const newAccessToken = newTokenData.accessToken;
      sessionStorage.setItem("accessToken", newAccessToken);

      // 새 토큰으로 재요청
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
    console.log("✅ [프론트] 조회된 세금 계산서 데이터:", data);
    return data;
  } catch (error) {
    console.error("❌ 세금 계산서 데이터를 가져오는 중 오류 발생:", error);
    return [];
  }
}

// 세금 계산서 삭제
export async function deleteFranTaxList(selectedInvoices) {
  if (!selectedInvoices || selectedInvoices.length === 0) {
    console.error("❌ 삭제할 세금 계산서가 없습니다!");
    return null;
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    // API 엔드포인트 (삭제 요청)
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/tax"; // ✅ 엔드포인트 맞게 변경

    let response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedInvoices), // ✅ 체크된 tax_id 목록을 전송
    });

    // 403 (토큰 만료 시) → Refresh Token으로 갱신 후 재요청
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedInvoices),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 세금 계산서 삭제 성공!");
    return true;
  } catch (error) {
    console.error("❌ 세금 계산서 삭제 중 오류 발생:", error);
    return false;
  }
}

// 손익 계산서 데이터 조회 (가맹점별)
export async function getFranPnlList(franCode, startDate, endDate) {
  if (!franCode || !startDate || !endDate) {
    console.error("❌ 필요한 데이터가 없습니다!");
    return [];
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    // 실제 서버 엔드포인트에 맞게 URL을 수정하세요.
    // 예: GET /api/fran/pnl/{franCode}?startDate=2023-01-01&endDate=2023-12-31
    const apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/pnl/${franCode}?startDate=${startDate}&endDate=${endDate}`;

    let response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // 403 (Forbidden) → Access Token 만료 시, Refresh Token으로 갱신
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");

      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!refreshResponse.ok) {
        throw new Error("❌ Refresh Token 갱신 실패! 다시 로그인해야 합니다.");
      }

      const newTokenData = await refreshResponse.json();
      const newAccessToken = newTokenData.accessToken;
      sessionStorage.setItem("accessToken", newAccessToken);

      // 새 Access Token으로 다시 요청
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
    console.log("✅ [프론트] 조회된 손익 계산서 데이터:", data);
    return data; // ← 서버에서 받은 손익계산서 배열(또는 객체)
  } catch (error) {
    console.error("❌ 손익 계산서 데이터를 가져오는 중 오류 발생:", error);
    return []; // 오류 시 빈 배열 반환
  }
}

// 손익 계산서 삭제
export async function deleteFranPnlList(selectedPnlIds) {
  if (!selectedPnlIds || selectedPnlIds.length === 0) {
    console.error("❌ 삭제할 손익 계산서가 없습니다!");
    return false;
  }

  try {
    let token = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");

    // API 엔드포인트 (삭제 요청)
    const apiUrl =
      "https://cafesync-back-production.up.railway.app/api/fran/pnl"; // ✅ 엔드포인트 확인 필요

    let response = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(selectedPnlIds), // ✅ 체크된 pnlId 목록을 JSON으로 전송
    });

    // 🔹 403 (토큰 만료 시) → Refresh Token으로 갱신 후 재요청
    if (response.status === 403 && refreshToken) {
      console.warn("🔄 Access Token 만료됨. Refresh Token으로 갱신 시도...");
      const refreshResponse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/refresh-token",
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
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedPnlIds),
      });
    }

    if (!response.ok) {
      throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
    }

    console.log("✅ 손익 계산서 삭제 성공!");
    return true;
  } catch (error) {
    console.error("❌ 손익 계산서 삭제 중 오류 발생:", error);
    return false;
  }
}
