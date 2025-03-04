import React, { useState, useEffect } from "react";
import { useDispatch , useSelector } from "react-redux";
import { callNoticeRegistAPI } from "../../../apis/notice/noticeApi";  // API 호출 함수
import style from "../barista-note/NoteRegist.module.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ Lottie Player 추가


function NoticeRegistLayout() {

    const user = useSelector((state) => state.auth.user); // ✅ user 객체 가져오기
    const userId = user?.userId || null; // ✅ user 객체에서 userId 추출
    const [creationDate, setCreationDate] = useState("");
    const [noticeTitle, setNoticeTitle] = useState("");
    const [noticeContent, setNoticeContent] = useState("");
    const [attachment, setAttachment] = useState(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    /* ---------------------------------등록모달--------------------------------- */

    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lottieAnimation, setLottieAnimation] = useState("");
    const [modalMessage, setModalMessage] = useState("");

    const handleRegistClick = async () => {

        if (!noticeTitle || !noticeContent) {
            setLottieAnimation("/animations/identify.json");  // 애니메이션 설정
            setModalMessage("제목과 내용을 입력해주세요.");   // 모달 메시지 설정
            setIsSuccessModalOpen(true);  // 모달 열기
            return; // 등록을 막음
        }

        const noticeDate = new Date().toISOString(); // 현재 날짜와 시간
    
            const result = await dispatch(callNoticeRegistAPI({
                noticeTitle,
                noticeContent,
                noticeDate,  // 서버에 전달할 날짜 (시간 포함)
                userId,
                attachment,
            }));
    

            setLottieAnimation("/animations/success-check.json");
            setModalMessage("공지사항을 정상 등록하였습니다.");
            setIsSuccessModalOpen(true);
    };

    /* ---------------------------------등록모달--------------------------------- */

    useEffect(() => {
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
        setCreationDate(formattedDate);
    }, []);
    
    

    return (
        <>
            <div className={style.wrapperBox}>
                <div className={style.container}>
                    <div className={style.row}>
                        <div>
                            <label className={style.labelTitle} htmlFor="noticeTitle">공지제목 :&nbsp; </label>
                            <input
                                className={style.title}
                                type="text"
                                required
                                value={noticeTitle}
                                onChange={(e) => setNoticeTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className={style.labelCreationDate} htmlFor="creationDate">작성날짜 :&nbsp; </label>
                            <input
                                className={style.creationDate}
                                type="date"
                                value={creationDate}
                                readOnly
                            />
                        </div>
                    </div>
                    <div className={style.row}>
                        <label className={style.registAttachment} htmlFor="noticeAttachment">파일첨부 :&nbsp; </label>
                        <input
                            className={style.registFile}
                            type="file"
                            onChange={(e) => setAttachment(e.target.files[0])}
                        />
                    </div>
                    <div className={style.row}>
                        <label className={style.labelContent} htmlFor="noticeContent">공지내용 :&nbsp; </label>
                        <textarea
                            className={style.Content}
                            required
                            value={noticeContent}
                            onChange={(e) => setNoticeContent(e.target.value)}
                        />
                    </div>

                    {/* Button Container to center the buttons */}
                    <div className={style.buttonContainer}>
                        <button className={style.registButton} onClick={handleRegistClick}>등록</button>
                        <Link to="/fran/notice">
                            <button className={style.returnToList}>목록</button>
                        </Link>
                    </div>
                </div>
                {/* ✅ 등록 성공 모달 */}
                {isSuccessModalOpen && (
                    <SModal
                        isOpen={isSuccessModalOpen}
                        onClose={() => {
                            setIsSuccessModalOpen(false);
                            navigate("/fran/notice", { replace: true }); // ✅ 모달 닫은 후 목록 이동
                        }}
                        buttons={[
                            {
                                text: "확인",
                                onClick: () => {
                                    setIsSuccessModalOpen(false);
                                    navigate("/fran/notice", { replace: true });
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
            </div>
        </>
    );
}

export default NoticeRegistLayout;
