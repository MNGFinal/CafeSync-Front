import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function HQLayout() {
  const [list, setList] = useState([]);

  async function fetchMenus() {
    try {
      const response = await fetch(
        "https://cafesync-back-production.up.railway.app/api/fran/menus"
      );
      const res = await response.json();
      setList(res.data || []);
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  return (
    <div>
      <h2>HQ 메뉴 관리</h2>
      {/* ✅ Outlet을 통해 `context` 전달 */}
      <Outlet context={{ list, fetchMenus }} />
    </div>
  );
}

export default HQLayout;
