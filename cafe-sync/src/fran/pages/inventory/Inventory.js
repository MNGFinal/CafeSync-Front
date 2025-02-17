import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getFranInventoryList } from "../../../apis/inventory/inventoryApi";
import styles from "./Inventory.module.css";

function Inventory() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [showLowStock, setShowLowStock] = useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    if (!franCode) return;

    const fetchInventory = async () => {
      const data = await getFranInventoryList(franCode);
      setInventory(data);
      setFilteredInventory(data);
    };

    fetchInventory();
  }, [franCode]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);

    if (value === "") {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(
        (item) =>
          item.inventory.invenCode.includes(value) ||
          item.inventory.invenName.includes(value)
      );
      setFilteredInventory(filtered);
    }
  };

  // ✅ 유통기한 D-Day 계산 함수
  const getDday = (expirationDate) => {
    if (!expirationDate) return "N/A";

    const today = new Date();
    const expiry = new Date(expirationDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-day"; // ✅ 오늘이 유통기한이면 D-day
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  // ✅ 재고 부족 필터링 (보유수량 ≤ 권장수량의 1/3)
  const handleLowStockFilter = () => {
    if (showLowStock) {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter(
        (item) => item.stockQty <= item.recommQty / 3
      );
      setFilteredInventory(filtered);
    }
    setShowLowStock(!showLowStock);
  };

  // ✅ 유통기한 임박 필터링 (D-7 이하)
  const handleExpiringSoonFilter = () => {
    if (showExpiringSoon) {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) => {
        const dDayText = getDday(item.inventory.expirationDate);
        const dDayNumber = parseInt(dDayText.replace("D-", ""), 10);
        return dDayText === "D-day" || (dDayNumber >= 0 && dDayNumber <= 7);
      });
      setFilteredInventory(filtered);
    }
    setShowExpiringSoon(!showExpiringSoon);
  };

  // ✅ 수량 변경 핸들러 (보유수량, 발주수량, 권장수량)
  const handleQuantityChange = (index, field, value) => {
    const updatedInventory = [...filteredInventory];
    updatedInventory[index][field] = value;
    setFilteredInventory(updatedInventory);
  };

  return (
    <>
      <div className="page-header">
        <h3>재고 목록</h3>
      </div>
      <div className={styles.container}>
        <div className={styles.box1}>
          <input
            type="text"
            placeholder="제품코드 or 제품명으로 입력해주세요"
            value={searchText}
            onChange={handleSearchChange}
            className={styles.searchbox}
          />
          <button className={styles.pdfButton}>PDF 파일 추출</button>
          <button className={styles.updateButton}>수량 저장</button>
          <button className={styles.disposeButton}>유통기한 임박 폐기</button>
        </div>
        <div className={styles.box2}>
          <button className={styles.stockRequest}>입출고 신청 관리</button>
          <button
            className={styles.expiryCheck}
            onClick={handleExpiringSoonFilter}
          >
            {showExpiringSoon ? "전체 보기" : "유통기한 임박 조회"}
          </button>
          <button className={styles.lowStock} onClick={handleLowStockFilter}>
            {showLowStock ? "전체 보기" : "재고 부족 조회"}
          </button>
          <button className={styles.orderRequest}>발주 신청</button>
        </div>
      </div>

      {/* 📌 테이블 UI */}
      <div className={styles.tableContainer}>
        <table className={styles.inventoryTable}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) =>
                    setSelectedItems(
                      e.target.checked
                        ? filteredInventory.map(
                            (item) => item.inventory.invenCode
                          )
                        : []
                    )
                  }
                  checked={
                    selectedItems.length > 0 &&
                    selectedItems.length === filteredInventory.length
                  }
                />
              </th>
              <th>제품 사진</th>
              <th>제품 코드</th>
              <th>제품명</th>
              <th>유통기한</th>
              <th>보유수량</th>
              <th>발주수량</th>
              <th>권장수량</th>
              <th>공급업체</th>
              <th>최근 입고일</th>
              <th>발주 상태</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item, index) => {
                const dDay = getDday(item.inventory.expirationDate);
                const isExpiringSoon =
                  dDay === "D-day" || parseInt(dDay.replace("D-", ""), 10) <= 7;

                return (
                  <tr key={index}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(
                          item.inventory.invenCode
                        )}
                        onChange={() =>
                          setSelectedItems((prevSelected) =>
                            prevSelected.includes(item.inventory.invenCode)
                              ? prevSelected.filter(
                                  (code) => code !== item.inventory.invenCode
                                )
                              : [...prevSelected, item.inventory.invenCode]
                          )
                        }
                      />
                    </td>
                    <td>
                      <img
                        src={item.inventory.invenImage}
                        alt="제품 사진"
                        className={styles.productImage}
                      />
                    </td>
                    <td>{item.inventory.invenCode}</td>
                    <td>{item.inventory.invenName}</td>
                    <td className={isExpiringSoon ? styles.expiringSoon : ""}>
                      {dDay}
                    </td>
                    {/* ✅ 인풋 필드 유지 */}
                    <td>
                      <input
                        type="number"
                        value={item.stockQty}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            "stockQty",
                            e.target.value
                          )
                        }
                        className={styles.inputField}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.orderQty}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            "orderQty",
                            e.target.value
                          )
                        }
                        className={styles.inputField}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.recommQty}
                        onChange={(e) =>
                          handleQuantityChange(
                            index,
                            "recommQty",
                            e.target.value
                          )
                        }
                        className={styles.inputField}
                      />
                    </td>
                    <td>{item.inventory.vendor.venName}</td>
                    <td>{item.lastIn}</td>
                    <td>{item.confirmed === 0 ? "발주 전" : "승인"}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="11" className={styles.noData}>
                  데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Inventory;
