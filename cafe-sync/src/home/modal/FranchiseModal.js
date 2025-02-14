import { useEffect, useState } from "react";
import { findFranList } from "../../apis/home/findAPI";
import styles from "./FranchiseModal.module.css";

function FranchiseModal({ onClose, onSelect }) {
  const [franchiseList, setFranchiseList] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const data = await findFranList();
      setFranchiseList(data);
    }
    fetchData();
  }, []);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>📌가맹점 검색📌</h2>
        <ul className={styles.list}>
          {franchiseList.length > 0 ? (
            franchiseList.map((fran) => (
              <li key={fran.franCode} onClick={() => onSelect(fran)}>
                {fran.franName} ({fran.franCode})
              </li>
            ))
          ) : (
            <p>가맹점 정보가 없습니다.</p>
          )}
        </ul>
        <button className={styles.closeButton} onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

export default FranchiseModal;
