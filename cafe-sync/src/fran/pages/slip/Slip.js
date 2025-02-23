import { useState, useEffect } from "react";
import styles from "./Slip.module.css";
import {
  getFranSlipList,
  getVendorList,
  getAccountList,
  getSummaryList,
  saveSlipList,
} from "../../../apis/slip/slipApi";
import { useSelector } from "react-redux";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";

function Slip() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [slipList, setSlipList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // 경고용 모달
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // --------------------------------------------
  // 🔹 "거래처" 관련 상태
  const [vendorList, setVendorList] = useState([]);
  const [vendorActiveTab, setVendorActiveTab] = useState("전체"); // 탭(전체, 일반, 도매, 금융, 카드)
  const [vendorSearchText, setVendorSearchText] = useState("");

  const [accountOptions, setAccountOptions] = useState([]);

  const [accountActiveTab, setAccountActiveTab] = useState("전체"); // 탭(전체, 자산, 부채, 자본, 수익, 비용)
  const [accountSearchText, setAccountSearchText] = useState("");

  // 🔹 "적요" 관련 상태
  const [summaryOptions, setSummaryOptions] = useState([]);

  // --------------------------------------------
  // 🔹 코드 선택 모달 관련 상태
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeModalType, setCodeModalType] = useState(""); // "vendor", "account", "summary"
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // --------------------------------------------
  // 🔹 벤더 필터링 함수
  const getFilteredVendorList = () => {
    let filtered = vendorList;
    // 탭 필터
    if (vendorActiveTab !== "전체") {
      filtered = filtered.filter(
        (vendor) => vendor.venDivision === vendorActiveTab
      );
    }
    // 검색어 필터 (거래처명)
    if (vendorSearchText.trim() !== "") {
      const lowerSearch = vendorSearchText.toLowerCase();
      filtered = filtered.filter((vendor) =>
        vendor.venName.toLowerCase().includes(lowerSearch)
      );
    }
    return filtered;
  };

  // 🔹 계정과목 필터링 함수
  const getFilteredAccountOptions = () => {
    let filtered = accountOptions;
    // 탭 필터
    if (accountActiveTab !== "전체") {
      filtered = filtered.filter((acc) => acc.division === accountActiveTab);
    }
    // 검색어 필터 (계정과목명)
    if (accountSearchText.trim() !== "") {
      const lowerSearch = accountSearchText.toLowerCase();
      filtered = filtered.filter((acc) =>
        acc.name.toLowerCase().includes(lowerSearch)
      );
    }
    return filtered;
  };

  // --------------------------------------------
  // 날짜 변경 이벤트 핸들러
  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
  };

  // 날짜 유효성 검사
  const isValidDateRange = () => {
    if (!startDate || !endDate) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("날짜를 선택해주세요!");
      setIsModalOpen(true);
      return false;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("시작 날짜는 종료 날짜보다 이후일 수 없습니다!");
      setIsModalOpen(true);
      return false;
    }

    const maxEndDate = new Date(start);
    maxEndDate.setMonth(start.getMonth() + 1);
    if (maxEndDate.getDate() !== start.getDate()) {
      maxEndDate.setDate(0);
    }

    if (end > maxEndDate) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage(
        <div
          style={{
            position: "absolute",
            left: "71px",
            top: "127px",
            textAlign: "center",
          }}
        >
          <p>조회 기간은 최대 1개월까지 가능합니다!</p>
          <p>(최대: {maxEndDate.toISOString().split("T")[0]})</p>
        </div>
      );
      setIsModalOpen(true);
      return false;
    }

    return true;
  };

  // 입력값 변경 핸들러
  const handleInputChange = (index, field, value, nestedField = null) => {
    const updatedList = { ...slipList };
    if (updatedList.data) {
      updatedList.data = updatedList.data.map((item, idx) => {
        if (idx === index) {
          if (nestedField) {
            return {
              ...item,
              slipCode: item.slipCode, // ✅ slipCode 유지
              [nestedField]: {
                ...item[nestedField],
                [field]: value,
              },
            };
          } else {
            return {
              ...item,
              slipCode: item.slipCode, // ✅ slipCode 유지
              [field]: value,
            };
          }
        }
        return item;
      });
    }
    setSlipList(updatedList);
  };

  // 코드 선택 모달 열기
  const openCodeModal = (index, type) => {
    setSelectedRowIndex(index);
    setCodeModalType(type);
    setCodeModalOpen(true);
  };

  // 코드 모달에서 옵션 선택 시 해당 행 업데이트
  const handleCodeSelect = (option) => {
    if (selectedRowIndex === null) return;
    const updatedList = { ...slipList };
    if (updatedList.data) {
      updatedList.data = updatedList.data.map((item, idx) => {
        if (idx === selectedRowIndex) {
          if (codeModalType === "vendor") {
            // option: { venCode, venName, ... }
            return {
              ...item,
              venCode: { venCode: option.venCode, venName: option.venName },
            };
          }
          if (codeModalType === "account") {
            // option: { code, name, division, ... }
            return {
              ...item,
              actCode: { actCode: option.code, actName: option.name },
            };
          }
          if (codeModalType === "summary") {
            // option: { code, name, ... }
            return {
              ...item,
              summaryCode: {
                summaryCode: option.code,
                summaryName: option.name,
              },
            };
          }
        }
        return item;
      });
    }
    setSlipList(updatedList);
    setCodeModalOpen(false);
    setSelectedRowIndex(null);
    setCodeModalType("");
  };

  // vendorList를 실제 DB에서 가져오기 (거래처 선택 모달 + 타입 = vendor)
  useEffect(() => {
    if (codeModalOpen && codeModalType === "vendor") {
      getVendorList()
        .then((res) => {
          setVendorList(res.data);
        })
        .catch((error) => console.error(error));
    }
  }, [codeModalOpen, codeModalType]);

  // 조회 버튼 클릭 시 데이터 불러오기
  const fetchSlips = async () => {
    if (!isValidDateRange()) return;

    try {
      const data = await getFranSlipList(franCode, startDate, endDate);
      console.log("✅ 응답 데이터:", data);

      if (!data || data.length === 0) {
        setLottieAnimation("/animations/warning.json");
        setModalMessage("해당 날짜에 대한 데이터가 없습니다!");
        setIsModalOpen(true);
        return;
      }

      setSlipList(data);
    } catch (error) {
      console.error("❌ 데이터 조회 오류:", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("데이터 조회 중 오류가 발생했습니다!");
      setIsModalOpen(true);
    }
  };

  // 새 행 추가 함수
  const handleAddRow = () => {
    const newRow = {
      slipDate: "",
      venCode: { venCode: "", venName: "" },
      slipDivision: "",
      actCode: { actCode: "", actName: "" },
      summaryCode: { summaryCode: "", summaryName: "" },
      debit: "",
      credit: "",
    };

    const updatedList = { ...slipList };
    if (!updatedList.data) {
      updatedList.data = [];
    }
    updatedList.data.push(newRow);
    setSlipList(updatedList);
  };

  function formatBusinessNum(numString) {
    if (!numString) return "";
    // 1) 숫자만 추출
    const raw = numString.replace(/[^0-9]/g, "");
    // 2) 길이가 10자리면 3-2-5 형태로 하이픈 삽입
    if (raw.length === 10) {
      return (
        raw.substring(0, 3) + "-" + raw.substring(3, 5) + "-" + raw.substring(5)
      );
    }
    return numString;
  }

  useEffect(() => {
    async function fetchAccountList() {
      try {
        const response = await getAccountList(); // 응답 구조: { data: [ { actCode, actName, actDivision }, ... ] }

        // response.data를 map 돌려서, 프론트가 쓰는 구조로 매핑
        const mapped = response.data.map((item) => ({
          code: item.actCode, // 기존 actCode -> code
          name: item.actName, // 기존 actName -> name
          division: item.actDivision, // 기존 actDivision -> division
        }));

        setAccountOptions(mapped);
      } catch (error) {
        console.error(error);
      }
    }

    if (codeModalOpen && codeModalType === "account") {
      fetchAccountList();
    }
  }, [codeModalOpen, codeModalType]);

  useEffect(() => {
    async function fetchSummaryList() {
      try {
        const response = await getSummaryList();
        const mapped = response.data.map((item) => ({
          code: item.summaryCode,
          name: item.summaryName,
        }));
        setSummaryOptions(mapped);
      } catch (error) {
        console.error(error);
      }
    }

    if (codeModalOpen && codeModalType === "summary") {
      fetchSummaryList();
    }
  }, [codeModalOpen, codeModalType]);

  function showModal(animationPath, message) {
    setLottieAnimation(animationPath);
    setModalMessage(message);
    setIsModalOpen(true);

    // 상태 업데이트 후 Lottie가 정상적으로 반영되도록 강제 렌더링 대기
    setTimeout(() => {
      setLottieAnimation(animationPath);
    }, 0);
  }

  // 필수 필드 검증 함수
  const isRowValid = (row) => {
    // 필수 항목: slipDate, slipDivision, venCode.venCode, actCode.actCode, summaryCode.summaryCode
    // debit, credit은 선택적이라고 가정합니다.
    return (
      row.slipDate &&
      row.slipDivision &&
      row.venCode &&
      row.venCode.venCode &&
      row.actCode &&
      row.actCode.actCode &&
      row.summaryCode &&
      row.summaryCode.summaryCode
    );
  };

  const handleSave = async () => {
    if (!slipList.data) {
      showModal("/animations/warning.json", "저장할 데이터가 없습니다!");
      return;
    }

    const checkedRows = slipList.data.filter((item) => item.selected);
    if (checkedRows.length === 0) {
      showModal("/animations/warning.json", "저장할 행을 선택하세요!");
      return;
    }

    // 검증: 각 체크된 행에 대해 필수 필드가 모두 채워졌는지 확인
    const invalidRow = checkedRows.find((row) => !isRowValid(row));
    if (invalidRow) {
      showModal("/animations/warning.json", "모든 필드값을 입력해주세요!");
      return;
    }

    const dtoArray = checkedRows.map((row) => ({
      slipCode: row.slipCode || 0,
      // 날짜에 T가 없으면 시간 정보를 추가
      slipDate: row.slipDate.includes("T")
        ? row.slipDate
        : row.slipDate + "T00:00:00",
      venCode: row.venCode.venCode ? parseInt(row.venCode.venCode) : 0,
      slipDivision: row.slipDivision,
      actCode: row.actCode.actCode ? parseInt(row.actCode.actCode) : 0,
      summaryCode: row.summaryCode.summaryCode,
      debit: row.debit ? parseInt(row.debit) : 0,
      credit: row.credit ? parseInt(row.credit) : 0,
      franCode: parseInt(franCode),
    }));

    try {
      const result = await saveSlipList(dtoArray);
      if (result) {
        showModal("/animations/success-check.json", "저장 성공!");
        // 저장 후, 최신 데이터로 재조회하여 UI 업데이트
        await fetchSlips();
      }
    } catch (error) {
      console.error(error);
      showModal("/animations/error.json", "저장 실패!");
    }
  };

  // 전체 선택/해제 핸들러
  const handleHeaderCheckboxChange = (checked) => {
    const updatedList = { ...slipList };
    if (updatedList.data) {
      updatedList.data = updatedList.data.map((item) => ({
        ...item,
        selected: checked,
      }));
    }
    setSlipList(updatedList);
  };

  const handleCheckboxChange = (index, checked) => {
    const updatedList = { ...slipList };
    if (updatedList.data) {
      updatedList.data = updatedList.data.map((item, idx) => {
        if (idx === index) {
          return { ...item, selected: checked };
        }
        return item;
      });
    }
    setSlipList(updatedList);
  };

  return (
    <>
      <div className="page-header">
        <h3>전표 관리</h3>
      </div>

      <div className={styles.searchBox}>
        <div className={styles.dateInput}>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
          />
          ~
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
          />
        </div>
        <div className={styles.searchBtn}>
          <button onClick={fetchSlips}>조회</button>
        </div>
      </div>

      <div className={styles.boxContainer}>
        <div className={styles.addBtn}>
          <button onClick={handleAddRow}>행 추가</button>
          <button onClick={handleSave}>저장</button> {/* ← 저장 버튼 */}
          <button>삭제</button>
        </div>
        <div className={styles.billBox}>
          <button>세금 계산서 생성</button>
          <button>손익 계산서 생성</button>
        </div>
      </div>

      <table className={styles.slipTable}>
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                onChange={(e) => handleHeaderCheckboxChange(e.target.checked)}
              />
            </th>
            <th>날짜</th>
            <th>거래처 코드</th>
            <th>거래처명</th>
            <th>구분</th>
            <th>계정과목 코드</th>
            <th>계정과목명</th>
            <th>적요 코드</th>
            <th>적요명</th>
            <th>차변(출금)</th>
            <th>대변(입금)</th>
          </tr>
        </thead>
        <tbody>
          {slipList && slipList.data && slipList.data.length > 0 ? (
            slipList.data.map((slip, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    checked={slip.selected || false}
                    onChange={(e) =>
                      handleCheckboxChange(index, e.target.checked)
                    }
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={slip.slipDate ? slip.slipDate.split("T")[0] : ""}
                    placeholder="날짜 선택"
                    onChange={(e) =>
                      handleInputChange(index, "slipDate", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.venCode.venCode}
                    placeholder="거래처 코드"
                    readOnly
                    onClick={() => openCodeModal(index, "vendor")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.venCode.venName}
                    placeholder="거래처명"
                    readOnly
                  />
                </td>
                <td>
                  <select
                    value={slip.slipDivision || ""}
                    onChange={(e) =>
                      handleInputChange(index, "slipDivision", e.target.value)
                    }
                  >
                    <option value="">선택</option>
                    <option value="입금">입금</option>
                    <option value="출금">출금</option>
                    <option value="차변(출금)">차변(출금)</option>
                    <option value="대변(입금)">대변(입금)</option>
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.actCode.actCode}
                    placeholder="계정과목 코드"
                    readOnly
                    onClick={() => openCodeModal(index, "account")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.actCode.actName}
                    placeholder="계정과목명"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.summaryCode.summaryCode}
                    placeholder="적요 코드"
                    readOnly
                    onClick={() => openCodeModal(index, "summary")}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={slip.summaryCode.summaryName}
                    placeholder="적요명"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={slip.debit || ""}
                    placeholder="차변(출금)"
                    onChange={(e) =>
                      handleInputChange(index, "debit", e.target.value)
                    }
                    disabled={
                      slip.slipDivision === "입금" ||
                      slip.slipDivision === "출금" ||
                      slip.slipDivision === "대변(입금)"
                    }
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={slip.credit || ""}
                    placeholder="대변(입금)"
                    onChange={(e) =>
                      handleInputChange(index, "credit", e.target.value)
                    }
                    disabled={
                      slip.slipDivision === "입금" ||
                      slip.slipDivision === "출금" ||
                      slip.slipDivision === "차변(출금)"
                    }
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className={styles.noData}>
                <img src="/images/icons/document.png" alt="문서" />
                <h3>데이터가 없습니다.</h3>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 경고 메시지용 모달 (SModal 그대로 사용) */}
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
            key={lottieAnimation} // ✅ 애니메이션이 변경될 때마다 리렌더링
            autoplay
            loop={false}
            keepLastFrame={true}
            src={lottieAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <br />
          <p>{modalMessage}</p>
        </div>
      </SModal>

      {/* 코드 선택 모달: 거래처, 계정과목, 적요 → Modal 사용 */}
      <Modal
        isOpen={codeModalOpen}
        onClose={() => setCodeModalOpen(false)}
        buttons={[
          {
            text: "돌아가기",
            onClick: () => setCodeModalOpen(false),
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div className={styles.modalContainer}>
          <h3 className={styles.modalTitle}>
            {codeModalType === "vendor"
              ? "거래처 조회"
              : codeModalType === "account"
              ? "계정과목 조회"
              : "적요 조회"}
          </h3>

          {/* 모달 내부: codeModalType별로 다른 탭/검색/테이블 */}
          {codeModalType === "vendor" && (
            <>
              {/* 탭 + 검색 영역 */}
              <div className={styles.tabFilterContainer}>
                {/* 탭 버튼들 */}
                <div className={styles.tabButtons}>
                  {["전체", "일반", "도매", "금융", "카드"].map((tab) => (
                    <button
                      key={tab}
                      className={`${styles.tabButton} ${
                        vendorActiveTab === tab ? styles.activeTab : ""
                      }`}
                      onClick={() => setVendorActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* 검색창 */}
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="거래처명 입력"
                    className={styles.searchInput}
                    value={vendorSearchText}
                    onChange={(e) => setVendorSearchText(e.target.value)}
                  />
                </div>
              </div>

              {/* 테이블 */}
              <div className={styles.tableWrapper}>
                <table className={styles.vendorTable}>
                  <thead>
                    <tr>
                      <th>거래처 코드</th>
                      <th>거래처명</th>
                      <th>사업자 등록 번호</th>
                      <th>대표자(담당자)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredVendorList().map((option, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleCodeSelect(option)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{option.venCode}</td>
                        <td>{option.venName}</td>
                        <td>{formatBusinessNum(option.businessNum) || "-"}</td>
                        <td>{option.venOwner || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {codeModalType === "account" && (
            <>
              {/* 탭 + 검색 영역 */}
              <div className={styles.tabFilterContainer}>
                {/* 탭 버튼들 */}
                <div className={styles.tabButtons}>
                  {["전체", "자산", "부채", "자본", "수익", "비용"].map(
                    (tab) => (
                      <button
                        key={tab}
                        className={`${styles.tabButton} ${
                          accountActiveTab === tab ? styles.activeTab : ""
                        }`}
                        onClick={() => setAccountActiveTab(tab)}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>

                {/* 검색창 */}
                <div className={styles.searchBox}>
                  <input
                    type="text"
                    placeholder="계정과목명 입력"
                    className={styles.searchInput}
                    value={accountSearchText}
                    onChange={(e) => setAccountSearchText(e.target.value)}
                  />
                </div>
              </div>

              {/* 테이블 */}
              <div className={styles.tableWrapper}>
                <table className={styles.vendorTable}>
                  <thead>
                    <tr>
                      <th>계정과목 코드</th>
                      <th>계정과목명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredAccountOptions().map((option, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleCodeSelect(option)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{option.code}</td>
                        <td>{option.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {codeModalType === "summary" && (
            <>
              {/* 탭 + 검색이 필요 없다면 생략 or 간단 처리 */}
              <div className={styles.tableWrapper}>
                <table className={styles.vendorTable}>
                  <thead>
                    <tr>
                      <th>적요 코드</th>
                      <th>적요명</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryOptions.map((option, idx) => (
                      <tr
                        key={idx}
                        onClick={() => handleCodeSelect(option)}
                        style={{ cursor: "pointer" }}
                      >
                        <td>{option.code}</td>
                        <td>{option.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}

export default Slip;
