import { useEffect, useState } from "react";
import styles from "./itemList/FranList.module.css"
import { fetchFrans } from "../../../apis/mgment/mgmentApi";

function HQMgment() {

  const [franList, setFranList] = useState([]);


  useEffect(() => {

    async function getFrans() {
      const data = await fetchFrans();
      setFranList(data);
    }
    getFrans();
  }, []);




  return (
    <>
      <div className="page-header">
        <h3>가맹점 관리</h3>
      </div>
      <div>

        <button className={styles.registButton}>등록</button>
        <div className={styles.dividerContainer}>
          <hr className={styles.divider} />
        </div>

        {/* 검색창 */}
        <div className={styles.searchContainer}>
          <p className={styles.text}>점포 목록</p>
          <input
            type="text"
            placeholder="가맹점을 검색하세요"
            className={styles.searchInput}
          />
          <button
            className={styles.searchButton}

          >
            검색
          </button>
        </div>
        {/* 가맹점 리스트 */}
        <div className={styles.gridContainer}>
          {franList.length > 0 ? (
            franList.map((fran) => (
              <div key={fran.franCode} className={styles.storeCard}>
                <img className={styles.storeImage} src={fran.franImage}></img>
                <h3>{fran.franName}</h3>
                <p>{fran.franAddr}</p>
                <p className={styles.managerName}>점장: {fran.managerName || "미등록"}</p>
              </div>
            ))
          ) : (
            <p>등록된 가맹점이 없습니다.</p>
          )}
        </div>


      </div>
    </>
  );
}

export default HQMgment;
