import "./HQcommon.css";
import { Link } from "react-router-dom";
import { useState } from "react";

function Sidebar() {
  const [showSubMenu, setShowSubMenu] = useState(false);

  return (
    <div className="sidebar">
      <Link to="/hq" className="menu-item">
        <img src="/images/icons/main.png" alt="본사 메인화면" />
        <span>메인화면</span>
      </Link>

      {/* ✅ 본사 재고 관리 메뉴 */}
      <div
        className="menu-item has-submenu"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <img src="/images/icons/inven.png" alt="재고 관리" />
        <span>재고 관리</span>

        {/* ✅ 본사 재고관리 서브메뉴 */}
        {showSubMenu && (
          <div className="submenu">
            <Link to="/hq/fran-inventory">가맹점별 재고현황</Link>
            <Link to="/hq/orders">발주신청 관리</Link>
            <Link to="/hq/vendor">공급업체 관리</Link>
          </div>
        )}
      </div>

      {/* ✅ 본사 메뉴 관리 메뉴 */}
      <div
        className="menu-item has-submenu"
        onMouseEnter={() => setShowSubMenu(true)}
        onMouseLeave={() => setShowSubMenu(false)}
      >
        <img src="/images/icons/coffee.png" alt="메뉴 관리" />
        <span>메뉴 관리</span>

        {/* ✅ 본사 메뉴 관리 서브메뉴 */}
        {showSubMenu && (
          <div className="submenu">
            <Link to="/hq/menus">메뉴 목록</Link>
            <Link to="/hq/discontinue-menus">단종 메뉴 목록</Link>
          </div>
        )}
      </div>

      {/* ✅ 본사 회계관리 메뉴 */}
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
            <Link to="/hq/slip">전표 관리</Link>
            <Link to="/hq/duty">세금 계산서</Link>
            <Link to="/hq/income">손익 계산서</Link>
          </div>
        )}
      </div>

      <Link to="/hq/plan" className="menu-item">
        <img src="/images/icons/schedule.png" alt="일정 관리" />
        <span>일정 관리</span>
      </Link>

      <Link to="/hq/mgment" className="menu-item">
        <img src="/images/icons/store.png" alt="가맹점 관리" />
        <span>가맹점 관리</span>
      </Link>

      <Link to="/hq/notice" className="menu-item">
        <img src="/images/icons/notice.png" alt="공지사항" />
        <span>공지사항</span>
      </Link>
      <Link to="/hq/chat" className="menu-item">
        <img src="/images/icons/chat.png" alt="채팅" />
        <span>채팅</span>
      </Link>
      <Link to="/hq/barista-note" className="menu-item">
        <img src="/images/icons/note.png" alt="바리스타 노트" />
        <span>바리스타 노트</span>
      </Link>
      <Link to="/hq/stats" className="menu-item">
        <img src="/images/icons/graph.png" alt="통계" />
        <span>통계</span>
      </Link>
    </div>
  );
}

export default Sidebar;
