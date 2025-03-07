import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js에서 사용할 요소 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SalesBarGraph({ salesData }) {
  // salesData를 그대로 차트 데이터로 사용 (각 항목: { label, sales })
  const data = {
    labels: salesData.map((item) => item.label), // X축 라벨 (예: "2025-03-01")
    datasets: [
      {
        label: "매출 금액",
        data: salesData.map((item) => item.sales),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      y: { beginAtZero: true },
      x: { ticks: { autoSkip: false } },
    },
    barThickness: 40,
    minBarLength: 10,
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1650px",
        height: "315px",
        margin: "0 auto",
      }}
    >
      <Bar data={data} options={options} />
    </div>
  );
}

export default SalesBarGraph;
