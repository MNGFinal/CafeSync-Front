import React, { useEffect, useState } from "react";
import axios from "axios";
import StatChart from "./StatChart";

const MenuSalesChart = ({ startDate, endDate }) => {
    const [menuData, setMenuData] = useState([]);

    useEffect(() => {
        if (!startDate || !endDate) return;

        axios.get(`http://localhost:8080/api/hq/top-menus?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                const formattedData = response.data.slice(0, 5).map(menu => ({
                    label: menu.menuNameKo,
                    value: menu.sales
                }));
                console.log("📌 메뉴 판매 데이터:", formattedData);
                setMenuData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching menu sales:", error);
            });
    }, [startDate, endDate]); // ✅ startDate, endDate 변경 시 다시 API 호출

    return <StatChart title="음료 판매 순위 (Top 5)" data={menuData} />;
};

export default MenuSalesChart;
