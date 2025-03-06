import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./EmpSearchModal.module.css";

function EmpSearchModal({ onClose, onSelect }) {
  const [employeeList, setEmployeeList] = useState([]);

  useEffect(() => {
    // 모달이 열릴 때 직원 목록 불러오기
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/fran/employees"
        );
        // 예: [{ empCode: 'E001', empName: '홍길동' }, ...]

        setEmployeeList(response.data.data);
      } catch (error) {
        console.error("직원 목록 조회 실패:", error);
      }
    };
    fetchEmployees();
  }, []);

  const handleSelect = (emp) => {
    // emp = { empCode, empName } 형태
    onSelect(emp);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>직원 조회</h2>
        <ul className={styles.empList}>
          {employeeList.map((emp) => (
            <li key={emp.empCode} className={styles.empItem}>
              <span>
                {emp.empName} ({emp.empCode})
              </span>
              <button onClick={() => handleSelect(emp)}>선택</button>
            </li>
          ))}
        </ul>
        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default EmpSearchModal;
