import React, { useEffect, useState } from "react";
import axios from "axios";

const StoreSales = ({ startDate, endDate }) => {
    const [stores, setStores] = useState([]);

    useEffect(() => {
        if (!startDate || !endDate) return;

        axios.get(`http://localhost:8080/api/hq/top-stores?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                console.log("📌 Store Sales Data:", response.data);
                setStores(response.data);
            })
            .catch(error => {
                console.error("Error fetching store sales:", error);
            });
    }, [startDate, endDate]); // ✅ startDate와 endDate 변경 시 다시 API 호출

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
