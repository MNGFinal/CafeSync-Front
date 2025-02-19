import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI, callSearchNoteAPI, callNoteRegistAPI } from '../../../apis/brista-note/baristaNoteApi';

function BaristaNoteLayout() {
    const dispatch = useDispatch();
    const notes = useSelector((state) => state.noteReducer.data);
    const user = useSelector((state) => state.auth.user); // ✅ user 객체 가져오기
    const userId = user?.userId || null; // ✅ user 객체에서 userId 추출

    console.log("🔍 Redux에서 가져온 user 객체:", user);
    console.log("📢 최종 userId:", userId);

    const noteList = Array.isArray(notes) ? notes : [];

    useEffect(() => {
        dispatch(callBaristNotesAPI());
    }, [dispatch]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [search, setSearch] = useState('');
    const [noteDetail, setNoteDetail] = useState('');
    const [attachment, setAttachment] = useState(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setNoteTitle(''); // 입력 필드 초기화
        setNoteDetail(''); // 만약 내용도 초기화하려면 추가
        setIsModalOpen(false);
    }
    const handleSearchChange = (e) => setSearch(e.target.value);
    
    const openDetailModal = (note) => {
        setSelectedNote(note);
        setIsDetailModalOpen(true);
    };
    const closeDetailModal = () => setIsDetailModalOpen(false);

    const handleTitleChange = (e) => setNoteTitle(e.target.value);
    const handleDetailChange = (e) => setNoteDetail(e.target.value);
    const handleFileChange = (e) => setAttachment(e.target.files[0]);

    const handleSaveNote = async () => {
        if (!noteTitle.trim()) {
            alert('⚠️ 제목을 입력해주세요!');
            return;
        }
    
        if (!noteDetail.trim()) {
            alert('⚠️ 내용을 입력해주세요!');
            return;
        }
    
    
        console.log("📢 최종 userId:", userId);
        if (!userId) {
            alert("❌ userId가 없습니다. 로그인 후 다시 시도해주세요.");
            return;
        }
    
        const noteData = {
            noteTitle,
            noteDetail,
            noteDate: new Date().toISOString(), // ✅ 현재시간 추가
            userId
        };
    
        console.log("📢 보낼 JSON 데이터:", noteData);
    
        await dispatch(callNoteRegistAPI(noteData)); // ✅ JSON 형식으로 전송
        dispatch(callBaristNotesAPI());
    
        closeModal();
    };
    
    
    
    

    const handleSearch = () => {
        if (search.trim()) {
            dispatch(callSearchNoteAPI({ search }));
        } else {
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
                    onChange={handleSearchChange}
                />
                <button className={style.searchButton} onClick={handleSearch}>검색</button>
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
                                required
                            />
                        </div>
                        <hr />
                        <div className={style.fileUpload}>
                            <label htmlFor="fileUpload">파일 첨부 : </label>
                            <input type="file" id="fileUpload" onChange={handleFileChange}/>
                        </div>
                        <div className={style.noteContent}>
                            <label htmlFor="noteContent">노트 내용 : </label>
                            <textarea id="noteContent" placeholder="노트를 작성하세요" onChange={handleDetailChange} required></textarea>
                        </div>
                        <div className={style.modalButtons}>
                            <button className={style.saveButton} onClick={handleSaveNote}>저장</button>
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
