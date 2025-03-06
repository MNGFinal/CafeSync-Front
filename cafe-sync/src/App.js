// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./home/pages/protected-route/ProtectedRoute";

/* ---------------------------------레이아웃------------------------------------ */
import LoginLayout from "./home/components/HomeLayout";
import Layout from "./fran/components/Layout";
import HQLayout from "./hq/components/HQLayout";
/* ---------------------------------------------------------------------------- */

/* ---------------------------------홈 컴포넌트--------------------------------- */
import Login from "./home/pages/login/Login";
import FindId from "./home/pages/find-id/FindId";
import FindPass from "./home/pages/find-pass/FindPass";
import FranchiseId from "./home/pages/find-id/FranchiseId";
import HQId from "./home/pages/find-id/HQId";
import CompleteId from "./home/pages/find-id/CompleteId";
import PassModify from "./home/pages/find-pass/PassModify";
/* --------------------------------------------------------------------------- */

/* ---------------------------------가맹점 컴포넌트----------------------------- */
import Main from "./fran/pages/main/Main";
import Inventory from "./fran/pages/inventory/Inventory";
import Menus from "./fran/pages/menus/page/Menus";
import Slip from "./fran/pages/slip/Slip";
import Complain from "./fran/pages/complain/Complain";
import Employee from "./fran/pages/employee/Employee";
import Chat from "./fran/pages/chat/Chat";
import Notice from "./fran/pages/notice/Notice";
import NoticeRegist from "./fran/pages/notice/NoticeRegist";
import NoticeLayout from "./fran/pages/notice/NoticeLayout";
import NoticeDetailLayout from "./fran/pages/notice/NoticeDetailLayout";
import BaristaNote from "./fran/pages/barista-note/BaristaNote";
import Stats from "./fran/pages/stats/Stats";
import FranInventory from "./fran/pages/inventory/FranInventory";
import Orders from "./fran/pages/inventory/Orders";
import Duty from "./fran/pages/slip/Duty";
import Income from "./fran/pages/slip/Income";
import Schedule from "./fran/pages/employee/Schedule";
import DayOff from "./fran/pages/employee/DayOff";
import CoffeeList from "./fran/pages/menus/itemList/CoffeeList";
import MenuStats from "./fran/pages/stats/MenuStats";
/* -------------------------------------------------------------------------- */

/* ---------------------------------본사 컴포넌트----------------------------- */
import HQMain from "./hq/pages/main/HQMain";
import HQFranInventory from "./hq/pages/inventory/HQFranInventory";
import HQVendor from "./hq/pages/inventory/HQVendor";
import HQOrders from "./hq/pages/inventory/HQOrders";
import HQMenus from "./hq/pages/menus/HQMenus";
import HQMenuList from "./hq/pages/menus/HQCoffeeList";
import HQSlip from "./hq/pages/slip/HQSlip";
import HQDuty from "./hq/pages/slip/HQDuty";
import HQIncome from "./hq/pages/slip/HQIncome";
import HQPlan from "./hq/pages/plan/HQPlan";
import HQMgment from "./hq/pages/mgment/HQMgment";
import HQNotice from "./hq/pages/notice/HQNotice";
import HQNoticeLayout from "./hq/pages/notice/HQNoticeLayout";
import HQNoticeDetailLayout from "./hq/pages/notice/HQNoticeDetailLayout";
import HQNoticeRegist from "./hq/pages/notice/HQNoticeRegist";
import HQChat from "./hq/pages/chat/HQChat";
import HQBaristaNote from "./hq/pages/barista-note/HQBaristaNote";
import HQStats from "./hq/pages/stats/HQStats";
import HQRegist from "./hq/pages/menus/HQRegist";
import HQDiscontinue from "./hq/pages/menus/HQDiscontinue";
import FranRegist from "./hq/pages/mgment/itemList/FranRegist";
/* -------------------------------------------------------------------------- */

import RegisterTest from "./test/RegisterTest";
import HQDiscontinueList from "./hq/pages/menus/HQDiscontinueList";

function App() {
  return (
    <Router>
      <Routes>
        {/* ✅ 기본 경로를 /login으로 설정 */}
        <Route path="/" element={<LoginLayout />}>
          <Route index element={<Login />} />
          <Route path="find-id" element={<FindId />} />
          <Route path="find-id/franchise" element={<FranchiseId />} />
          <Route path="find-id/hq" element={<HQId />} />
          <Route path="find-id/complete" element={<CompleteId />} />
          <Route path="find-pass" element={<FindPass />} />
          <Route path="find-pass/modify" element={<PassModify />} />
        </Route>

        {/* ✅ 보호된 가맹점 라우트 */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN", "USER"]}
              allowedJobCodes={[21, 22]}
            />
          }
        >
          <Route path="/fran" element={<Layout />}>
            <Route index element={<Main />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="fran-inventory" element={<FranInventory />} />
            <Route path="orders" element={<Orders />} />

            <Route path="menus" element={<Menus />}>
              {/* ✅ "menus/:category"에서 Outlet을 통해 컴포넌트가 렌더링됨 */}
              <Route path=":category">
                <Route index element={<CoffeeList />} />{" "}
                {/* 기본값으로 CoffeeList 표시 */}
                <Route path="coffee" element={<CoffeeList />} />
              </Route>
            </Route>

            <Route path="slip" element={<Slip />} />
            <Route path="duty" element={<Duty />} />
            <Route path="income" element={<Income />} />
            <Route path="complain" element={<Complain />} />
            <Route path="employee" element={<Employee />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="dayoff" element={<DayOff />} />
            <Route path="notice" element={<Notice />} />
            <Route path="/fran/notice" element={<NoticeLayout />} />
            <Route
              path="/fran/notice/:noticeCode"
              element={<NoticeDetailLayout />}
            />
            <Route path="notice/notice-regist" element={<NoticeRegist />} />
            <Route path="chat" element={<Chat />} />
            <Route path="barista-note" element={<BaristaNote />} />
            <Route path="stats" element={<Stats />} />
            <Route path="/fran/menu-stats" element={<MenuStats />} />
          </Route>
        </Route>

        {/* ✅ 보호된 본사 라우트 */}
        <Route
          element={
            <ProtectedRoute
              allowedRoles={["ADMIN"]}
              allowedJobCodes={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]}
            />
          }
        >
          <Route path="/hq" element={<HQLayout />}>
            <Route index element={<HQMain />} />
            <Route path="fran-inventory" element={<HQFranInventory />} />
            <Route path="vendor" element={<HQVendor />} />
            <Route path="orders" element={<HQOrders />} />

            {/* 기존 menus 관련 라우트 */}
            <Route path="menus" element={<HQMenus />}>
              <Route index element={<HQMenuList />} />
              <Route path="regist" element={<HQRegist />} />
            </Route>

            <Route path="discontinue-menus" element={<HQDiscontinue />}>
              <Route index element={<HQDiscontinueList />} />
            </Route>

            <Route path="slip" element={<HQSlip />} />
            <Route path="duty" element={<HQDuty />} />
            <Route path="income" element={<HQIncome />} />
            <Route path="plan" element={<HQPlan />} />
            <Route path="mgment" element={<HQMgment />} />
            <Route path="mgment/regist" element={<FranRegist />} />
            <Route path="notice" element={<HQNotice />} />
            <Route path="notice" element={<HQNoticeLayout />} />
            <Route
              path="notice/:noticeCode"
              element={<HQNoticeDetailLayout />}
            />
            <Route path="notice/notice-regist" element={<HQNoticeRegist />} />

            <Route path="chat" element={<HQChat />} />
            <Route path="barista-note" element={<HQBaristaNote />} />
            <Route path="stats" element={<HQStats />} />
          </Route>
        </Route>

        {/* ✅ 테스트 페이지 라우트 추가 */}
        <Route path="/register" element={<RegisterTest />} />
      </Routes>
    </Router>
  );
}

export default App;
