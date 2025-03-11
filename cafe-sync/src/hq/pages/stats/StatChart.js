import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";
import styles from "./stat.module.css";

// Chart.js 요소 등록
Chart.register(ArcElement, Tooltip, Legend);

const StatChart = ({ title, data, type }) => {
    console.log(`📌 [${title}] 데이터 확인:`, data);

    const chartData = {
        labels: data.map(item => (type === "menu" ? item.menuName : item.franName)),  // ✅ 데이터 타입에 따라 다르게 매핑
        datasets: [
            {
                data: data.map(item => (type === "menu" ? item.sales : item.todaySales)),  // ✅ 메뉴는 sales, 가맹점은 todaySales 사용
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"
                ],
                hoverBackgroundColor: [
                    "#FF4D6D", "#2D93CA", "#FFC34D", "#3B9A9C", "#7E5AC6"
                ]
            }
        ]
    };

    if (!data || data.length === 0) {
        return <p>📌 데이터를 불러오는 중...</p>;
    }

    return (
        <div className={styles.container}>
            <h3>{title}</h3>
            <Doughnut data={chartData} options={{ plugins: { legend: { display: true, position: "bottom" } } }} />
        </div>
    );
};

export default StatChart;
