import { useSelector } from "react-redux";
import React, { useState } from "react";
import MenuSalesChart from "./MenuSalesChart";
import StoreSales from "./StoreSales";
import styles from "./stat.module.css"; // ✅ CSS 모듈 적용
import TodaySalesChart2 from "./TodaySalesChart2";

function HQStats() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  console.log("로그인된 가맹점코드", franCode);

  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");
  const [searchTrigger, setSearchTrigger] = useState(false);

  // ✅ 날짜 변경 핸들러
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // ✅ 조회 버튼 클릭 시 API 요청 실행
  const handleSearch = () => {
    console.log(`📌 검색 기간: ${startDate} ~ ${endDate}`);
    setSearchTrigger((prev) => !prev); // ✅ 조회 버튼을 눌렀을 때만 값 변경
  };

  return (
    <>
      <div className={styles.pageHeader}>
        <h3>통계</h3>
      </div>
      <div className={styles.pageHeader2}>
        <h3>가맹점별 매출 현황</h3>
      </div>

      {/* ✅ 날짜 필터 스타일 적용 */}
      <div className={styles.dateFilter}>
        <label className={styles.label2}>기간 선택</label>
        <input type="date" value={startDate} onChange={handleStartDateChange} />
        ~
        <input type="date" value={endDate} onChange={handleEndDateChange} />
        <button onClick={handleSearch} className={styles.searchButton}>
          조회
        </button>
      </div>

      <div className={styles.gridContainer}>
        <div>
          <div>
            {/* ✅ StoreSales에 searchTrigger 전달 */}
            <StoreSales
              startDate={startDate}
              endDate={endDate}
              searchTrigger={searchTrigger}
            />
            <div className={styles.statContainer}>
              <MenuSalesChart
                startDate={startDate}
                endDate={endDate}
                searchTrigger={searchTrigger}
              />
              <TodaySalesChart2 searchTrigger={searchTrigger} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HQStats;
