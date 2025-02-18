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

  // soldOut 상태 관리
  const [soldOutMenus, setSoldOutMenus] = useState(new Set());

  useEffect(() => {
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

        // orderableStatus === 0인 메뉴들을 Sold Out 상태로 설정
        const initialSoldOutMenus = new Set(data.filter(menu => menu.orderableStatus === 0).map(menu => menu.menuCode));

        console.log("서버에서 넘어온 값", data);

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

  // Sold Out 상태 변경
  const toggleSoldOut = (menuCode) => {
    setSoldOutMenus((prev) => {
      const updatedMenus = new Set(prev);
      if (updatedMenus.has(menuCode)) {
        updatedMenus.delete(menuCode); // 이미 Sold Out된 메뉴는 상태 해제
      } else {
        updatedMenus.add(menuCode); // 새로운 메뉴를 Sold Out 상태로 추가
      }
      return updatedMenus;
    });
  };






  return (
    <div className={styles.menuGrid}>
      {filteredList.length > 0 ? (
        filteredList.map((menu) => (
          <div
            key={menu.menuCode}
            className={`${styles.menuCard} ${soldOutMenus.has(menu.menuCode) ? styles.soldOut : ""}`}
            onClick={() => handleMenuClick(menu)}
          >
            <div className={styles.imageContainer}>
              <img src={menu.menuImage} alt={menu.menuNameKo} className={styles.menuImage} />
              {soldOutMenus.has(menu.menuCode) && (
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
          onClose={closeModal}
          toggleSoldOut={toggleSoldOut} // Sold Out 상태를 업데이트하는 함수 전달
        />
      )}
    </div>
  );
}

export default MenuList;
