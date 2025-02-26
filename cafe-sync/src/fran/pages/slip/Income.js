import React, { useState, useEffect } from "react";
import styles from "./Income.module.css";
import { AiOutlineReload } from "react-icons/ai";
import ReactPaginate from "react-paginate";

// 손익 계산서 조회 API
import { getFranPnlList, deleteFranPnlList } from "../../../apis/slip/slipApi";
import { useSelector } from "react-redux";
import generatePDF from "../../../config/generatePnlPDF";
import SModal from "../../../components/SModal"; // ✅ 모달 추가
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";

function Income() {
  // 리덕스에서 가맹점 코드 가져오기
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 날짜 입력 상태 (전체 조회 시 기본값)
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 서버에서 받아온 손익 계산서 리스트
  const [data, setData] = useState([]);

  // 선택된 행 및 상세보기용 손익 계산서
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 12;
  const offset = currentPage * itemsPerPage;
  const currentPageData = data.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(data.length / itemsPerPage);

  // ✅ 모달 상태 추가
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState(
    "/animations/warning.json"
  );

  const handlePDFDownload = () => {
    generatePDF("손익 계산서", "incomeReport"); // ✅ ID 기반으로 PDF 변환 실행
  };

  // API 데이터 조회 함수
  // API 데이터 조회 함수 (최신순 정렬 추가)
  const fetchData = async (start, end) => {
    if (!franCode) return;
    try {
      const response = await getFranPnlList(franCode, start, end);
      const pnlData = Array.isArray(response) ? response : response.data;

      // ✅ "기간" 기준 최신순 정렬 (내림차순)
      const sortedData = pnlData.sort(
        (a, b) => new Date(b.period) - new Date(a.period)
      );

      setData(sortedData);
      setSelectedRows([]);
      setSelectedReport(null);
      setCurrentPage(0);
    } catch (error) {
      console.error("손익 계산서 조회 실패:", error);
      alert("손익 계산서 조회 중 오류가 발생했습니다.");
    }
  };

  // 첫 렌더링 시 전체 데이터 조회
  useEffect(() => {
    if (franCode) {
      const start = startDate || "0000-01-01";
      const end = endDate || "9999-12-31";
      fetchData(start, end);
    }
  }, [franCode, startDate, endDate]);

  // ✅ handleDateChange 수정
  const handleDateChange = (type, value) => {
    if (type === "start") {
      setStartDate(value);
    } else {
      setEndDate(value);
    }
  };

  // ✅ useEffect에서 날짜 유효성 검사 후 fetchData 실행
  useEffect(() => {
    if (!startDate || !endDate) return;

    if (new Date(startDate) > new Date(endDate)) {
      setModalMessage("시작 날짜는 종료 날짜보다 이후일 수 없습니다.");
      setLottieAnimation("/animations/warning.json");
      setIsModalOpen(true);
      return; // ❗ fetchData 실행 방지
    }

    fetchData(startDate, endDate);
  }, [startDate, endDate]);

  // 날짜 초기화 (전체 조회)
  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchData("0000-01-01", "9999-12-31");
  };

  // 페이지 변경 핸들러
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  // 행 클릭 시 상세 정보 표시
  const handleRowClick = (report) => {
    setSelectedReport(report);
  };

  const getSlipDateRange = (slipCodes) => {
    if (!slipCodes || slipCodes.length === 0) return "";

    // slipCodes 배열에서 slipDate만 추출 후 정렬
    const dates = slipCodes
      .flatMap((slipGroup) =>
        slipGroup.slip.map((slip) => new Date(slip.slipDate))
      )
      .sort((a, b) => a - b); // 오름차순 정렬

    const firstDate = dates[0]?.toISOString().split("T")[0]; // 첫 번째 날짜 (최소값)
    const lastDate = dates[dates.length - 1]?.toISOString().split("T")[0]; // 마지막 날짜 (최대값)

    return `${firstDate} ~ ${lastDate}`;
  };

  const handleDelete = async () => {
    if (selectedRows.length === 0) {
      setModalMessage("삭제할 항목을 선택해주세요.");
      setLottieAnimation("/animations/warning.json");
      setIsModalOpen(true);
      return;
    }

    const success = await deleteFranPnlList(selectedRows);
    if (success) {
      setModalMessage("선택한 손익 계산서가 삭제되었습니다.");
      setLottieAnimation("/animations/success-check.json");
      setData((prevData) =>
        prevData.filter((item) => !selectedRows.includes(item.pnlId))
      ); // UI에서도 삭제 반영
      setSelectedRows([]); // 선택 목록 초기화
    } else {
      setModalMessage("손익 계산서 삭제 중 오류가 발생했습니다.");
      setLottieAnimation("/animations/error.json");
    }

    setIsModalOpen(true);
  };

  return (
    <>
      <div className="page-header">
        <h3>손익 계산서</h3>
      </div>

      <div className={styles.defSection}>
        {/* 왼쪽 영역: 검색/테이블/페이징 */}
        <div className={styles.addSection}>
          {/* 검색 박스 */}
          <div className={styles.searchBox}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange("start", e.target.value)}
            />
            <span>~</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange("end", e.target.value)}
            />
            <button className={styles.resetBtn} onClick={handleReset}>
              <AiOutlineReload />
            </button>
            <button className={styles.deleteBtn} onClick={handleDelete}>
              삭제
            </button>
          </div>

          {/* 손익 계산서 테이블 */}
          <div className={styles.tableContainer}>
            <table className={styles.incomeTable}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        setSelectedRows(
                          e.target.checked ? data.map((row) => row.pnlId) : []
                        );
                      }}
                      checked={
                        selectedRows.length === data.length && data.length > 0
                      }
                    />
                  </th>
                  <th>발행 기간</th>
                  <th>총 수익</th>
                  <th>총 비용</th>
                  <th>순이익</th>
                  <th>이익률</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length > 0 &&
                  currentPageData.map((row) => (
                    <tr key={row.pnlId} onClick={() => handleRowClick(row)}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.pnlId)}
                          onChange={() =>
                            setSelectedRows((prev) =>
                              prev.includes(row.pnlId)
                                ? prev.filter((id) => id !== row.pnlId)
                                : [...prev, row.pnlId]
                            )
                          }
                        />
                      </td>
                      <td>{row.period}</td>
                      <td>{row.revenue?.toLocaleString("ko-KR")} 원</td>
                      <td>{row.expense?.toLocaleString("ko-KR")} 원</td>
                      <td>{row.netProfit?.toLocaleString("ko-KR")} 원</td>
                      <td>{row.ratio}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            breakLabel={"..."}
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
            containerClassName={styles.paginationContainer}
            activeClassName={styles.activePage}
            disabledClassName={styles.disabled}
          />
        </div>

        {/* 오른쪽 영역: 상세보기 */}
        <div className={styles.listSection}>
          {selectedReport ? (
            <div className={styles.reportDetail}>
              <button className={styles.pdfBtn} onClick={handlePDFDownload}>
                PDF 파일 생성
              </button>
              <div id="incomeReport" className={styles.reportDetail}>
                <div className={styles.reportTitleRow}>
                  <h1>손익계산서</h1>
                  <span className={styles.reportDate}>
                    {getSlipDateRange(selectedReport.slipCodes)}
                  </span>
                </div>
                <div className={styles.reportInfo}>
                  <p>
                    <strong>가맹점명:</strong>{" "}
                    {selectedReport.franchise?.franName || "-"}
                  </p>
                </div>
                <address className={styles.reportAddress}>
                  {selectedReport.franchise?.franAddress || "-"}
                </address>
                {/* 전표 상세내역 */}
                {selectedReport.slipCodes &&
                  selectedReport.slipCodes.length > 0 && (
                    <>
                      <h3 className={styles.dataDetail}>상세 내역</h3>
                      <table className={styles.reportTable}>
                        <tbody>
                          {/* 🔹 총 수익: 대변(입금) 항목 표시 */}
                          <tr className={styles.totalRow}>
                            <td>총 수익</td>
                            <td>
                              {selectedReport.revenue?.toLocaleString("ko-KR")}{" "}
                              원
                            </td>
                          </tr>
                          {selectedReport.slipCodes?.flatMap((slipGroup) =>
                            slipGroup.slip
                              .filter(
                                (slip) => slip.slipDivision === "대변(입금)"
                              )
                              .map((slip, idx) => (
                                <tr
                                  key={`credit-${idx}`}
                                  className={styles.subItem}
                                >
                                  <td>{slip.actCode?.actName || "-"}</td>
                                  <td>
                                    + {slip.credit?.toLocaleString("ko-KR")} 원
                                  </td>
                                </tr>
                              ))
                          )}

                          {/* 🔹 총 비용: 차변(출금) 항목 표시 */}
                          <tr className={styles.totalRow}>
                            <td>총 비용</td>
                            <td>
                              {selectedReport.expense?.toLocaleString("ko-KR")}{" "}
                              원
                            </td>
                          </tr>
                          {selectedReport.slipCodes?.flatMap((slipGroup) =>
                            slipGroup.slip
                              .filter(
                                (slip) => slip.slipDivision === "차변(출금)"
                              )
                              .map((slip, idx) => (
                                <tr
                                  key={`debit-${idx}`}
                                  className={styles.debitItem}
                                >
                                  <td>{slip.actCode?.actName || "-"}</td>
                                  <td>
                                    - {slip.debit?.toLocaleString("ko-KR")} 원
                                  </td>
                                </tr>
                              ))
                          )}

                          <tr className={styles.totalRow}>
                            <td>순이익</td>
                            <td>
                              {selectedReport.netProfit?.toLocaleString(
                                "ko-KR"
                              )}{" "}
                              원
                            </td>
                          </tr>
                          <tr className={styles.totalRow}>
                            <td>이익률</td>
                            <td>{selectedReport.ratio}</td>
                          </tr>
                        </tbody>
                      </table>
                    </>
                  )}
              </div>
            </div>
          ) : (
            <div className={styles.noData}>
              <img src="/images/icons/document.png" alt="문서" />
              <p>좌측에서 손익 계산서를 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>
      {/* ✅ SModal 추가 */}
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
        <div className={styles.modalContent}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={lottieAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "18px",
            }}
          >
            {modalMessage}
          </p>
        </div>
      </SModal>
    </>
  );
}

export default Income;
