import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Outlet } from "react-router-dom";
import CategoryButtons from "./CategoryButtons";
import styles from "./Menus.module.css";

function Menus() {
  const [category, setCategory] = useState("coffee");
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState([]);
  const [slicedList, setSlicedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // ✅ 메뉴 데이터 가져오기
  async function fetchMenus(resetPage = false) {
    const categoryMap = {
      coffee: 1,
      drink: 2,
      dessert: 3,
      goods: 4,
    };

    const categoryCode = categoryMap[category];
    if (!categoryCode) return;

    try {
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/fran/menus/${categoryCode}?query=${searchQuery}`
      );
      const res = await response.json();

      console.log("서버에서 넘어온 값", res);

      // ✅ disconStatus === false인 메뉴만 필터링
      const filteredList = res.data.filter(
        (menu) => menu.disconStatus === false
      );

      // ✅ 전체 데이터 저장
      setList(filteredList);

      // ✅ 🔥 검색 실행 시 첫 페이지로 이동
      if (resetPage) setCurrentPage(0);

      // ✅ 현재 페이지 데이터 업데이트
      setSlicedList(filteredList.slice(0, itemsPerPage));

      console.log("현재 페이지:", currentPage);
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  // ✅ 카테고리 변경 시: currentPage 0으로 초기화 & 데이터 다시 불러오기
  useEffect(() => {
    setCurrentPage(0);
    fetchMenus(true);
  }, [category]);

  // ✅ currentPage 또는 list가 바뀔 때 slicedList 업데이트
  useEffect(() => {
    const offset = currentPage * itemsPerPage;
    setSlicedList(list.slice(offset, offset + itemsPerPage));
  }, [currentPage, list]);

  // ✅ 페이지 변경 시 동작
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>

      {/* 카테고리 & 검색 버튼 */}
      <CategoryButtons
        fetchMenus={() => fetchMenus(true)} // 🔥 검색 시 첫 페이지로 이동
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
      />

      {/* 현재 페이지 데이터만 Outlet으로 전달 */}
      <div className={styles.contentContainer}>
        <Outlet context={{ list: slicedList, fetchMenus }} />
      </div>

      {/* 페이지네이션 (데이터가 10개 이상일 때만 표시) */}
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
          forcePage={currentPage}
        />
      )}
    </div>
  );
}

export default Menus;
