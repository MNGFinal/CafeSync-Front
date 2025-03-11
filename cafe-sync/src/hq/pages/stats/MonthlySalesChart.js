import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend } from "chart.js";

// Chart.js 요소 등록
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

const MonthlySalesChart = ({ startDate = "2025-01-01", endDate = "2025-12-31" }) => {
    const [monthlyData, setMonthlyData] = useState([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);  // ✅ 데이터 로드 여부 추가

    useEffect(() => {
        axios.get(`http://localhost:8080/api/hq/monthly-sales?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                console.log("📌 월별 매출 데이터:", response.data);

                if (response.data.length === 0) {
                    setIsDataLoaded(false);  // ✅ 데이터가 없으면 그래프 숨김
                } else {
                    const formattedData = response.data.map(item => ({
                        month: item.month,
                        totalSales: item.totalSales
                    }));
                    setMonthlyData(formattedData);
                    setIsDataLoaded(true);  // ✅ 데이터가 있으면 그래프 표시
                }
            })
            .catch(error => {
                console.error("Error fetching monthly sales:", error);
                setIsDataLoaded(false);  // ✅ 에러 발생 시 그래프 숨김
            });
    }, [startDate, endDate]);

    // ✅ 데이터가 없을 경우 그래프를 숨김
    if (!isDataLoaded) {
        return null;  // 🚀 그래프를 완전히 숨김
    }

    const chartData = {
        labels: monthlyData.map(item => item.month),
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
