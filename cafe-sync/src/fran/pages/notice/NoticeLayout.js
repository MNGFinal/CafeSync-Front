import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import style from '../barista-note/Note.module.css';
import { Link } from "react-router-dom";
import { callNoticesAPI , callIncreaseViewCountAPI} from '../../../apis/notice/noticeApi';

function NoticeLayout() {
    const dispatch = useDispatch();
    const notices = useSelector(state => state.noticeReducer.data); // state.notice.notices에서 데이터를 가져옵니다.

    // 컴포넌트가 처음 렌더링될 때 공지사항 데이터를 불러옵니다.
    useEffect(() => {
        dispatch(callNoticesAPI());
    }, [dispatch]);

    const handleNoticeClick = (noticeCode) => {
        dispatch(callIncreaseViewCountAPI(noticeCode));
    };

    return (
        <>
            <div className={style.upperBox}>
                <input className={style.inputBox} type="text" placeholder="게시글검색" />
                <button className={style.searchButton}>검색</button>
                <Link to="/fran/notice/notice-regist">
                    <button className={style.registButton}>등록</button>
                </Link>
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
                    {/* 공지사항 데이터가 없으면 '데이터 없음' 메시지를 출력 */}
                    {notices && notices.length > 0 ? (
                        notices.map((notice) => (
                            <Link to={`/fran/notice/${notice.noticeCode}`} onClick={() => handleNoticeClick(notice.noticeCode)}>
                            <div key={notice.noticeCode} className={style.infoRow}>
                                <div className={style.infoItem}>{notice.noticeCode}</div>
                                <div className={style.infoItem}>{notice.noticeTitle}</div>
                                <div className={style.infoItem}>{notice.empName}</div>
                                <div className={style.infoItem}>{notice.noticeDate}</div>
                                <div className={style.infoItem}>{notice.noticeViews}</div>
                            </div>
                        </Link>
                        ))
                    ) : (
                        <div className={style.noData}>데이터 없음</div>
                    )}
                </div>
            </div>
        </>
    );
}

export default NoticeLayout;