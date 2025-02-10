import styles from "./FindId.module.css";
import { Link } from "react-router-dom";

function FindId() {
  return (
    <>
      <header>
        <h2>아이디 찾기</h2>
      </header>
      <br />
      <br />
      <h3>찾으실 아이디를 선택해주세요.</h3>

      <div className={styles.selectBox}>
        {/* ✅ 가맹점 클릭 시 /find-id/franchise 이동 */}
        <Link to="/find-id/franchise" className={styles.selectButton}>
          <div className={styles.header}>
            <h3>가맹점</h3>
            <img
              src="/images/icons/cafe.png"
              alt="카페"
              className={styles.icon}
            />
          </div>
        </Link>

        {/* ✅ 본사 클릭 시 /find-id/hq 이동 */}
        <Link to="/find-id/hq" className={styles.selectButton}>
          <div className={styles.header}>
            <h3>본사</h3>
            <img
              src="/images/icons/building.png"
              alt="빌딩"
              className={styles.icon}
            />
          </div>
        </Link>
      </div>
    </>
  );
}

export default FindId;
