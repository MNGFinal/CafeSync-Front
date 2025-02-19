import styles from "./FranList.module.css";

function FranList() {

    const franList = fetch('http://localhost:8080/api/hq/mgment');
    console.log('프랜차이즈 리스트', franList)



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
