import styles from "./FindPass.module.css";
import { Link } from "react-router-dom";

function FindPass() {
  return (
    <>
      <header className={styles.header}>
        <h2>비밀번호 찾기</h2>
      </header>

      <div className={styles.container}>
        {/* 이름 입력 */}
        <div className={styles.inputBox}>
          <label>이름</label>
          <input type="text" placeholder="이름을 입력하세요" />
        </div>

        {/* 이메일 입력 */}
        <div className={styles.inputBox}>
          <label>이메일</label>
          <input type="text" placeholder="이메일을 입력하세요" />
        </div>

        <div className={styles.inputBox}>
          <label>인증번호</label>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="발송된 인증번호를 입력하세요" />
            <button className={`${styles.button} ${styles.searchButton}`}>
              인증
            </button>{" "}
          </div>
        </div>
      </div>

      {/* ✅ 확인 & 취소 버튼 정렬 */}
      <div className={styles.buttonGroup}>
        <Link to="/find-pass/modify" className={styles.selectButton}>
          <button className={`${styles.button} ${styles.confirmButton}`}>
            확인
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

export default FindPass;
