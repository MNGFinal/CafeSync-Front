import React, { useEffect, useState } from "react";
import axios from "axios";
import StatChart from "./StatChart";

const TodaySalesChart = ({ searchTrigger }) => {
    const [todaySalesData, setTodaySalesData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hq/today-sales?today=2025-03-06")
            .then(response => {
                console.log("📌 가맹점 매출 데이터:", response.data);
                setTodaySalesData(response.data);
            })
            .catch(error => console.error("Error fetching today's sales:", error));
    }, [searchTrigger]); // ✅ 조회 버튼을 눌렀을 때만 API 호출

    return <StatChart title="가맹점 오늘의 매출 순위" data={todaySalesData} type="store" />;
};

export default TodaySalesChart;
