import { useState } from "react";
import FranchiseModal from "../../modal/FranchiseModal"; // 가맹점 모달창
import { verifyUser } from "../../../apis/home/findAPI";
import styles from "./FranchiseId.module.css";
import { Link, useNavigate } from "react-router-dom";

function FranchiseId() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFranchise, setSelectedFranchise] = useState({
    name: "",
    code: "",
  });
  const [empCode, setEmpCode] = useState(""); // 사원코드
  const [email, setEmail] = useState(""); // 이메일
  const navigate = useNavigate();

  const onClickHandler = () => {
    setIsModalOpen(true);
  };

  const handleSelectFranchise = (fran) => {
    setSelectedFranchise({
      name: fran.franName, // 사용자에게 보이는 가맹점명
      code: fran.franCode, // 내부적으로 저장할 가맹점 코드
    });
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // 기본 폼 제출 방지

    // 입력값 검증
    if (!selectedFranchise.code || !empCode || !email) {
      alert("⚠️ 모든 필드를 입력해주세요.");
      return;
    }

    try {
      const userId = await verifyUser(selectedFranchise.code, empCode, email);

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
        <img src="/images/icons/cafe.png" alt="카페" className={styles.icon} />
        <h2>가맹점 아이디 찾기</h2>
      </header>
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.inputContainer}>
            {/* 가맹점 선택 */}
            <div className={styles.inputBox}>
              <label>가맹점</label>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="가맹점을 검색하세요"
                  value={selectedFranchise.name}
                  readOnly
                />
                <button
                  type="button"
                  className={`${styles.button} ${styles.searchButton}`}
                  onClick={onClickHandler}
                >
                  검색
                </button>
              </div>
              {/* 내부적으로 선택한 가맹점 코드 저장 */}
              <input type="hidden" value={selectedFranchise.code} />
            </div>

            {/* 사원코드 입력 */}
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
          {/* 확인 & 취소 버튼 */}
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={`${styles.button} ${styles.confirmButton}`}
            >
              확인
            </button>
            <Link to="/" className={styles.selectButton}>
              <button className={`${styles.button} ${styles.cancelButton}`}>
                취소
              </button>
            </Link>
          </div>
        </form>
      </div>

      {/* 모달 창 */}
      {isModalOpen && (
        <FranchiseModal
          onClose={() => setIsModalOpen(false)}
          onSelect={handleSelectFranchise}
        />
      )}
    </>
  );
}

export default FranchiseId;
