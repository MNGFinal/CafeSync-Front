import React, { useState,useEffect } from 'react';
import { getAllNotes } from '../../../apis/brista-note/baristaNoteApi'; // API 함수 임포트
import style from './Note.module.css';

function BaristaNoteLayout() {
    // 모달창의 상태 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [noteTitle, setNoteTitle] = useState(''); // 새로운 상태 추가: 제목 입력값 관리
    const [notes, setNotes] = useState([]); // 노트 데이터를 관리하는 상태

    // 모달창 열기
    const openModal = () => {
        setIsModalOpen(true);
    };

    // 모달창 닫기
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // 제목 변경 함수
    const handleTitleChange = (e) => {
        setNoteTitle(e.target.value);
    };

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                console.log("Fetching notes...");
                const data = await getAllNotes(); // API 호출
                console.log("Fetched notes: ", data); // 데이터 출력
                setNotes(data); // 받아온 데이터를 상태에 저장
            } catch (error) {
                console.error('Failed to fetch notes:', error);
            }
        };
    
        fetchNotes();
    }, []);

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
                {/* 노트 데이터를 화면에 표시 */}
                {notes.length > 0 ? (
                    notes.map((note) => (
                    <div key={note.noteCode} className={style.infoRow}>
                        <div className={style.infoItem}>{note.noteCode}</div>
                        <div className={style.infoItem}>{note.noteTitle}</div>
                        <div className={style.infoItem}>{note.userId}</div>
                        <div className={style.infoItem}>{note.noteDate}</div>
                        <div className={style.infoItem}>0</div> {/* 조회수는 0으로 설정 */}
                    </div>
                    ))
                ) : (
                    <div>노트가 없습니다.</div>
                )}
                </div>
            </div>

            {/* 모달창 */}
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
