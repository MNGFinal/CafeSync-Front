import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import modalStyle from "../../../../components/ModalButton.module.css";
import style from "../styles/ScheduleAdd.module.css";

const ScheduleAdd = ({ isModalOpen, setIsModalOpen, franCode }) => {
  console.log('ScheduleAdd에서 본 franCode', franCode);

  const today = new Date().toISOString().split("T")[0];
  
  const divisionOption = [
    { label: "오픈", value: 1 }, 
    { label: "미들", value: 2}, 
    { label: "마감", value: 3}, 
    { label: "휴가", value: 4}
  ];

  const [workerList, setWorkerList] = useState([]);
  const [scheduleDate, setScheduleDate] = useState(today);
  
  const [workers, setWorkers] = useState([
    { empCode: "", division: "", key: Date.now() },
  ]);
  
  useEffect( () => { if (franCode) { fetchWorkers(); } }, [franCode] );
    
  const fetchWorkers = async () => {
    if(!franCode) return;
    
    try {
      const responseWorker = await fetch(
        `http://localhost:8080/api/fran/employee/workers/${franCode}`
      );

      if(!responseWorker.ok) {throw new Error("근로자 응답 실패")};

      const workerData = await responseWorker.json();
      console.log("조회된 근로자???", workerData);

      setWorkerList(workerData.map(worker => ({
        empCode: worker.empCode,
        empName: worker.empName
      })));

    } catch (error) {
      console.log("조회 오류!!!", error);
    }
  }

  // ✅ 근로자 추가
  const addWorkerHandler = () => {
    setWorkers([...workers, { empCode: "", division: "", key: Date.now() }]);
  };

  // ✅ 근로자 삭제
  const rmWorkerHandler = (removeKey) => {
    setWorkers(workers.filter((worker) => worker.key !== removeKey));
  };

  // ✅ 근로자/근로 시간 변경
  const workerChangeHandler = (e, key) => {
    const { name, value } = e.target;
    setWorkers(
      workers.map((worker) => {
        if(worker.key === key) {
          if(name === "worker") {
            return { ...worker, empCode: value };
          }
          return { ...worker, [name]: value };
        }
        return worker;
      })
    );
  };

  const prepareScheduleData = () => {
    return workers.map(worker => ({
      scheduleDate: scheduleDate,
      empCode: worker.empCode,
      scheduleDivision: Number(worker.division),
      franCode: franCode
    }));
  };

  const confirmHandler = async () => {
    const scheduleData = prepareScheduleData();
    console.log("날짜 정보: ", prepareScheduleData.scheduleDate);

    try {
      const resopnse = await fetch("http://localhost:8080/api/fran/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(scheduleData)
      });
      if (!resopnse.ok) {
        throw new Error("스케줄 저장 실패ㅠ");
      }

      console.log("스케줄 등록 성공!!!!!");
      alert("스케줄 등록 성공");
      setIsModalOpen(false);
    } catch (error) {
      console.log("스케줄 등록 실 패 !", error);
      alert("스케줄 등록 실패");
    }
  }
  const closeHandler = () => {
    setWorkers([{ worker: "", division: "", key: Date.now() }]);
    setIsModalOpen(false);
  };

  return (
    <div>
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeHandler}
        buttons={[
          {
            text: "등록",
            onClick: confirmHandler,
            className: modalStyle.confirmButtonB
          },
          { 
            text: "취소", 
            onClick: closeHandler, 
            className: modalStyle.cancelButtonB 
          }
        ]}
      >
        <h2 className={style.schH2}>스케줄 신규 등록</h2>
        <hr />
        <div className={style.addContainer}>
          <div className={style.dateContainer}>
            <span>날짜</span>
            <input type="date" defaultValue={today} onChange={(e) => setScheduleDate(e.target.value)}/>
          </div>
          <div >
            <h3 style={{marginBottom: "10px"}}>근로자 추가</h3>

            <div className={style.workerListContainer}>
              {workers.map(({ worker, division, key }, index) => (
                <div key={key} className={style.workerContainer}>
                  <span className={style.s1}>근로자</span>
                  <select
                    name="worker"
                    value={worker}
                    onChange={(e) => workerChangeHandler(e, key)}
                    className={style.workerBox}
                  >
                    <option value="">선택</option>
                    {/* 옵션이 이곳에 동적으로 추가되도록 하기 */}
                    {workerList.map(({empCode, empName}) => (
                      <option key={empCode} value={empCode}>
                        {empName}
                      </option>
                    ))}
                  </select>

                  <span className={style.s2}>근로 시간</span>
                  <select 
                    name="division" 
                    value={division} 
                    onChange={(e) => workerChangeHandler(e, key)}
                    className={style.workerBox}
                  >
                    <option value="">선택</option>
                    {divisionOption.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className={style.btnContainer}>
                    <button onClick={addWorkerHandler} className={style.plusBtn}>+</button>
                    {index > 0 && (
                      <button onClick={() => rmWorkerHandler(key)} className={style.minusBtn}>─</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </Modal>
    </div>
  );
};

export default ScheduleAdd;
