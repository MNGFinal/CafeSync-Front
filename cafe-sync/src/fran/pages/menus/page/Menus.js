import { Outlet } from "react-router-dom";
import CategoryButtons from "./CategoryButtons";
import styles from "./Menus.module.css";
import MenuModal from "../modal/MenuModal";

function Menus() {
  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>
      <CategoryButtons /> {/* ✅ 카테고리 버튼은 항상 유지 */}
      {/* ✅ 리스트가 렌더링되는 영역 */}
      <div className={styles.contentContainer}>
        <Outlet /> {/* ✅ 버튼 클릭 시 여기가 변경됨! */}
      </div>
    </div>
  );
}

export default Menus;
