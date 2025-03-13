import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Modal from "../../../components/Modal";
import EmployeeDetail from "./EmployeeDetail";
import styles from "./Employee.module.css";
import modalStyle from "../../../components/ModalButton.module.css";

function Employee() {
  const [employees, setEmployees] = useState([]);
  const [activeTab, setActiveTab] = useState("근로자");

  // 로그인한 사용자 직급코드 (21=점장)
  const loginJobCode = useSelector(
    (state) => state.auth?.user?.job?.jobCode ?? null
  );
  const isManagerLoggedIn = loginJobCode === 21;

  // 로그인한 사용자의 가맹점 코드
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 직원 상세 모달 관련 상태
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 직원 목록 가져오기
  async function fetchEmployees() {
    if (!franCode) return;

    try {
      const response = await fetch(
        `cafesync-back-production.up.railway.app/api/fran/employee/workers/${franCode}`
      );
      const res = await response.json();

      console.log("서버에서 가져온 가맹점 직원 데이터", res);

      if (Array.isArray(res)) {
        setEmployees(res);
      } else {
        console.error("API 응답이 배열이 아님:", res);
        setEmployees([]);
      }
    } catch (error) {
      console.error("API 호출 오류:", error);
      setEmployees([]);
    }
  }

  // 컴포넌트 마운트 시 직원 목록 조회
  useEffect(() => {
    fetchEmployees();
  }, [franCode]);

  // 근로자 / 퇴사자 분류
  const workingEmployees = employees.filter((emp) => emp.retireDate === null);
  const retiredEmployees = employees.filter((emp) => emp.retireDate !== null);

  // 탭에 따라 표시할 목록
  const displayedEmployees =
    activeTab === "근로자" ? workingEmployees : retiredEmployees;

  // 날짜 포매팅 (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const dateObj = new Date(dateString);
    if (isNaN(dateObj.getTime())) return "";
    return dateObj.toISOString().split("T")[0];
  };

  // 카드 클릭 시 모달 열기 (수정 모드)
  const handleCardClick = (emp) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedEmployee(null);
    setIsModalOpen(false);
  };

  // 신규 등록 버튼 클릭 (점장만 가능)
  const handleNewEmployee = () => {
    setSelectedEmployee(null); // null이면 신규 등록 모드
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className="page-header">
        <h3 className={styles.title}>직원 목록</h3>
        {/* 직급코드가 21(점장)일 때만 "신규 등록" 버튼 노출 */}
        {isManagerLoggedIn && (
          <button className={styles.newButton} onClick={handleNewEmployee}>
            신규 등록
          </button>
        )}
      </div>

      {/* 탭 버튼 */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === "근로자" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("근로자")}
        >
          근로자
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === "퇴사자" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("퇴사자")}
        >
          퇴사자
        </button>
      </div>

      {/* 카드 목록 */}
      <div className={styles.cardBox}>
        <div className={styles.cardGrid}>
          {displayedEmployees.length > 0 ? (
            displayedEmployees.map((emp) => (
              <div
                key={emp.empCode}
                className={styles.card}
                onClick={() => handleCardClick(emp)}
              >
                <img
                  src={emp.profileImage || "/images/default-profile.png"}
                  alt={`${emp.empName} 프로필`}
                  className={styles.profileImage}
                />
                <h4 className={styles.name}>{emp.empName}</h4>
                <p className={styles.job}>
                  {emp.job?.jobName || "직책 정보 없음"}
                </p>
                <p className={styles.phone}>{emp.phone || "전화번호 없음"}</p>
                <p className={styles.hireDate}>
                  입사일: {formatDate(emp.hireDate) || "정보 없음"}
                </p>
              </div>
            ))
          ) : (
            <p className={styles.noData}>직원 정보 없음</p>
          )}
        </div>
      </div>

      {/* 모달 (신규 등록 or 수정) */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal}>
          <EmployeeDetail
            employee={selectedEmployee} // null이면 "신규 등록 모드"
            formatDate={formatDate}
            fetchEmployees={fetchEmployees} // 등록/수정 후 목록 재조회
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}

export default Employee;
