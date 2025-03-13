import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Outlet } from "react-router-dom";
import HQCategoryButtons from "./HQCategoryButtons";
import styles from "../../../fran/pages/menus/page/Menus.module.css";

function HQDiscontinue() {
  const [category, setCategory] = useState("coffee"); // 기본값: 커피
  const [searchQuery, setSearchQuery] = useState("");
  const [list, setList] = useState([]);
  const [slicedList, setSlicedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // ✅ 카테고리에 따라 API 호출
  async function fetchMenus() {
    const categoryMap = { coffee: 1, drink: 2, dessert: 3, goods: 4 };
    const categoryCode = categoryMap[category];
    if (!categoryCode) return;

    try {
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/fran/menus/${categoryCode}?query=${searchQuery}`
      );
      const res = await response.json();

      console.log("서버에서 넘어온 값", res);

      // 단종 메뉴만 필터링
      const discontinuedMenus = res.data.filter(
        (menu) => menu.disconStatus === true
      );
      console.log("단종메뉴 조회", discontinuedMenus);

      setList(discontinuedMenus);
      setCurrentPage(0); // 새로운 카테고리 클릭 시 페이지를 0으로 초기화
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  // ✅ category가 변경될 때마다 fetchMenus() 실행
  useEffect(() => {
    fetchMenus();
  }, [category]);

  // ✅ list 또는 currentPage가 바뀔 때 slicedList 업데이트
  useEffect(() => {
    const offset = currentPage * itemsPerPage;
    setSlicedList(list.slice(offset, offset + itemsPerPage));
    console.log(
      "slicedList 업데이트됨:",
      list.slice(offset, offset + itemsPerPage)
    );
  }, [currentPage, list]);

  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>단종 메뉴 관리</h3>
      </div>

      {/* 카테고리 버튼 + 검색창 */}
      <HQCategoryButtons
        fetchMenus={fetchMenus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
      />

      <div className={styles.contentContainer}>
        {console.log("Outlet에 전달된 slicedList:", slicedList)}
        {/* Outlet을 통해 HQDiscontinueList에 데이터를 전달 */}
        <Outlet context={{ list: slicedList, fetchMenus }} />
      </div>
      {/* ✅ 페이지네이션을 별도 컨테이너로 감싸기 */}
      <div className={styles.paginationWrapper}>
        {list.length > itemsPerPage && (
          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            breakLabel={"..."}
            pageCount={Math.ceil(list.length / itemsPerPage)}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={({ selected }) => setCurrentPage(selected)}
            containerClassName={styles.pagination}
            activeClassName={styles.activePage}
            previousClassName={styles.previous}
            nextClassName={styles.next}
            disabledClassName={styles.disabled}
            forcePage={currentPage}
          />
        )}
      </div>
    </div>
  );
}

export default HQDiscontinue;
