import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { callNoticeRegistAPI } from "../../../apis/notice/noticeApi"; // API 호출 함수
import style from "./HQNoticeRegistLayout.module.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ Lottie Player 추가
import { uploadFileToFirebase } from "../../../firebase/uploadFileToFirebase";

function HQNoticeRegistLayout() {
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
      setLottieAnimation("/animations/identify.json");
      setModalMessage("제목과 내용을 입력해주세요.");
      setIsSuccessModalOpen(true);
      return;
    }

    const noticeDate = new Date().toISOString(); // 현재 날짜

    let fileUrl = null;
    if (attachment) {
      fileUrl = await uploadFileToFirebase(attachment); // 🔹 Firebase에 파일 업로드
    }

    const result = await dispatch(
      callNoticeRegistAPI({
        noticeTitle,
        noticeContent,
        noticeDate,
        userId,
        attachment: fileUrl, // 🔹 업로드한 파일의 URL을 보냄
      })
    );

    setLottieAnimation("/animations/success-check.json");
    setModalMessage("공지사항을 정상 등록하였습니다.");
    setIsSuccessModalOpen(true);
  };

  /* ---------------------------------등록모달--------------------------------- */

  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split("T")[0]; // YYYY-MM-DD 형식
    setCreationDate(formattedDate);
  }, []);

  return (
    <>
      <div className={style.wrapperBox}>
        <div className={style.container}>
          {/* 공지 제목 */}
          <div className={style.inputGroup}>
            <input
              type="text"
              id="noticeTitle"
              value={noticeTitle}
              onChange={(e) => setNoticeTitle(e.target.value)}
              placeholder=" "
            />
            <label htmlFor="noticeTitle">공지제목</label>
          </div>

          {/* 작성 날짜 */}
          <div className={style.inputGroup}>
            <input
              type="date"
              id="createDate"
              value={creationDate}
              readOnly
              className={style.createDate}
            />
            <label htmlFor="createDate">작성날짜</label>
          </div>

          {/* 파일 첨부 */}
          <div className={style.inputGroup}>
            <input
              type="file"
              id="noticeAttachment"
              className={style.registFile}
              onChange={(e) => setAttachment(e.target.files[0])}
            />
            <label htmlFor="noticeAttachment">파일첨부</label>
          </div>

          {/* 공지 내용 */}
          <div className={style.inputGroup}>
            <textarea
              id="noticeContent"
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder=" "
            />
            <label htmlFor="noticeContent">공지내용</label>
          </div>

          {/* 버튼 */}
          <div className={style.buttonContainer}>
            <button className={style.registButton} onClick={handleRegistClick}>
              등록
            </button>
            <Link to="/hq/notice">
              <button
                className={style.returnToList}
                onClick={() => {
                  window.location.href = "/hq/notice";
                }}
              >
                목록
              </button>
            </Link>
          </div>
        </div>
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
                  navigate("/hq/notice");
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
              <span
                style={{
                  marginTop: "15px",
                  whiteSpace: "pre-line",
                  padding: "10px",
                  position: "absolute",
                  top: "43%",
                  left: "21%",
                }}
              >
                {modalMessage}
              </span>
            </div>
          </SModal>
        )}
      </div>
    </>
  );
}

export default HQNoticeRegistLayout;
