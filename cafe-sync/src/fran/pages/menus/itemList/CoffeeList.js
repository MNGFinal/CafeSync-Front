import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import styles from "./MenuList.module.css";
import MenuModal from "../modal/MenuModal";

function MenuList() {
  const { category } = useParams();
  const location = useLocation();
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenu, setSelectedMenu] = useState(null); // 선택한 메뉴 정보 저장
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 상태

  useEffect(() => {
    async function fetchMenus() {
      const categoryMap = {
        coffee: 1,
        drink: 2,
        dessert: 3,
        goods: 4,
      };

      const categoryCode = categoryMap[category];
      if (!categoryCode) return;

      try {
        const response = await fetch(`http://localhost:8080/api/fran/menus/${categoryCode}`);
        const data = await response.json();
        setList(data);
        setFilteredList(data);
      } catch (error) {
        console.error("메뉴 데이터 로딩 실패:", error);
      }
    }

    fetchMenus();
  }, [category]);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get("query");

    if (query) {
      setSearchQuery(query);
      const filteredData = list.filter((menu) =>
        menu.menuNameKo.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredList(filteredData);
    } else {
      setFilteredList(list);
    }
  }, [location.search, list]);

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
      {filteredList.length > 0 ? (
        filteredList.map((menu) => (
          <div key={menu.menuCode} className={styles.menuCard} onClick={() => handleMenuClick(menu)}>
            <div className={styles.imageContainer}>
              <img src={menu.menuImage} alt={menu.menuNameKo} className={styles.menuImage} />
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
      {isModalOpen && selectedMenu && <MenuModal menu={selectedMenu} onClose={closeModal} />}
    </div>
  );
}

export default MenuList;
