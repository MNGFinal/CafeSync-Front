import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const location = useLocation();



  // ✅ 로그인 안 한 경우 → 로그인 페이지로 이동
  if (!accessToken || !user) {
    console.warn("🚨 인증되지 않은 사용자 → 로그인 페이지로 이동");
    return <Navigate to="/" replace />;
  }

  const userAuthority = user.authority;
  const userJobCode = user.job?.jobCode;

  // ✅ 가맹점 접근 가능 여부 확인
  const isFranchiseAllowed =
    (userAuthority === "ADMIN" || userAuthority === "USER") &&
    [21, 22].includes(userJobCode);

  // ✅ 본사 접근 가능 여부 확인
  const isHQAllowed =
    (userAuthority === "ADMIN" || userAuthority === "USER") &&
    userJobCode >= 1 &&
    userJobCode <= 11;

  if (location.pathname.startsWith("/fran") && !isFranchiseAllowed) {
    console.warn(
      `🚨 가맹점 접근 제한: authority=${userAuthority}, jobCode=${userJobCode}`
    );
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  if (location.pathname.startsWith("/hq") && !isHQAllowed) {
    console.warn(
      `🚨 본사 접근 제한: authority=${userAuthority}, jobCode=${userJobCode}`
    );
    alert("접근 권한이 없습니다.");
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
