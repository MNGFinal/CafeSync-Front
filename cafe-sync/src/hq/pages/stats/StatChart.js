import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Chart.js 요소 등록
Chart.register(ArcElement, Tooltip, Legend);

const StatChart = ({ title, data }) => {
    console.log("데이타에 뭐들어있니", data)
    const chartData = {

        labels: data.map(item => item.label),  // ✅ 메뉴 이름 추가


        datasets: [
            {
                data: data.map(item => item.value),
                backgroundColor: [
                    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"
                ],
                hoverBackgroundColor: [
                    "#FF4D6D", "#2D93CA", "#FFC34D", "#3B9A9C", "#7E5AC6"
                ]
            }
        ]
    };

    const chartOptions = {
        plugins: {
            legend: {
                display: true,  // ✅ 차트에 범례(메뉴명) 표시
                position: "bottom"
            },
            tooltip: {
                enabled: true,  // ✅ 마우스를 올리면 상세정보 표시
            }
        }
    };

    return (
        <div className="chart-container">
            <h3>{title}</h3>
            <Doughnut data={chartData} options={chartOptions} />
        </div>
    );
};

export default StatChart;
