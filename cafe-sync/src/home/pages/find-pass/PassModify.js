import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./PassModify.module.css";
import { updatePassword } from "../../../apis/home/findAPI"; // ✅ 비밀번호 변경 API 호출

function PassModify() {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId || ""; // ✅ 넘어온 userId 값 가져오기

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageColor, setMessageColor] = useState("");
  const [passwordValid, setPasswordValid] = useState(false);
  const [lengthError, setLengthError] = useState(false);

  // ✅ 비밀번호 유효성 검사
  const validatePassword = (value) => {
    if (value.length > 14) return;
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
      setPasswordValid(passwordRegex.test(value));
    }

    // ✅ 비밀번호 입력값이 변경될 때마다 확인 비밀번호와 비교
    if (confirmPassword.length > 0) {
      checkPasswordMatch(confirmPassword, value);
    } else {
      setMessage(""); // ✅ 위쪽 비밀번호 입력값이 바뀌면 메시지 초기화
    }
  };

  // ✅ 비밀번호 일치 여부 확인
  const checkPasswordMatch = (confirmValue, mainPassword = password) => {
    setConfirmPassword(confirmValue);

    if (mainPassword && confirmValue) {
      if (mainPassword === confirmValue) {
        setMessage("비밀번호가 일치합니다.");
        setMessageColor("green");
      } else {
        setMessage("비밀번호가 일치하지 않습니다.");
        setMessageColor("red");
      }
    } else {
      setMessage(""); // ✅ 비밀번호가 입력되지 않은 경우 메시지 초기화
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordValid || password !== confirmPassword) {
      alert("⚠️ 비밀번호가 일치하지 않거나 유효하지 않습니다.");
      return;
    }

    try {
      const result = await updatePassword(userId, password);

      if (result.success) {
        alert("✅ 비밀번호가 변경되었습니다! 로그인 페이지로 이동합니다.");
        navigate("/");
      } else {
        alert(`${result.message}`);
      }
    } catch (error) {
      console.error("비밀번호 변경 오류:", error);
      alert("❌ 서버 오류로 인해 비밀번호 변경에 실패했습니다.");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <h2>새 비밀번호 설정</h2>
      </header>

      <div className={styles.container}>
        <div className={styles.inputBox}>
          <label>비밀번호</label>
          <input
            type="password"
            placeholder="새 비밀번호를 입력해주세요"
            value={password}
            onChange={(e) => validatePassword(e.target.value)}
            maxLength={14}
          />
          <p className={styles.helperText}>
            영문, 숫자, 특수문자 포함 8자~14자로 입력해주세요.
          </p>
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

        <div className={styles.inputBox}>
          <label>비밀번호 확인</label>
          <input
            type="password"
            placeholder="다시 한 번 새 비밀번호를 입력해주세요"
            value={confirmPassword}
            onChange={(e) => checkPasswordMatch(e.target.value)}
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

      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.confirmButton}`}
          onClick={handlePasswordChange}
          disabled={!passwordValid || password !== confirmPassword}
        >
          변경
        </button>

        <button
          className={`${styles.button} ${styles.cancelButton}`}
          onClick={() => navigate("/")} // ✅ 클릭 시 페이지 이동
        >
          취소
        </button>
      </div>
    </>
  );
}

export default PassModify;
