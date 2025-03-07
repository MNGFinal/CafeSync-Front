import React, { useEffect, useState } from "react";
import axios from "axios";

const StoreSales = () => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/hq/top-stores?startDate=2025-01-01&endDate=2025-12-31")
            .then(response => {
                console.log("📌 Store Sales Data:", response.data); // 디버깅 로그
                setStores(response.data);
            })
            .catch(error => {
                console.error("Error fetching store sales:", error);
            });
    }, []);

    return (
        <div className="store-container">
            <h2>Top 5 점포 순위</h2>
            <div className="grid-container">
                {stores.length > 0 ? (
                    stores.slice(0, 5).map((store, index) => (
                        <div key={store.franCode} className="store-box">
                            <h3>{index + 1}등 {store.franName}</h3>
                            <p>매출액: {store.totalSales.toLocaleString()}원</p>
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
