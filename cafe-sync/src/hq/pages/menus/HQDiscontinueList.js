import { useEffect, useState } from "react";
import styles from "../../../fran/pages/menus/itemList/MenuList.module.css";
import HQMenuModal from "../../../hq/pages/menus/HQMenuModal";
import { useOutletContext } from "react-router-dom";

function HQDiscontinueList() {
  const { list = [], fetchMenus } = useOutletContext();
  console.log("useOutletContext()에서 받은 list:", list);

  const [renderList, setRenderList] = useState([]);

  useEffect(() => {
    // 이미 단종 메뉴만 list에 들어있지만, 추가 필터링 가능
    const filteredList = list.filter((menu) => menu.disconStatus === true);
    console.log("필터링된 renderList:", filteredList);
    setRenderList(filteredList);
  }, [list]);

  const [selectedMenu, setSelectedMenu] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  };

  return (
    <div className={styles.menuGrid}>
      {renderList.length > 0 ? (
        renderList.map((menu) => (
          <div
            key={menu.menuCode}
            className={styles.menuCard}
            onClick={() => handleMenuClick(menu)}
          >
            <div className={styles.imageContainer}>
              {/* 항상 메뉴 이미지를 렌더링 */}
              <img
                src={menu.menuImage}
                alt={menu.menuNameKo}
                className={styles.menuImage}
              />
              {/* 단종 상태이면 sold-out 오버레이 추가 */}
              {menu.disconStatus && (
                <img
                  src="/sold-out.png"
                  alt="Sold Out"
                  className={styles.soldOutOverlay}
                />
              )}
            </div>
            <h3 className={styles.menuName}>{menu.menuNameKo}</h3>
            <p className={styles.menuNameEN}>{menu.menuNameEN}</p>
          </div>
        ))
      ) : (
        <p className={styles.noResult}>단종된 메뉴가 없습니다.</p>
      )}

      {isModalOpen && selectedMenu && (
        <HQMenuModal
          menu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          onClose={closeModal}
          fetchMenus={fetchMenus}
        />
      )}
    </div>
  );
}

export default HQDiscontinueList;
