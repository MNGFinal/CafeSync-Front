import { useEffect, useState } from "react";
import styles from "./HQEmployee.module.css";
import { getEmployeeList } from "../../../apis/chat/chatApi";
import { AiOutlineSend } from "react-icons/ai";
import CreateChatRoom from "./HQCreateChatRoom";
import { useSelector } from "react-redux";

function HQEmployee({ onCreateRoom }) {
  const [employees, setEmployees] = useState([]); // 전체 직원 목록
  const [searchText, setSearchText] = useState(""); // 검색창 텍스트
  const [showModal, setShowModal] = useState(false); // 모달 열고 닫기
  const [roomName, setRoomName] = useState(""); // 채팅방 제목

  const { user } = useSelector((state) => state.auth);
  const loggedInEmpCode = user?.employee?.empCode; // 로그인한 사용자의 empCode

  console.log("✅ user 정보:", user);
  console.log("✅ 로그인한 empCode:", loggedInEmpCode);

  // 왼쪽(직원 목록)
  const [availableEmployees, setAvailableEmployees] = useState([]);
  // 오른쪽(채팅방 참여자)
  const [selectedEmployees, setSelectedEmployees] = useState([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployeeList();

        console.log("🚀 직원 API 응답 데이터:", data);

        if (!data || !data.data) {
          console.error("❌ 직원 목록이 존재하지 않음!", data);
          return;
        }

        setEmployees(data.data);
      } catch (error) {
        console.error("❌ 직원 목록 불러오기 오류:", error);
      }
    };
    fetchEmployees();
  }, []);

  // 🔎 로그인한 사용자 정보 찾기 (Redux에서가 아니라 직원 목록에서 찾음)
  const loggedInUserData = employees.find(
    (emp) => emp.empCode === loggedInEmpCode
  );

  console.log("🔍 로그인한 유저 정보:", loggedInUserData);

  // 🔎 검색 필터링: 로그인한 사용자는 제외
  const filteredEmployees = employees.filter((emp) => {
    if (loggedInEmpCode && emp.empCode === loggedInEmpCode) return false;
    const franName = emp.franChise?.franName?.toLowerCase() || "";
    const empName = emp.empName?.toLowerCase() || "";
    const lowerSearch = searchText.toLowerCase();
    return franName.includes(lowerSearch) || empName.includes(lowerSearch);
  });

  /** 모달 열기 */
  const openModal = () => {
    const notSelected = filteredEmployees.filter(
      (emp) => !selectedEmployees.some((sel) => sel.empCode === emp.empCode)
    );
    setAvailableEmployees(notSelected);
    setRoomName("");
    setShowModal(true);
  };

  /** 모달 닫기 */
  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className={styles.employeeContainer}>
      <div className={styles.top}>
        <div className={styles.title}>
          <h2>직원목록</h2>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="가맹점명 or 이름을 입력해주세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.empBox}>
        {filteredEmployees.map((employee) => (
          <div key={employee.empCode} className={styles.employeeCard}>
            <div className={styles.leftSide}>
              <img
                src={employee.profileImage || "/images/default-profile.png"}
                alt={`${employee.empName} 프로필 이미지`}
                className={styles.profileImage}
              />
              <p className={styles.employeeInfo}>
                {employee.franChise?.franName}
              </p>
              <div className={styles.nameJobBox}>
                {employee.empName} {employee?.job?.jobName}
              </div>
            </div>
            <AiOutlineSend
              className={styles.sendIcon}
              onClick={() => {
                openModal();
              }}
            />
          </div>
        ))}
      </div>

      {showModal && (
        <CreateChatRoom
          isOpen={showModal}
          onClose={closeModal}
          onConfirm={(newRoom) => {
            onCreateRoom?.(newRoom); // ✅ 새 채팅방 즉시 반영
            setShowModal(false);
          }}
          availableEmployeesFromParent={filteredEmployees}
          loggedInUserData={loggedInUserData}
        />
      )}
    </div>
  );
}

export default HQEmployee;
