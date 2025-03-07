import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";


// Chart.js 요소 등록
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const MonthlySalesChart = () => {
    const [monthlyData, setMonthlyData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hq/monthly-sales?startDate=2025-01-01&endDate=2025-12-31")
            .then(response => {
                console.log("📌 월별 매출 데이터:", response.data); // ✅ 디버깅 로그
                const formattedData = response.data.map(item => ({
                    month: item.month,  // ✅ "YYYY-MM" 형식
                    totalSales: item.totalSales
                }));
                setMonthlyData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching monthly sales:", error);
            });
    }, []);

    const chartData = {
        labels: monthlyData.map(item => item.month),  // ✅ 월 정보 추가
        datasets: [
            {
                label: "월별 매출액",
                data: monthlyData.map(item => item.totalSales),
                borderColor: "#36A2EB",
                backgroundColor: "rgba(54, 162, 235, 0.5)",
                fill: true
            }
        ]
    };

    return (
        <div className="chart-container">
            <h3>월별 매출 추이</h3>
            <Line data={chartData} />
        </div>
    );
};

export default MonthlySalesChart;
