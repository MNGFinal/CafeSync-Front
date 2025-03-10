import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "./stat.module.css"; // ✅ CSS 모듈 추가!

const StoreSales = () => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8080/api/hq/top-stores?startDate=2025-01-01&endDate=2025-12-31")
            .then((response) => {
                console.log("📌 Store Sales Data:", response.data);
                setStores(response.data);
            })
            .catch((error) => {
                console.error("Error fetching store sales:", error);
            });
    }, []);

    return (<>
        <div className={styles.storeContainer}>

            <div className={styles.storeGrid}>
                {stores.length > 0 ? (
                    stores.slice(0, 5).map((store, index) => (
                        <div key={store.franCode} className={styles.storeBox}>
                            <img src={store.franImage || "/default-image.jpg"} alt={`${store.franName} 이미지`} className={styles.image} />
                            <h3>{index + 1}등 {store.franName}</h3>
                            <p>매출액: {store.totalSales?.toLocaleString()}원</p>
                        </div>
                    ))
                ) : (
                    <p>데이터가 없습니다.</p>
                )}
            </div>
        </div>
    </>
    );
};

export default StoreSales;
