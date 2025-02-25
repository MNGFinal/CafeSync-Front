import React, { useState, useEffect } from "react";
import styles from "./Duty.module.css";
import { getFranTaxList, deleteFranTaxList } from "../../../apis/slip/slipApi";
import { useSelector } from "react-redux";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import ReactPaginate from "react-paginate";
import { AiOutlineReload } from "react-icons/ai";
import generateInvoicePDF from "../../../config/generateInvoicePDF";
import { useNavigate } from "react-router-dom"; // 👈 페이지 이동을 위한 훅 추가

function Duty() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 세금 계산서(TaxDTO) 데이터를 API로부터 받아올 상태
  const [invoiceData, setInvoiceData] = useState([]); // ✅ 빈 배열을 초기값으로 설정

  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // 기본 날짜 범위 설정 (전체 조회)
  const defaultStartDate = "0000-01-01";
  const defaultEndDate = "9999-12-31";

  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지 상태 추가
  const itemsPerPage = 12; // 페이지당 12개씩 표시
  const [totalPages, setTotalPages] = useState(1); // 전체 페이지 수 상태
  const [lottieAnimation, setLottieAnimation] = useState(
    "/animations/warning.json"
  );

  // ✅ 현재 페이지에서 보여줄 데이터 계산
  // ✅ 현재 페이지에서 보여줄 데이터 계산
  const offset = currentPage * itemsPerPage;
  const currentPageData = Array.isArray(invoiceData)
    ? invoiceData.slice(offset, offset + itemsPerPage)
    : [];

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const [isModalOpen, setIsModalOpen] = useState(false); // 🔥 모달 상태 추가
  const [modalMessage, setModalMessage] = useState(""); // 🔥 모달 메시지 추가

  const navigate = useNavigate(); // 👈 페이지 이동 함수

  const [selectedInvoices, setSelectedInvoices] = useState([]); // 선택된 세금계산서 목록

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedInvoices(invoiceData.map((invoice) => invoice.taxId)); // 모든 taxId 추가
    } else {
      setSelectedInvoices([]); // 선택 해제
    }
  };

  const handleSelectRow = (taxId) => {
    setSelectedInvoices(
      (prevSelected) =>
        prevSelected.includes(taxId)
          ? prevSelected.filter((id) => id !== taxId) // 체크 해제
          : [...prevSelected, taxId] // 체크 추가
    );
  };

  const deleteSelectedInvoices = async () => {
    if (selectedInvoices.length === 0) {
      setLottieAnimation("/animations/warning.json"); // ❗️경고 애니메이션
      setModalMessage("삭제할 세금 계산서를 선택해주세요.");
      setIsModalOpen(true);
      return;
    }

    try {
      await deleteFranTaxList(selectedInvoices); // ✅ API 호출 (삭제할 taxId 배열 전달)

      setInvoiceData(
        invoiceData.filter(
          (invoice) => !selectedInvoices.includes(invoice.taxId)
        )
      ); // ✅ UI에서도 삭제 반영
      setSelectedInvoices([]); // ✅ 선택 목록 초기화

      // ✅ 성공 애니메이션 적용
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("선택된 세금 계산서가 삭제되었습니다.");
      setIsModalOpen(true);
    } catch (error) {
      console.error("삭제 오류:", error);

      setLottieAnimation("/animations/error.json"); // ❌ 실패 애니메이션
      setModalMessage("삭제 중 오류가 발생했습니다.");
      setIsModalOpen(true);
    }
  };

  const handleSearch = () => {
    if (!startDate || !endDate) {
      setModalMessage("조회할 날짜를 선택해주세요.");
      setIsModalOpen(true);
      return;
    }

    // 🔥 날짜 검증: 시작 날짜가 종료 날짜보다 이후일 경우 검색 차단
    if (new Date(startDate) > new Date(endDate)) {
      setModalMessage("시작 날짜는 종료 날짜보다 이후일 수 없습니다.");
      setIsModalOpen(true);
      return;
    }

    getFranTaxList(franCode, startDate, endDate)
      .then((data) => {
        if (data.data.length === 0) {
          setModalMessage(
            `${startDate} ~ ${endDate} 에 해당하는 데이터가 없습니다.`
          );
          setIsModalOpen(true);
        } else {
          setInvoiceData(data.data);
          setCurrentPage(0);
        }
      })
      .catch((error) => {
        setModalMessage("해당 날짜에 대한 데이터가 없습니다.");
        setIsModalOpen(true);
      });
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    fetchInvoices(1); // 전체 조회
  };

  useEffect(() => {
    if (franCode) {
      getFranTaxList(franCode, defaultStartDate, defaultEndDate)
        .then((data) => {
          console.log("API 응답 데이터:", data); // 디버깅용 로그
          const receivedData = Array.isArray(data.data) ? data.data : [];

          setInvoiceData(receivedData);

          if (receivedData.length === 0) {
            setModalMessage("조회된 세금 계산서 데이터가 없습니다.");
            setIsModalOpen(true);

            // 3초 후 이전 페이지로 이동
            setTimeout(() => {
              navigate(-1); // 👈 이전 페이지로 이동
            }, 3000);
          }
        })
        .catch((error) => {
          console.error("세금 계산서 데이터를 가져오는 중 오류:", error);
          setInvoiceData([]); // 에러 발생 시 빈 배열 설정
          setModalMessage("데이터를 불러오는 중 오류가 발생했습니다.");
          setIsModalOpen(true);

          // 3초 후 이전 페이지로 이동
          setTimeout(() => {
            navigate(-1);
          }, 3000);
        });
    }
  }, [franCode, navigate]);

  // 행 클릭 시 상세 표시를 위해 상태 업데이트
  const handleRowClick = (invoice) => {
    setSelectedInvoice(invoice);
  };

  const fetchInvoices = (page) => {
    getFranTaxList(
      franCode,
      defaultStartDate,
      defaultEndDate,
      page,
      itemsPerPage // ✅ 한 페이지에 12개씩 가져오도록 수정
    )
      .then((data) => {
        setInvoiceData(data.data);
        setTotalPages(data.totalPages);
      })
      .catch((error) => {
        console.error("세금 계산서 데이터를 가져오는 중 오류:", error);
      });
  };

  useEffect(() => {
    if (franCode) {
      fetchInvoices(currentPage + 1); // API 페이지 시작 번호에 맞게 조정
    }
  }, [franCode, currentPage]);

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected); // 페이지 변경 시 상태 업데이트 → useEffect가 실행됨
  };

  const formatBusinessNumber = (businessNum) => {
    if (!businessNum) return "-";
    return businessNum.replace(/(\d{3})(\d{2})(\d{5})/, "$1-$2-$3");
  };

  return (
    <>
      <div className="page-header">
        <h3>세금 계산서</h3>
      </div>

      <div className={styles.defSection}>
        <div className={styles.addSection}>
          <div className={styles.searchBox}>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
            ~
            <input type="date" value={endDate} onChange={handleEndDateChange} />
            <button className={styles.searchBtn} onClick={handleSearch}>
              검색
            </button>
            <button className={styles.resetBtn} onClick={handleReset}>
              <AiOutlineReload />
            </button>
            <button
              className={styles.deleteBtn}
              onClick={deleteSelectedInvoices}
            >
              삭제
            </button>
          </div>

          {/* 세금 계산서 목록 테이블 */}
          <table className={styles.tableStyle}>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={
                      selectedInvoices.length === invoiceData.length &&
                      invoiceData.length > 0
                    }
                  />
                </th>
                <th>세금 계산서 번호</th>
                <th>발행 일자</th>
                <th>공급자</th>
                <th>공급받는자자</th>
                <th>합계</th>
              </tr>
            </thead>
            <tbody>
              {currentPageData.length > 0 ? (
                currentPageData.map((invoice) => (
                  <tr
                    key={invoice.taxId}
                    onClick={() => handleRowClick(invoice)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice.taxId)}
                        onChange={() => handleSelectRow(invoice.taxId)}
                      />
                    </td>
                    <td>{invoice.taxId}</td>
                    <td>{invoice.taxDate}</td>
                    <td>{invoice.slip?.venCode?.venName ?? "-"}</td>
                    <td>{invoice.franchise?.franName ?? "-"}</td>
                    <td>
                      {(invoice.slip?.debit != null
                        ? invoice.slip.debit
                        : invoice.slip?.credit
                      )?.toLocaleString("ko-KR")}{" "}
                      원
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#888",
                    }}
                  >
                    조회된 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            breakLabel={"..."}
            pageCount={Math.ceil(invoiceData.length / itemsPerPage)} // ✅ 전체 데이터 개수 기준으로 페이지 수 계산
            forcePage={currentPage}
            onPageChange={handlePageChange}
            containerClassName={styles.paginationContainer}
            activeClassName={styles.activePage}
            disabledClassName={styles.disabled}
          />
        </div>

        {/* 상세 영역 */}
        <div className={styles.listSection}>
          {selectedInvoice && (
            <button
              className={styles.pdfBtn}
              onClick={() => generateInvoicePDF(selectedInvoice)}
            >
              PDF 파일 생성
            </button>
          )}
          {selectedInvoice ? (
            <div className={styles.invoiceWrapper}>
              <h3 className={styles.invoiceTitle}>세 금 계 산 서</h3>
              <table className={styles.invoiceTable}>
                <tbody>
                  <tr>
                    <td className={styles.label}>세금 계산서 번호</td>
                    <td>{selectedInvoice.taxId}</td>
                    <td className={styles.label}>발행 일자</td>
                    <td>{selectedInvoice.taxDate}</td>
                  </tr>

                  <tr>
                    <td className={styles.label}>공급자</td>
                    <td>{selectedInvoice.slip?.venCode.venName}</td>
                    <td className={styles.label}>사업자등록번호</td>
                    <td>
                      {formatBusinessNumber(
                        selectedInvoice.slip?.venCode.businessNum
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td className={styles.label}>공급자 주소</td>
                    <td colSpan="3">{selectedInvoice.slip?.venCode.venAddr}</td>
                  </tr>

                  <tr>
                    <td className={styles.label}>공급받는자</td>
                    <td>{selectedInvoice.franchise?.franName}</td>
                    <td className={styles.label}>전표 구분</td>
                    <td>{selectedInvoice.slip?.slipDivision}</td>
                  </tr>

                  <tr>
                    <td className={styles.label}>공급받는자 주소</td>
                    <td colSpan={"3"}>
                      {selectedInvoice.franchise.franAddress}
                    </td>
                  </tr>

                  <tr>
                    <td className={styles.label}>계정과목 코드</td>
                    <td>{selectedInvoice.slip?.actCode?.actCode}</td>{" "}
                    <td className={styles.label}>계정과목명</td>
                    <td>{selectedInvoice.slip?.actCode?.actName}</td>{" "}
                  </tr>

                  <tr>
                    <td className={styles.label}>적요 코드</td>
                    <td>{selectedInvoice.slip?.summaryCode.summaryCode}</td>
                    <td className={styles.label}>적요명</td>
                    <td>{selectedInvoice.slip?.summaryCode.summaryName}</td>
                  </tr>

                  <tr>
                    <td className={styles.label}>세액</td>
                    <td colSpan={"3"}>
                      {selectedInvoice.taxVal
                        ? selectedInvoice.taxVal.toLocaleString("ko-KR")
                        : "0"}
                      원
                    </td>
                  </tr>

                  <tr>
                    <td className={styles.label}>합계</td>
                    <td colSpan="3">
                      {(
                        (selectedInvoice.slip?.debit || 0) +
                        (selectedInvoice.slip?.credit || 0)
                      ).toLocaleString("ko-KR")}
                      원
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.noData}>
              <img src="/images/icons/document.png" alt="문서" />
              <p>좌측에서 세금 계산서를 선택해주세요.</p>
            </div>
          )}
        </div>
      </div>

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
            src={lottieAnimation} // ✅ 상태 적용
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

export default Duty;
