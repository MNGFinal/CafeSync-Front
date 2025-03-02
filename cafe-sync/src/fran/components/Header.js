import "./common.css";
import { useDispatch, useSelector } from "react-redux"; // ✅ Redux 사용 추가
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Redux에서 가맹점 이름, 직원 이름, 직급 가져오기
  const { user } = useSelector((state) => state.auth);
  const franName = user?.franchise?.franName || "알 수 없음";
  const name = user?.employee?.empName || "알 수 없음";
  const jobName = user?.job?.jobName || "알 수 없음";

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

      {/* 가운데: 가맹점 + 직원 이름 + 직급 표시 */}
      <div className="fran-name">
        {franName} - {name} {jobName}
      </div>

      {/* 오른쪽: 로그아웃 */}
      <button className="logout-btn" onClick={onLogout}>
        로그아웃
      </button>
    </div>
  );
}

export default Header;
