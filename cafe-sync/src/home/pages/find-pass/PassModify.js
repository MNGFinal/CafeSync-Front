import { useState } from "react";
import styles from "./PassModify.module.css";
import { Link } from "react-router-dom";

function PassModify() {
  // ✅ 상태 변수
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState(""); // ✅ 비밀번호 확인 메시지
  const [messageColor, setMessageColor] = useState(""); // ✅ 메시지 색상
  const [passwordValid, setPasswordValid] = useState(false); // ✅ 비밀번호 유효성 체크
  const [lengthError, setLengthError] = useState(false); // ✅ 길이 제한 에러 상태

  // ✅ 비밀번호 유효성 검사 (영문 + 숫자 + 특수문자 포함, 8~14자)
  const validatePassword = (value) => {
    if (value.length > 14) return; // ✅ 14자 초과 입력 방지

    setPassword(value);
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+]).{8,14}$/;

    if (value.length === 0) {
      setPasswordValid(false);
      setLengthError(false);
    } else if (value.length < 8) {
      setPasswordValid(false);
      setLengthError(true);
    } else {
      setLengthError(false);
      if (!passwordRegex.test(value)) {
        setPasswordValid(false);
      } else {
        setPasswordValid(true);
      }
    }
  };

  // ✅ 비밀번호 일치 여부 확인
  const checkPasswordMatch = (value) => {
    setConfirmPassword(value);

    if (password && value) {
      if (password === value) {
        setMessage("비밀번호가 일치합니다.");
        setMessageColor("green");
      } else {
        setMessage("비밀번호가 일치하지 않습니다.");
        setMessageColor("red");
      }
    } else {
      setMessage(""); // 입력이 없을 때 메시지 제거
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h2>새 비밀번호 설정</h2>
      </header>

      <div className={styles.container}>
        {/* 비밀번호 입력 */}
        <div className={styles.inputBox}>
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="새 비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => validatePassword(e.target.value)} // ✅ 비밀번호 유효성 검사 실행
            maxLength={14} // ✅ 14자 초과 입력 방지
          />
          {/* ✅ 기본 안내 문구 (회색) */}
          <p className={styles.helperText}>
            영문, 숫자, 특수문자 포함 8자~14자로 입력해주세요.
          </p>
          {/* ✅ 조건 미달일 경우 오류 메시지 (빨간색) */}
          {lengthError && (
            <p className={styles.warningText}>
              비밀번호는 8자 이상 14자 이하로 입력해야 합니다.
            </p>
          )}
          {!passwordValid && password.length >= 8 && (
            <p className={styles.warningText}>
              영문, 숫자, 특수문자를 포함해야 합니다.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 입력 */}
        <div className={styles.inputBox}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            placeholder="다시 한 번 새 비밀번호를 입력해주세요"
            value={confirmPassword}
            onChange={(e) => checkPasswordMatch(e.target.value)} // ✅ 비밀번호 확인
          />
          {message && (
            <p
              className={styles.passwordMessage}
              style={{ color: messageColor }}
            >
              {message}
            </p>
          )}
        </div>
      </div>

      {/* ✅ 확인 & 취소 버튼 정렬 */}
      <div className={styles.buttonGroup}>
        <Link to="/" className={styles.selectButton}>
          <button
            className={`${styles.button} ${styles.confirmButton}`}
            disabled={!passwordValid || password !== confirmPassword}
          >
            변경
          </button>
        </Link>

        <Link to="/" className={styles.selectButton}>
          <button className={`${styles.button} ${styles.cancelButton}`}>
            취소
          </button>
        </Link>
      </div>
    </>
  );
}

export default PassModify;
