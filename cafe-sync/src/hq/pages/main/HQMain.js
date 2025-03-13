import { Link } from "react-router-dom";
import st from "./HQMain.module.css";
import { useDispatch } from "react-redux";
import { callNoticesAPI } from "../../../apis/notice/noticeApi";
import { RESET_NOTICE_DETAIL } from "../../../modules/NoticeModule";
import HQNoticeList from "./components/HQNoticeList";
import HQDailySalesChart from "./components/HQDailySalesChart";
import HQPromotion from "./components/HQPromotion";
import React, { useEffect, useState } from "react";

function HQMain() {
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
      {/* <h1>본사 메인 화면</h1> */}
      <div className={`noticeSection ${st.sec}`}>
        <Link to="/hq/notice" className={st.title}>
          공지사항
        </Link>
        <hr />
        <HQNoticeList allData={allData} />
      </div>
      <div className={`planSection ${st.sec}`}>
        <Link to="/hq/plan" className={st.title}>
          이벤트 일정
        </Link>
        <hr />
        <HQPromotion />
      </div>
      <div className={`statsSection ${st.sec}`}>
        <Link to="/hq/stats" className={st.title}>
          우수 가맹점 매출 현황 그래프
        </Link>
        <hr />
        <HQDailySalesChart />
      </div>
    </>
  );
}

export default HQMain;
