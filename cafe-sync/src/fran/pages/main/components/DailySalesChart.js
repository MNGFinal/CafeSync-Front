import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import SalesBarGraph from "./SalesBarGraph";

function DailySalesChart() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // ✅ 한 번만 today를 고정
  const [today] = useState(() => new Date());
  const todayStr = today.toISOString().split("T")[0];

  // 시작 날짜: 현재 연도의 3월 1일 (예: "2025-03-01")
  const currentYear = today.getFullYear();
  const startDateStr = `${currentYear}-03-01`;

  // 날짜를 "YYYY-MM-DD" 형식 문자열로 변환
  const formatDate = (date) => date.toISOString().split("T")[0];

  // ✅ 유틸 함수
  const generateDateRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // ✅ dateRange도 useMemo로 고정 (startDateStr나 today가 바뀌지 않으면 재생성 안 함)
  const dateRange = useMemo(() => {
    return generateDateRange(new Date(startDateStr), today);
  }, [startDateStr, today]);

  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!franCode) {
      console.warn("⚠️ franCode가 없습니다.");
      return;
    }

    const fetchDailySales = async () => {
      setLoading(true);
      try {
        // dateRange의 각 날짜마다 API 호출
        const promises = dateRange.map(async (date) => {
          const dateStr = formatDate(date);
          const apiUrl = `cafesync-back-production.up.railway.app/api/fran/sales/summary?franCode=${franCode}&startDate=${dateStr}&endDate=${dateStr}`;
          const response = await fetch(apiUrl, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          const data = await response.json();
          // 날짜별 매출 합계 = data.monthlySales[0].sales (가정)
          const dailyTotal =
            data.monthlySales && data.monthlySales.length > 0
              ? data.monthlySales[0].sales
              : 0;

          return { label: dateStr, sales: dailyTotal };
        });

        const results = await Promise.all(promises);
        setDailySales(results);
      } catch (error) {
        console.error("🚨 매출 데이터를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDailySales();
  }, [franCode, dateRange]); // ✅ dateRange가 바뀌지 않으면 재호출 안 됨

  return (
    <div>
      {loading ? (
        <p>데이터 로딩 중...</p>
      ) : dailySales.length > 0 ? (
        <SalesBarGraph salesData={dailySales} />
      ) : (
        <p>차트에 표시할 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export default DailySalesChart;
