import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";

// 🔹 Chart.js에서 사용할 요소들 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 🔹 빈 달(month) 자동 추가 함수 (✅ 검색 연도 기반으로 동적 생성)
const generateEmptyMonths = (salesData) => {
    if (!salesData || salesData.length === 0) return [];

    // 🔹 검색된 데이터의 최소 연도와 최대 연도 찾기
    const years = salesData.map((item) => parseInt(item.month.split("-")[0]));
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // 🔹 검색된 연도 범위에 맞게 모든 월 데이터 생성
    let months = [];
    for (let year = minYear; year <= maxYear; year++) {
        for (let month = 1; month <= 12; month++) {
            const monthStr = `${year}-${String(month).padStart(2, "0")}`;
            months.push(monthStr);
        }
    }

    // 🔹 기존 데이터가 없는 월은 매출 0으로 추가
    return months.map((month) => {
        const existing = salesData.find((data) => data.month === month);
        return existing ? existing : { month, sales: 0 };
    });
};

function BarChart({ salesData }) {
    const formattedData = generateEmptyMonths(salesData); // ✅ 동적으로 데이터 변환

    // 🔹 차트에 들어갈 데이터 구성
    const data = {
        labels: formattedData.map((item) => item.month), // X축 라벨 (YYYY-MM)
        datasets: [
            {
                label: "매출 금액",
                data: formattedData.map((item) => item.sales), // 매출 데이터
                backgroundColor: "rgba(75, 192, 192, 0.6)", // 막대 색상
                borderColor: "rgba(75, 192, 192, 1)", // 테두리 색상
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false, // ✅ 크기 조정 가능하도록 설정
        plugins: {
            legend: { position: "top" },
            title: { display: true },
        },
        scales: {
            y: { beginAtZero: true },
            x: {
                ticks: { autoSkip: false }, // ✅ X축 레이블 자동 스킵 방지
                grid: { display: false },
            },
        },
        barThickness: 40, // ✅ 막대 최소 두께
        minBarLength: 10, // ✅ 데이터가 적어도 최소 길이 유지
    };

    return (
        <div style={{ width: "100%", maxWidth: "1650px", height: "450px", margin: "0 auto" }}>
            <Bar data={data} options={options} />
        </div>
    );
}

export default BarChart;
