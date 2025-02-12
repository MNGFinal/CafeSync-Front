import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

function Layout() {

  const location = useLocation();

  // /fran(메인 페이지)일 경우 className 'grid-layout'로 설정
  const isMainPage = location.pathname === "/fran";
  const contentClass = isMainPage ? "grid-layout" : "content"

  return (
    <>
      <Header />
      <div className="middle">
        <Sidebar />
        <div className={contentClass}>
          <Outlet />
        </div>
      </div>
    </>
  );
}

export default Layout;
