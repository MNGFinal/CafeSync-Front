import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import st from "./HQNoticeList.module.css";

function HQNoticeList({ allData }) {
  // 클라이언트 사이드에서 보여줄 목록과 페이지 관리를 진행
  const [noticeList, setNoticeList] = useState([]); // 실제로 렌더링할 부분
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPage = 6; // 한 번에 보여줄 개수

  // allData가 바뀌거나, page가 바뀔 때마다 noticeList를 업데이트
  useEffect(() => {
    if (!allData || allData.length === 0) return;

    setIsLoading(true);

    // 현재 페이지까지 보여줄 데이터 범위 계산
    const endIndex = page * itemsPerPage;
    const newSlice = allData.slice(0, endIndex);

    setNoticeList(newSlice);

    // 더 이상 보여줄 데이터가 없는 경우 hasMore를 false로
    if (endIndex >= allData.length) {
      setHasMore(false);
    } else {
      setHasMore(true);
    }

    setIsLoading(false);
  }, [allData, page]);

  // 마지막 요소 관찰용 ref
  const observerRef = useRef();

  // 콜백 ref (마지막 요소가 화면에 들어오면 page를 1 증가)
  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore]
  );

  return (
    <div className={st.noticeContainer}>
      <div className={st.noticeHeader}>
        <span className={st.dateColumn}>작성날짜</span>
        <span className={st.titleColumn}>글제목</span>
        <span className={st.authorColumn}>작성자</span>
      </div>
      <div
        className={st.noticeList}
        style={{ height: "310px", overflowY: "auto" }}
      >
        {noticeList.length > 0 ? (
          noticeList.map((notice, index) => {
            // 마지막 요소에는 ref를 달아서 관찰
            if (index === noticeList.length - 1) {
              return (
                <div
                  key={`notice-${index}`}
                  className={st.noticeItem}
                  ref={lastElementRef}
                >
                  <Link
                    to={`/hq/notice/${notice.noticeCode}`}
                    className={st.noticeLink}
                  >
                    <span className={st.dateColumn}>
                      {new Date(notice.noticeDate).toISOString().split("T")[0]}
                    </span>
                    <span className={st.titleColumn}>{notice.noticeTitle}</span>
                    <span className={st.authorColumn}>{notice.empName}</span>
                  </Link>
                </div>
              );
            } else {
              return (
                <div key={`notice-${index}`} className={st.noticeItem}>
                  <Link
                    to={`/hq/notice/${notice.noticeCode}`}
                    className={st.noticeLink}
                  >
                    <span className={st.dateColumn}>
                      {new Date(notice.noticeDate).toISOString().split("T")[0]}
                    </span>
                    <span className={st.titleColumn}>{notice.noticeTitle}</span>
                    <span className={st.authorColumn}>{notice.empName}</span>
                  </Link>
                </div>
              );
            }
          })
        ) : (
          <div className={st.noData}>데이터 없음</div>
        )}
        {isLoading && <p className={st.loadingText}>로딩 중...</p>}
        {!hasMore && (
          <p className={st.loadingText}>더 이상 불러올 데이터가 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default HQNoticeList;
