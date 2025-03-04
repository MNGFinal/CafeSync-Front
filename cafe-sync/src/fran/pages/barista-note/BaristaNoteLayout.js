// src/fran/pages/barista-note/BaristaNoteLayout.js

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import style from './Note.module.css';
import { callBaristNotesAPI, callSearchNoteAPI, callNoteRegistAPI , callNoteUpdateAPI , callNoteDeleteAPI , callBaristNoteDetailAPI } from '../../../apis/brista-note/baristaNoteApi';
import { useMemo } from 'react';
import { GET_NOTES } from '../../../modules/NoteModule';
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import Lottie from "lottie-react"; // Lottie 애니메이션을 위한 라이브러리
import { Player } from "@lottiefiles/react-lottie-player";
import { useNavigate } from "react-router-dom";

// 추가된 임포트
import ReactPaginate from 'react-paginate'; // 페이지네이션 컴포넌트

function BaristaNoteLayout() {
    const dispatch = useDispatch();
    const notes = useSelector((state) => state.noteReducer.data);
    const user = useSelector((state) => state.auth.user); // ✅ user 객체 가져오기
    const userId = user?.userId || null; // ✅ user 객체에서 userId 추출
    const noteList = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);
    const navigate = useNavigate();

    /* ----------------------------------등록모달--------------------------------------- */

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

    const handleUpdateNote = async () => {
        if (!noteTitle.trim() || !noteDetail.trim()) {
            setLottieAnimation("/animations/identify.json");  // 애니메이션 설정
            setModalMessage("제목과 내용을 입력해주세요.");   // 모달 메시지 설정
            setIsSuccessModalOpen(true);  // 모달 열기
            return;
        }
    
        // 세션에서 가져온 user.id와 selectedNote.userId를 비교
        const sessionUserId = user?.userId;  // `user`는 Redux store에서 가져온 사용자 정보
    
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
        setSuccessLottieAnimation("/animations/success-check.json");
        setIsUpdateModalOpen("바리스타노트를 정상적으로 수정하였습니다.");
        closeDetailModal();
    };    

    const handleSaveNote = async () => {
        if (!noteTitle.trim() || !noteDetail.trim()) {
            setLottieAnimation("/animations/identify.json");  // 애니메이션 설정
            setModalMessage("제목과 내용을 입력해주세요.");   // 모달 메시지 설정
            setIsSuccessModalOpen(true);  // 모달 열기
            return;
        }
    
        const newNote = {
            noteTitle,
            noteDetail,
            userId,
            noteDate: new Date().toISOString(), // 현재 시간으로 설정
        };
    
        try {
            await dispatch(callNoteRegistAPI(newNote)); // 노트 등록 API 호출
            setIsSuccessModalOpen(true); // 성공 모달 열기
            setModalMessage("바리스타 노트가 성공적으로 등록되었습니다.");
            setLottieAnimation("/animations/success-check.json"); // 성공 애니메이션
            closeModal(); // 등록 모달 닫기
    
            // 노트 등록 후 상태를 바로 갱신하여 UI에 반영
            dispatch(callBaristNotesAPI());  // 새로 등록된 노트를 즉시 반영하기 위한 API 호출
        } catch (error) {
            console.error("노트 등록 실패:", error);
            alert('❌ 노트 등록에 실패했습니다.');
        }
    };
    
    /* ----------------------------------등록모달--------------------------------------- */
    /* ----------------------------------수정모달--------------------------------------- */

    const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [successLottieAnimation, setSuccessLottieAnimation] = useState("");

    // 수정 모드로 들어가기 전에 확인 모달을 띄우는 함수
    const openEditConfirmModal = () => {
        setModalMessage("수정하시겠습니까?");  // 수정 확인 메시지 설정
        setLottieAnimation("/animations/identify.json"); 
        setIsEditConfirmModalOpen(true);  // 수정 확인 모달 열기
    };

    const closeEditConfirmModal = () => {
        setIsEditConfirmModalOpen(false);  // 수정 확인 모달 닫기
    };

    const handleConfirmEdit = () => {
        setIsEditMode(true);  // 수정 모드로 전환
        closeEditConfirmModal();  // 모달 닫기
    };

    const handleCancelEdit = () => {
        // 원래 note의 제목과 내용을 설정하여 수정된 내용을 취소
        setNoteTitle(selectedNote.noteTitle);
        setNoteDetail(selectedNote.noteDetail);
        setIsEditMode(false); // 읽기 전용 모드로 설정
    };

    const closeSuccessModal = () => {
        setIsSuccessModalOpen(false);
    };

    /* ----------------------------------수정모달--------------------------------------- */


    console.log("🔍 Redux에서 가져온 user 객체:", user);
    console.log("📢 최종 userId:", userId);

    // 추가된 상태 변수
    const [pageCount, setPageCount] = useState(0); // 전체 페이지 수
    const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
    const notesPerPage = 15; // 한 페이지에 표시할 노트 개수

    useEffect(() => {
        dispatch(callBaristNotesAPI());
    }, [dispatch]);

    // 페이지 변경 핸들러
    const handlePageChange = (selected) => {
        setCurrentPage(selected.selected);
    };

    useEffect(() => {
        const newPageCount = Math.ceil(noteList.length / notesPerPage);
        setPageCount(newPageCount);
    
        setCurrentPage((prevPage) => 
            prevPage >= newPageCount && newPageCount > 0 ? newPageCount - 1 : prevPage
        );
    }, [noteList]);

    const notesToDisplay = noteList.slice(
        currentPage * notesPerPage,
        (currentPage + 1) * notesPerPage
    );

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

    const openDetailModal = async (note) => {
        // 기존 Redux 상태 가져오기
        const updatedNotes = noteList.map(n =>
            n.noteCode === note.noteCode ? { ...n, viewCount: (n.viewCount || 0) + 1 } : n
        );
    
        // Redux 상태 즉시 업데이트하여 UI에 반영
        dispatch({ type: GET_NOTES, payload: updatedNotes });
    
        // 서버에 조회수 증가 요청
        await dispatch(callBaristNoteDetailAPI({ noteCode: note.noteCode }));
    
        // 선택된 노트 상태 업데이트
        setSelectedNote({ ...note, viewCount: (note.viewCount || 0) + 1 });
        setNoteTitle(note.noteTitle);
        setNoteDetail(note.noteDetail);
        setIsDetailModalOpen(true);
        setIsEditMode(false);
    };

    const closeDetailModal = () => setIsDetailModalOpen(false);

    const handleTitleChange = (e) => setNoteTitle(e.target.value);
    const handleDetailChange = (e) => setNoteDetail(e.target.value);
    const handleFileChange = (e) => setAttachment(e.target.files[0]);

    const handleSearch = () => {
        if (search.trim()) {
            dispatch(callSearchNoteAPI({ search }));
        } else {
            dispatch(callBaristNotesAPI());
        }
    };

    // 삭제버튼을 추가하는 메소드
    // const handleDeleteNote = async (noteCode) => {
    //     if (window.confirm('정말로 이 노트를 삭제하시겠습니까?')) {
    //         await dispatch(callNoteDeleteAPI({ noteCode }));
    //         dispatch(callBaristNotesAPI()); // 노트 삭제 후 갱신
    //         closeDetailModal();
    //     }
    // };

    /* ----------------------------------삭제모달---------------------------------------------- */

    // 삭제 모달 관련 상태 추가
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);
    const [lottieAnimation, setLottieAnimation] = useState("");
    const [modalMessage, setModalMessage] = useState(""); 
    

    // 삭제 모달 열기 함수
    const openDeleteModal = (noteCode) => {
        setNoteToDelete(noteCode);
        setLottieAnimation("/animations/identify.json"); // 경고 애니메이션 설정
        setModalMessage("정말로 이 바리스타 노트를 삭제하시겠습니까?");
        setIsDeleteModalOpen(true);
    };

    // 삭제 모달 닫기 함수
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setNoteToDelete(null);
    };

    const confirmHandler = async () => {
        if (noteToDelete) {
            await dispatch(callNoteDeleteAPI({ noteCode: noteToDelete }));
            dispatch(callBaristNotesAPI()); // 노트 삭제 후 목록 갱신
        
            // ✅ 삭제 완료 메시지 설정
            setLottieAnimation("/animations/success-check.json"); 
            setModalMessage("바리스타 노트가 삭제되었습니다.");
        
            setTimeout(() => {
                closeDeleteModal(); // 삭제 모달 닫기
                closeDetailModal(); // 상세 모달 닫기
            }, 2000);
    
            // 삭제 즉시 상세보기 모달도 닫기
            closeDetailModal();
        }
    };
    


    // 삭제 버튼 클릭 시 모달 띄우도록 변경
    const handleDeleteNote = (noteCode) => {
        openDeleteModal(noteCode);
    };
    
    /* -------------------------------------------------------------------------------- */

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
                <div className={style.NoticeData}>
                {notesToDisplay.length > 0 ? (
                    notesToDisplay.map((note) => (
                        <div key={note.noteCode} className={style.infoRow} onClick={() => openDetailModal(note)}>
                            <div className={style.infoItem}>{note.noteCode}</div>
                            <div className={style.infoItem}>{note.noteTitle}</div>
                            <div className={style.infoItem}>{note.empName}</div>
                            <div className={style.infoItem}>{note.noteDate}</div>
                            <div className={style.infoItem}>{note.viewCount}</div>
                        </div>
                    ))
                ) : (
                    <div>데이터가 없습니다.</div>
                )}
                </div>

            {/* 페이지네이션 위치 조정 */}
            <div className={style.paginationContainer}>
                <ReactPaginate
                    previousLabel={"이전"}
                    nextLabel={"다음"}
                    breakLabel={"..."}
                    pageCount={pageCount}
                    marginPagesDisplayed={2}
                    pageRangeDisplayed={3}
                    onPageChange={handlePageChange}
                    containerClassName={style.pagination}
                    activeClassName={style.activePage}
                    previousClassName={style.previous}
                    nextClassName={style.next}
                    disabledClassName={style.disabled}
                    forcePage={currentPage}
                />
            </div>

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
                            <p>조회수: {selectedNote.viewCount}</p>
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
                                <button className={style.saveButton} onClick={openEditConfirmModal}>수정</button>
                                {/* 삭제 버튼 추가 */}
                                <button 
                                    className={style.deleteButton} 
                                    onClick={() => handleDeleteNote(selectedNote.noteCode)}
                                >
                                    삭제
                                </button>
                            </div>
                        )}

                        {/* 수정 모드일 때만 저장 및 취소 버튼 보이도록 */}
                        {isEditMode && (
                            <div className={style.modalButtons}>
                                <button className={style.saveButton} onClick={handleUpdateNote}>저장</button>
                                <button className={style.cancelButton} onClick={handleCancelEdit}>취소</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

           {/* 삭제 확인 모달 */}
           {isDeleteModalOpen && (
                <SModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => {
                        setIsDeleteModalOpen(false);
                    }}
                    buttons={
                        modalMessage === "바리스타 노트가 삭제되었습니다."
                            ? [
                                {
                                    text: "확인",
                                    onClick: () => setIsDeleteModalOpen(false),
                                    className: modalStyle.confirmButtonS,
                                },
                            ]
                            : [
                                {
                                    text: "삭제",
                                    onClick: confirmHandler, 
                                    className: modalStyle.deleteButtonS,
                                },
                                {
                                    text: "취소",
                                    onClick: closeDeleteModal,
                                    className: modalStyle.cancelButtonS,
                                },
                            ]
                    }
                >
                    <div style={{ textAlign: "center" }}>
                        <Player
                            autoplay
                            loop={false}
                            keepLastFrame={true}
                            src={lottieAnimation} 
                            style={{ height: "100px", width: "100px", margin: "0 auto" }}
                        />
                        <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
                            {modalMessage}
                        </span>
                    </div>
                </SModal>
            )}
            {/* ✅ 등록 성공 모달 */}
            {isSuccessModalOpen && (
                    <SModal
                        isOpen={isSuccessModalOpen}
                        onClose={() => {
                            setIsSuccessModalOpen(false);
                        }}
                        buttons={[
                            {
                                text: "확인",
                                onClick: () => {
                                    setIsSuccessModalOpen(false);
                                },
                                className: modalStyle.confirmButtonS,
                            },
                        ]}
                    >
                        <div style={{ textAlign: "center" }}>
                            <Player
                                autoplay
                                loop={false}
                                keepLastFrame={true}
                                src={lottieAnimation}
                                style={{ height: "100px", width: "100px", margin: "0 auto" }}
                            />
                            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
                                {modalMessage}
                            </span>
                        </div>
                    </SModal>
            )}
            {/* 수정 확인 모달 */}
            {isEditConfirmModalOpen && (
                    <SModal
                        isOpen={isEditConfirmModalOpen}
                        onClose={closeEditConfirmModal}  // 모달 닫기
                        buttons={[
                            {
                                text: "수정",
                                onClick: handleConfirmEdit,  // 수정 확정 시 호출
                                className: modalStyle.confirmButtonS,
                            },
                            {
                                text: "취소",
                                onClick: closeEditConfirmModal,  // 취소 시 모달 닫기
                                className: modalStyle.cancelButtonS,
                            },
                        ]}
                    >
                        <div style={{ textAlign: "center" }}>
                            {/* Lottie 애니메이션: Player 컴포넌트 사용 */}
                            <Player
                                autoplay
                                loop={false} // 애니메이션 반복 X
                                keepLastFrame={true} // 애니메이션 끝난 후 마지막 프레임 유지
                                src={lottieAnimation} // 동적으로 변경됨
                                style={{ height: "100px", width: "100px", margin: "0 auto" }}
                            />
                            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
                                {modalMessage}
                            </span>
                        </div>
                    </SModal>
                )}
                {isUpdateModalOpen && (
                <SModal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    buttons={[
                        {
                            text: "확인",
                            onClick: () => setIsUpdateModalOpen(false),
                            className: modalStyle.confirmButtonS,
                        },
                    ]}
                >
                    <div style={{ textAlign: "center" }}>
                        <Player
                            autoplay
                            loop={false}
                            keepLastFrame={true}
                            src={successLottieAnimation}
                            style={{ height: "100px", width: "100px", margin: "0 auto" }}
                        />
                        <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
                            {isUpdateModalOpen}
                        </span>
                    </div>
                </SModal>
            )}
        </>
    );
}

export default BaristaNoteLayout;