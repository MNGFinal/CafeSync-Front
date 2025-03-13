import { useState, useEffect } from "react";

const useFetchWorkers = (franCode) => {
  const [workerList, setWorkerList] = useState([]);

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!franCode) return;

      try {
        let token = sessionStorage.getItem("accessToken");
        const responseWorker = await fetch(
          `cafesync-back-production.up.railway.app/api/fran/employee/workers/${franCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!responseWorker.ok) {
          throw new Error("근로자 응답 실패");
        }

        const workerData = await responseWorker.json();

        setWorkerList(
          workerData.map((worker) => ({
            empCode: worker.empCode,
            empName: worker.empName,
          }))
        );
      } catch (error) {
        console.log("조회 오류!!!", error);
      }
    };

    fetchWorkers();
  }, [franCode]); // franCode가 변경될 때마다 자동 호출

  return workerList;
};

export default useFetchWorkers;
