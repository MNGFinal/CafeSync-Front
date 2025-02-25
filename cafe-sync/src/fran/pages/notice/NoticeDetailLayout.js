import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { callNoticeDetailAPI } from "../../../apis/notice/noticeApi";
import style from "../../pages/barista-note/NoteRegist.module.css";

function NoticeDetailLayout() {
    const { noticeCode } = useParams();
    const dispatch = useDispatch();
    const notice = useSelector(state => state.noticeReducer.selectedNotice);

    const [creationDate, setCreationDate] = useState("");
    const [isViewCountIncreased, setIsViewCountIncreased] = useState(false);

    useEffect(() => {
        console.log("🔄 공지사항 상세 요청:", noticeCode);
        dispatch(callNoticeDetailAPI({ noticeCode }));
    }, [dispatch, noticeCode]);

    useEffect(() => {
        if (notice && notice.noticeDate && !isViewCountIncreased) {
            setCreationDate(notice.noticeDate);
            setIsViewCountIncreased(true); // 조회수 증가가 이미 이루어졌음을 표시
        }
    }, [notice, isViewCountIncreased]);

    if (!notice) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={style.wrapperBox}>
            <div className={style.noteDetailContainer}>
                {/* 제목 & 작성 날짜 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelTitle} htmlFor="noticeTitle">제목 :&nbsp;</label>
                        <input className={style.title} type="text" value={notice.noticeTitle || ""} readOnly />
                    </div>
                    <div className={style.inlineField}>
                        <label className={style.labelCreationDate} htmlFor="creationDate">작성날짜 :&nbsp;</label>
                        <input className={style.creationDate} type="text" value={creationDate || ""} readOnly />
                    </div>
                </div>

                {/* 작성자 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelWriter} htmlFor="writer">작성자 :&nbsp;</label>
                        <input className={style.writer} type="text" value={notice.empName || "정보 없음"} readOnly />
                    </div>
                </div>

                {/* 조회수 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelViews} htmlFor="views">조회수 :&nbsp;</label>
                        <input className={style.views} type="text" value={notice.noticeViews || "0"} readOnly />
                    </div>
                </div>

                {/* 파일첨부 */}
                <div className={style.row}>
                    <label className={style.labelAttachment} htmlFor="attachment">파일첨부 :&nbsp;</label>
                    {notice.attachment ? (
                        <input className={style.attachment} type="text" value={notice.attachment} />
                    ) : (
                        <span>파일 없음</span>
                    )}
                </div>

                {/* 내용 */}
                <div className={style.row}>
                    <label className={style.labelContent} htmlFor="content">내용 :&nbsp;</label>
                    <textarea className={style.Content} value={notice.noticeContent || ""} readOnly />
                </div>

                {/* 버튼 컨테이너 */}
                <div className={style.buttonContainer}>
                    <Link to="/fran/notice">
                        <button className={style.returnToList}>목록</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NoticeDetailLayout;