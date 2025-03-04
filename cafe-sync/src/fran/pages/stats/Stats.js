import { useEffect, useState } from "react";
import styles from "./Stats.module.css"; // ✅ CSS 모듈 사용

function Stats() {
  // 매출 데이터 상태 저장
  const [salesSummary, setSalesSummary] = useState({
    today: { totalSales: 0, count: 0 },
    week: { totalSales: 0, count: 0 },
    month: { totalSales: 0, count: 0 },
    year: { totalSales: 0, count: 0 }
  });

  useEffect(() => {
    // 매출 데이터 가져오는 함수
    const fetchSalesSummary = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/fran/sales/summary`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setSalesSummary({
          today: data.today,
          week: data.week,
          month: data.month,
          year: data.year
        });
      } catch (error) {
        console.error("매출 데이터를 불러오는데 실패했습니다.", error);
      }
    };

    fetchSalesSummary();
  }, []);

  return (
    <div className={styles.statsContainer}>
      <div className={styles.pageHeader}>
        <h3>통계</h3>
      </div>

      {/* 매출 현황 카드 */}
      <div className={styles.salesSummary}>
        <div className={styles.salesCard}>
          <p>오늘</p>
          <h2 className={styles.today}>{salesSummary.today.totalSales.toLocaleString()} 원</h2>
          <span>{salesSummary.today.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <p>이번주</p>
          <h2 className={styles.week}>{salesSummary.week.totalSales.toLocaleString()} 원</h2>
          <span>{salesSummary.week.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <p>이번달</p>
          <h2 className={styles.month}>{salesSummary.month.totalSales.toLocaleString()} 원</h2>
          <span>{salesSummary.month.count}건</span>
        </div>
        <div className={styles.salesCard}>
          <p>올해</p>
          <h2 className={styles.year}>{salesSummary.year.totalSales.toLocaleString()} 원</h2>
          <span>{salesSummary.year.count}건</span>
        </div>
      </div>
    </div>
  );
}

export default Stats;
