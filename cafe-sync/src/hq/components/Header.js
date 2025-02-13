import "./HQcommon.css";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/authSlice"; // ✅ Redux에서 로그아웃 액션 가져오기
import { useNavigate } from "react-router-dom";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Redux에서 직원 이름 가져오기
  const { user } = useSelector((state) => state.auth);
  const empName = user?.employee?.empName || "직원"; // 기본값 설정

  const onLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      dispatch(logout());
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <div className="header">
      {/* 왼쪽: 로고 */}
      <img src="/images/logo/cafe-sync-logo1.png" className="logo" alt="logo" />

      {/* 가운데: 본사 직원 이름 */}
      <div className="fran-name">카페싱크(본사) - {empName}</div>

      {/* 오른쪽: 로그아웃 버튼 */}
      <button className="logout-btn" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}

export default Header;
