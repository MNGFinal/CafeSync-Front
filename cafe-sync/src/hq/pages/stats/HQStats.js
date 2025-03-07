import { useSelector } from "react-redux";
import React from "react";
import MenuSalesChart from "./menuSalseChart";
import TodaySalesChart from "./todaySalesChart";
import StatChart from "./StatChart";
import StoreSales from "./StoreSales";
import MonthlySalesChart from "./MonthlySalesChart.js";

function HQStats() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  console.log("로그인된 가맹점코드", franCode)

  return (
    <>
      <div className="page-header">
        <h3>통계</h3>
      </div>

      <div className="grid-container">


        <StoreSales />
        <MenuSalesChart />
        <TodaySalesChart />
        <MonthlySalesChart />  {/* ✅ 월별 매출 차트 추가 */}
      </div>
    </>
  );
}

export default HQStats;