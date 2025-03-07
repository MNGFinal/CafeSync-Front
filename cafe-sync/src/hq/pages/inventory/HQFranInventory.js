import { useState } from "react";
import { useSelector } from "react-redux";
import styles from "./HQFranInventory.module.css";
import HQInventoryTableHeader from "./HQInventoryTableHeader";
import FranchiseModal from "../../../home/modal/FranchiseModal";
import { findFranList } from "../../../apis/home/findAPI";
import { getFranInventoryList } from "../../../apis/inventory/inventoryApi";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";

function HQFranInventory() {
  const [inventory, setInventory] = useState([]); // 전체 재고 데이터
  const [filteredInventory, setFilteredInventory] = useState([]); // 검색 필터링된 재고 데이터
  const [searchText, setSearchText] = useState("");
  const [isFranModalOpen, setIsFranModalOpen] = useState(false);
  const [franList, setFranList] = useState([]); // ✅ 가맹점 리스트 저장
  const [selectedFran, setSelectedFran] = useState(null); // ✅ 선택된 가맹점 저장
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ✅ 로그인한 가맹점 정보 가져오기
  const loggedInFranCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode
  );

  // ✅ 제품 검색 기능 추가
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

  // ✅ 가맹점 검색 버튼 클릭 -> 가맹점 리스트 가져오기
  const searchHandler = async () => {
    const data = await findFranList();
    setFranList(data);
    setIsFranModalOpen(true); // 모달 열기
  };

  // ✅ 가맹점 선택 시 실행되는 함수
  const handleFranSelect = async (fran) => {
    // 🔹 로그인한 가맹점이면 선택 불가
    if (fran.franCode === loggedInFranCode) {
      setWarningMessage("자신의 가맹점은 선택할 수 없습니다.");
      setIsWarningModalOpen(true);
      return;
    }

    setSelectedFran(fran); // 선택된 가맹점 상태 업데이트
    setIsFranModalOpen(false); // 모달 닫기

    // ✅ 선택한 가맹점 코드로 재고 데이터 불러오기
    const inventoryData = await getFranInventoryList(fran.franCode);
    setInventory(inventoryData);
    setFilteredInventory(inventoryData);
  };

  return (
    <>
      <div className="page-header">
        <h3>가맹점별 재고 현황</h3>
      </div>

      <div className={styles.container}>
        {/* 왼쪽: 가맹점 선택 & 검색 버튼 */}
        <div className={styles.searchInput}>
          <input
            type="text"
            value={
              selectedFran ? selectedFran.franName : "가맹점을 선택해주세요"
            }
            readOnly
          />
          <button onClick={searchHandler}>검색</button>
        </div>

        {/* 오른쪽: 제품 검색 필터 */}
        <div className={styles.filterInput}>
          <input
            type="text"
            placeholder="제품코드 or 제품명으로 입력해주세요"
            value={searchText}
            onChange={handleSearchChange}
            className={styles.searchbox}
          />
        </div>
      </div>

      {/* 📌 테이블 UI */}
      <div className={styles.tableContainer}>
        <table className={styles.inventoryTable}>
          {/* ✅ 공통 테이블 헤더 */}
          <HQInventoryTableHeader
            onSelectAll={() => {}}
            isAllSelected={false}
          />
          <tbody>
            {filteredInventory.length > 0 ? (
              filteredInventory.map((item, index) => (
                <tr key={index}>
                  <td>
                    <img
                      src={item.inventory.invenImage}
                      alt="제품 사진"
                      className={styles.productImage}
                    />
                  </td>
                  <td>{item.inventory.invenCode}</td>
                  <td>{item.inventory.invenName}</td>
                  {/* ✅ 날짜 포맷 변경 (2025-02-12) */}
                  <td>{item.inventory.expirationDate.split("T")[0]}</td>
                  <td>{item.stockQty}</td>
                  <td>{item.inventory.vendor.venName}</td>
                </tr>
              ))
            ) : (
              <div className={styles.content}>
                <img src="/images/icons/document.png" alt="문서" />
                <h3>데이터가 없습니다.</h3>
              </div>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ 가맹점 선택 모달 */}
      {isFranModalOpen && (
        <FranchiseModal
          franList={franList} // 불러온 가맹점 리스트 전달
          onClose={() => setIsFranModalOpen(false)}
          onSelect={handleFranSelect} // 선택 핸들러 전달
        />
      )}

      {/* ✅ 가맹점 선택 제한 경고 모달 */}
      <SModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsWarningModalOpen(false),
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "10px",
          }}
        >
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src="/animations/warning.json"
            style={{ height: "80px", width: "80px" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "14px",
            }}
          >
            {warningMessage}
          </p>
        </div>
      </SModal>
    </>
  );
}

export default HQFranInventory;
