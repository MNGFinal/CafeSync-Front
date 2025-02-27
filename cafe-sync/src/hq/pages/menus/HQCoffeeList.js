import { useState } from "react";
import styles from "../../../fran/pages/menus/itemList/MenuList.module.css";
import HQMenuModal from "../../../hq/pages/menus/HQMenuModal";
import { useOutletContext } from "react-router-dom";

function HQCoffeeList() {
  const { list, fetchMenus } = useOutletContext();

  const [selectedMenu, setSelectedMenu] = useState(null); // 선택한 메뉴 정보 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태


  // 메뉴 클릭 시 상세페이지 모달 열기
  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  // 상세페이지 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  };

  return (
    <div className={styles.menuGrid}>
      {list?.length > 0 ? (
        list?.map((menu) => (
          <div
            key={menu.menuCode}
            className={`${styles.menuCard} ${!menu.orderableStatus ? styles.soldOut : ""}`}
            onClick={() => handleMenuClick(menu)}
          >
            <div className={styles.imageContainer}>
              <img src={menu.menuImage} alt={menu.menuNameKo} className={styles.menuImage} />
              {!menu.orderableStatus && (
                <img src="/sold-out.png" alt="Sold Out" className={styles.soldOutImage} />
              )}
            </div>
            <h3 className={styles.menuName}>{menu.menuNameKo}</h3>
            <p className={styles.menuNameEN}>{menu.menuNameEN}</p>
            {/* <hr className={styles.DetailLine} /> */}
            {/* <p className={styles.menuDetail}>{menu.menuDetail}</p> */}
          </div>
        ))
      ) : (
        <p className={styles.noResult}>검색 결과가 없습니다.</p>
      )}

      {/* 모달 표시 */}
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

export default HQCoffeeList;