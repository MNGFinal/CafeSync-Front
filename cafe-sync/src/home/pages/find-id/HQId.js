import styles from "./HQId.module.css";
import { Link, useNavigate } from "react-router-dom";
import { HQverifyUser } from "../../../apis/home/findAPI";
import { useState } from "react";

function HQId() {
  const [empCode, setEmpCode] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmitHandle = async (e) => {
    e.preventDefault(); // 기본 폼 제출 방지

    // 입력값 검증
    if (!empCode || !email) {
      alert("⚠️ 모든 필드를 입력해주세요.");
      return;
    }

    try {
      const userId = await HQverifyUser(empCode, email);

      if (userId) {
        navigate("/find-id/complete", { state: { userId } });
      } else {
        alert("❌ 일치하는 정보가 없습니다.");
      }
    } catch (error) {
      alert("🚨 아이디 찾기에 실패했습니다.");
    }
  };

  return (
    <>
      <header className={styles.header}>
        <img
          src="/images/icons/building.png"
          alt="본사"
          className={styles.icon}
        />
        <h2>본사 아이디 찾기</h2>
      </header>

      <form onSubmit={onSubmitHandle}>
        <div className={styles.container}>
          {/* 사번 코드 입력 */}
          <div className={styles.inputBox}>
            <label>사원코드</label>
            <input
              type="text"
              placeholder="사원코드를 입력하세요"
              value={empCode}
              onChange={(e) => setEmpCode(e.target.value)}
            />
          </div>

          {/* 이메일 입력 */}
          <div className={styles.inputBox}>
            <label>이메일</label>
            <input
              type="text"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ 확인 & 취소 버튼 수정 */}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={`${styles.button} ${styles.confirmButton}`}
          >
            확인
          </button>

          <Link to="/" className={styles.selectButton}>
            <button
              type="button"
              className={`${styles.button} ${styles.cancelButton}`}
            >
              취소
            </button>
          </Link>
        </div>
      </form>
    </>
  );
}

export default HQId;
