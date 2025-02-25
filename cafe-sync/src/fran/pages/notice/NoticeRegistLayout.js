import React, { useEffect, useState } from "react"; 
import { Link } from "react-router-dom";
import style from "../barista-note/NoteRegist.module.css";

function NoticeRegistLayout() {
    const [creationDate, setCreationDate] = useState("");

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        setCreationDate(formattedDate);
    }, []);

    return (
        <>
            <div className={style.wrapperBox}>
                <div className={style.container}>
                    <div className={style.row}>
                        <div>
                            <label className={style.labelTitle} htmlFor="baristaNoteTitle">노트제목 :&nbsp; </label>
                            <input className={style.title} type="text" required />
                        </div>
                        <div>
                            <label className={style.labelCreationDate} htmlFor="baristaNoteCreationDate">작성날짜 :&nbsp; </label>
                            <input 
                                className={style.creationDate} 
                                type="date" 
                                value={creationDate} 
                                readOnly 
                            />
                        </div>
                    </div>
                    <div className={style.row}>
                        <label className={style.registAttachment} htmlFor="baristaNoteAttachment">파일첨부 :&nbsp; </label>
                        <input className={style.registFile} type="file" />
                    </div>
                    <div className={style.row}>
                        <label className={style.labelContent} htmlFor="baristaNoteContent">노트내용 :&nbsp; </label>
                        <textarea className={style.Content} required />
                    </div>

                    {/* Button Container to center the buttons */}
                    <div className={style.buttonContainer}>
                        <button className={style.registButton}>등록</button>
                        <Link to="/fran/notice">
                        <button className={style.returnToList}>목록</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

export default NoticeRegistLayout;
