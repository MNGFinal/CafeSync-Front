import { Outlet, useLocation, useParams } from "react-router-dom";
import CategoryButtons from "./CategoryButtons";
import styles from "./Menus.module.css";
import { useEffect, useState } from "react";


function Menus() {

  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [list, setList] = useState([]);

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
      const response = await fetch(`http://localhost:8080/api/fran/menus/${categoryCode}?query=${searchQuery}`);
      const data = await response.json();

      console.log("서버에서 넘어온 값", data);

      setList(data);
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  // 최초 페이지 접근시 조회
  useEffect(() => {
    fetchMenus();
  }, [category]);

  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>
      <CategoryButtons 
        fetchMenus={fetchMenus}
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
      /> {/* ✅ 카테고리 버튼은 항상 유지 */}
      {/* ✅ 리스트가 렌더링되는 영역 */}
      <div className={styles.contentContainer}>
        {/* 아울렛을 사용할 땐 밑의 방식으로 넘겨야 함 */}
        <Outlet context={{
          list,
          fetchMenus
        }}/>
      </div>
    </div>
  );
}

export default Menus;
