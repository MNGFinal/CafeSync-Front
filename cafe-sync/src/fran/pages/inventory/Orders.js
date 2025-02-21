import { useState, useEffect } from "react";
import styles from "./Orders.module.css";
import { useSelector } from "react-redux";
import { findOrderList } from "../../../apis/inventory/inventoryApi";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import generateOrderPDF from "../../../config/generateOrderPDF"; // ✅ 새 PDF 함수 가져오기

function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // 필터링된 데이터
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true); // ✅ 로딩 상태 추가
  const [selectedItems, setSelectedItems] = useState([]); // ✅ 선택된 제품 목록
  const [selectAll, setSelectAll] = useState(false); // ✅ 전체 선택 상태
  // ✅ 날짜 선택 관련 상태 추가
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const itemsPerPage = 15;
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // ✅ 검색어 상태 추가
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrderDetails, setFilteredOrderDetails] = useState([]);
  const [lottieAnimation, setLottieAnimation] = useState(""); // ✅ 추가
  const franName = useSelector(
    (state) => state.auth?.user?.franchise?.franName ?? "가맹점명 미확인"
  );

  // ✅ 선택된 주문이 변경될 때 초기화
  useEffect(() => {
    if (selectedOrder) {
      setFilteredOrderDetails(selectedOrder.orderDetails);
    }
  }, [selectedOrder]);

  // ✅ 검색어 변경 시 필터링
  useEffect(() => {
    if (!selectedOrder) return;

    const filteredDetails = selectedOrder.orderDetails.filter(
      (detail) =>
        detail.invenCode.includes(searchTerm) ||
        (detail.inventory?.invenName ?? "").includes(searchTerm)
    );

    setFilteredOrderDetails(filteredDetails);
  }, [searchTerm, selectedOrder]);

  // 📌 API 호출 (발주 신청 내역 가져오기)
  useEffect(() => {
    async function fetchOrders() {
      if (!franCode) return;
      setLoading(true);
      const data = await findOrderList(franCode);
      setOrders(data);
      setFilteredOrders(data); // 초기값 설정
      setLoading(false);
    }
    fetchOrders();
  }, [franCode]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / itemsPerPage)
  );

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // 날짜 변환 실패 시 빈 문자열 반환
    return date.toISOString().split("T")[0];
  };

  // ✅ 체크박스 개별 선택
  const handleCheckboxChange = (orderDetailId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(orderDetailId)
        ? prevSelected.filter((id) => id !== orderDetailId)
        : [...prevSelected, orderDetailId]
    );
  };

  // ✅ 전체 선택 / 해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]); // 전체 해제
    } else {
      setSelectedItems(
        selectedOrder.orderDetails.map((detail) => detail.orderDetailId)
      ); // 모든 항목 선택
    }
    setSelectAll(!selectAll);
  };

  // ✅ 날짜 변경 핸들러 (시작일)
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && newStartDate > endDate) {
      setWarningMessage("시작 날짜는 종료 날짜보다 늦을 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setStartDate(newStartDate); // ✅ 상태만 업데이트 (handleFilterOrders 호출 X)
  };

  // ✅ 날짜 변경 핸들러 (종료일)
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate < startDate) {
      setWarningMessage("종료 날짜는 시작 날짜보다 빠를 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setEndDate(newEndDate); // ✅ 상태만 업데이트 (handleFilterOrders 호출 X)
  };

  // ✅ 날짜 변경 시 자동으로 필터링 실행
  useEffect(() => {
    if (startDate && endDate) {
      handleFilterOrders();
    }
  }, [startDate, endDate]); // ✅ 날짜가 변경될 때만 실행

  // ✅ 날짜 필터링 기능
  const handleFilterOrders = () => {
    if (!startDate || !endDate) return; // ✅ 날짜가 없으면 실행 안 함

    const filtered = orders.filter((order) => {
      const orderDate = formatDate(order.orderDate); // ✅ 날짜 변환
      return orderDate >= startDate && orderDate <= endDate;
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // 첫 페이지로 이동
  };

  // ✅ 전체 조회 버튼 핸들러
  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFilteredOrders(orders); // 전체 데이터 복원
    setCurrentPage(1);
  };

  // ✅ 주문 상태 변환 함수
  const getOrderStatusText = (status) => {
    switch (status) {
      case 0:
        return "대기";
      case 1:
        return "승인";
      case 2:
        return "반려";
      default:
        return "알 수 없음";
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setWarningMessage("선택된 제품이 없습니다. 최소 한 개 이상 선택하세요.");
      setIsWarningModalOpen(true);
      return;
    }

    const selectedData = filteredOrderDetails
      .filter((detail) => selectedItems.includes(detail.orderDetailId))
      .map((detail) => ({
        invenCode: detail.invenCode,
        invenName: detail.inventory?.invenName ?? "N/A",
        orderQty: detail.orderQty ?? 0,
      }));

    const orderDate = formatDate(selectedOrder.orderDate);

    try {
      await generateOrderPDF(selectedData, franName, orderDate); // ✅ PDF 생성 완료

      // 📌 PDF 생성 성공 후 모달 상태 업데이트
      setLottieAnimation("/animations/success-check.json"); // ✅ 성공 애니메이션
      setWarningMessage("✅ PDF 파일이 성공적으로 생성되었습니다!");
      setIsWarningModalOpen(true);
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      setLottieAnimation("/animations/warning.json"); // ⚠️ 오류 발생 시 경고 애니메이션
      setWarningMessage(
        "🚨 PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요."
      );
      setIsWarningModalOpen(true);
    }
  };

  return (
    <>
      <div className="page-header">
        <h3>발주 관리</h3>
      </div>
      <div className={styles.defSection}>
        <div className={styles.addSection}>
          <div className={styles.searchBox}>
            <div className={styles.periodLabel}>기간</div>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={handleStartDateChange}
            />
            <span className={styles.dateSeparator}>~</span>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={handleEndDateChange}
            />
            <button className={styles.searchBtn} onClick={handleResetFilters}>
              전체 조회
            </button>
          </div>

          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th>발주 신청 기간</th>
                <th>상태</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="2">⏳ 데이터 로딩 중...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((order) => (
                    <tr
                      key={order.orderCode}
                      className={
                        selectedOrder?.orderCode === order.orderCode
                          ? styles.selectedRow
                          : ""
                      }
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{getOrderStatusText(order.orderStatus)}</td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="2">📭 조회된 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {totalPages >= 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={currentPage === index + 1 ? styles.activePage : ""}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 패널 - 상세 정보 */}
        <div
          className={`${styles.listSection} ${
            selectedOrder ? styles.whiteBackground : styles.grayBackground
          }`}
        >
          {selectedOrder ? (
            <>
              <div className={styles.detailHeader}>
                <h3>{formatDate(selectedOrder.orderDate)} 발주 신청 내역</h3>
                <button
                  className={styles.exportBtn}
                  onClick={handleGeneratePDF}
                >
                  PDF 파일 추출
                </button>
              </div>

              <div className={styles.buttonContainer}>
                <div className={styles.searchInput}>
                  <input
                    type="text"
                    placeholder="제품코드 or 제품명을 입력해주세요"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button className={styles.addList}>추가</button>
                  <button className={styles.editBtn}>수정</button>
                  <button className={styles.deleteBtn}>삭제</button>
                </div>
              </div>

              {/* ✅ 제품 테이블에 체크박스 추가 */}
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={
                          selectedOrder.orderDetails.length > 0 &&
                          selectedItems.length ===
                            selectedOrder.orderDetails.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th>제품 이미지</th>
                    <th>제품 코드</th>
                    <th>제품명</th>
                    <th>발주 수량</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderDetails.map((detail) => (
                    <tr key={detail.orderDetailId}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(detail.orderDetailId)}
                          onChange={() =>
                            handleCheckboxChange(detail.orderDetailId)
                          }
                        />
                      </td>
                      <td>
                        {detail.inventory?.invenImage ? (
                          <img
                            src={detail.inventory.invenImage}
                            alt={detail.inventory.invenName}
                            width="50"
                          />
                        ) : (
                          "이미지 없음"
                        )}
                      </td>
                      <td>{detail.invenCode}</td>
                      <td>{detail.inventory?.invenName ?? "알 수 없음"}</td>
                      <td>{detail.orderQty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <div className={styles.emptySection}>
              <img src="/images/icons/document.png" alt="문서" />
              <h3>발주 신청 내역을 선택해주세요</h3>
            </div>
          )}
        </div>
      </div>
      {/* ✅ 경고 모달 추가 */}
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
            src={lottieAnimation} // ✅ 동적으로 애니메이션 적용
            style={{ height: "100px", width: "100px" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {warningMessage}
          </p>
        </div>
      </SModal>
    </>
  );
}

export default Orders;
