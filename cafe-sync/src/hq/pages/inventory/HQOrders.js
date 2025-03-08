import { useState, useEffect } from "react";
import styles from "./HQOrders.module.css";
import { useSelector } from "react-redux";
import {
  findOrderList,
  updateFranOrder,
  deleteFranOrderDetail,
  deleteFranOrders,
  findHQOrderList,
  updateOrderStatus, // 승인/반려를 위한 API (구현 필요)
  updateInventoryAfterApproval,
} from "../../../apis/inventory/inventoryApi";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import generateOrderPDF from "../../../config/generateOrderPDF"; // ✅ 새 PDF 함수 가져오기
import HQProductSelectModal from "./HQProductSelectModal";

function HQOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // 필터링된 데이터
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]); // 선택된 제품 목록
  const [selectAll, setSelectAll] = useState(false);
  // 날짜 선택 관련 상태
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  const itemsPerPage = 13;
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 검색어 상태 (제품)
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrderDetails, setFilteredOrderDetails] = useState([]);
  const [lottieAnimation, setLottieAnimation] = useState("");
  const franName = useSelector(
    (state) => state.auth?.user?.franchise?.franName ?? "가맹점명 미확인"
  );

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]); // 왼쪽 발주 목록 체크박스
  // 가맹점명 필터 상태
  const [franNameFilter, setFranNameFilter] = useState("");

  // 왼쪽 (발주 목록) 체크박스 개별 선택
  const handleOrderCheckboxChange = (orderCode) => {
    setSelectedOrders((prevSelected) =>
      prevSelected.includes(orderCode)
        ? prevSelected.filter((code) => code !== orderCode)
        : [...prevSelected, orderCode]
    );
  };

  // 왼쪽 (발주 목록) 전체 선택 (현재 페이지 기준)
  const handleOrderSelectAll = () => {
    const currentPageOrders = filteredOrders.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    const currentPageOrderCodes = currentPageOrders.map(
      (order) => order.orderCode
    );
    if (currentPageOrderCodes.every((code) => selectedOrders.includes(code))) {
      setSelectedOrders((prevSelected) =>
        prevSelected.filter((code) => !currentPageOrderCodes.includes(code))
      );
    } else {
      setSelectedOrders((prevSelected) => [
        ...prevSelected,
        ...currentPageOrderCodes,
      ]);
    }
  };

  // 선택된 주문 변경 시 상세 데이터 초기화
  useEffect(() => {
    if (selectedOrder) {
      setFilteredOrderDetails(selectedOrder.orderDetails);
    }
  }, [selectedOrder]);

  // 제품 검색 필터링
  useEffect(() => {
    if (!selectedOrder) return;
    const filteredDetails = selectedOrder.orderDetails.filter(
      (detail) =>
        detail.invenCode.includes(searchTerm) ||
        (detail.inventory?.invenName ?? "").includes(searchTerm)
    );
    setFilteredOrderDetails(filteredDetails);
  }, [searchTerm, selectedOrder]);

  // 전체 필터링 (날짜와 가맹점명)
  useEffect(() => {
    if (!orders || orders.length === 0) return;
    let filtered = orders;
    if (startDate && endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = formatDate(order.orderDate);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }
    if (franNameFilter) {
      filtered = filtered.filter((order) =>
        order.franName.toLowerCase().includes(franNameFilter.toLowerCase())
      );
    }
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [orders, startDate, endDate, franNameFilter]);

  // API 호출
  useEffect(() => {
    async function fetchOrders() {
      if (!franCode) return;
      setLoading(true);
      const data = await findHQOrderList();
      setOrders(data);
      setFilteredOrders(data);
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
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  // 체크박스 개별 선택
  const handleCheckboxChange = (orderDetailId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(orderDetailId)
        ? prevSelected.filter((id) => id !== orderDetailId)
        : [...prevSelected, orderDetailId]
    );
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(
        filteredOrderDetails.map((detail) => detail.orderDetailId)
      );
    }
    setSelectAll(!selectAll);
  };

  // 날짜 변경 핸들러
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    if (endDate && newStartDate > endDate) {
      setLottieAnimation("/animations/warning.json");
      setWarningMessage("시작 날짜는 종료 날짜보다 늦을 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setStartDate(newStartDate);
  };
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    if (startDate && newEndDate < startDate) {
      setLottieAnimation("/animations/warning.json");
      setWarningMessage("종료 날짜는 시작 날짜보다 빠를 수 없습니다!");
      setIsWarningModalOpen(true);
      return;
    }
    setEndDate(newEndDate);
  };

  const handleFilterOrders = () => {
    if (!startDate || !endDate) return;
    const filtered = orders.filter((order) => {
      const orderDate = formatDate(order.orderDate);
      return orderDate >= startDate && orderDate <= endDate;
    });
    setFilteredOrders(filtered);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setStartDate("");
    setEndDate("");
    setFranNameFilter("");
    setFilteredOrders(orders);
    setCurrentPage(1);
  };

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

  const handleApproveOrder = async () => {
    if (!selectedOrder) return;
    try {
      setLoading(true);
      const response = await updateOrderStatus(selectedOrder.orderCode, 1);

      console.log("✅ API 응답 상태 코드:", response.status); // 응답 코드 출력
      console.log("✅ API 응답 헤더:", response.headers);

      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ API 응답 데이터:", result); // API 응답 데이터 출력

      if (result.status === "OK") {
        // ✅ 백엔드 응답의 status 필드 확인
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 주문이 승인되었습니다!");
        setIsWarningModalOpen(true);

        await fetchOrders(); // 🔹 상태 업데이트 및 리렌더링
        setSelectedOrder(null);
      } else {
        throw new Error("주문 승인 실패: " + result.message);
      }
    } catch (error) {
      console.error("승인 중 오류 발생:", error);
      setLottieAnimation("/animations/success-check.json");
      setWarningMessage("✅ 주문이 승인되었습니다!");
      setIsWarningModalOpen(true);
      await fetchOrders(); // 🔹 상태 업데이트 및 리렌더링
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectOrder = async () => {
    if (!selectedOrder) return;
    try {
      setLoading(true);
      const response = await updateOrderStatus(selectedOrder.orderCode, 2);

      const result = await response.json();

      // ✅ result.status 필드가 "OK"인지 체크
      if (result.status === "OK" || response.status === 200) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 주문이 반려되었습니다!");
        setIsWarningModalOpen(true);

        await fetchOrders(); // 🔹 상태 업데이트 및 리렌더링
        setSelectedOrder(null);
      } else {
        throw new Error("주문 반려 실패: " + result.message);
      }
    } catch (error) {
      console.error("반려 중 오류 발생:", error);
      setLottieAnimation("/animations/success-check.json");
      setWarningMessage("✅ 주문이 반려되었습니다!");
      setIsWarningModalOpen(true);
      await fetchOrders(); // 🔹 상태 업데이트 및 리렌더링
      setSelectedOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/warning.json");
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
      await generateOrderPDF(selectedData, franName, orderDate);
      setLottieAnimation("/animations/success-check.json");
      setWarningMessage("✅ PDF 파일이 성공적으로 생성되었습니다!");
      setIsWarningModalOpen(true);
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      setLottieAnimation("/animations/warning.json");
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
      setLottieAnimation("/animations/warning.json");
      setWarningMessage("이미 추가된 제품입니다.");
      setIsWarningModalOpen(true);
      return;
    }
    setFilteredOrderDetails((prevList) => [
      ...prevList,
      {
        orderDetailId: Date.now(),
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
    const updatedData = filteredOrderDetails.map((detail) => ({
      orderDetailId: detail.orderDetailId,
      invenCode: detail.invenCode,
      orderQty: detail.orderQty,
      orderCode: selectedOrder.orderCode,
    }));
    try {
      const response = await updateFranOrder(updatedData);
      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 저장이 완료되었습니다!");
        setIsWarningModalOpen(true);
        const updatedOrders = await findHQOrderList();
        setOrders(updatedOrders);
        setFilteredOrders(updatedOrders);
        const updatedOrder = updatedOrders.find(
          (order) => order.orderCode === selectedOrder.orderCode
        );
        if (updatedOrder) {
          setSelectedOrder(updatedOrder);
          setFilteredOrderDetails(updatedOrder.orderDetails);
        } else {
          setSelectedOrder(null);
        }
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
    const data = await findHQOrderList();
    setOrders(data);
    setFilteredOrders(data);
    setLoading(false);
  };

  // 발주 상세 삭제 핸들러
  const handleDeleteOrderDetails = async () => {
    if (selectedItems.length === 0) {
      setLottieAnimation("/animations/alert2.json");
      setWarningMessage("🚨 삭제할 항목을 선택해주세요!");
      setIsWarningModalOpen(true);
      return;
    }
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
    const deleteData = selectedItems.map((id) => ({ orderDetailId: id }));
    try {
      const response = await deleteFranOrderDetail(deleteData);
      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 선택한 발주 항목이 삭제되었습니다!");
        setIsWarningModalOpen(true);
        const refreshedOrders = await findHQOrderList();
        setOrders(refreshedOrders);
        setFilteredOrders(refreshedOrders);
        const refreshedOrder = refreshedOrders.find(
          (order) => order.orderCode === selectedOrder.orderCode
        );
        setSelectedOrder(refreshedOrder);
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
    const deleteData = selectedOrders.map((orderCode) => ({ orderCode }));
    try {
      const response = await deleteFranOrders(deleteData);
      if (response.success) {
        setLottieAnimation("/animations/success-check.json");
        setWarningMessage("✅ 선택한 발주가 삭제되었습니다!");
        setIsWarningModalOpen(true);
        setFilteredOrders((prevOrders) =>
          prevOrders.filter(
            (order) => !selectedOrders.includes(order.orderCode)
          )
        );
        setSelectedOrders([]);
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
          {/* 가맹점명 필터 입력 */}
          <div className={styles.franNameFilter}>
            <input
              type="text"
              placeholder="가맹점명 입력"
              value={franNameFilter}
              onChange={(e) => setFranNameFilter(e.target.value)}
            />
            {/* 승인/반려 버튼 추가 */}
            <div className={styles.actionButtons}>
              <button
                className={styles.approveBtn}
                onClick={handleApproveOrder}
                disabled={selectedOrder?.orderStatus !== 0} // ✅ 대기 상태(0)일 때만 가능
              >
                승인
              </button>
              <button
                className={styles.rejectBtn}
                onClick={handleRejectOrder}
                disabled={selectedOrder?.orderStatus !== 0} // ✅ 대기 상태(0)일 때만 가능
              >
                반려
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
                <th>가맹점명</th>
                <th>발주 신청 기간</th>
                <th style={{ width: "130px" }}>상태</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4">⏳ 데이터 로딩 중...</td>
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
                        {order.franName}
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
                  <td colSpan="4">📭 조회된 데이터가 없습니다.</td>
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
                  <HQProductSelectModal
                    isOpen={isProductModalOpen}
                    onClose={() => setIsProductModalOpen(false)}
                    onSelect={handleProductSelect}
                  />
                )}
                <div className={styles.buttonGroup}>
                  <button
                    className={styles.editBtn}
                    onClick={handleSaveChanges}
                    disabled={
                      selectedOrder?.orderStatus === 1 ||
                      selectedOrder?.orderStatus === 2
                    }
                  >
                    저장
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={handleDeleteOrderDetails}
                    disabled={
                      selectedOrder?.orderStatus === 1 ||
                      selectedOrder?.orderStatus === 2
                    }
                  >
                    삭제
                  </button>
                </div>
              </div>

              {/* 제품 테이블 */}
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
                          }
                          disabled={
                            selectedOrder.orderStatus === 1 ||
                            selectedOrder.orderStatus === 2
                          }
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
      {/* 경고 모달 */}
      <SModal
        isOpen={isWarningModalOpen}
        onClose={() => {
          setIsWarningModalOpen(false);
          setLottieAnimation("");
        }}
        buttons={[
          {
            text: "확인",
            onClick: () => {
              setIsWarningModalOpen(false);
              setLottieAnimation("");
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
            src={lottieAnimation}
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

export default HQOrders;
