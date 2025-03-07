import React, { useEffect, useState } from "react";
import axios from "axios";
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

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function HQDailySalesChart() {
  const [topStores, setTopStores] = useState([]);

  useEffect(() => {
    // 3월 1일 ~ 3월 17일까지 매출 합산 데이터 가져오기
    axios
      .get(
        "http://localhost:8080/api/hq/top-stores?startDate=2025-03-01&endDate=2025-03-17"
      )
      .then((response) => {
        console.log("📌 상위 10개 매장 데이터:", response.data);
        setTopStores(response.data.slice(0, 10)); // 상위 10개만 저장
      })
      .catch((error) => {
        console.error("🚨 매출 데이터를 불러오는데 실패했습니다.", error);
      });
  }, []);

  // 차트 데이터 설정
  const data = {
    labels: topStores.map((store) => store.franName), // 점포 이름
    datasets: [
      {
        label: "총 매출 (원)",
        data: topStores.map((store) => store.totalSales), // 총 매출 데이터
        backgroundColor: "rgba(75, 192, 192, 0.6)", // 막대 색상
        borderColor: "rgba(75, 192, 192, 1)", // 테두리 색상
        borderWidth: 1,
      },
    ],
  };

  // 차트 옵션 설정
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
        height: "300px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ textAlign: "center" }}>
        상위 10개 매장 매출 현황 (3월 1일 ~ 3월 17일)
      </h3>
      {topStores.length > 0 ? (
        <Bar data={data} options={options} />
      ) : (
        <p style={{ textAlign: "center" }}>차트에 표시할 데이터가 없습니다.</p>
      )}
    </div>
  );
}

export default HQDailySalesChart;
