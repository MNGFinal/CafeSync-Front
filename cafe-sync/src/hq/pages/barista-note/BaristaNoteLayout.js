import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import style from "./NoteDetail.module.css";
import {
  callBaristNotesAPI,
  callSearchNoteAPI,
  callNoteRegistAPI,
  callNoteUpdateAPI,
  callNoteDeleteAPI,
  callBaristNoteDetailAPI,
} from "../../../apis/brista-note/baristaNoteApi";
import { GET_NOTES } from "../../../modules/NoteModule";
import ReactPaginate from "react-paginate";

// ✅ SModal + Lottie Player
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player";

// ✅ Modal (공용)
import Modal from "../../../components/Modal";

// ✅ Firebase 파일 업로드
import { uploadFileBaristaToFirebase } from "../../../firebase/uploadFileBaristaToFirebase";

/** 파일명만 추출하는 헬퍼 함수 */
const extractFileName = (fileUrl) => {
  if (!fileUrl || fileUrl === "null") return "";
  const decodedUrl = decodeURIComponent(fileUrl);
  const urlWithoutParams = decodedUrl.split("?")[0];
  return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1);
};

/** blob 방식 다운로드 헬퍼 함수 */
const handleDownload = async (fileUrl) => {
  try {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`파일 다운로드 실패! 상태코드: ${response.status}`);
    }
    const blob = await response.blob();
    const fileName = extractFileName(fileUrl);
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error("파일 다운로드 중 오류 발생:", error);
  }
};

function BaristaNoteLayout() {
  const dispatch = useDispatch();
  const notes = useSelector((state) => state.noteReducer.data);
  const user = useSelector((state) => state.auth.user);
  const userId = user?.userId || null;

  /** 노트 목록 (메모이제이션) */
  const noteList = useMemo(() => (Array.isArray(notes) ? notes : []), [notes]);

  /** 페이지네이션 관련 상태 */
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const notesPerPage = 10;

  /** 검색 상태 */
  const [search, setSearch] = useState("");

  /** 모달 상태 */
  const [isModalOpen, setIsModalOpen] = useState(false); // 등록 모달
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false); // 상세보기 모달
  const [isEditMode, setIsEditMode] = useState(false);

  /** 선택된 노트 정보 */
  const [selectedNote, setSelectedNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDetail, setNoteDetail] = useState("");
  const [attachment, setAttachment] = useState(null);

  /** 삭제 확인 모달 */
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [deleteModalMessage, setDeleteModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");

  /** ✅ 공통 SModal (경고/성공) 관리 */
  const [sModalOpen, setSModalOpen] = useState(false);
  const [sModalMessage, setSModalMessage] = useState("");
  const [sModalAnimation, setSModalAnimation] = useState("");
  const [sModalButtons, setSModalButtons] = useState([]);

  /** 노트 목록 불러오기 */
  useEffect(() => {
    dispatch(callBaristNotesAPI());
  }, [dispatch]);

  /** 페이지네이션 세팅 */
  useEffect(() => {
    const newPageCount = Math.ceil(noteList.length / notesPerPage);
    setPageCount(newPageCount);
    setCurrentPage((prev) =>
      prev >= newPageCount && newPageCount > 0 ? newPageCount - 1 : prev
    );
  }, [noteList]);

  const notesToDisplay = noteList.slice(
    currentPage * notesPerPage,
    (currentPage + 1) * notesPerPage
  );

  /** 페이지 변경 핸들러 */
  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  /** 검색 */
  const handleSearchChange = (e) => setSearch(e.target.value);
  const handleSearch = () => {
    if (search.trim()) {
      dispatch(callSearchNoteAPI({ search }));
    } else {
      dispatch(callBaristNotesAPI());
    }
  };

  /** 등록 모달 열기/닫기 */
  const openModal = () => {
    setIsEditMode(false);
    setNoteTitle("");
    setNoteDetail("");
    setAttachment(null);
    setSelectedNote(null);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  /** 상세보기 모달 열기/닫기 */
  const openDetailModal = async (note) => {
    // 프론트 조회수 증가
    dispatch({
      type: GET_NOTES,
      payload: noteList.map((n) =>
        n.noteCode === note.noteCode
          ? { ...n, viewCount: (n.viewCount || 0) + 1 }
          : n
      ),
    });
    // 백엔드 조회수 증가
    await dispatch(callBaristNoteDetailAPI({ noteCode: note.noteCode }));

    // 노트 정보 세팅
    setSelectedNote({ ...note, viewCount: (note.viewCount || 0) + 1 });
    setNoteTitle(note.noteTitle);
    setNoteDetail(note.noteDetail);

    // ✅ 기존 첨부파일을 상태에 세팅 (중요!)
    setAttachment(note.attachment || null);

    setIsEditMode(false);
    setIsDetailModalOpen(true);
  };
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setIsEditMode(false);
  };

  /** 파일 업로드(Firebase) */
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return; // 파일 선택 취소 시 아무것도 안 함

    try {
      const downloadURL = await uploadFileBaristaToFirebase(file);
      setAttachment(downloadURL);
    } catch (error) {
      console.error("파일 업로드 중 오류 발생:", error);
    }
  };

  /** 노트 등록 */
  const handleSaveNote = async () => {
    // 필수값 검증
    if (!noteTitle.trim() || !noteDetail.trim()) {
      // warning 모달
      setSModalMessage("제목과 내용을 입력해주세요!");
      setSModalAnimation("/animations/warning.json");
      setSModalButtons([
        {
          text: "확인",
          onClick: () => setSModalOpen(false),
          className: modalStyle.confirmButtonS,
        },
      ]);
      setSModalOpen(true);
      return;
    }

    const newNote = {
      noteTitle,
      noteDetail,
      userId,
      noteDate: new Date().toISOString(),
      attachment,
    };
    try {
      await dispatch(callNoteRegistAPI(newNote));

      // success 모달
      setSModalMessage("바리스타 노트가 성공적으로 등록되었습니다.");
      setSModalAnimation("/animations/success-check.json");
      setSModalButtons([
        {
          text: "확인",
          onClick: () => {
            setSModalOpen(false);
            closeModal();
          },
          className: modalStyle.confirmButtonS,
        },
      ]);
      setSModalOpen(true);

      dispatch(callBaristNotesAPI());
    } catch (error) {
      console.error("노트 등록 실패:", error);
      alert("❌ 노트 등록에 실패했습니다.");
    }
  };

  /** 노트 수정 */
  const handleUpdateNote = async () => {
    // 필수값 검증
    if (!noteTitle.trim() || !noteDetail.trim()) {
      // warning 모달
      setSModalMessage("제목과 내용을 입력해주세요!");
      setSModalAnimation("/animations/warning.json");
      setSModalButtons([
        {
          text: "확인",
          onClick: () => setSModalOpen(false),
          className: modalStyle.confirmButtonS,
        },
      ]);
      setSModalOpen(true);
      return;
    }

    if (selectedNote.userId !== userId) {
      alert("자신이 작성한 글만 수정할 수 있습니다.");
      return;
    }
    const updatedNote = {
      noteCode: selectedNote.noteCode,
      noteTitle,
      noteDetail,
      noteDate: new Date().toISOString(),
      userId,
      attachment,
    };
    await dispatch(callNoteUpdateAPI(updatedNote));
    dispatch(callBaristNoteDetailAPI({ noteCode: selectedNote.noteCode }));

    // success 모달
    setSModalMessage("바리스타 노트를 정상적으로 수정하였습니다.");
    setSModalAnimation("/animations/success-check.json");
    setSModalButtons([
      {
        text: "확인",
        onClick: () => {
          setSModalOpen(false);
          closeDetailModal();
          setSearch(""); // 검색어 초기화
          dispatch(callBaristNotesAPI()); // 전체 목록 다시 불러오기
        },
        className: modalStyle.confirmButtonS,
      },
    ]);
    setSModalOpen(true);
  };

  /** 수정 취소 */
  const handleCancelEdit = () => {
    setNoteTitle(selectedNote.noteTitle);
    setNoteDetail(selectedNote.noteDetail);
    setIsEditMode(false);
  };

  /** 노트 삭제 */
  const openDeleteModal = (noteCode) => {
    setNoteToDelete(noteCode);
    setDeleteModalMessage("정말로 이 바리스타 노트를 삭제하시겠습니까?");
    setLottieAnimation("/animations/identify.json");
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };
  const confirmDelete = async () => {
    if (noteToDelete) {
      await dispatch(callNoteDeleteAPI({ noteCode: noteToDelete }));
      dispatch(callBaristNotesAPI());

      setDeleteModalMessage("바리스타 노트가 삭제되었습니다.");
      setLottieAnimation("/animations/success-check.json");
      setTimeout(() => {
        closeDeleteModal();
        closeDetailModal();
      }, 1000);
    }
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <>
      {/* 상단 검색 / 등록 영역 */}
      <div className={style.upperBox}>
        <input
          className={style.inputBox}
          type="text"
          placeholder="게시글검색"
          value={search}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyPress} // ✅ 엔터 키 입력 감지
        />
        <button className={style.searchButton} onClick={handleSearch}>
          검색
        </button>
        <button className={style.registButton} onClick={openModal}>
          등록
        </button>
      </div>

      {/* 노트 목록 영역 */}
      <div className={style.lowerBox}>
        {/* 실제 테이블 형태를 표현할 메인 컨테이너 */}
        <div className={style.NoticeData}>
          {/* ✅ 헤더 행 */}
          <div className={`${style.infoRow} ${style.header}`}>
            <div className={style.infoItem}>번호</div>
            <div className={style.infoItem}>제목</div>
            <div className={style.infoItem}>작성자</div>
            <div className={style.infoItem}>작성일</div>
            <div className={style.infoItem}>조회수</div>
          </div>

          {/* ✅ 데이터 행 */}
          {notesToDisplay.length > 0 ? (
            notesToDisplay.map((note) => (
              <div
                key={note.noteCode}
                className={style.infoRow}
                onClick={() => openDetailModal(note)}
                style={{ cursor: "pointer" }}
              >
                <div className={style.infoItem}>{note.noteCode}</div>
                <div className={style.infoItem}>{note.noteTitle}</div>
                <div className={style.infoItem}>{note.empName}</div>
                <div className={style.infoItem}>
                  {new Date(note.noteDate).toISOString().split("T")[0]}
                </div>
                <div className={style.infoItem}>{note.viewCount}</div>
              </div>
            ))
          ) : (
            <div className={style.noData}>데이터가 없습니다.</div>
          )}
        </div>

        {/* 페이지네이션 영역 */}
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

      {/* ========== [신규 등록 모달] ========== */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <div className={style.modalContentContainer}>
            <h2 className={style.modalTitle}>바리스타 노트 등록</h2>

            <label className={style.label} htmlFor="noteTitle">
              제목
            </label>
            <input
              id="noteTitle"
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className={style.modalTitleInput}
            />

            <label className={style.label} htmlFor="fileUpload">
              파일 첨부
            </label>
            <input
              id="fileUpload"
              type="file"
              onChange={handleFileChange}
              className={style.fileInput}
            />

            <label className={style.label} htmlFor="noteContent">
              내용
            </label>
            <textarea
              id="noteContent"
              placeholder="노트를 작성하세요"
              onChange={(e) => setNoteDetail(e.target.value)}
              className={style.textarea}
            />

            <div className={style.buttonBox2}>
              <button className={style.saveButton} onClick={handleSaveNote}>
                저장
              </button>
              <button className={style.cancelButton} onClick={closeModal}>
                닫기
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========== [상세보기/수정 모달] ========== */}
      {isDetailModalOpen && selectedNote && (
        <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal}>
          <div className={style.modalContent}>
            <hr />
            {/* 노트 제목: 수정 모드면 input, 아니면 h2로 표시 */}
            {isEditMode ? (
              <input
                type="text"
                className={style.modalTitleInput}
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            ) : (
              <h2 className={style.noteTitle}>{selectedNote.noteTitle}</h2>
            )}

            {/* 작성자/작성일/조회수 */}
            <div className={style.modalInfo}>
              <p>
                작성자: <span>{selectedNote.empName}</span>
              </p>
              <p>
                작성일:{" "}
                <span>
                  {new Date(selectedNote.noteDate).toISOString().split("T")[0]}
                </span>
              </p>
              <p>
                조회수: <span>{selectedNote.viewCount}</span>
              </p>
            </div>

            {/* 파일 첨부 */}
            <label className={style.label}>파일 첨부</label>
            {isEditMode ? (
              <>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className={style.fileInput}
                />
                {/* 기존 attachment가 있으면 이름 표시 */}
                {attachment && (
                  <div className={style.attachmentPreview}>
                    기존 파일: {extractFileName(attachment)}
                  </div>
                )}
              </>
            ) : selectedNote.attachment ? (
              // 수정 모드가 아닐 때: 다운로드 버튼
              <button
                className={style.downloadButton}
                onClick={() => handleDownload(selectedNote.attachment)}
              >
                {extractFileName(selectedNote.attachment)}
              </button>
            ) : (
              <p className={style.noAttachment}>첨부파일 없음</p>
            )}

            {/* 내용 */}
            <div className={style.textBox}>
              <label className={style.label}>내용</label>
              <textarea
                value={noteDetail}
                onChange={(e) => setNoteDetail(e.target.value)}
                readOnly={!isEditMode}
                className={style.textarea}
              />
            </div>
            {/* 하단 버튼들 */}
            <div className={style.buttonBox}>
              {selectedNote && selectedNote.userId === userId && (
                <>
                  {isEditMode ? (
                    <>
                      <button
                        className={style.saveButton}
                        onClick={handleUpdateNote}
                      >
                        저장
                      </button>
                      <button
                        className={style.cancelButton}
                        onClick={handleCancelEdit}
                      >
                        취소
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className={style.saveButton}
                        onClick={() => setIsEditMode(true)}
                      >
                        수정
                      </button>
                      <button
                        className={style.deleteButton}
                        onClick={() => openDeleteModal(selectedNote.noteCode)}
                      >
                        삭제
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ========== [삭제 확인 모달] ========== */}
      {isDeleteModalOpen && (
        <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
          <div className={style.modalContentContainer}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src={lottieAnimation}
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <p className={style.modalMessage}>{deleteModalMessage}</p>
            <div className={style.buttonBox}>
              <button className={style.deleteButton} onClick={confirmDelete}>
                삭제
              </button>
              <button className={style.cancelButton} onClick={closeDeleteModal}>
                취소
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ========== [공통 SModal (경고/성공 등)] ========== */}
      <SModal
        isOpen={sModalOpen}
        onClose={() => setSModalOpen(false)}
        buttons={sModalButtons}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={sModalAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <p style={{ marginTop: "15px" }}>{sModalMessage}</p>
        </div>
      </SModal>
    </>
  );
}

export default BaristaNoteLayout;
