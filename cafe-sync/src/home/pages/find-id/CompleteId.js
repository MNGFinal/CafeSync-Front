import styles from "./CompleteId.module.css";
import { Link } from "react-router-dom";

function CompleteId() {
  return (
    <>
      <img
        src="/images/logo/cafe-sync-logo2.png"
        alt="로고"
        className={styles.logo}
      />
      <div className={styles.infoBox}>
        <h2>OOO님의</h2>
        <h2>아이디는 OOO 입니다</h2>
      </div>

      <Link to="/" className={styles.homeButton}>
        <button className={styles.button}>로그인 페이지 이동하기</button>
      </Link>
    </>
  );
}

export default CompleteId;
