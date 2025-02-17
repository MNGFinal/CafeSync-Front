import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./MenuList.module.css";
import MenuModal from "../modal/MenuModal";

function MenuList() {
  const { category } = useParams();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null); // 선택한 메뉴 정보 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  // 최초 페이지 접근시 조회
  useEffect(() => {
    fetchMenus();
  }, [category]);

  async function fetchMenus() {
    // 카테고리 별 코드 매핑
    const categoryMap = {
      coffee: 1,
      drink: 2,
      dessert: 3,
      goods: 4,
    };

    // 현재 선택된 카테고리 코드 가져오기
    const categoryCode = categoryMap[category];
    if (!categoryCode) return;

    try {
      // 서버에서 메뉴 데이터 가져오기
      const response = await fetch(`http://localhost:8080/api/fran/menus/${categoryCode}`);
      const data = await response.json();

      console.log("서버에서 넘어온 값", data);

      setList(data);
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }


  // 메뉴 클릭 시 모달 열기
  const handleMenuClick = (menu) => {
    setSelectedMenu(menu);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedMenu(null);
  };

  return (
    <div className={styles.menuGrid}>
      {list.length > 0 ? (
        list.map((menu) => (
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
            <hr className={styles.DetailLine} />
            <p className={styles.menuDetail}>{menu.menuDetail}</p>
          </div>
        ))
      ) : (
        <p className={styles.noResult}>검색 결과가 없습니다.</p>
      )}

      {/* 모달 표시 */}
      {isModalOpen && selectedMenu && (
        <MenuModal
          menu={selectedMenu}
          setSelectedMenu={setSelectedMenu}
          onClose={closeModal}
          fetchMenus={fetchMenus}
        />
      )}
    </div>
  );
}

export default MenuList;
