import "./common.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [showSubMenu, setShowSubMenu] = useState(false);

  return (
    <div className="sidebar">
      <Link to="/fran" className="menu-item">
        <img src="/images/icons/main.png" alt="메인화면" />
        <span>메인화면</span>
      </Link>

      {/* ✅ 재고 관리 메뉴 */}
      <div
        className="menu-item has-submenu"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <img src="/images/icons/inven.png" alt="재고 관리" />
        <span>재고 관리</span>

        {/* ✅ 재고관리 서브메뉴 */}
        {showSubMenu && (
          <div className="submenu">
            <Link to="/fran/inventory">재고 목록</Link>
            <Link to="/fran/fran-inventory">가맹점별 재고현황</Link>
            <Link to="/fran/orders">발주 관리</Link>
          </div>
        )}
      </div>

      <Link to="/fran/menus" className="menu-item">
        <img src="/images/icons/coffee.png" alt="메뉴 관리" />
        <span>메뉴 관리</span>
      </Link>

      {/* ✅ 회계관리 메뉴 */}
      <div
        className="menu-item has-submenu"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <img src="/images/icons/slip.png" alt="회계 관리" />
        <span>회계 관리</span>

        {/* ✅ 회계관리 서브메뉴 */}
        {showSubMenu && (
          <div className="submenu">
            <Link to="/fran/slip">전표 관리</Link>
            <Link to="/fran/duty">세금 계산서</Link>
            <Link to="/fran/income">손익 계산서</Link>
          </div>
        )}
      </div>

      <Link to="/fran/complain" className="menu-item">
        <img src="/images/icons/complain.png" alt="컴플레인" />
        <span>컴플레인</span>
      </Link>

      {/* ✅ 직원 관리 메뉴 */}
      <div
        className="menu-item has-submenu"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <img src="/images/icons/people.png" alt="직원 관리" />
        <span>직원 관리</span>

        {/* ✅ 직원 관리 서브메뉴 */}
        {showSubMenu && (
          <div className="submenu">
            <Link to="/fran/employee">직원 목록</Link>
            <Link to="/fran/schedule">스케줄 조회</Link>
            <Link to="/fran/dayoff">휴가 신청</Link>
          </div>
        )}
      </div>

      <Link to="/fran/notice" className="menu-item">
        <img src="/images/icons/notice.png" alt="공지사항" />
        <span>공지사항</span>
      </Link>
      <Link to="/fran/chat" className="menu-item">
        <img src="/images/icons/chat.png" alt="채팅" />
        <span>채팅</span>
      </Link>
      <Link to="/fran/barista-note" className="menu-item">
        <img src="/images/icons/note.png" alt="바리스타 노트" />
        <span>바리스타 노트</span>
      </Link>
      <Link to="/fran/stats" className="menu-item">
        <img src="/images/icons/graph.png" alt="통계" />
        <span>통계</span>
      </Link>
    </div>
  );
}

export default Sidebar;
