import React, { useEffect, useState } from "react";
import axios from "axios";
import StatChart from "./StatChart";

const MenuSalesChart = () => {
    const [menuData, setMenuData] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hq/top-menus?startDate=2025-01-01&endDate=2025-12-31")
            .then(response => {

                const formattedData = response.data
                    .slice(0, 5)  // ✅ Top 5만 표시
                    .map(menu => ({
                        
                        label: menu.menuNameKo,  // ✅ 메뉴 이름 추가
                        value: menu.sales
                    }));
                console.log("📌 메뉴 판매 데이터:", formattedData);  // ✅ 디버깅 로그 추가
                setMenuData(formattedData);
            })
            .catch(error => {
                console.error("Error fetching menu sales:", error);
            });
    }, []);

    return <StatChart title="음료 판매 순위 (Top 5)" data={menuData} />;
};

export default MenuSalesChart;
