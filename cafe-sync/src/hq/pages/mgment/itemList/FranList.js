import { useState, useEffect } from "react";
import styles from "./FranList.module.css";

function FranList() {

    const [franList, setFranList] = useState([]);




    // ✅ 백엔드에서 데이터 가져오기
    useEffect(() => {
        fetch('http://localhost:8080/api/hq/mgment')
            .then(response => {
                if (!response.ok) {
                    throw new Error("데이터 로딩 실패");
                }
                return response.json(); // JSON 변환
            })
            .then(data => {
                console.log("프랜차이즈 리스트", data); // ✅ 데이터 콘솔 출력
                setFranList(data); // ✅ 상태 업데이트
            })
            .catch(error => console.error("API 요청 중 오류 발생:", error));
    }, []); // ✅ 의존성 배열이 비어있어 처음 마운트될 때만 실행됨




















    return (
        <>
            <button className={styles.registButton}>등록</button>
            <div className={styles.dividerContainer}>
                <hr className={styles.divider} />
            </div>

            {/* 검색창 */}
            <div className={styles.searchContainer}>
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
        </>
    );
}

export default FranList;
