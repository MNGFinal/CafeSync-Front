
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI , callSearchNoteAPI } from '../../../apis/brista-note/baristaNoteApi';

function BaristaNoteLayout() {
    const dispatch = useDispatch();
    const notes = useSelector((state) => state.noteReducer.data);
    const noteList = Array.isArray(notes) ? notes : [];
    
    useEffect(() => {
        dispatch(callBaristNotesAPI());
    }, [dispatch]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [search, setSearch] = useState(''); 

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
        const handleSearchChange = (e) => setSearch(e.target.value);  // 검색어 변경 함수
    
    const openDetailModal = (note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };
    const closeDetailModal = () => setIsDetailModalOpen(false);
    const handleTitleChange = (e) => setNoteTitle(e.target.value);

    const handleSearch = () => {
        if (search.trim()) {
            // 검색어가 있을 때만 검색 API 호출
            dispatch(callSearchNoteAPI({ search }));
        } else {
            // 검색어가 비어있으면 전체 목록을 불러오기
            dispatch(callBaristNotesAPI());
        }
    };

    return (
        <>
            <div className={style.upperBox}>
                <input
                    className={style.inputBox}
                    type="text"
                    placeholder="게시글검색"
                    value={search}
                    onChange={handleSearchChange}  // 검색어 변경 시 상태 업데이트
                />
                <button className={style.searchButton} onClick={handleSearch}>검색</button>  {/* 검색 버튼 클릭 시 검색 실행 */}
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
                {noteList.length > 0 ? (
                    noteList.map((note) => (
                        <div key={note.noteCode} className={style.infoRow} onClick={() => openDetailModal(note)}>
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

            {/* 등록 모달 */}
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

            {/* 상세보기 모달 (등록 모달과 동일한 디자인) */}
            {isDetailModalOpen && selectedNote && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.modalContentContainer}>
                            <input
                                type="text"
                                value={selectedNote.noteTitle}
                                className={style.modalTitleInput}
                                readOnly
                            />
                        </div>
                        <hr />
                        <div className={style.modalDetails}>
                            <p>작성자: {selectedNote.empName}</p>
                            <p>작성일: {selectedNote.noteDate}</p>
                        </div>
                        <div className={style.fileUpload}>
                            <label htmlFor="fileUpload">파일 첨부 : </label>
                            <span>{selectedNote.attachment ? selectedNote.attachment : '없음'}</span>
                        </div>
                        <div className={style.noteContent}>

                            <textarea id="noteContent" value={selectedNote.noteDetail} readOnly></textarea>
                        </div>
                        <div className={style.modalButtons}>
                            <button className={style.cancelButton} onClick={closeDetailModal}>닫기</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default BaristaNoteLayout;