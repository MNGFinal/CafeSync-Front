import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const accessToken = useSelector((state) => state.auth.accessToken);

  return accessToken ? <Outlet /> : <Navigate to="/" replace />; // 페이지 접근 시 토큰 유효성 검사
};

export default ProtectedRoute;
