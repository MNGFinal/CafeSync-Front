import styles from "./FindPass.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { requestAuthCode, verifyAuthCode } from "../../../apis/home/findAPI"; // 분리된 API 가져오기

function FindPass() {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [authenticationNumber, setAuthenticationNumber] = useState("");
  const [timeLeft, setTimeLeft] = useState(null); // 남은 시간 (초)
  const navigate = useNavigate();

  // 인증번호 요청 함수
  const handleRequestAuthCode = async () => {
    if (!userId || !email) {
      alert("⚠️ 아이디와 이메일을 입력해주세요.");
      return;
    }

    const success = await requestAuthCode(userId, email);
    if (success) {
      alert("📩 인증번호가 이메일로 전송되었습니다.");
      setTimeLeft(300); // 5분 카운트다운 시작
    } else {
      alert("❌ 일치하는 정보가 없습니다.");
    }
  };

  // 입력한 인증번호 검증
  const handleVerifyAuthCode = async () => {
    if (!authenticationNumber) {
      alert("⚠️ 인증번호를 입력해주세요.");
      return;
    }

    const isVerified = await verifyAuthCode(
      userId,
      email,
      authenticationNumber
    );
    if (isVerified) {
      alert("✅ 인증되었습니다! 비밀번호 변경 페이지로 이동합니다.");
      navigate("/find-pass/modify", { state: { userId } }); // ✅ 인증된 아이디와 함께 이동
    } else {
      alert("❌ 인증번호가 일치하지 않습니다.");
    }
  };

  // 타이머 관리 (useEffect)
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // 시간 포맷 변환 함수
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <>
      <header className={styles.header}>
        <h2>비밀번호 찾기</h2>
      </header>

      <div className={styles.container}>
        {/* 아이디 입력 */}
        <div className={styles.inputBox}>
          <label>아이디</label>
          <input
            type="text"
            placeholder="아이디를 입력하세요"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>

        {/* 이메일 입력 (전송 버튼 추가) */}
        <div className={styles.inputBox}>
          <label>이메일</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              className={`${styles.button} ${styles.sendButton}`}
              onClick={handleRequestAuthCode}
            >
              전송
            </button>
          </div>
        </div>

        {/* 인증번호 입력 */}
        <div className={styles.inputBox}>
          <label>인증번호</label>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="발송된 인증번호를 입력하세요"
              value={authenticationNumber}
              onChange={(e) => setAuthenticationNumber(e.target.value)}
            />
            <button
              className={`${styles.button} ${styles.verifyButton}`}
              onClick={handleVerifyAuthCode}
              disabled={timeLeft === 0} // 시간이 다 되면 버튼 비활성화
            >
              인증
            </button>
          </div>
          {/* ⏳ 타이머 표시 */}
          {timeLeft !== null && timeLeft > 0 && (
            <p className={styles.timer}>⏳ 남은 시간: {formatTime(timeLeft)}</p>
          )}
          {timeLeft === 0 && (
            <p className={styles.timer}>❌ 시간이 초과되었습니다.</p>
          )}
        </div>
      </div>

      {/* 로그인 페이지로 이동 */}
      <div className={styles.buttonGroup}>
        <Link to="/" className={styles.selectButton}>
          <button className={`${styles.button} ${styles.cancelButton}`}>
            로그인 페이지로 이동하기
          </button>
        </Link>
      </div>
    </>
  );
}

export default FindPass;
