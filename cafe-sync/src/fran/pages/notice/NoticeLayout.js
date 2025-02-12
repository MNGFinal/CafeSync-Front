import style from '../barista-note/Note.module.css';
import { Link } from "react-router-dom";

function NoticeLayout(){

    return(
        <>
            <div className={style.upperBox}>
                <input className={style.inputBox} type="text" placeholder="게시글검색" />
                <button className={style.searchButton}>검색</button>
                <Link to="/fran/notice/regist">
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
                    {/* 여기에 공지사항 데이터가 들어갑니다. */}
                </div>
            </div>
        </>
    )
}

export default NoticeLayout;