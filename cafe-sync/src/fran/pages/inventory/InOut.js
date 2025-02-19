import { useEffect, useState } from "react";
import { getInOutList } from "../../../apis/inventory/inventoryApi";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./InOut.module.css";
import { useSelector } from "react-redux";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import OutRegist from "./OutRegist";
import ReactPaginate from "react-paginate";

function InOut({ isOpen, onClose }) {
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

  const itemsPerPage = 6; // ✅ 한 페이지당 6개

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
              <button className={`${styles.actionButton} ${styles.inButton}`}>
                입고 승인
              </button>
              <button
                className={`${styles.actionButton} ${styles.cancelButton}`}
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
                >
                  <input
                    type="checkbox"
                    checked={item.checked || false}
                    onChange={() => handleCheckboxChange(index)}
                  />
                  <span>{item.franOutCode?.franName || "-"}</span>
                  <span>{item.franInCode?.franName || "-"}</span>
                  <span>{formatDate(item.inoutDate)}</span>
                  <span>{item.inoutStatus === 0 ? "대기" : "승인"}</span>
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
