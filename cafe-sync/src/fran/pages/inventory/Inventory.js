import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

function Inventory() {
  // Redux에서 franchise 정보 가져오기 (초기 상태 대비)
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  console.log("🔍 현재 franCode 값:", franCode);

  // API에서 받아온 데이터를 저장할 상태
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    if (!franCode) return; // franCode가 없으면 실행 안 함

    const fetchInventory = async () => {
      try {
        const token = sessionStorage.getItem("accessToken");
        const apiUrl = `http://localhost:8080/api/fran/inven/${franCode}`; // ✅ 백엔드 절대 경로 사용

        console.log("🛠️ API 요청 URL:", apiUrl);
        console.log("🛠️ JWT 토큰:", token);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("🔍 응답 상태 코드:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
        }

        const text = await response.text();
        console.log("🔍 API 응답 내용:", text);

        const data = JSON.parse(text);
        setInventory(data);
      } catch (error) {
        console.error("재고 데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchInventory();
  }, [franCode]); // franCode가 변경될 때마다 실행

  if (!franCode) {
    return <p>로딩 중...</p>;
  }

  return (
    <>
      <div className="page-header">
        <h3>재고 목록</h3>
      </div>
      <div>
        {inventory.length > 0 ? (
          <ul>
            {inventory.map((item) => (
              <li key={item.franInvenCode}>
                {item.invenCode} - 재고: {item.stockQty}
              </li>
            ))}
          </ul>
        ) : (
          <p>재고 데이터가 없습니다.</p>
        )}
      </div>
    </>
  );
}

export default Inventory;
