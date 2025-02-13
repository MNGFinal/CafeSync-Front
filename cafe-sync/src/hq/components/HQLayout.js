import Header from "./Header";
import Sidebar from "./Sidebar";
import { Outlet, useLocation } from "react-router-dom";

function HQLayout() {

  const location = useLocation();

  // /hq(메인 페이지)일 경우 className 'grid-layout'로 설정
  const isMainPage = location.pathname === "/hq";
  const contentClass = isMainPage ? "hq-grid-layout" : "content"

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

export default HQLayout;
