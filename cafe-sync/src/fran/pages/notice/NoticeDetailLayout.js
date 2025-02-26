import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { callNoticeDetailAPI, callNoticeUpdateAPI } from "../../../apis/notice/noticeApi";
import style from "../../pages/barista-note/NoteRegist.module.css";

function NoticeDetailLayout() {
    const { noticeCode } = useParams();
    const dispatch = useDispatch();
    const notice = useSelector(state => state.noticeReducer.selectedNotice);
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));

    const [creationDate, setCreationDate] = useState("");
    const [isViewCountIncreased, setIsViewCountIncreased] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editNotice, setEditNotice] = useState({});

    const isOwner = sessionUser && sessionUser.userId === notice?.userId;

    useEffect(() => {
        dispatch(callNoticeDetailAPI({ noticeCode }));
    }, [dispatch, noticeCode]);

    useEffect(() => {
        if (notice && notice.noticeDate && !isViewCountIncreased) {
            setCreationDate(notice.noticeDate);  // 기존 작성일자 그대로 사용
            setIsViewCountIncreased(true);
            setEditNotice({ ...notice });
        }
    }, [notice, isViewCountIncreased]);

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
        setEditNotice({ ...notice });
    };

    const handleChange = (e) => {
        setEditNotice({
            ...editNotice,
            [e.target.name]: e.target.value,
        });
    };

    const handleSaveClick = () => {
        if (editNotice.noticeCode === 0) {
            console.log("❌ 잘못된 공지사항 코드입니다.");
            return;
        }
    
        // 수정 시 현재 시간을 한국 시간으로 갱신
        const now = new Date();
        const koreaTime = new Date(now.getTime() + (9 * 60 * 60 * 1000)); // UTC+9 (한국 시간)
    
        const updatedNotice = {
            ...editNotice,
            noticeDate: koreaTime.toISOString(),  // 수정 시 작성시간을 한국 시간으로 설정
        };
    
        // 수정된 공지사항을 API로 업데이트
        dispatch(callNoticeUpdateAPI(updatedNotice)).then(() => {
            // API 호출 후 상태가 갱신되면 다시 detail 페이지를 불러오도록 설정
            dispatch(callNoticeDetailAPI({ noticeCode }));  // 수정 후 갱신된 내용을 다시 불러오기
        });
    
        setIsEditMode(false); // 저장 후 다시 읽기 모드로 변경
    };
    
    

    if (!notice) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={style.wrapperBox}>
            <div className={style.noteDetailContainer}>
                <div className={style.closeButtonContainer}>
                    <div className={style.closeButton}>x</div>
                </div>
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelTitle} htmlFor="noticeTitle">제목 :&nbsp;</label>
                        <input 
                            className={style.title} 
                            type="text" 
                            name="noticeTitle" 
                            value={editNotice.noticeTitle || ""} 
                            readOnly={!isEditMode} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className={style.inlineField}>
                        <label className={style.labelCreationDate} htmlFor="creationDate">작성날짜 :&nbsp;</label>
                        <input className={style.creationDate} type="text" value={creationDate || ""} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelWriter} htmlFor="writer">작성자 :&nbsp;</label>
                        <input className={style.writer} type="text" value={notice.empName || "정보 없음"} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelViews} htmlFor="views">조회수 :&nbsp;</label>
                        <input className={style.views} type="text" value={notice.noticeViews || "0"} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <label className={style.labelAttachment} htmlFor="attachment">파일첨부 :&nbsp;</label>
                    <input 
                        className={style.attachment} 
                        type="file" 
                        name="attachment" 
                        disabled={!isEditMode} 
                    />
                </div>

                <div className={style.row}>
                    <label className={style.labelContent} htmlFor="content">내용 :&nbsp;</label>
                    <textarea 
                        className={style.Content} 
                        name="noticeContent" 
                        value={editNotice.noticeContent || ""} 
                        readOnly={!isEditMode} 
                        onChange={handleChange} 
                    />
                </div>

                <div className={style.buttonContainer}>
                    {isOwner && (
                        isEditMode ? (
                            <>
                                <button className={style.registButton} onClick={handleSaveClick}>저장</button>
                                <button className={style.returnToList} onClick={handleCancelClick}>취소</button>
                            </>
                        ) : (
                            <>
                                <button className={style.registButton} onClick={handleEditClick}>수정</button>
                                <Link to="/fran/notice">
                                    <button className={style.returnToList}>목록</button>
                                </Link>
                            </>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default NoticeDetailLayout;
