// src/fran/pages/BaristaNote.js

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI } from '../../../apis/brista-note/baristaNoteApi';
import { GET_NOTES } from '../../../modules/NoteModule.js';


function BaristaNoteLayout() {

    const dispatch = useDispatch();
    const notes = useSelector((state) => state.noteReducer.data);
    const noteList = Array.isArray(notes) ? notes : [];
    console.log(notes);

    useEffect(() => {
        dispatch(callBaristNotesAPI());  // ✅ 이렇게 호출해야 함
    }, [dispatch]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const handleTitleChange = (e) => setNoteTitle(e.target.value);
    const openDetailModal = (note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };
    const closeDetailModal = () => setIsDetailModalOpen(false);

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
                                <div className={style.infoItem}>{note.noteTitle}</div>
                                <div className={style.infoItem}>{note.empName}</div>
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
               {/* 상세보기 모달 */}
               {isDetailModalOpen && selectedNote && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalContentContainer}>
                            <div className={style.detailRow}>
                                <div className={style.labelTitle}>제목</div>
                                <div>{selectedNote.noteTitle}</div>
                            </div>
                            <hr />
                            <div className={style.detailRow}>
                                <div className={style.labelTitle}>작성자</div>
                                <div>{selectedNote.empName}</div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.labelTitle}>작성일자</div>
                                <div>{selectedNote.noteDate}</div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.labelTitle}>파일 첨부</div>
                                <div>{selectedNote.fileName || '없음'}</div>
                            </div>
                            <div className={style.detailRow}>
                                <div className={style.labelTitle}>노트 내용</div>
                                <div>{selectedNote.noteContent}</div>
                            </div>
                        </div>
                        <div className={style.modalButtons}>
                            <button className={style.returnToList} onClick={closeDetailModal}>목록으로 돌아가기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BaristaNoteLayout;
