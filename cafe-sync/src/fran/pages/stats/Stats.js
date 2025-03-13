import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styles from "./Stats.module.css";
import BarChart from "./BarChart";

function Stats() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  console.log("로그인 된 가맹점 코드:", franCode);

  // ✅ 기본값: 올해 1월 1일 ~ 올해 12월 31일
  const now = new Date();
  const currentYear = now.getFullYear();
  const defaultStartDate = `${currentYear}-01-01`;
  const defaultEndDate = `${currentYear}-12-31`;

  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);

  const [salesSummary, setSalesSummary] = useState({
    today: { totalSales: 0, count: 0 },
    week: { totalSales: 0, count: 0 },
    month: { totalSales: 0, count: 0 },
    year: { totalSales: 0, count: 0 },
  });

  const [monthlySales, setMonthlySales] = useState([]);

  const fetchSalesSummary = async () => {
    if (!franCode) {
      console.warn("⚠️ franCode가 없습니다. API 요청을 생략합니다.");
      return;
    }

    let apiUrl = `https://cafesync-back-production.up.railway.app/api/fran/sales/summary?franCode=${franCode}&startDate=${startDate}&endDate=${endDate}`;

    console.log("🟢 API 요청 URL:", apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ 받은 데이터:", data);

      setSalesSummary({
        today: data.today,
        week: data.week,
        month: data.month,
        year: data.year,
      });

      setMonthlySales(data.monthlySales || []);
    } catch (error) {
      console.error("🚨 매출 데이터를 불러오는데 실패했습니다.", error);
    }
  };

  // ✅ startDate 변경 시 endDate도 유효한 범위로 조정
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    const maxEndDate = new Date(newStartDate);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // 최대 1년 뒤

    setStartDate(newStartDate);

    if (new Date(endDate) < new Date(newStartDate)) {
      setEndDate(newStartDate); // ✅ endDate가 startDate보다 과거일 경우 startDate와 동일하게 맞춤
    } else if (new Date(endDate) > maxEndDate) {
      setEndDate(maxEndDate.toISOString().split("T")[0]); // ✅ 최대 검색 기간 1년 제한
    }
  };

  // ✅ endDate 변경 시 최대 1년 제한 적용
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    const maxEndDate = new Date(startDate);
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1); // 최대 1년 뒤

    if (new Date(newEndDate) < new Date(startDate)) {
      alert("📢 종료 날짜는 시작 날짜보다 이전일 수 없습니다. 📢");
      return;
    } else if (new Date(newEndDate) > maxEndDate) {
      alert("📢 검색 기간은 최대 1년을 초과할 수 없습니다. 📢");
      return;
    }

    setEndDate(newEndDate);
  };

  useEffect(() => {
    fetchSalesSummary();
  }, [franCode]);

  return (
    <div>
      <div className="page-header">
        <h3>통계</h3>
      </div>
      <div className={styles.pageHeader}>
        <h3>매출 현황</h3>
      </div>

      {/* ✅ 매출 통계 카드 */}
      <div className={styles.salesSummary}>
        <div className={styles.salesCard}>
          <h2 className={styles.today}>
            {salesSummary.today.totalSales.toLocaleString()} 원
          </h2>
          <p>오늘</p>
          <span>{salesSummary.today.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <h2 className={styles.week}>
            {salesSummary.week.totalSales.toLocaleString()} 원
          </h2>
          <p>이번주</p>
          <span>{salesSummary.week.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <h2 className={styles.month}>
            {salesSummary.month.totalSales.toLocaleString()} 원
          </h2>
          <p>이번달</p>
          <span>{salesSummary.month.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <h2 className={styles.year}>
            {salesSummary.year.totalSales.toLocaleString()} 원
          </h2>
          <p>올해</p>
          <span>{salesSummary.year.count}건</span>
        </div>
      </div>

      {/* ✅ 차트 추가 */}
      <div>
        <h3 className={styles.salesChange}>월별 매출 변화</h3>
        {/* ✅ 기간 선택 필터 */}
        <div className={styles.dateFilter}>
          <label>기간 선택</label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
          />
          ~
          <input type="date" value={endDate} onChange={handleEndDateChange} />
          <button onClick={fetchSalesSummary}>조회</button>
        </div>
        <BarChart salesData={monthlySales} />
      </div>
    </div>
  );
}

export default Stats;
