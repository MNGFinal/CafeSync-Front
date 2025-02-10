import styles from "./FranchiseId.module.css";
import { Link } from "react-router-dom";

function FranchiseId() {
  return (
    <>
      <header className={styles.header}>
        <img src="/images/icons/cafe.png" alt="카페" className={styles.icon} />
        <h2>가맹점 아이디 찾기</h2>
      </header>

      <div className={styles.container}>
        {/* 가맹점 선택 */}
        <div className={styles.inputBox}>
          <label>가맹점</label>
          <div className={styles.inputGroup}>
            <input type="text" placeholder="가맹점을 검색하세요" />
            <button className={`${styles.button} ${styles.searchButton}`}>
              검색
            </button>{" "}
          </div>
        </div>

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
      </div>

      {/* ✅ 확인 & 취소 버튼 정렬 */}
      <div className={styles.buttonGroup}>
        <Link to="/find-id/complete" className={styles.selectButton}>
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

export default FranchiseId;
