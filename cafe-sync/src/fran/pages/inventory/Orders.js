import { useState, useEffect } from "react";
import styles from "./Orders.module.css";
import { useSelector } from "react-redux";
import {
  findOrderList,
  updateFranOrder,
  deleteFranOrderDetail,
  deleteFranOrders,
} from "../../../apis/inventory/inventoryApi";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import generateOrderPDF from "../../../config/generateOrderPDF"; // ✅ 새 PDF 함수 가져오기
import ProductSelectModal from "./ProductSelectModal";

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

  const itemsPerPage = 12;
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

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const [selectedOrders, setSelectedOrders] = useState([]); // ✅ 왼쪽 (발주 목록 체크박스)

  // ✅ 왼쪽 (발주 목록) 체크박스 개별 선택
  const handleOrderCheckboxChange = (orderCode) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderCode)
        ? prevSelected.filter((code) => code !== orderCode)
        : [...prevSelected, orderCode]
    );
  };

  // ✅ 왼쪽 (발주 목록) 전체 선택 (현재 페이지 기준으로)
  const handleOrderSelectAll = () => {
    const currentPageOrders = filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    const currentPageOrderCodes = currentPageOrders.map(
      (order) => order.orderCode
    );

    if (currentPageOrderCodes.every((code) => selectedOrders.includes(code))) {
      // ✅ 현재 페이지의 모든 항목이 선택된 경우 → 전체 해제
      setSelectedOrders((prevSelected) =>
        prevSelected.filter((code) => !currentPageOrderCodes.includes(code))
      );
    } else {
      // ✅ 현재 페이지에서 선택되지 않은 항목들만 추가
      setSelectedOrders((prevSelected) => [
        ...prevSelected,
        ...currentPageOrderCodes,
      ]);
    }
  };

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

  // ✅ 전체 선택 / 해제 (API + 새로 추가된 데이터 포함)
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]); // 전체 해제
    } else {
      setSelectedItems(
        filteredOrderDetails.map((detail) => detail.orderDetailId)
      ); // ✅ 모든 데이터 포함!
    }
    setSelectAll(!selectAll);
  };

  // ✅ 날짜 변경 핸들러 (시작일)
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && newStartDate > endDate) {
      console.log("🚨 시작 날짜 오류 감지! warning.json 설정");
      setLottieAnimation("/animations/warning.json"); // ✅ 경고 애니메이션 적용
      setWarningMessage("시작 날짜는 종료 날짜보다 늦을 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setStartDate(newStartDate);
  };

  // ✅ 날짜 변경 핸들러 (종료일)
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate < startDate) {
      console.log("🚨 날짜 오류 감지! warning.json 설정");
      setLottieAnimation("/animations/warning.json"); // ✅ 경고 애니메이션 적용
      setWarningMessage("종료 날짜는 시작 날짜보다 빠를 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setEndDate(newEndDate);
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

  const handleProductSelect = (selectedProduct) => {
    const isDuplicate = filteredOrderDetails.some(
      (product) => product.invenCode === selectedProduct.invenCode
    );

    if (isDuplicate) {
      console.log("🔍 현재 Lottie 애니메이션 경로:", lottieAnimation);
      setLottieAnimation("/animations/warning.json"); // ✅ 애니메이션 경로 설정
      setWarningMessage("이미 추가된 제품입니다.");
      setIsWarningModalOpen(true);
      return;
    }

    setFilteredOrderDetails((prevList) => [
      ...prevList,
      {
        orderDetailId: Date.now(), // ✅ 고유한 ID 부여
        invenCode: selectedProduct.invenCode,
        orderQty: 1,
        inventory: {
          invenImage: selectedProduct.invenImage,
          invenName: selectedProduct.invenName,
        },
      },
    ]);

    setIsProductModalOpen(false);
  };

  const handleOrderQtyChange = (index, newQty) => {
    const updatedQty = Math.max(Number(newQty) || 1, 1);

    setFilteredOrderDetails((prevDetails) =>
      prevDetails.map((detail, i) =>
        i === index ? { ...detail, orderQty: updatedQty } : detail
      )
    );
  };

  const handleSaveChanges = async () => {
    if (!selectedOrder) {
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 저장할 발주를 선택해주세요!");
      setIsWarningModalOpen(true);
      return;
    }

    // ✅ 업데이트할 데이터 구성 (orderDetailId 유지)
    const updatedData = filteredOrderDetails.map((detail) => ({
      orderDetailId: detail.orderDetailId, // 기존 ID 유지 (추가한 경우 가짜 ID 포함)
      invenCode: detail.invenCode,
      orderQty: detail.orderQty,
      orderCode: selectedOrder.orderCode, // ✅ orderCode 추가
    }));

    try {
      const response = await updateFranOrder(updatedData);

      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 저장이 완료되었습니다!");
        setIsWarningModalOpen(true);

        // ✅ 최신 데이터 다시 불러오기 (백엔드에서 실제 orderDetailId 반영)
        const updatedOrders = await findOrderList(franCode);
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);

        // ✅ 선택된 주문의 최신 데이터를 가져와 반영 (가짜 ID → 실제 ID)
        const updatedOrder = updatedOrders.find(
          (order) => order.orderCode === selectedOrder.orderCode
        );

        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
          setFilteredOrderDetails(updatedOrder.orderDetails);
        } else {
          setSelectedOrder(null);
        }

        // ✅ 선택된 아이템 초기화
        setSelectedItems([]);
      } else {
        setLottieAnimation("/animations/alert2.json");
        setWarningMessage("❌ 업데이트에 실패했습니다. 다시 시도해주세요.");
        setIsWarningModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 업데이트 중 오류 발생:", error);
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 서버 오류 발생! 다시 시도해주세요.");
      setIsWarningModalOpen(true);
    }
  };

  const fetchOrders = async () => {
    if (!franCode) return;
    setLoading(true);
    const data = await findOrderList(franCode);
    setOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  };

  // ✅ 발주 상세 항목 삭제 핸들러
  const handleDeleteOrderDetails = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 삭제할 항목을 선택해주세요!");
      setIsWarningModalOpen(true);
      return;
    }

    // ✅ 선택된 발주 중에서 승인(1) 또는 반려(2) 상태가 있는지 확인
    const hasRestrictedItems = filteredOrderDetails.some(
      (detail) =>
        selectedItems.includes(detail.orderDetailId) &&
        (selectedOrder.orderStatus === 1 || selectedOrder.orderStatus === 2)
    );

    if (hasRestrictedItems) {
      setLottieAnimation("/animations/warning.json");
      setWarningMessage("🚨 승인되었거나 반려된 발주는 삭제할 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }

    // ✅ 삭제할 데이터 최신 ID 적용
    const deleteData = selectedItems.map((id) => ({ orderDetailId: id }));

    try {
      const response = await deleteFranOrderDetail(deleteData);

      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 선택한 발주 항목이 삭제되었습니다!");
        setIsWarningModalOpen(true);

        // ✅ 최신 데이터 다시 불러오기 (UI와 백엔드 동기화)
        const refreshedOrders = await findOrderList(franCode);
        setOrders(refreshedOrders);
        setFilteredOrders(refreshedOrders);

        // ✅ 선택된 주문의 최신 데이터를 반영
        const refreshedOrder = refreshedOrders.find(
          (order) => order.orderCode === selectedOrder.orderCode
        );
        setSelectedOrder(refreshedOrder);

        // ✅ 선택된 항목 초기화
        setSelectedItems([]);
      } else {
        setLottieAnimation("/animations/alert2.json");
        setWarningMessage("❌ 삭제할 제품을 체크해주세요.");
        setIsWarningModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 삭제 중 오류 발생:", error);
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsWarningModalOpen(true);
    }
  };

  const handleDeleteOrders = async () => {
    if (selectedOrders.length === 0) {
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 삭제할 발주를 선택해주세요!");
      setIsWarningModalOpen(true);
      return;
    }

    // ✅ 선택된 발주 중에서 승인(1) 또는 반려(2) 상태가 있는지 확인
    const hasRestrictedOrders = filteredOrders.some(
      (order) =>
        selectedOrders.includes(order.orderCode) &&
        (order.orderStatus === 1 || order.orderStatus === 2)
    );

    if (hasRestrictedOrders) {
      setLottieAnimation("/animations/warning.json");
      setWarningMessage("🚨 승인되었거나 반려된 발주는 삭제할 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }

    // ✅ 삭제할 orderCode 리스트
    const deleteData = selectedOrders.map((orderCode) => ({ orderCode }));

    try {
      const response = await deleteFranOrders(deleteData);

      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 선택한 발주가 삭제되었습니다!");
        setIsWarningModalOpen(true);

        // ✅ UI에서 삭제된 항목 즉시 제거
        setFilteredOrders((prevOrders) =>
          prevOrders.filter(
            (order) => !selectedOrders.includes(order.orderCode)
          )
        );

        // ✅ 선택된 항목 초기화
        setSelectedOrders([]);

        // ✅ 최신 데이터 다시 불러오기
        await fetchOrders();
      } else {
        setLottieAnimation("/animations/alert2.json");
        setWarningMessage("❌ 삭제할 발주를 선택해주세요.");
        setIsWarningModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 삭제 중 오류 발생:", error);
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
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
            <div className={styles.buttonGroup2}>
              <button className={styles.searchBtn} onClick={handleResetFilters}>
                전체 조회
              </button>
              <button
                className={styles.deleteOrder}
                onClick={handleDeleteOrders}
              >
                발주내역 삭제
              </button>
            </div>
          </div>

          <table className={styles.orderTable}>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={filteredOrders
                      .slice(
                        (currentPage - 1) * itemsPerPage,
                        currentPage * itemsPerPage
                      )
                      .every((order) =>
                        selectedOrders.includes(order.orderCode)
                      )}
                    onChange={handleOrderSelectAll}
                  />
                </th>
                <th>발주 신청 기간</th>
                <th style={{ width: "130px" }}>상태</th>{" "}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="3">⏳ 데이터 로딩 중...</td>
                </tr>
              ) : filteredOrders.length > 0 ? (
                filteredOrders
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage
                  )
                  .map((order) => (
                    <tr key={order.orderCode}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.orderCode)}
                          onChange={() =>
                            handleOrderCheckboxChange(order.orderCode)
                          }
                        />
                      </td>
                      <td onClick={() => setSelectedOrder(order)}>
                        {formatDate(order.orderDate)}
                      </td>
                      <td
                        className={
                          order.orderStatus === 1
                            ? styles.statusApproved
                            : order.orderStatus === 2
                            ? styles.statusRejected
                            : ""
                        }
                      >
                        {getOrderStatusText(order.orderStatus)}
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="3">📭 조회된 데이터가 없습니다.</td>
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
                {isProductModalOpen && (
                  <ProductSelectModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onSelect={handleProductSelect}
                  />
                )}
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.addList}
                    onClick={() => setIsProductModalOpen(true)}
                    disabled={
                      selectedOrder?.orderStatus === 1 ||
                      selectedOrder?.orderStatus === 2
                    } // ✅ 상태가 1(승인) 또는 2(반려)이면 비활성화
                  >
                    추가
                  </button>

                  <button
                    className={styles.editBtn}
                    onClick={handleSaveChanges}
                    disabled={
                      selectedOrder?.orderStatus === 1 ||
                      selectedOrder?.orderStatus === 2
                    } // ✅ 상태가 1(승인) 또는 2(반려)이면 비활성화
                  >
                    저장
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDeleteOrderDetails}
                    disabled={
                      selectedOrder?.orderStatus === 1 ||
                      selectedOrder?.orderStatus === 2
                    } // ✅ 승인(1) 또는 반려(2) 상태이면 삭제 불가
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* ✅ 제품 테이블에 체크박스 추가 */}
              <table className={styles.detailTable}>
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>
                      <input
                        type="checkbox"
                        checked={
                          filteredOrderDetails.length > 0 &&
                          selectedItems.length === filteredOrderDetails.length
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                    <th style={{ width: "200px" }}>제품 이미지</th>
                    <th style={{ width: "140px" }}>제품 코드</th>
                    <th>제품명</th>
                    <th style={{ width: "130px" }}>발주 수량</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrderDetails.map((detail, index) => (
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
                      <td>
                        <input
                          type="number"
                          value={detail.orderQty}
                          min="1"
                          className={styles.inputSmall}
                          onChange={(e) =>
                            handleOrderQtyChange(index, e.target.value)
                          } // ✅ index를 전달!
                          disabled={
                            selectedOrder.orderStatus === 1 ||
                            selectedOrder.orderStatus === 2
                          } // ✅ 상태가 승인(1) 또는 반려(2)일 때 비활성화
                        />
                      </td>
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
        onClose={() => {
          setIsWarningModalOpen(false);
          setLottieAnimation(""); // ✅ 모달 닫을 때 초기화
        }}
        buttons={[
          {
            text: "확인",
            onClick: () => {
              setIsWarningModalOpen(false);
              setLottieAnimation(""); // ✅ 버튼 클릭 시 초기화
            },
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
