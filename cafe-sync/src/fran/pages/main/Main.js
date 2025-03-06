import { Link } from "react-router-dom";
import ScheduleCalendar from "./components/ScheduleCalendar";
import style from "./Main.module.css";
import "../employee/styles/FullCalendar.module.css";

function Main() {

  return (
    <>
      <div className={`noticeSection ${style.sec}`}>
        <Link to="/fran/notice">공지사항</Link>
        <hr/>
      </div>
      <div className={`${style.scheduleSection} ${style.sec}`}>
        <Link to="/fran/schedule">금주 근무자 스케줄</Link>
        <hr/>
        <ScheduleCalendar/>
      </div>
      <div className={`inventorySection ${style.sec}`}>
        <Link to="/fran/inventory">재고 부족 품목 확인</Link>
        <hr/>
      </div>
      <div className={`statsSection ${style.sec}`}>
        <Link to="/fran/stats">날짜별 매출 현황 그래프</Link>
        <hr/>
      </div>
    </>
  );
}

export default Main;
