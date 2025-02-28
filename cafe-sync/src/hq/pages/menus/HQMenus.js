import { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { Outlet } from "react-router-dom";
import HQCategoryButtons from "../../../hq/pages/menus/HQCategoryButtons";
import styles from "../../../fran/pages/menus/page/Menus.module.css";

function HQMenus() {
  const [category, setCategory] = useState("coffee");
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const [list, setList] = useState([]); // 전체 메뉴 리스트
  const [slicedList, setSlicedList] = useState([]); // 전체 메뉴 리스트
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

    // 카테고리별로 메뉴 리스트 가져오기
    const categoryCode = categoryMap[category];
    if (!categoryCode) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/fran/menus/${categoryCode}?query=${searchQuery}`
      );
      const res = await response.json();

      console.log("서버에서 넘어온 값", res);
      setList(res.data); // 전체 데이터 저장
      setSlicedList(
        res.data.slice(
          currentPage * itemsPerPage,
          (currentPage + 1) * itemsPerPage
        )
      ); // 전체 데이터 저장
      // setCurrentPage(0); // ✅ 카테고리 변경 시 첫 페이지로 초기화
      console.log("커런트페이지 뭐나올까?", currentPage);
    } catch (error) {
      console.error("메뉴 데이터 로딩 실패:", error);
    }
  }

  // ✅ 카테고리 변경 시 데이터 다시 불러오기
  useEffect(() => {
    setCurrentPage(0);
    fetchMenus();
  }, [category]);
  console.log("카테고리바꿀때?", category);

  // ✅ 페이지 변경 시 동작
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);

    // ✅ 현재 페이지 데이터 필터링 (10개씩 나누기)
    const offset = selected * itemsPerPage; // 0 → 10 → 20 ... (페이지별 데이터 시작점)
    setSlicedList(list.slice(offset, offset + itemsPerPage)); // 10개씩 자르기
  };

  useEffect(() => {
    fetchMenus();
  }, [category]);

  // ✅ currentPage 변경될 때 slicedList 업데이트
  useEffect(() => {
    const offset = currentPage * itemsPerPage;
    setSlicedList(list.slice(offset, offset + itemsPerPage));
  }, [currentPage, list]); // list가 변경될 때도 반영되도록 설정

  // ✅ 카테고리 변경 시 currentPage를 초기화 (fetchMenus 이후 실행)
  useEffect(() => {
    setCurrentPage(0); // ✅ 여기에서 초기화
  }, [category]);

  return (
    <div className={styles.menuContainer}>
      <div className="page-header">
        <h3>메뉴 관리</h3>
      </div>

      <HQCategoryButtons
        fetchMenus={fetchMenus}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        category={category}
        setCategory={setCategory}
      />

      {/* ✅ Outlet을 유지하면서 페이지네이션 적용 */}
      <div className={styles.contentContainer}>
        <Outlet context={{ list: slicedList, fetchMenus }} />{" "}
        {/* ✅ 현재 페이지 데이터만 넘김 */}
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
          forcePage={currentPage}
        />
      )}
    </div>
  );
}

export default HQMenus;
