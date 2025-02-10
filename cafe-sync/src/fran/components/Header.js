import "./common.css";

function Header() {
  return (
    <div className="header">
      {/* 왼쪽: 로고 */}
      <img src="/images/logo/cafe-sync-logo1.png" className="logo" />

      {/* 가운데: 지점명 */}
      <div className="fran-name">카페싱크 - OOO점</div>

      {/* 오른쪽: 로그아웃 */}
      <button className="logout-btn">로그아웃</button>
    </div>
  );
}

export default Header;
