import { Link } from "react-router-dom";
import st from "./Main.module.css";

function Main() {
  return (
    <>
      <div className={`noticeSection ${st.sec}`}>
        <Link to="/fran/notice">공지사항</Link>
        <hr/>
      </div>
      <div className={`scheduleSection ${st.sec}`}>
        <Link to="/fran/notice">근무자 스케줄</Link>
        <hr/>
      </div>
      <div className={`inventorySection ${st.sec}`}>
        <Link to="/fran/inventory">재고 부족 품목 확인</Link>
        <hr/>
      </div>
      <div className={`statsSection ${st.sec}`}>
        <Link to="/fran/stats">날짜별 매출 현황 그래프</Link>
        <hr/>
      </div>
    </>
  );
}

export default Main;
