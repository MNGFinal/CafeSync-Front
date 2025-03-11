import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./stat.module.css"; // ✅ CSS 모듈 추가!

const StoreSales = ({ startDate, endDate, searchTrigger }) => { // ✅ 조회 버튼이 눌릴 때만 실행
    const [stores, setStores] = useState([]);

    useEffect(() => {
        if (!startDate || !endDate) return; // ✅ 날짜가 없으면 요청하지 않음

        console.log(`📌 [DEBUG] Fetching store sales for ${startDate} ~ ${endDate}`);

        axios
            .get("http://localhost:8080/api/hq/top-stores", {
                params: { startDate, endDate } // ✅ API에 날짜 전달
            })
            .then((response) => {
                console.log("📌 [DEBUG] Store Sales Data:", response.data);
                setStores(response.data);
            })
            .catch((error) => {
                console.error("❌ [ERROR] Error fetching store sales:", error);
            });

    }, [searchTrigger]); // ✅ 조회 버튼을 눌렀을 때만 실행됨

    return (
        <div className={styles.storeContainer}>
            <div className={styles.storeGrid}>
                {stores.length > 0 ? (
                    stores.slice(0, 5).map((store, index) => (
                        <div key={store.franCode} className={styles.storeBox}>
                            <img src={store.franImage || "/default-image.jpg"} alt={`${store.franName} 이미지`} className={styles.image} />
                            <h3>{index + 1}등 {store.franName}</h3>
                            <p className={styles.saless}>매출액: {store.totalSales?.toLocaleString()}원</p>
                        </div>
                    ))
                ) : (
                    <p>데이터가 없습니다.</p>
                )}
            </div>
        </div>
    );
};

export default StoreSales;
