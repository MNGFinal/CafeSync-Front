import React, { useEffect, useState } from "react";
import axios from "axios";
import StatChart from "./StatChart.js";


const TodaySalesChart = () => {
    const [todaySalesData, setTodaySalesData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hq/today-sales?today=2025-03-06")
            .then(response => {
                const formattedData = response.data.map(store => ({
                    label: store.franName,
                    value: store.todaySales
                }));
                setTodaySalesData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching today's sales:", error);
            });
    }, []);

    return <StatChart title="가맹점 오늘의 매출 순위" data={todaySalesData} />;
};

export default TodaySalesChart;
