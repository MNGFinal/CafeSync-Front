import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { callNoticesAPI } from "../../../apis/notice/noticeApi";
import { RESET_NOTICE_DETAIL } from "../../../modules/NoticeModule";
import ScheduleCalendar from "./components/ScheduleCalendar";
import NoticeList from "./components/NoticeList";
import InventoryShortageList from "./components/InventoryShortageList"; // 🔹 만든 컴포넌트
import style from "./Main.module.css";
import DailySalesChart from "./components/DailySalesChart";

function Main() {
  const dispatch = useDispatch();
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    dispatch({ type: RESET_NOTICE_DETAIL });

    dispatch(callNoticesAPI()).then((data) => {
      console.log("📌 공지사항 데이터:", data);
      if (Array.isArray(data) && data.length > 0) {
        setAllData(data);
      } else {
        console.warn("⚠️ 공지사항 데이터가 없습니다.");
      }
    });
  }, [dispatch]);

  return (
    <>
      <div className={`noticeSection ${style.sec}`}>
        <Link to="/fran/notice" className={style.title}>
          공지사항
        </Link>
        <hr />
        <NoticeList allData={allData} />
      </div>

      <div className={`${style.scheduleSection} ${style.sec}`}>
        <Link to="/fran/schedule" className={style.title}>
          금주 근무자 스케줄
        </Link>
        <hr />
        <ScheduleCalendar />
      </div>

      <div className={`inventorySection ${style.sec}`}>
        <Link to="/fran/inventory" className={style.title}>
          재고 부족 품목 확인
        </Link>
        <hr />
        {/* 🔹 여기서 재고 부족 품목 표시 */}
        <InventoryShortageList />
      </div>

      <div className={`statsSection ${style.sec}`}>
        <Link to="/fran/stats" className={style.title}>
          날짜별 매출 현황 그래프
        </Link>
        <hr />
        <DailySalesChart />
      </div>
    </>
  );
}

export default Main;
