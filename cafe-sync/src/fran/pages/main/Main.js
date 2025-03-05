import React, { useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import st from "./Main.module.css";
import { useDispatch, useSelector } from 'react-redux';
import { callNoticesAPI } from '../../../apis/notice/noticeApi';
import { RESET_NOTICE_DETAIL } from '../../../modules/NoticeModule'

function Main() {
  const notices = useSelector(state => state.noticeReducer.data);
  const dispatch = useDispatch();
  const noticeList = notices.slice(0, 4);

  useEffect(() => {
      dispatch({ type: RESET_NOTICE_DETAIL });  // 데이터 초기화 액션 추가
  }, [dispatch]);

  useEffect(()=>{
    dispatch(callNoticesAPI())
  },[dispatch])

  if (!notices) return <div>Loading...</div>;

  return (
    <>
      <div className={`noticeSection ${st.sec}`}>
        <Link to="/fran/notice">공지사항</Link>
        <hr/>
        <div className={st.noticeList}>
          {noticeList.length > 0 ? (
            noticeList.map((notice) => (
              <div key={notice.noticeCode} className={st.noticeItem}>
                <Link to={`/fran/notice/${notice.noticeCode}`}>
                  <div className={st.noticeTitle}>{notice.noticeTitle}</div>
                  <div className={st.noticeDate}>
                    {new Date(notice.noticeDate).toISOString().split('T')[0]}
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className={st.noData}>데이터 없음</div>
          )}
        </div>
      </div>
      <div className={`scheduleSection ${st.sec}`}>
        <Link to="/fran/notice">근무자 스케줄</Link>
        <hr/>
      </div>
      <div className={`inventorySection ${st.sec}`}>
        <Link to="/fran/inventory">재고 부족 품목 확인</Link>
        <hr/>
      </div>
      <div className={`statsSection ${st.sec}`}>
        <Link to="/fran/stats">날짜별 매출 현황 그래프</Link>
        <hr/>
      </div>
    </>
  );
}

export default Main;
