import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  callNoticesAPI,
  callNoticeDetailAPI,
  callNoticeUpdateAPI,
  callNoticeDeleteAPI,
} from "../../../apis/notice/noticeApi";
import style from "./HQNoticeDetailLayout.module.css";
import { RESET_NOTICE_DETAIL } from "../../../modules/NoticeModule";
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player";

function extractFileName(fileUrl) {
  const decodedUrl = decodeURIComponent(fileUrl);
  const urlWithoutParams = decodedUrl.split("?")[0];
  return urlWithoutParams.substring(urlWithoutParams.lastIndexOf("/") + 1);
}

function HQNoticeDetailLayout() {
  const { noticeCode } = useParams();
  const dispatch = useDispatch();
  const notice = useSelector((state) => state.noticeReducer.selectedNotice);
  const sessionUser = JSON.parse(sessionStorage.getItem("user"));
  const navigate = useNavigate();

  const [creationDate, setCreationDate] = useState("");
  const [isViewCountIncreased, setIsViewCountIncreased] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editNotice, setEditNotice] = useState({});

  // 공통 모달 상태 (삭제/수정 확인 모달에 사용)
  const [commonLottieAnimation, setCommonLottieAnimation] = useState("");
  const [commonModalMessage, setCommonModalMessage] = useState("");

  // 삭제 모달 상태
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // 수정 확인 모달 상태
  const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);

  // 수정 성공 모달 상태
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successLottieAnimation, setSuccessLottieAnimation] = useState("");
  const [successModalMessage, setSuccessModalMessage] = useState("");

  // 공지사항 상세정보를 불러오고 초기 상태 설정
  useEffect(() => {
    dispatch({ type: RESET_NOTICE_DETAIL });
    dispatch(callNoticeDetailAPI({ noticeCode }));
  }, [dispatch, noticeCode]);

  useEffect(() => {
    if (notice && notice.noticeDate && !isViewCountIncreased) {
      const formattedDate = new Date(notice.noticeDate);
      const displayDate = formattedDate.toISOString().split("T")[0];
      setCreationDate(displayDate);
      setIsViewCountIncreased(true);
      setEditNotice({ ...notice });
    }
  }, [notice, isViewCountIncreased]);

  // 모달 처리 함수 (삭제)
  const openDeleteModal = (code) => {
    setNoteToDelete(code);
    setCommonLottieAnimation("/animations/identify.json");
    setCommonModalMessage("정말로 이 공지사항을 삭제하시겠습니까?");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setNoteToDelete(null);
  };

  const confirmDelete = async () => {
    if (noteToDelete) {
      await dispatch(callNoticeDeleteAPI({ noticeCode: noteToDelete }));
      dispatch(callNoticesAPI());
      setCommonLottieAnimation("/animations/success-check.json");
      setCommonModalMessage("공지사항이 삭제되었습니다.");
      setIsDeleteModalOpen(true);
      setTimeout(() => {
        closeDeleteModal();
        navigate("/hq/notice");
      }, 2000);
    }
  };

  // 모달 처리 함수 (수정 확인)
  const openEditConfirmModal = () => {
    if (!editNotice.noticeTitle || !editNotice.noticeContent) {
      setCommonModalMessage("제목과 내용을 모두 입력해주세요.");
      setCommonLottieAnimation("/animations/identify.json");
      setIsEditConfirmModalOpen(true);
    } else {
      setCommonModalMessage("수정하시겠습니까?");
      setCommonLottieAnimation("/animations/identify.json");
      setIsEditConfirmModalOpen(true);
    }
  };

  const closeEditConfirmModal = () => {
    setIsEditConfirmModalOpen(false);
  };

  const handleConfirmEdit = () => {
    setIsEditMode(true);
    closeEditConfirmModal();
  };

  // 수정 저장 함수
  const handleSaveClick = async () => {
    if (!editNotice.noticeTitle || !editNotice.noticeContent) {
      setCommonModalMessage("제목과 내용을 모두 입력해주세요.");
      setCommonLottieAnimation("/animations/identify.json");
      setIsEditConfirmModalOpen(true);
      return;
    }

    if (editNotice.noticeCode === 0) {
      console.error("❌ 잘못된 공지사항 코드입니다.");
      return;
    }

    const now = new Date();
    const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const formattedDate = koreaTime.toISOString();
    const displayDate = formattedDate.split("T")[0];
    setCreationDate(displayDate);

    const updatedNotice = {
      ...editNotice,
      noticeDate: formattedDate,
    };

    try {
      await dispatch(callNoticeUpdateAPI(updatedNotice));
      dispatch(callNoticeDetailAPI({ noticeCode }));
      setSuccessLottieAnimation("/animations/success-check.json");
      setSuccessModalMessage("공지사항을 정상적으로 수정하였습니다.");
      setIsSuccessModalOpen(true);
    } catch (error) {
      console.error("🚨 공지사항 수정 중 오류 발생:", error);
      alert("🚨 공지사항 수정에 실패했습니다.");
    }

    setIsEditMode(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/hq/notice");
  };

  // 기타 핸들러
  const handleCloseClick = () => {
    navigate("/hq/notice");
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

  const handleDeleteClick = () => {
    if (!(sessionUser && sessionUser.userId === notice?.userId)) {
      alert("❌ 자신이 작성한 글만 삭제할 수 있습니다.");
      return;
    }
    openDeleteModal(noticeCode);
  };

  // blob 방식 파일 다운로드 함수
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

  if (!notice) {
    return <div>로딩 중...</div>;
  }

  const isOwner = sessionUser && sessionUser.userId === notice?.userId;

  return (
    <div className={style.wrapperBox}>
      <div className={style.noteDetailContainer}>
        <div className={style.closeButtonContainer}>
          <div className={style.closeButton} onClick={handleCloseClick}>
            x
          </div>
        </div>
        {/* 제목 Row */}
        <div className={style.row}>
          <div className={style.inlineField}>
            <label className={style.labelTitle} htmlFor="noticeTitle">
              제목&nbsp;
            </label>
            <input
              className={style.title}
              type="text"
              name="noticeTitle"
              value={editNotice.noticeTitle || ""}
              readOnly={!isEditMode}
              onChange={handleChange}
            />
          </div>
        </div>
        {/* 작성자와 작성날짜 Row */}
        <div className={style.row}>
          <div className={style.inlineField}>
            <label className={style.labelWriter} htmlFor="writer">
              작성자&nbsp;
            </label>
            <input
              className={style.writer}
              type="text"
              value={notice.empName || "정보 없음"}
              readOnly
            />
          </div>
          <div className={style.inlineField}>
            <label className={style.labelCreationDate} htmlFor="creationDate">
              작성날짜&nbsp;
            </label>
            <input
              className={style.creationDate}
              type="text"
              value={creationDate || ""}
              readOnly
            />
          </div>
        </div>
        {/* 조회수 Row */}
        <div className={style.row}>
          <div className={style.inlineField}>
            <label className={style.labelViews} htmlFor="views">
              조회수&nbsp;
            </label>
            <input
              className={style.views}
              type="text"
              value={notice.noticeViews || "0"}
              readOnly
            />
          </div>
        </div>
        {/* 파일첨부 Row */}
        <div className={style.row}>
          <label className={style.labelAttachment} htmlFor="attachment">
            파일첨부:&nbsp;
          </label>
          {notice.attachment ? (
            <button
              className={style.downloadButton}
              onClick={() => handleDownload(notice.attachment)}
            >
              {extractFileName(notice.attachment)}
            </button>
          ) : (
            <span className={style.noAttachment}>첨부된 파일이 없습니다.</span>
          )}
        </div>
        {/* 내용 Row */}
        <div className={style.row}>
          <label className={style.labelContent} htmlFor="content">
            내용&nbsp;
          </label>
          <textarea
            className={style.Content}
            name="noticeContent"
            value={editNotice.noticeContent || ""}
            readOnly={!isEditMode}
            onChange={handleChange}
          />
        </div>
        {/* 버튼 컨테이너 */}
        <div className={style.buttonContainer}>
          {isOwner &&
            (isEditMode ? (
              <>
                <button
                  className={style.registButton}
                  onClick={handleSaveClick}
                >
                  저장
                </button>
                <button
                  className={style.returnToList}
                  onClick={handleCancelClick}
                >
                  취소
                </button>
              </>
            ) : (
              <>
                <button
                  className={style.registButton}
                  onClick={openEditConfirmModal}
                >
                  수정
                </button>
                <button
                  className={style.returnToList}
                  onClick={handleDeleteClick}
                >
                  삭제
                </button>
              </>
            ))}
        </div>
      </div>
      {/* 삭제 확인 모달 */}
      {isDeleteModalOpen && (
        <SModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            if (commonModalMessage === "공지사항이 삭제되었습니다.") {
              navigate("/hq/notice");
            }
            closeDeleteModal();
          }}
          buttons={
            commonModalMessage === "공지사항이 삭제되었습니다."
              ? [
                  {
                    text: "확인",
                    onClick: () => navigate("/hq/notice"),
                    className: modalStyle.confirmButtonS,
                  },
                ]
              : [
                  {
                    text: "삭제",
                    onClick: confirmDelete,
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
              src={commonLottieAnimation}
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {commonModalMessage}
            </span>
          </div>
        </SModal>
      )}
      {/* 수정 성공 모달 */}
      {isSuccessModalOpen && (
        <SModal
          isOpen={isSuccessModalOpen}
          onClose={closeSuccessModal}
          buttons={[
            {
              text: "확인",
              onClick: closeSuccessModal,
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
              {successModalMessage}
            </span>
          </div>
        </SModal>
      )}
      {/* 수정 확인 모달 */}
      {isEditConfirmModalOpen && (
        <SModal
          isOpen={isEditConfirmModalOpen}
          onClose={closeEditConfirmModal}
          buttons={[
            commonModalMessage === "제목과 내용을 모두 입력해주세요."
              ? {
                  text: "확인",
                  onClick: closeEditConfirmModal,
                  className: modalStyle.confirmButtonS,
                }
              : {
                  text: "수정",
                  onClick: handleConfirmEdit,
                  className: modalStyle.confirmButtonS,
                },
            commonModalMessage !== "제목과 내용을 모두 입력해주세요." && {
              text: "취소",
              onClick: closeEditConfirmModal,
              className: modalStyle.cancelButtonS,
            },
          ].filter(Boolean)}
        >
          <div style={{ textAlign: "center" }}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src={commonLottieAnimation}
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {commonModalMessage}
            </span>
          </div>
        </SModal>
      )}
    </div>
  );
}

export default HQNoticeDetailLayout;
