import styles from "./CompleteId.module.css";
import { Link, useLocation } from "react-router-dom";

function CompleteId() {
  const location = useLocation();
  const userId = location.state?.userId || "알 수 없음";

  return (
    <>
      <img
        src="/images/logo/cafe-sync-logo2.png"
        alt="로고"
        className={styles.logo}
      />
      <div className={styles.infoBox}>
        <h2>회원님의 아이디는</h2>
        <h2 className={styles.userId}>{userId} 입니다</h2>
      </div>

      <Link to="/" className={styles.homeButton}>
        <button className={styles.button}>로그인 페이지 이동하기</button>
      </Link>
    </>
  );
}

export default CompleteId;
