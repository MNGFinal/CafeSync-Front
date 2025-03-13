import React, { useEffect, useState } from "react";
import axios from "axios";
import StatChart from "./StatChart";

const MenuSalesChart = ({ startDate, endDate, searchTrigger }) => {
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    if (!startDate || !endDate) return;

    axios
      .get(
        `cafesync-back-production.up.railway.app/api/hq/top-menus?startDate=${startDate}&endDate=${endDate}`
      )
      .then((response) => {
        console.log("📌 메뉴 판매 데이터:", response.data);
        setMenuData(response.data.slice(0, 5));
      })
      .catch((error) =>
        console.error("❌ [ERROR] 데이터 불러오기 실패:", error)
      );
  }, [searchTrigger]); // ✅ 조회 버튼을 눌렀을 때만 API 호출

  return (
    <StatChart title="음료 판매 순위 (Top 5)" data={menuData} type="menu" />
  );
};

export default MenuSalesChart;
