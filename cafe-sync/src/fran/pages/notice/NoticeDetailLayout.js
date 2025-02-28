import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { callNoticesAPI, callNoticeDetailAPI, callNoticeUpdateAPI , callNoticeDeleteAPI } from "../../../apis/notice/noticeApi";
import { useNavigate } from "react-router-dom";
import style from "../../pages/barista-note/NoteRegist.module.css";
import {RESET_NOTICE_DETAIL} from '../../../modules/NoticeModule';
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import Lottie from "lottie-react"; // Lottie 애니메이션을 위한 라이브러리
import { Player } from "@lottiefiles/react-lottie-player";

function NoticeDetailLayout() {
    const { noticeCode } = useParams();
    const dispatch = useDispatch();
    const notice = useSelector(state => state.noticeReducer.selectedNotice);
    const sessionUser = JSON.parse(sessionStorage.getItem("user"));
    const navigate = useNavigate();

    const handleCloseClick = () => {
        navigate("/fran/notice"); // 목록 페이지로 이동 (경로는 실제 목록 페이지에 맞게 변경)
    };

    const [creationDate, setCreationDate] = useState("");
    const [isViewCountIncreased, setIsViewCountIncreased] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editNotice, setEditNotice] = useState({});

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
            setModalMessage("정말로 이 공지사항을 삭제하시겠습니까?");
            setIsDeleteModalOpen(true);
        };
    
        // 삭제 모달 닫기 함수
        const closeDeleteModal = () => {
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        };
    
        // 삭제 확정 핸들러
        const confirmHandler = async () => {
            if (noteToDelete) {
                await dispatch(callNoticeDeleteAPI({ noticeCode: noteToDelete }));
                dispatch(callNoticesAPI()); // 공지 목록 갱신
                
                // ✅ 삭제 완료 메시지 설정
                setLottieAnimation("/animations/success-check.json"); 
                setModalMessage("공지사항이 삭제되었습니다.");
                
                // ✅ 성공 모달 다시 띄우기
                setIsDeleteModalOpen(true);
        
                // ✅ 확인 버튼 클릭 시 목록으로 이동
                setTimeout(() => {
                    closeDeleteModal(); 
                    navigate("/fran/notice");
                }, 2000); // 2초 후 이동
            }
        };
    
        // 삭제 버튼 클릭 시 모달 띄우도록 변경
        const handleDeleteNote = (noteCode) => {
            openDeleteModal(noteCode);
        };
        
    /* ----------------------------------수정모달--------------------------------------- */


    const [isEditConfirmModalOpen, setIsEditConfirmModalOpen] = useState(false);  // 수정 확인 모달 상태

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

    /* ----------------------------------수정모달--------------------------------------- */
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successLottieAnimation, setSuccessLottieAnimation] = useState("");
    const [successModalMessage, setSuccessModalMessage] = useState("");

    const handleSaveClick = async () => {
        if (editNotice.noticeCode === 0) {
            console.log("❌ 잘못된 공지사항 코드입니다.");
            return;
        }
    
        const now = new Date();
        const koreaTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const formattedDate = koreaTime.toISOString().split(".")[0];
    
        const updatedNotice = {
            ...editNotice,
            noticeDate: formattedDate,
        };
    
        setCreationDate(formattedDate);
    
        try {
            await dispatch(callNoticeUpdateAPI(updatedNotice));
            dispatch(callNoticeDetailAPI({ noticeCode }));
    
            // ✅ 수정 성공 모달 띄우기
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
        navigate("/fran/notice"); // ✅ 성공 모달 닫힌 후 목록 페이지로 이동
    };

    /* -------------------------------------------------------------------------------- */

    const isOwner = sessionUser && sessionUser.userId === notice?.userId;

    useEffect(() => {
        dispatch({ type: RESET_NOTICE_DETAIL }); // ✅ 공지사항 변경 시 기존 데이터 초기화
        dispatch(callNoticeDetailAPI({ noticeCode }));
    }, [dispatch, noticeCode]);
    

    useEffect(() => {
        if (notice && notice.noticeDate && !isViewCountIncreased) {
            setCreationDate(notice.noticeDate);  // 기존 작성일자 그대로 사용
            setIsViewCountIncreased(true);
            setEditNotice({ ...notice });
        }
    }, [notice, isViewCountIncreased]);

    if (!notice) {
        return <div>로딩 중...</div>; // ✅ 데이터 로딩 중이면 기존 데이터 노출 방지
    }

    const handleEditClick = () => {
        setIsEditMode(true);
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
        if (!isOwner) {
            alert("❌ 자신이 작성한 글만 삭제할 수 있습니다.");
            return;
        }
    
        // if (window.confirm("⚠️ 정말로 삭제하시겠습니까?")) {
        //     dispatch(callNoticeDeleteAPI({ noticeCode }))
        //         .then(() => {
        //             alert("✅ 공지사항이 삭제되었습니다.");
                    
        //             // ✅ 삭제된 공지를 제외한 새로운 목록으로 상태 업데이트
        //             dispatch(callNoticesAPI()); 
    
        //             // ✅ 삭제된 공지의 상세 페이지가 보이지 않도록 이동
        //             navigate("/fran/notice"); 
        //         })
        //         .catch((error) => {
        //             console.error("🚨 삭제 중 오류 발생:", error);
        //             alert("🚨 삭제에 실패했습니다.");
        //         });
        // }
        openDeleteModal(noticeCode);
    };

    if (!notice) {
        return <div>로딩 중...</div>;
    }

    return (
        <div className={style.wrapperBox}>
            <div className={style.noteDetailContainer}>
                <div className={style.closeButtonContainer}>
                    <div className={style.closeButton} onClick={handleCloseClick}>x</div>
                </div>
                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelTitle} htmlFor="noticeTitle">제목 :&nbsp;</label>
                        <input 
                            className={style.title} 
                            type="text" 
                            name="noticeTitle" 
                            value={editNotice.noticeTitle || ""} 
                            readOnly={!isEditMode} 
                            onChange={handleChange} 
                        />
                    </div>
                    <div className={style.inlineField}>
                        <label className={style.labelCreationDate} htmlFor="creationDate">작성날짜 :&nbsp;</label>
                        <input className={style.creationDate} type="text" value={creationDate || ""} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelWriter} htmlFor="writer">작성자 :&nbsp;</label>
                        <input className={style.writer} type="text" value={notice.empName || "정보 없음"} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <div className={style.inlineField}>
                        <label className={style.labelViews} htmlFor="views">조회수 :&nbsp;</label>
                        <input className={style.views} type="text" value={notice.noticeViews || "0"} readOnly />
                    </div>
                </div>

                <div className={style.row}>
                    <label className={style.labelAttachment} htmlFor="attachment">파일첨부 :&nbsp;</label>
                    <input 
                        className={style.attachment} 
                        type="file" 
                        name="attachment" 
                        disabled={!isEditMode} 
                    />
                </div>

                <div className={style.row}>
                    <label className={style.labelContent} htmlFor="content">내용 :&nbsp;</label>
                    <textarea 
                        className={style.Content} 
                        name="noticeContent" 
                        value={editNotice.noticeContent || ""} 
                        readOnly={!isEditMode} 
                        onChange={handleChange} 
                    />
                </div>

                <div className={style.buttonContainer}>
                    {isOwner && (
                        isEditMode ? (
                            <>
                                <button className={style.registButton} onClick={handleSaveClick}>저장</button>
                                <button className={style.returnToList} onClick={handleCancelClick}>취소</button>
                            </>
                        ) : (
                            <>
                                <button className={style.registButton} onClick={openEditConfirmModal}>수정</button>
                                <button className={style.returnToList} onClick={handleDeleteClick}>삭제</button>
                            </>
                        )
                        
                    )}
                </div>
            </div>
        {/* 삭제 확인 모달 */}
        {isDeleteModalOpen && (
            <SModal
                isOpen={isDeleteModalOpen}
                onClose={() => {
                    if (modalMessage === "공지사항이 삭제되었습니다.") {
                        navigate("/fran/notice"); // ✅ 삭제 완료 후 이동
                    }
                    closeDeleteModal();
                }}
                buttons={
                    modalMessage === "공지사항이 삭제되었습니다."
                        ? [
                            {
                                text: "확인",
                                onClick: () => navigate("/fran/notice"), 
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
        </div>
        
    );
}

export default NoticeDetailLayout;
