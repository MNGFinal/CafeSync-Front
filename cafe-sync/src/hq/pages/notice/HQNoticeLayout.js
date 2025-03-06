import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from "./HQNoticeLayout.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import ReactPaginate from "react-paginate";
import {
  callNoticesAPI,
  callIncreaseViewCountAPI,
  callSearchNoticeAPI,
  callNoticeDetailAPI,
} from "../../../apis/notice/noticeApi";
import { RESET_NOTICE_DETAIL } from "../../../modules/NoticeModule";

function HQNoticeLayout() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const notices = useSelector((state) => state.noticeReducer.data);
  const user = JSON.parse(sessionStorage.getItem("user"));
  const userAuthority = user?.authority;

  /** 공지 목록 */
  const noticeList = useMemo(
    () => (Array.isArray(notices) ? notices : []),
    [notices]
  );

  /** 페이지네이션 상태 */
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const noticesPerPage = 10;

  /** 검색 상태 */
  const [search, setSearch] = useState("");

  /** 공지사항 리스트 API 호출 */
  useEffect(() => {
    dispatch(callNoticesAPI());
  }, [dispatch]);

  /** 페이지네이션 설정 */
  useEffect(() => {
    const newPageCount = Math.ceil(noticeList.length / noticesPerPage);
    setPageCount(newPageCount);
    setCurrentPage((prev) =>
      prev >= newPageCount && newPageCount > 0 ? newPageCount - 1 : prev
    );
  }, [noticeList]);

  /** 현재 페이지에 표시할 공지 목록 */
  const noticesToDisplay = noticeList.slice(
    currentPage * noticesPerPage,
    (currentPage + 1) * noticesPerPage
  );

  /** 페이지 변경 핸들러 */
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  /** 검색 핸들러 */
  const handleSearchChange = (e) => setSearch(e.target.value);

  const handleSearch = () => {
    if (search.trim()) {
      dispatch(callSearchNoticeAPI({ search }));
    } else {
      dispatch(callNoticesAPI());
    }
  };

  /** 🔹 엔터 키 입력 시 검색 실행 */
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleNoticeClick = (noticeCode) => {
    dispatch({ type: RESET_NOTICE_DETAIL });
    dispatch(callIncreaseViewCountAPI(noticeCode));

    setTimeout(() => {
      dispatch(callNoticeDetailAPI({ noticeCode }));

      // Number(franCode)를 사용하여 숫자형으로 비교
      const basePath = Number(franCode) === 10000 ? "/hq" : "/fran";
      navigate(`${basePath}/notice/${noticeCode}`, { replace: true });
    }, 0);
  };

  return (
    <>
      {/* 상단 검색 & 등록 버튼 */}
      <div className={style.upperBox}>
        <input
          className={style.inputBox}
          type="text"
          placeholder="게시글 검색"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyPress}
        />
        <button className={style.searchButton} onClick={handleSearch}>
          검색
        </button>

        {/* 가맹점 코드가 10000이고 ADMIN 권한인 경우에만 등록 버튼 표시 */}
        {userAuthority === "ADMIN" && franCode === 10000 && (
          <Link to="/hq/notice/notice-regist">
            <button className={style.registButton}>등록</button>
          </Link>
        )}
      </div>

      {/* 공지사항 리스트 */}
      <div className={style.lowerBox}>
        <div className={style.NoticeData}>
          {/* ✅ 테이블 헤더 */}
          <div className={`${style.infoRow} ${style.header}`}>
            <div className={style.infoItem}>번호</div>
            <div className={style.infoItem}>제목</div>
            <div className={style.infoItem}>작성자</div>
            <div className={style.infoItem}>작성일</div>
            <div className={style.infoItem}>조회수</div>
          </div>

          {/* ✅ 데이터 목록 */}
          {noticesToDisplay.length > 0 ? (
            noticesToDisplay.map((notice) => (
              <div
                key={notice.noticeCode}
                className={style.infoRow}
                onClick={() => handleNoticeClick(notice.noticeCode)}
                style={{ cursor: "pointer" }}
              >
                <div className={style.infoItem}>{notice.noticeCode}</div>
                <div className={style.infoItem}>{notice.noticeTitle}</div>
                <div className={style.infoItem}>{notice.empName}</div>
                <div className={style.infoItem}>
                  {new Date(notice.noticeDate).toISOString().split("T")[0]}
                </div>
                <div className={style.infoItem}>{notice.noticeViews}</div>
              </div>
            ))
          ) : (
            <div className={style.noData}>데이터 없음</div>
          )}
        </div>

        {/* ✅ 페이지네이션 */}
        <div className={style.paginationContainer}>
          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            breakLabel={"..."}
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
            onPageChange={handlePageChange}
            containerClassName={style.pagination}
            activeClassName={style.activePage}
            previousClassName={style.previous}
            nextClassName={style.next}
            disabledClassName={style.disabled}
            forcePage={currentPage}
          />
        </div>
      </div>
    </>
  );
}

export default HQNoticeLayout;
