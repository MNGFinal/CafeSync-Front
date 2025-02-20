import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI, callSearchNoteAPI, callNoteRegistAPI } from '../../../apis/brista-note/baristaNoteApi';
import { callNoteUpdateAPI } from '../../../apis/brista-note/baristaNoteApi'; // 수정 API 호출

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
    const [isEditMode, setIsEditMode] = useState(false); // 수정 모드 상태 추가

    const openModal = () => {
        setIsEditMode(false);  // 등록 모드에서는 항상 false
        setNoteTitle('');      // 제목 초기화
        setNoteDetail('');     // 내용 초기화
        setAttachment(null);   // 첨부파일 초기화
        setSelectedNote(null); // 선택된 노트 초기화
        setIsModalOpen(true);
    };
    const closeModal = () => {
        setNoteTitle('');      // 제목 초기화
        setNoteDetail('');     // 내용 초기화
        setAttachment(null);   // 첨부파일 초기화
        setSelectedNote(null); // 선택된 노트 초기화
        setIsModalOpen(false);
    };

    const handleSearchChange = (e) => setSearch(e.target.value);
    
    const openDetailModal = (note) => {
        setSelectedNote(note);
        setNoteTitle(note.noteTitle); // 선택된 노트의 제목 설정
        setNoteDetail(note.noteDetail); // 선택된 노트의 내용 설정
        setIsDetailModalOpen(true);
        setIsEditMode(false); // 상세보기 모드에서는 수정이 안 되도록 초기화
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

    const handleUpdateNote = async () => {
        if (!noteTitle.trim() || !noteDetail.trim()) {
            alert('⚠️ 제목과 내용을 입력해주세요!');
            return;
        }
    
        // 세션에서 가져온 user.id와 selectedNote.userId를 비교
        const sessionUserId = user?.userId;  // `user`는 Redux store에서 가져온 사용자 정보
    
        console.log("🔍 sessionUserId:", sessionUserId);
        console.log("🔍 selectedNote.userId:", selectedNote?.userId);
    
        if (selectedNote.userId !== sessionUserId) {
            alert("❌ 자신이 작성한 글만 수정할 수 있습니다.");
            return;
        }
    
        // 수정 시에만 `noteDate`를 현재 시간으로 업데이트
        const updatedNote = {
            noteCode: selectedNote.noteCode,
            noteTitle,
            noteDetail,
            noteDate: new Date().toISOString(), // 수정 시 현재 시간으로 업데이트
            userId: sessionUserId
        };
    
        await dispatch(callNoteUpdateAPI(updatedNote)); // 수정 API 호출
        dispatch(callBaristNotesAPI());
        closeDetailModal();
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
                        {/* 닫기 버튼 (X)를 문자열로 표시하여 우측 상단에 배치 */}
                        <div className={style.closeButtonContainer}>
                            <span className={style.closeButton} onClick={closeModal}>×</span>
                        </div>

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
                            <input type="file" id="fileUpload" onChange={handleFileChange} />
                        </div>
                        <div className={style.noteContent}>
                            <label htmlFor="noteContent">노트 내용 : </label>
                            <textarea id="noteContent" placeholder="노트를 작성하세요" onChange={handleDetailChange} required></textarea>
                        </div>
                        <div className={style.modalButtons}>
                            <button className={style.saveButton} onClick={handleSaveNote}>저장</button>
                        </div>
                    </div>
                </div>
            )}

            {/* 상세보기 모달 */}
            {isDetailModalOpen && selectedNote && (
                <div className={style.modalOverlay}>
                    <div className={style.modalContent}>
                        <div className={style.closeButtonContainer}>
                            <span className={style.closeButton} onClick={closeModal}>×</span>
                        </div>
                        <div className={style.modalContentContainer}>
                            <input
                                type="text"
                                value={noteTitle}
                                onChange={handleTitleChange}
                                className={style.modalTitleInput}
                                readOnly={!isEditMode} // 수정 모드일 때만 수정 가능
                            />
                        </div>
                        <hr />
                        <div className={style.modalDetails}>
                            <p>작성자: {selectedNote.empName}</p>
                            <p>작성일: {selectedNote.noteDate}</p>
                        </div>

                        {/* 파일 첨부 부분: 첨부된 파일이 있을 때는 파일명, 없을 때는 파일 첨부 버튼 */}
                        <div className={style.fileUpload}>
                            {selectedNote.attachment ? (
                                <span>파일 첨부 : {selectedNote.attachment}</span>
                            ) : (
                                isEditMode && (
                                    <>
                                        <label htmlFor="fileUpload">파일 첨부: </label>
                                        <input 
                                            type="file" 
                                            id="fileUpload" 
                                            onChange={handleFileChange} 
                                            className={style.fileInput}
                                        />
                                    </>
                                )
                            )}
                        </div>

                        <div className={style.noteContent}>
                            <textarea
                                id="noteContent"
                                value={noteDetail}
                                onChange={handleDetailChange}
                                readOnly={!isEditMode}
                            />
                        </div>

                        {/* 수정 버튼은 파일 첨부 여부와 상관없이, isEditMode에만 의존 */}
                        {selectedNote.userId === userId && !isEditMode && (
                            <div className={style.modalButtons}>
                                <button className={style.saveButton} onClick={() => setIsEditMode(true)}>수정</button>
                            </div>
                        )}

                        {/* 수정 모드일 때만 저장 및 취소 버튼 보이도록 */}
                        {isEditMode && (
                            <div className={style.modalButtons}>
                                <button className={style.saveButton} onClick={handleUpdateNote}>저장</button>
                                <button className={style.cancelButton} onClick={() => setIsEditMode(false)}>취소</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </>
    );
}

export default BaristaNoteLayout;
