import { Link } from "react-router-dom";
import st from "./HQMain.module.css";

function HQMain() {
  return (
    <>
      {/* <h1>본사 메인 화면</h1> */}
      <div className={`noticeSection ${st.sec}`}>
        <Link to="/hq/notice">공지사항</Link>
        <hr/>
      </div>
      <div className={`planSection ${st.sec}`}>
        <Link to="/hq/plan">이벤트 일정</Link>
        <hr/>
      </div>
      <div className={`statsSection ${st.sec}`}>
        <Link to="/hq/stats">우수 가맹점 매출 현황 그래프</Link>
        <hr/>
      </div>
    </>
  );
}

export default HQMain;
