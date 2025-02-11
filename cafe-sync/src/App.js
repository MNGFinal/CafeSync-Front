import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* ---------------------------------레이아웃------------------------------------ */
import LoginLayout from "./home/components/HomeLayout"; // 홈 레이아웃
import Layout from "./fran/components/Layout"; // 가맹점 레이아웃
import HQLayout from "./hq/components/HQLayout"; // 본사 레이아웃
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
import Menus from "./fran/pages/menus/Menus";
import Slip from "./fran/pages/slip/Slip";
import Complain from "./fran/pages/complain/Complain";
import Employee from "./fran/pages/employee/Employee";
import Chat from "./fran/pages/chat/Chat";
import Notice from "./fran/pages/notice/Notice";
import NoticeRegist from "./fran/pages/notice/NoticeRegist";
import BaristaNote from "./fran/pages/barista-note/BaristaNote";
import Stats from "./fran/pages/stats/Stats";
import FranInventory from "./fran/pages/inventory/FranInventory";
import Orders from "./fran/pages/inventory/Orders";
import Duty from "./fran/pages/slip/Duty";
import Income from "./fran/pages/slip/Income";
import Schedule from "./fran/pages/employee/Schedule";
import DayOff from "./fran/pages/employee/DayOff";
/* -------------------------------------------------------------------------- */

/* ---------------------------------본사 컴포넌트----------------------------- */
import HQMain from "./hq/pages/main/HQMain";
import HQFranInventory from "./hq/pages/inventory/HQFranInventory";
import HQVendor from "./hq/pages/inventory/HQVendor";
import HQOrders from "./hq/pages/inventory/HQOrders";
import HQMenus from "./hq/pages/menus/HQMenus";
import HQSlip from "./hq/pages/slip/HQSlip";
import HQDuty from "./hq/pages/slip/HQDuty";
import HQIncome from "./hq/pages/slip/HQIncome";
import HQPlan from "./hq/pages/plan/HQPlan";
import HQMgment from "./hq/pages/mgment/HQMgment";
import HQNotice from "./hq/pages/notice/HQNotice";
import HQChat from "./hq/pages/chat/HQChat";
import HQBaristaNote from "./hq/pages/barista-note/HQBaristaNote";
import HQStats from "./hq/pages/stats/HQStats";
import HQRegist from "./hq/pages/menus/HQRegist";
import HQDiscontinue from "./hq/pages/menus/HQDiscontinue";


/* -------------------------------------------------------------------------- */

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

        {/* ✅ 가맹점 라우트 */}
        <Route path="/fran" element={<Layout />}>
          <Route index element={<Main />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="fran-inventory" element={<FranInventory />} />
          <Route path="orders" element={<Orders />} />
          <Route path="menus" element={<Menus />} />
          <Route path="slip" element={<Slip />} />
          <Route path="duty" element={<Duty />} />
          <Route path="income" element={<Income />} />
          <Route path="complain" element={<Complain />} />
          <Route path="employee" element={<Employee />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="dayoff" element={<DayOff />} />
          <Route path="notice" element={<Notice />} />
          <Route path="notice/regist" element={<NoticeRegist/>} />
          <Route path="chat" element={<Chat />} />
          <Route path="barista-note" element={<BaristaNote />} />
          <Route path="stats" element={<Stats />} />
        </Route>

        {/* ✅ 본사 라우트 */}
        <Route path="/hq" element={<HQLayout />}>
          <Route index element={<HQMain />} />
          <Route path="fran-inventory" element={<HQFranInventory />} />
          <Route path="vendor" element={<HQVendor />} />
          <Route path="orders" element={<HQOrders />} />
          <Route path="menus" element={<HQMenus />} />
          <Route path="menus/regist" element={<HQRegist />} />
          <Route path="discontinue-menus" element={<HQDiscontinue />} />
          <Route path="slip" element={<HQSlip />} />
          <Route path="duty" element={<HQDuty />} />
          <Route path="income" element={<HQIncome />} />
          <Route path="plan" element={<HQPlan />} />
          <Route path="mgment" element={<HQMgment />} />
          <Route path="notice" element={<HQNotice />} />
          <Route path="chat" element={<HQChat />} />
          <Route path="barista-note" element={<HQBaristaNote />} />
          <Route path="stats" element={<HQStats />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
