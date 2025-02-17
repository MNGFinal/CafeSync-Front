import { useState } from "react";
import Modal from "../../../../components/Modal";
import {useState} from "react";
import Modal from "../../../../components/Modal"

const ScheduleAdd = ({ isModalOpen, setIsModalOpen }) => {
  // const [isModalOpen, setIsModalOpen] = useState(false);      // 모달 여닫기 관리
  const [workers, setWorkers] = useState([
    { worker: "", division: "", key: Date.now() },
  ]);

  // 근로자 추가
  const addWorkerHandler = () => {
    setWorkers([...workers, { worker: "", division: "", key: Date.now() }]);
  };

  // 근로자 삭제
  const rmWorkerHandler = (removeKey) => {
    setWorkers(workers.filter((worker) => worker.key !== removeKey));
  };

  // 근로자/근로 시간 변경
  const workerChangeHandler = (e, key) => {
    const { name, value } = e.target;
    setWorkers(
      workers.map((worker) =>
        worker.key === key ? { ...worker, [name]: value } : worker
      )
    );
  };

  return (
    <div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2>스케줄 신규 등록</h2>
        <hr />
        <span>날짜</span>
        <input type="date" />
        <h3>근로자 추가</h3>

        {workers.map(({ worker, division, key }, index) => (
          <div key={key} style={{ display: "flex", alignItems: "center" }}>
            <select
              name="worker"
              value={worker}
              onChange={(e) => workerChangeHandler(e, key)}
            >
              <option value="">근로자 선택</option>
              {/* 옵션이 이곳에 동적으로 추가되도록 하기 */}
            </select>
            <span>근로 시간</span>
            <input
              type="number"
              name="division"
              value={division}
              onChange={(e) => workerChangeHandler(e, key)}
              placeholder="근로 시간"
            />
            <button onClick={addWorkerHandler}>+</button>
            {index > 0 && <button onClick={rmWorkerHandler}>-</button>}
          </div>
        ))}
      </Modal>
    </div>
  );
};

export default ScheduleAdd;
