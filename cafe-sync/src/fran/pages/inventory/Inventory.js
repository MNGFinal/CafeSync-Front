import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getFranInventoryList } from "../../../apis/inventory/inventoryApi";
import styles from "./Inventory.module.css";
import generatePDF from "../../../config/generatePDF";
import SModal from "../../../components/SModal"; // ✅ 이동 후 경로 수정
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ Lottie 애니메이션 추가
import {
  updateFranInventory,
  deleteFranInventory,
} from "../../../apis/inventory/inventoryApi";
import InOut from "./InOut"; // ✅ 새로 만든 InOut 컴포넌트 가져오기

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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);

  const handleManageModalOpen = () => {
    setIsManageModalOpen(true);
  };

  const handleManageModalClose = () => {
    setIsManageModalOpen(false);
  };

  const fetchInventory = async () => {
    if (!franCode) return;
    const data = await getFranInventoryList(franCode);
    setInventory(data);
    setFilteredInventory(data);
  };

  // ✅ useEffect에서 실행
  useEffect(() => {
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

    return diffDays === 0
      ? "D-day"
      : diffDays > 0
      ? `D-${diffDays}`
      : `D+${Math.abs(diffDays)}`;
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

  const isExpiringSoon = (dDay) => {
    if (!dDay) return false; // 예외 처리

    const dDayNumber = parseInt(dDay.replace(/D[-+]/, ""), 10);

    return dDay.includes("D+") || (dDay.includes("D-") && dDayNumber <= 7);
  };

  // ✅ 유통기한 임박 필터링 (D-7 이하)
  const handleExpiringSoonFilter = () => {
    if (showExpiringSoon) {
      setFilteredInventory(inventory);
    } else {
      const filtered = inventory.filter((item) => {
        const dDayText = getDday(item.inventory.expirationDate);
        return isExpiringSoon(dDayText); // 🔥 여기서 방금 만든 함수 활용!
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

  const handleGeneratePDF = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("선택된 항목이 없습니다. 최소 한 개를 선택하세요.");
      setIsModalOpen(true);
      return;
    }

    const selectedData = filteredInventory.filter((item) =>
      selectedItems.includes(item.inventory.invenCode)
    );

    await generatePDF(selectedData);
    setLottieAnimation("/animations/success-check.json"); // ✅ 성공 애니메이션
    setModalMessage("PDF 파일이 성공적으로 생성되었습니다!");
    setIsModalOpen(true);
  };

  const handleSaveQuantities = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("최소 한 개이상 체크를 해주세요.");
      setIsModalOpen(true);
      return;
    }

    // 선택된 항목 필터링
    const updatedData = filteredInventory
      .filter((item) => selectedItems.includes(item.inventory.invenCode))
      .map((item) => ({
        franInvenCode: item.franInvenCode,
        stockQty: item.stockQty,
        orderQty: item.orderQty,
        recommQty: item.recommQty,
      }));

    // API 호출
    const result = await updateFranInventory(updatedData);

    setLottieAnimation(
      result.success
        ? "/animations/success-check.json"
        : "/animations/warning.json"
    );
    setModalMessage(result.message);
    setIsModalOpen(true);
  };

  const handleDeleteItems = () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("최소 한 개 이상 선택해야 합니다.");
      setIsModalOpen(true);
      return;
    }

    setModalMessage("선택한 항목을 삭제하시겠습니까?");
    setIsDeleteModalOpen(true); // ✅ 삭제 확인 모달 열기
  };

  const confirmDelete = async () => {
    try {
      // ✅ selectedItems에는 invenCode만 들어 있음 → 이를 filteredInventory에서 찾음
      const deleteData = filteredInventory
        .filter((item) => selectedItems.includes(item.inventory.invenCode))
        .map((item) => ({
          franInvenCode: item.franInvenCode,
        }));

      const result = await deleteFranInventory(deleteData);

      if (result.success) {
        setLottieAnimation("/animations/success-check.json");
        setModalMessage("선택한 항목이 삭제되었습니다!");

        // ✅ UI에서 삭제된 항목 필터링
        setFilteredInventory((prev) =>
          prev.filter(
            (item) => !selectedItems.includes(item.inventory.invenCode)
          )
        );
        setSelectedItems([]); // 선택 목록 초기화
      } else {
        setLottieAnimation("/animations/warning.json");
        setModalMessage("삭제에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("❌ 삭제 중 오류 발생:", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    }

    setIsDeleteModalOpen(false); // 모달 닫기
    setIsModalOpen(true);
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
          <button className={styles.pdfButton} onClick={handleGeneratePDF}>
            PDF 파일 추출
          </button>{" "}
          <button
            className={styles.updateButton}
            onClick={handleSaveQuantities}
          >
            수량 저장
          </button>
          <button className={styles.disposeButton} onClick={handleDeleteItems}>
            유통기한 임박 폐기
          </button>
        </div>
        <div className={styles.box2}>
          <button
            className={styles.stockRequest}
            onClick={handleManageModalOpen} // ✅ 클릭 시 모달 열기
          >
            입출고 신청 관리
          </button>

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
                const isExpiringSoon = (dDay) => {
                  const dDayNumber = parseInt(dDay.replace(/D[-+]/, ""), 10);
                  return (
                    dDay.includes("D+") ||
                    (dDay.includes("D-") && dDayNumber <= 7)
                  );
                };

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
                    <td
                      className={
                        isExpiringSoon(dDay) ? styles.expiringSoon : ""
                      }
                    >
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
      {/* ✅ 모달 추가 (애니메이션 포함) */}
      <SModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsModalOpen(false),
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false} // ✅ 애니메이션 반복 X
            keepLastFrame={true} // ✅ 애니메이션이 끝나도 마지막 프레임 유지
            src={lottieAnimation} // ✅ 동적으로 변경됨
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <br />
          <p>{modalMessage}</p>
        </div>
      </SModal>
      <SModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: confirmDelete, // ✅ 삭제 실행
            className: modalStyle.confirmButtonS,
          },
          {
            text: "취소",
            onClick: () => setIsDeleteModalOpen(false), // ✅ 모달 닫기
            className: modalStyle.cancelButtonS,
          },
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src="/animations/alert2.json" // ⚠️ 경고 애니메이션
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <br />
          <p>{modalMessage}</p>
        </div>
      </SModal>

      {/* ✅ InOut 컴포넌트로 모달 분리 */}
      <InOut
        isOpen={isManageModalOpen}
        onClose={handleManageModalClose}
        refreshInventory={fetchInventory} // ✅ 재고 목록 업데이트 함수 전달
      />
    </>
  );
}

export default Inventory;
