import { Outlet, useParams } from "react-router-dom";
import CategoryButtons from "./CategoryButtons";
import styles from "./Menus.module.css";
import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";

function Menus() {
  const { category } = useParams();
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [list, setList] = useState([]); // 전체 메뉴 리스트
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const itemsPerPage = 10; // ✅ 페이지당 10개(5개 × 2줄) 표시

  // 메뉴 데이터 가져오기
  async function fetchMenus() {
    const categoryMap = {
      coffee: 1,
      drink: 2,
      dessert: 3,
      goods: 4,
    };

    // 카테고리별로 메뉴
    const categoryCode = categoryMap[category];
    if (!categoryCode) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/fran/menus/${categoryCode}?query=${searchQuery}`
      );
      const data = await response.json();

      console.log("서버에서 넘어온 값", data);
      setList(data); // 전체 데이터 저장
      setCurrentPage(0); // ✅ 카테고리 변경 시 첫 페이지로 초기화
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  // ✅ 카테고리 변경 시 데이터 다시 불러오기
  useEffect(() => {
    fetchMenus();
  }, [category]);

  // ✅ 현재 페이지 데이터 필터링 (10개씩 나누기)
  const offset = currentPage * itemsPerPage; // 0 → 10 → 20 ... (페이지별 데이터 시작점)
  const currentPageData = list.slice(offset, offset + itemsPerPage); // 10개씩 자르기

  // ✅ 페이지 변경 시 동작
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>

      <CategoryButtons
        fetchMenus={fetchMenus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* ✅ Outlet을 유지하면서 페이지네이션 적용 */}
      <div className={styles.contentContainer}>
        <Outlet context={{ list: currentPageData, fetchMenus }} /> {/* ✅ 현재 페이지 데이터만 넘김 */}
      </div>

      {/* ✅ 페이지네이션 (데이터가 10개 이상일 때만 표시) */}
      {list.length > itemsPerPage && (
        <ReactPaginate
          previousLabel={"이전"}
          nextLabel={"다음"}
          breakLabel={"..."}
          pageCount={Math.ceil(list.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          containerClassName={styles.pagination}
          activeClassName={styles.activePage}
          previousClassName={styles.previous}
          nextClassName={styles.next}
          disabledClassName={styles.disabled}
        />

      )}
    </div>
  );
}

export default Menus;
