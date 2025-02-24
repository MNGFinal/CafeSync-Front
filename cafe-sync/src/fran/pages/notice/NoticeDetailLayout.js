// src/fran/pages/notice/NoticeDetailLayout.js

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

    useEffect(() => {
        dispatch(callNoticeDetailAPI({ noticeCode }));
    }, [dispatch, noticeCode]);

    useEffect(() => {
        if (notice && notice.noticeDate) {
            setCreationDate(notice.noticeDate);
        }
    }, [notice]);

    return (
        <div className={style.wrapperBox}>
            <div className={style.noteDetailContainer}>
                {/* 제목 & 작성 날짜 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelTitle} htmlFor="noticeTitle">제목 :&nbsp;</label>
                        <input className={style.title} type="text" value={notice.noticeTitle} readOnly />
                    </div>
                    <div className={style.inlineField}>
                        <label className={style.labelCreationDate} htmlFor="creationDate">작성날짜 :&nbsp;</label>
                        <input className={style.creationDate} type="text" value={notice.noticeDate} readOnly />
                    </div>
                </div>

                {/* 작성자 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelWriter} htmlFor="writer">작성자 :&nbsp;</label>
                        <input className={style.writer} type="text" value={notice.empName} readOnly />
                    </div>
                </div>

                {/* 조회수 */}
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelViews} htmlFor="views">조회수 :&nbsp;</label>
                        <input className={style.views} type="text" value={notice.noticeViews} readOnly />
                    </div>
                </div>

                {/* 파일첨부 */}
                <div className={style.row}>
                        <label className={style.labelAttachment} htmlFor="attachment">파일첨부 :&nbsp;</label>
                        <input className={style.attachment} type="file" disabled />
                </div>

                {/* 내용 */}
                <div className={style.row}>
                    <label className={style.labelContent} htmlFor="content">내용 :&nbsp;</label>
                    <textarea className={style.Content} value={notice.noticeContent} readOnly />
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
