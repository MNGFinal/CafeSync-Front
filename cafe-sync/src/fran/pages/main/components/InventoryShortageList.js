import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getFranInventoryList } from "../../../../apis/inventory/inventoryApi";
// 🔹 새로 만든 CSS 모듈
import st from "./InventoryShortageList.module.css";

function InventoryShortageList() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [shortItems, setShortItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!franCode) return;

    setLoading(true);
    getFranInventoryList(franCode)
      .then((data) => {
        console.log("전체 재고 리스트:", data);
        // 재고량 <= 권장 재고량의 1/3 인 품목만 필터링
        const filtered = data.filter(
          (item) => item.stockQty <= item.recommQty / 3
        );
        setShortItems(filtered);
      })
      .catch((err) => {
        console.error("재고 부족 품목 조회 중 오류 발생:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [franCode]);

  return (
    <div className={st.inventoryContainer}>
      <div className={st.inventoryHeader}>
        <span className={st.codeColumn}>제품코드</span>
        <span className={st.nameColumn}>제품명</span>
        <span className={st.stockColumn}>보유수량</span>
        <span className={st.recommColumn}>권장수량</span>
      </div>

      <div className={st.inventoryList}>
        {loading ? (
          <p className={st.loadingText}>로딩 중...</p>
        ) : shortItems.length > 0 ? (
          shortItems.map((item) => (
            <div className={st.inventoryItem} key={item.itemCode}>
              <span className={st.codeColumn}>{item.inventory.invenCode}</span>
              <span className={st.nameColumn}>{item.inventory.invenName}</span>
              <span className={st.stockColumn}>{item.stockQty}</span>
              <span className={st.recommColumn}>{item.recommQty}</span>
            </div>
          ))
        ) : (
          <div className={st.noData}>부족한 재고 품목이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default InventoryShortageList;
