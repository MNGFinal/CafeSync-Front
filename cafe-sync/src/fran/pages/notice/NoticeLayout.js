import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from "react-redux";
import style from '../barista-note/Note.module.css';
import { Link } from "react-router-dom";
import { callNoticesAPI , callIncreaseViewCountAPI, callSearchNoticeAPI , callNoticeDetailAPI } from '../../../apis/notice/noticeApi';
import { useMemo } from 'react';
import { useNavigate } from "react-router-dom";
import ReactPaginate from 'react-paginate';
import {RESET_NOTICE_DETAIL} from '../../../modules/NoticeModule';

function NoticeLayout() {
    const dispatch = useDispatch();
    const notices = useSelector(state => state.noticeReducer.data); // state.notice.notices에서 데이터를 가져옵니다.
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const noticeList = useMemo(() => (Array.isArray(notices) ? notices : []), [notices]);

    // 컴포넌트가 처음 렌더링될 때 공지사항 데이터를 불러옵니다.
    useEffect(() => {
        dispatch(callNoticesAPI());
    }, [dispatch]);

    const [pageCount, setPageCount] = useState(0); // 전체 페이지 수
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
    const noticesPerPage = 10; // 한 페이지에 표시할 노트 개수

    useEffect(() => {
            const newPageCount = Math.ceil(noticeList.length / noticesPerPage);
            setPageCount(newPageCount);
        
            setCurrentPage((prevPage) => 
                prevPage >= newPageCount && newPageCount > 0 ? newPageCount - 1 : prevPage
            );
        }, [noticeList]);
    
    const noticesToDisplay = noticeList.slice(
            currentPage * noticesPerPage,
            (currentPage + 1) * noticesPerPage
    );

    // 페이지 변경 핸들러
    const handlePageChange = (selected) => {
        setCurrentPage(selected.selected);
    };

    // 🔹 현재 로그인한 사용자 정보 가져오기 (Redux 또는 sessionStorage)
    const user = JSON.parse(sessionStorage.getItem("user")); // 세션에서 유저 정보 가져오기
    const userAuthority = user?.authority; // authority 값 확인

    const handleNoticeClick = (noticeCode) => {
        dispatch({ type: RESET_NOTICE_DETAIL });  // ✅ 기존 데이터 초기화
        dispatch(callIncreaseViewCountAPI(noticeCode)); // 조회수 증가 API 호출
    
        setTimeout(() => {
            dispatch(callNoticeDetailAPI({ noticeCode })); // ✅ 새로운 공지사항 상세 정보 요청
            navigate(`/fran/notice/${noticeCode}`); // 상세 페이지로 이동
        }, 0); // 비동기 처리로 순서 보장
    };    
    

    const handleSearchChange = (e) => setSearch(e.target.value);

    const handleSearch = () => {
        if (search.trim()) {
            dispatch(callSearchNoticeAPI({ search }));
        } else {
            dispatch(callNoticesAPI());
        }
    };

    return (
        <>
            <div className={style.upperBox}>
                <input className={style.inputBox} type="text" placeholder="게시글검색"  value={search} onChange={handleSearchChange} />
                <button className={style.searchButton} onClick={handleSearch}>검색</button>
                {userAuthority === "ADMIN" ? (
                <Link to="/fran/notice/notice-regist">
                        <button className={style.registButton}>등록</button>
                </Link>
                ) : (
                    <button className={style.rightPlaceholder}>등록</button>  // 등록 버튼이 없을 때 공간 유지
                )}
            </div>

            <div className={style.lowerBox}>
                <div className={style.infoRow}>
                    <div className={style.infoItem}>번호</div>
                    <div className={style.infoItem}>제목</div>
                    <div className={style.infoItem}>작성자</div>
                    <div className={style.infoItem}>작성일</div>
                    <div className={style.infoItem}>조회수</div>
                </div>
                <div className={style.NoticeData}>
                    {noticesToDisplay.length > 0 ? (
                        noticesToDisplay.map((notice) => (
                            <div key={notice.noticeCode} className={style.infoRow} onClick={() => handleNoticeClick(notice.noticeCode)} style={{ cursor: 'pointer' }}>
                                <div className={style.infoItem}>{notice.noticeCode}</div>
                                <div className={style.infoItem}>{notice.noticeTitle}</div>
                                <div className={style.infoItem}>{notice.empName}</div>
                                <div className={style.infoItem}>{new Date(notice.noticeDate).toISOString().split('T')[0]}</div>
                                <div className={style.infoItem}>{notice.noticeViews}</div>
                            </div>
                        ))
                    ) : (
                        <div className={style.noData}>데이터 없음</div>
                    )}
                </div>
                {/* 페이지네이션 위치 조정 */}
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

export default NoticeLayout;