import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // ✅ Redux에서 가맹점 코드 가져오기
import styles from "./MenuStats.module.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// ✅ Chart.js 요소 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MenuStats() {
    // ✅ Redux에서 가맹점 코드 가져오기
    const franCode = useSelector((state) => state.auth?.user?.franchise?.franCode ?? null);

    // ✅ 기본 날짜 설정 (올해 전체)
    const defaultStartDate = "2025-01-01";
    const defaultEndDate = "2025-12-31";

    // ✅ 상태 변수 관리
    const [startDate, setStartDate] = useState(defaultStartDate);
    const [endDate, setEndDate] = useState(defaultEndDate);
    const [menuSales, setMenuSales] = useState([]); // ✅ 메뉴별 판매 데이터
    const [loading, setLoading] = useState(false); // ✅ 로딩 상태

    // ✅ 메뉴 판매 데이터를 가져오는 함수
    const fetchMenuSales = async () => {
        if (!franCode) {
            console.warn("⚠️ franCode가 없습니다. API 요청을 생략합니다.");
            return;
        }

        setLoading(true); // ✅ 로딩 시작
        try {
            const response = await fetch(
                `http://localhost:8080/api/fran/sales/menuStat?franCode=${franCode}&startDate=${startDate}&endDate=${endDate}`
            );
            if (!response.ok) throw new Error("데이터 로드 실패");

            const data = await response.json();
            console.log("✅ 받은 데이터:", data);

            // ✅ 응답 데이터가 배열인지 확인 후 설정
            setMenuSales(Array.isArray(data) ? data : (data.menuSales ?? []));
        } catch (error) {
            console.error("🚨 메뉴별 판매 데이터를 불러오는데 실패했습니다.", error);
            setMenuSales([]); // ✅ 실패 시 빈 배열로 설정
        }
        setLoading(false); // ✅ 로딩 종료
    };

    // ✅ 날짜 변경 시 API 요청
    useEffect(() => {
        fetchMenuSales();
    }, [franCode, startDate, endDate]);

    // ✅ 조회 버튼 클릭 시 데이터 새로고침
    const handleSearch = () => {
        fetchMenuSales();
    };

    // ✅ 데이터 정렬 및 필터링
    const sortedData = [...menuSales].sort((a, b) => b.sales - a.sales);
    const top10 = sortedData.slice(0, 10);
    const bottom10 = sortedData.slice(-10);

    // ✅ 차트 데이터 생성 함수
    const createChartData = (data, color) => ({
        labels: data.map((item) => item.menuName),
        datasets: [
            {
                label: "판매량 (잔)",
                data: data.map((item) => Number(item.sales) || 0), // ✅ sales 값 숫자로 변환
                backgroundColor: color,
                borderColor: color,
                borderWidth: 1,
            },
        ],
    });

    // ✅ 차트 옵션
    const chartOptions = {
        indexAxis: "y", // ✅ 가로형 차트 설정
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            title: { display: false },
        },
        scales: {
            x: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1, // ✅ X축 단위를 1로 설정
                },
            },
        },
    };

    return (
        <>
            <div className="page-header">
                <h3>통계</h3>
            </div>
            <div className={styles.pageHeader}>
                <h3>메뉴별 판매 현황</h3>
            </div>

            {/* ✅ 기간 선택 필터 */}
            <div className={styles.dateFilter}>
                <label>기간 선택</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                ~
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                <button onClick={handleSearch} disabled={loading}>
                    {loading ? "조회 중..." : "조회"}
                </button>
            </div>

            {/* ✅ 차트 영역 */}
            <div className={styles.chartsContainer}>
                {loading ? (
                    <p>📌 데이터를 불러오는 중...</p>
                ) : menuSales.length > 0 ? (
                    <>
                        <div className={styles.chart}>
                            <h4>Top 10 판매순위</h4>
                            <Bar data={createChartData(top10, "rgba(255, 99, 132, 0.8)")} options={chartOptions} />
                        </div>
                        <div className={styles.chart}>
                            <h4>Bottom 10 판매순위</h4>
                            <Bar data={createChartData(bottom10, "rgba(54, 162, 235, 0.8)")} options={chartOptions} />
                        </div>
                    </>
                ) : (
                    <p>📌 데이터가 없습니다.</p>
                )}
            </div>
        </>
    );
}

export default MenuStats;
