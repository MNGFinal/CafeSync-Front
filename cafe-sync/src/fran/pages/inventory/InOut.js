import { useEffect, useState } from "react";
import {
  getInOutList,
  approveInoutItems,
  cancelInoutItems,
} from "../../../apis/inventory/inventoryApi";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./InOut.module.css";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import OutRegist from "./OutRegist";
import ReactPaginate from "react-paginate";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import InOutDetail from "./InOutDetail"; // ✅ 추가

function InOut({ isOpen, onClose, refreshInventory }) {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  const [inOutList, setInOutList] = useState([]);
  const [filteredInOutList, setFilteredInOutList] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isOutRegistOpen, setIsOutRegistOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false); // 🔥 에러 모달 상태 추가
  const [errorMessage, setErrorMessage] = useState(""); // 🔥 에러 메시지 상태 추가
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false); // ✅ 성공 모달 상태 추가
  const [successMessage, setSuccessMessage] = useState(""); // ✅ 성공 메시지 추가
  const [selectedInOut, setSelectedInOut] = useState(null); // ✅ 선택된 입출고 데이터 저장
  const [isDetailOpen, setIsDetailOpen] = useState(false); // ✅ 상세 모달 상태

  const itemsPerPage = 6; // ✅ 한 페이지당 6개

  // ✅ 날짜 유효성 검사: 시작 날짜가 종료 날짜보다 이후면 `SModal` 띄우기
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (start > end) {
        setErrorMessage("시작 날짜는 종료 날짜보다 이후일 수 없습니다.");
        setIsErrorModalOpen(true);
        setStartDate("");
        setEndDate("");
      }
    }
  }, [startDate, endDate]);

  // ✅ 📌 출고 등록 후 리스트 갱신을 위해 `fetchInOutList` 함수 생성
  const fetchInOutList = () => {
    if (franCode) {
      getInOutList(franCode).then((data) => {
        setInOutList(data);
        setFilteredInOutList(data); // ✅ 초기 데이터
      });
    }
  };

  // ✅ 모달이 열릴 때 데이터 가져오기
  useEffect(() => {
    if (isOpen) {
      fetchInOutList(); // 🔥 출고 등록 후 최신 데이터 불러오기
    }
  }, [isOpen, franCode]);

  // ✅ 출고 등록 성공 후 리스트 갱신
  const handleRegisterSuccess = () => {
    fetchInOutList(); // 🔥 출고 등록 후 최신 데이터 불러오기
    setIsOutRegistOpen(false); // ✅ 모달 닫기
  };

  // ✅ 날짜 필터링 적용
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredInOutList(inOutList);
      setCurrentPage(0);
      return;
    }

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const filteredData = inOutList.filter((item) => {
      const itemDate = new Date(item.inoutDate);
      return itemDate >= start && itemDate <= end;
    });

    setFilteredInOutList(filteredData);
    setCurrentPage(0);
  }, [startDate, endDate, inOutList]);

  // ✅ 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd HH:mm:ss", { locale: ko });
  };

  // ✅ 페이지네이션 핸들러
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // ✅ 현재 페이지에서 보여줄 데이터 계산
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredInOutList.slice(
    offset,
    offset + itemsPerPage
  );

  const handleCheckboxChange = (index) => {
    const updatedList = [...filteredInOutList];

    // ✅ 이미 승인(1) 또는 취소(2)된 항목은 선택 불가
    if (updatedList[index].inoutStatus !== 0) {
      setErrorMessage("이미 승인 또는 취소된 항목입니다.");
      setIsErrorModalOpen(true);
      return;
    }

    updatedList[index] = {
      ...updatedList[index],
      checked: !updatedList[index].checked,
    };
    setFilteredInOutList(updatedList);
  };

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    const updatedList = filteredInOutList.map((item) => ({
      ...item,
      checked: newSelectAll,
    }));
    setFilteredInOutList(updatedList);
  };

  const handleApproveIn = async () => {
    const selectedItems = filteredInOutList.filter((item) => item.checked);

    if (selectedItems.length === 0) {
      setErrorMessage("승인할 항목을 선택해주세요.");
      setIsErrorModalOpen(true);
      return;
    }

    const invalidItems = selectedItems.filter(
      (item) => item.franInCode.franCode !== franCode
    );

    if (invalidItems.length > 0) {
      setErrorMessage("입고 매장만 승인할 수 있습니다.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const approveData = selectedItems.map((item) => ({
        inoutCode: item.inoutCode,
        inoutStatus: 1,
        franOutCode: { franCode: item.franOutCode.franCode },
        franInCode: { franCode: item.franInCode.franCode },
        inventoryList: item.inventoryList.map((inv) => ({
          invenCode: inv.invenCode,
          quantity: inv.quantity,
        })),
      }));

      const response = await approveInoutItems(approveData);

      if (response.success) {
        setSuccessMessage("입고 승인 처리되었습니다.");
        setIsSuccessModalOpen(true); // ✅ 성공 모달 열기
        fetchInOutList();
        refreshInventory(); // 재고 목록 새로고침
      } else {
        setErrorMessage(response.error || "입고 승인에 실패했습니다.");
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage("서버 오류 발생. 다시 시도해주세요.");
      setIsErrorModalOpen(true);
    }
  };

  const handleCancelIn = async () => {
    const selectedItems = filteredInOutList.filter((item) => item.checked);

    if (selectedItems.length === 0) {
      setErrorMessage("취소할 항목을 선택해주세요.");
      setIsErrorModalOpen(true);
      return;
    }

    const invalidItems = selectedItems.filter(
      (item) => item.franInCode.franCode !== franCode
    );

    if (invalidItems.length > 0) {
      setErrorMessage("입고 매장만 취소할 수 있습니다.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const cancelData = selectedItems.map((item) => ({
        inoutCode: item.inoutCode,
        inoutStatus: 2,
      }));

      const response = await cancelInoutItems(cancelData);

      if (response.success) {
        setSuccessMessage("입고 취소 처리되었습니다.");
        setIsSuccessModalOpen(true); // ✅ 성공 모달 열기
        fetchInOutList();
        refreshInventory(); // 재고 목록 새로고침침
      } else {
        setErrorMessage(response.error || "입고 취소에 실패했습니다.");
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      setErrorMessage("서버 오류 발생. 다시 시도해주세요.");
      setIsErrorModalOpen(true);
    }
  };

  // ✅ 상태값을 한글로 변환하는 함수
  const formatStatus = (status) => {
    switch (status) {
      case 0:
        return "대기";
      case 1:
        return "승인";
      case 2:
        return "취소"; // ✅ 취소 상태 추가
      default:
        return "-";
    }
  };

  // ✅ 리스트 아이템 클릭 시 상세 모달 열기
  const handleItemClick = (item) => {
    setSelectedInOut(item);
    setIsDetailOpen(true);
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        buttons={[
          {
            text: "목록으로 돌아가기",
            onClick: onClose,
            className: modalStyle.confirmButtonB,
          },
        ]}
      >
        <div>
          <h3>입출고 신청 관리</h3>

          {/* ✅ 필터 UI */}
          <div className={styles.container}>
            <div className={styles.filterContainer}>
              <div className={styles.filterGroup}>
                <button
                  className={styles.showAllButton}
                  onClick={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                >
                  전체 조회
                </button>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span>~</span>
                <input
                  type="date"
                  className={styles.dateInput}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* ✅ 버튼 그룹 */}
            <div className={styles.buttonGroup}>
              <button
                className={`${styles.actionButton} ${styles.outButton}`}
                onClick={() => setIsOutRegistOpen(true)}
              >
                출고 등록
              </button>

              <button
                className={`${styles.actionButton} ${styles.inButton}`}
                onClick={handleApproveIn}
                disabled={filteredInOutList.every(
                  (item) => item.inoutStatus !== 0
                )} // ✅ 모든 항목이 승인 또는 취소된 경우 비활성화
              >
                입고 승인
              </button>

              <button
                className={`${styles.actionButton} ${styles.cancelButton}`}
                onClick={handleCancelIn}
                disabled={filteredInOutList.every(
                  (item) => item.inoutStatus !== 0
                )} // ✅ 모든 항목이 승인 또는 취소된 경우 비활성화
              >
                입고 취소
              </button>
            </div>
          </div>

          {/* ✅ 리스트 UI */}
          <ul className={styles.list}>
            <li className={`${styles.listHeader} ${styles.listRow}`}>
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
              <span>출고 매장</span>
              <span>입고 매장</span>
              <span>날짜</span>
              <span>상태</span>
            </li>

            {currentPageData.length > 0 ? (
              currentPageData.map((item, index) => (
                <li
                  key={index}
                  className={`${styles.listItem} ${styles.listRow}`}
                  onClick={() => handleItemClick(item)} // ✅ 리스트 클릭 시 상세보기 실행
                >
                  {/* ✅ 체크박스 클릭 시 이벤트 버블링 차단 */}
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onClick={(e) => e.stopPropagation()} // ✅ 클릭 이벤트가 li로 전달되지 않도록 차단!
                    onChange={() => handleCheckboxChange(index)}
                  />
                  <span>{item.franOutCode?.franName || "-"}</span>
                  <span>{item.franInCode?.franName || "-"}</span>
                  <span>{formatDate(item.inoutDate)}</span>
                  <span>{formatStatus(item.inoutStatus)}</span>
                </li>
              ))
            ) : (
              <li className={styles.noData}>입출고 데이터가 없습니다.</li>
            )}
          </ul>

          {/* ✅ 페이지네이션 UI */}
          <ReactPaginate
            previousLabel={"<"}
            nextLabel={">"}
            breakLabel={"..."}
            pageCount={Math.ceil(filteredInOutList.length / itemsPerPage)}
            marginPagesDisplayed={1}
            pageRangeDisplayed={3}
            onPageChange={handlePageChange}
            containerClassName={styles.pagination}
            activeClassName={styles.activePage}
          />
        </div>
      </Modal>
      {/* ✅ 성공 모달 (성공 시 가장 먼저 렌더링) */}
      {isSuccessModalOpen && (
        <SModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: () => setIsSuccessModalOpen(false),
              className: modalStyle.confirmButtonS,
            },
          ]}
        >
          <div className={styles.modalContent}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src="/animations/success-check.json" // ✅ 성공 애니메이션 적용
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "center",
                paddingTop: "14px",
              }}
            >
              {successMessage}
            </p>
          </div>
        </SModal>
      )}

      {/* ✅ 실패 모달 (성공 모달보다 뒤에 배치) */}
      {isErrorModalOpen && (
        <SModal
          isOpen={isErrorModalOpen}
          onClose={() => setIsErrorModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: () => setIsErrorModalOpen(false),
              className: modalStyle.confirmButtonS,
            },
          ]}
        >
          <div className={styles.modalContent}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src="/animations/warning.json" // ✅ 실패 시 warning.json 사용
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                textAlign: "center",
                paddingTop: "14px",
              }}
            >
              {errorMessage}
            </p>
          </div>
        </SModal>
      )}

      {/* ✅ 입출고 상세 모달 */}
      {isDetailOpen && (
        <InOutDetail
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          inoutData={selectedInOut} // ✅ 선택된 데이터 전달
        />
      )}

      {/* ✅ 출고 등록 모달에 `handleRegisterSuccess` 전달 */}
      <OutRegist
        isOpen={isOutRegistOpen}
        onClose={() => setIsOutRegistOpen(false)}
        onRegisterSuccess={handleRegisterSuccess} // 🔥 출고 등록 성공 시 리스트 갱신
      />
    </>
  );
}

export default InOut;
