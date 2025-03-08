import React from "react";
import { Link } from "react-router-dom";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
  return (
    <div className={styles.container}>
      {/* 배경 이미지 */}
      <img
        src="/images/login/not-found-page.jpg"
        alt="404"
        className={styles.backgroundImage}
      />

      {/* 가운데 정사각형 박스 */}
      <div className={styles.box}>
        <img
          src="/images/logo/cafe-sync-logo2.png"
          alt="로고"
          className={styles.logo}
        />
        <div className={styles.textBox}>
          <h1>404</h1>
          <p>요청하신 페이지를 찾을 수 없습니다.</p>
        </div>
        <Link to="/" className={styles.homeLink}>
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
