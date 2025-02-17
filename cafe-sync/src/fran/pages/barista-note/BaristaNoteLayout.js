// src/fran/pages/BaristaNote.js

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI } from '../../../apis/brista-note/baristaNoteApi';
import { GET_NOTES } from '../../../modules/NoteModule.js';


function BaristaNoteLayout() {
    const dispatch = useDispatch();
    const notes = useSelector((state) => state.noteReducer);
    console.log("notes",notes);
    const noteList = Array.isArray(notes) ? notes.data : [];  // 배열이 아니면 빈 배열로 초기화

    useEffect(() => {
        dispatch(callBaristNotesAPI());  // ✅ 이렇게 호출해야 함
    }, [dispatch]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleTitleChange = (e) => setNoteTitle(e.target.value);

    return (
        <>
            <div className={style.upperBox}>
                <input className={style.inputBox} type="text" placeholder="게시글검색" />
                <button className={style.searchButton}>검색</button>
                <button className={style.registButton} onClick={openModal}>등록</button>
            </div>

            <div className={style.lowerBox}>
                <div className={style.infoRow}>
                    <div className={style.infoItem}>번호</div>
                    <div className={style.infoItem}>제목</div>
                    <div className={style.infoItem}>작성자</div>
                    <div className={style.infoItem}>작성일</div>
                    <div className={style.infoItem}>조회수</div>
                </div>

                <div className={style.baristaNoteData}>
                    {/* noteList가 배열일 때만 .map()을 호출 */}
                    {noteList.length > 0 ? (
                        noteList.map((note) => (
                            <div key={note.noteCode} className={style.infoRow}>
                                <div className={style.infoItem}>{note.noteCode}</div>
                                <div className={style.infoItem}>{note.title}</div>
                                <div className={style.infoItem}>{note.userId}</div>
                                <div className={style.infoItem}>{note.noteDate}</div>
                                <div className={style.infoItem}>{note.viewCount || 0}</div>
                            </div>
                        ))
                    ) : (
                        <div>데이터가 없습니다.</div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalContentContainer}>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={handleTitleChange}
                                className={style.modalTitleInput}
                                placeholder="제목을 입력하세요"
                            />
                        </div>
                        <hr />
                        <div className={style.fileUpload}>
                            <label htmlFor="fileUpload">파일 첨부 : </label>
                            <input type="file" id="fileUpload" />
                        </div>
                        <div className={style.noteContent}>
                            <label htmlFor="noteContent">노트 내용 : </label>
                            <textarea id="noteContent" placeholder="노트를 작성하세요"></textarea>
                        </div>
                        <div className={style.modalButtons}>
                            <button className={style.saveButton}>저장</button>
                            <button className={style.cancelButton} onClick={closeModal}>취소</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BaristaNoteLayout;
