import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import SModal from "../../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../../components/ModalButton.module.css";
import style from "../styles/ScheduleAdd.module.css";

const ScheduleModify = ({ isModifyModalOpen, setIsModifyModalOpen, franCode, onScheduleUpdate, existingSchedules }) => {
  const divisionOption = [
    { value: "1", label: "오픈" },
    { value: "2", label: "미들" },
    { value: "3", label: "마감" },
    { value: "4", label: "휴가" },
  ];

  const [workerList, setWorkerList] = useState([]);
  const [scheduleDate, setScheduleDate] = useState("");
  const [workers, setWorkers] = useState([]);
  const [addError, setAddError] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);  // 삭제 모달 열기 상태
  const [workerToDelete, setWorkerToDelete] = useState(null); // 삭제할 worker 정보 저장

  // 날짜 변경 시 가져오기
  const dateChangeHandler = (e) => {
    const selectedDate = e.target.value;
    setScheduleDate(selectedDate);

    // 기존 스케줄 중 해당 날짜와 데이터 필터링
    const schedulesForDate = existingSchedules.filter(
      (schedule) => schedule.date === selectedDate
    );

    const formattedWorkers = schedulesForDate.map((schedule) => {
      const worker = workerList.find(w => w.empCode === schedule.emp);
      return {
        empCode: schedule.emp || "",
        empName: worker ? worker.empName : "",
        division: schedule.extendedProps.scheduleDivision || "",
        key: schedule.id,
        isNew: false
      }
    })
    console.log("✅ 변환된 workers 배열:", formattedWorkers);

    setWorkers(formattedWorkers);
  };

  useEffect( () => { if (franCode) { fetchWorkers(); } }, [franCode] );
    
  const fetchWorkers = async () => {
    if(!franCode) return;
    
    try {
      const responseWorker = await fetch(
        `http://localhost:8080/api/fran/employee/workers/${franCode}`
      );

      if(!responseWorker.ok) {throw new Error("근로자 응답 실패")};

      const workerData = await responseWorker.json();

      setWorkerList(workerData.map(worker => ({
        empCode: worker.empCode,
        empName: worker.empName
      })));
    } catch (error) { console.log("조회 오류!!!", error); }
  }

  // ✅ 근로자 추가
  const addWorkerHandler = () => {
    setWorkers([ ...workers, { empCode: "", empName: "", division: "", scheduleDate: scheduleDate, key: Date.now(), isNew: true }]);
  };
  

  // ✅ 근로자 삭제 (프론트)
  const rmWorkerHandler = (removeKey) => {
    const worker = workers.find(worker => worker.key === removeKey);
  
    if (worker.isNew) {
      setWorkers(workers.filter((worker) => worker.key !== removeKey)); 
    } else {
      setWorkerToDelete(worker);  // 삭제할 worker 정보 설정
      setIsDeleteModalOpen(true);  // 삭제 확인 모달 열기
      setLottieAnimation("/animations/identify.json");
      setModalMessage("해당 스케줄은 기존에 등록되어 있던 스케줄입니다. \n 정말로 삭제하시겠습니까?" );
    }
  };

  // ✅ 근로자 삭제 (백엔드)
  const deleteWorkHandler = async (worker) => {
    if (worker && !worker.isNew) {
      try {
        const response = await fetch(`http://localhost:8080/api/schedule/${worker.key}`, {
          method: "DELETE",
        });
  
        if (!response.ok) throw new Error("삭제 실패");
  
        console.log("기존 데이터 삭제 성공!");
        setWorkers(workers.filter(w => w.key !== worker.key));  // 프론트에서 삭제 처리
        setLottieAnimation("/animations/success-check.json");
        setModalMessage("스케줄을 정상 삭제하였습니다.");
        setIsDeleteModalOpen(false);
        setIsSModalOpen(true);
      } catch (error) {
        console.error("삭제 오류:", error);
        setLottieAnimation("/animations/warning.json");
        setModalMessage("스케줄 삭제에 실패하였습니다.");
        setIsDeleteModalOpen(false);
        setIsSModalOpen(true);
      }
    } else {
      // `isNew: true`인 경우는 프론트에서만 삭제
      setWorkers(workers.filter(w => w.key !== worker.key));
      setIsDeleteModalOpen(false);
    }
  };

  // ✅ 근로자/근로 시간 변경
  const workerChangeHandler = (e, key) => {
    const { name, value } = e.target;
  
    setWorkers((prevWorkers) =>
      prevWorkers.map((worker) => {
        if (worker.key === key) {
          const updatedWorker = { ...worker, [name]: value, scheduleDate };
          // ✅ empCode 값이 들어올 때 empName을 찾아 함께 저장
          if (name === "worker") {
            const selectedWorker = workerList.find(w => w.empCode === value);
            updatedWorker.empCode = value;
            updatedWorker.empName = selectedWorker ? selectedWorker.empName : "";
          }
          return updatedWorker;
        }
        return worker;
      })
    );
  };

  const prepareScheduleData = () => {
    return workers.map(worker => {
      const localDateTime = new Date(scheduleDate);
      localDateTime.setHours(9,0,0,0);
      return {
        scheduleDate: localDateTime.toISOString(),
        empCode: worker.empCode,
        scheduleDivision: Number(worker.division),
        franCode: franCode,
        empName: worker.empName,
        scheduleCode: worker.key,
        isNew: worker.isNew,
      }
    });
  };

  useEffect(() => {
    if (workers.length === 0) return;
    console.log("🛠 workers 변경 감지, 중복 검사 실행");
  
    // ✅ 새로 추가된 데이터끼리의 중복 여부만 검사
    const hasDuplicate = workers.some((worker, index, self) =>
      worker.empCode &&
      worker.division &&
      self.some(
        (w, i) => i !== index && w.empCode === worker.empCode && w.division === worker.division
      )
    );
  
    console.log("🔍 새로 추가된 데이터끼리의 중복 여부:", hasDuplicate);
  
    if (hasDuplicate) {
      console.log("🚨 중복 발견! 등록 불가");
      setAddError("동일 근무 시간에 중복된 근로자가 있습니다.");
    } else {
      console.log("✅ 중복 없음!");
      setAddError("");
    }
  }, [workers, scheduleDate]);
  
  // ✅ 수정 확인 핸들러
  const modifyHandler = async () => {
    if (workers.some((w) => !w.empCode || !w.division)) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("모든 항목을 입력해주세요.");
      setIsSModalOpen(true);
      return;
    }
  
    if (addError) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("동일 근무 시간에 중복된 근로자가 있습니다. \n 수정 후 다시 시도하세요.");
      setIsSModalOpen(true);
      return;
    }
  
    const scheduleData = prepareScheduleData();
    const modifyScheduleData = scheduleData.filter(worker => worker.scheduleCode && !worker.isNew);
    
    // 추가되는 데이터에 scheduleCode 제거
    const addScheduleData = scheduleData
                            .filter(worker => !worker.scheduleCode || worker.isNew)
                            .map(({ scheduleCode, ...worker }) => worker);


    console.log('modifyScheduleData?', modifyScheduleData);
    console.log('addScheduleData?', addScheduleData);
  
    try {
      let savedSchedules = [];    // 변경된 스케줄 저장될 배열
      const requests = [];        // 요청을 보낼 Promise 배열

      if (modifyScheduleData.length > 0) {
        // PUT 요청 - modifiedWorkers 배열을 한 번에 보내기
        const responseModify = fetch("http://localhost:8080/api/fran/schedule", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(modifyScheduleData), // 배열 전체를 한 번에 전송
        })
        .then(res => {
          if(!res.ok) throw new Error("수정 실패");
          return res.json();
        });
        
        requests.push(responseModify)
        // const modifyResult = await responseModify.json();
        // savedSchedules = [ ...savedSchedules, ...modifyResult.data ];
      }
  
      if (addScheduleData.length > 0) {
        // POST 요청 - 새로운 데이터 추가
        const responseAdd = fetch("http://localhost:8080/api/fran/schedule", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addScheduleData),
        })
        .then(res => {
          if (!res.ok) throw new Error("새로운 데이터 추가 실패");
          return res.json();
        });

        requests.push(responseAdd)
        // const addResult = await responseAdd.json();
        // savedSchedules = [ ...savedSchedules, ...addResult.data ];
      }

      if (requests.length > 0) {
        const results = await Promise.all(requests);
        
        results.forEach(result => {
          if (result && result.data) {
            savedSchedules = [ ...savedSchedules, ...result.data ];
          }
        });
      }
  
      console.log("스케줄 수정 성공!", savedSchedules);
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("스케줄이 정상 수정되었습니다.");
      setIsSModalOpen(true);
      setIsModifyModalOpen(true);

      if (onScheduleUpdate) {
        onScheduleUpdate(savedSchedules);
      };

    } catch (error) {
      console.error("스케줄 수정 오류:", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("수정 중 오류가 발생했습니다.");
      setIsSModalOpen(true);
      setIsModifyModalOpen(false);
    }
  };
  

  const closeSmodalHandler = () => {
    setIsSModalOpen(false);
    if (lottieAnimation === "/animations/success-check.json") {
      closeHandler(); // ✅ 성공한 경우만 기존 모달 닫기
    }
  };

  const closeHandler = () => {
    setWorkers([{ empCode: "", empName: "", division: "", scheduleDate:"" , key: Date.now(), isNew: false }]);
    setIsModifyModalOpen(false);
  };

  return (
    <div>
      <Modal 
        isOpen={true} 
        onClose={closeHandler}
        buttons={[
          {
            text: "수정",
            onClick: modifyHandler,
            className: modalStyle.confirmButtonB
          },
          { 
            text: "취소", 
            onClick: closeHandler, 
            className: modalStyle.cancelButtonB 
          }
        ]}
      >
        <h2 className={style.schH2}>스케줄 수정</h2>
        <hr />
        <div className={style.addContainer}>
          <div className={style.dateContainer}>
            <span>수정 날짜</span>
            <input type="date" value={scheduleDate} onChange={dateChangeHandler}/>
          </div>
          {/* 선택한 날짜의 스케줄, 데이터가 있을 때에만! */}
          {scheduleDate && workers.length > 0 && (
            <div className={style.modifyWorkerListContainer}>
              <span className={style.spanH3}>근로자 수정</span>
              {addError && <p style={{ display: "inline-block", color: "red", marginBotton: "10px", fontSize: "12px" }}>{addError}</p>}
      
              <div className={style.workerListContainer}>
                {workers.map(({ empCode, division, key }, index) => (
                  <div key={key} className={style.workerContainer}>
                    <span className={style.s1}>근로자</span>
                    <select
                      name="worker"
                      value={empCode}
                      onChange={(e) => workerChangeHandler(e, key)}
                      className={style.workerBox}
                    >
                      <option value="">선택</option>
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
          )}
          {/* 해당 날짜에 스케줄이 없을 경우 */}
          {scheduleDate && workers.length === 0 && (
            <p>해당 날짜에 등록된 스케줄이 없습니다.</p>
          )}
        </div>
        <SModal
          isOpen={isSModalOpen}
          onClose={() => setIsSModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: closeSmodalHandler,
              className: modalStyle.confirmButtonS,
            },
          ]}
        >
          <div style={{ textAlign: "center" }}>
            <Player
              autoplay
              loop={false} // ✅ 애니메이션 반복 X
              keepLastFrame={true} // ✅ 애니메이션이 끝나도 마지막 프레임 유지
              src={lottieAnimation} // ✅ 동적으로 변경됨
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            {/* <br /> */}
            <span style={{marginTop: "15px", whiteSpace: "pre-line"}}>{modalMessage}</span>
            <br />
          </div>
        </SModal>
        <SModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}  // 모달 닫기
          buttons={[
            {
              text: "삭제",
              onClick: () => deleteWorkHandler(workerToDelete),  // "확인" 클릭 시 삭제 처리
              className: modalStyle.deleteButtonS,
            },
            {
              text: "취소",
              onClick: () => setIsDeleteModalOpen(false),  // "취소" 클릭 시 모달 닫기
              className: modalStyle.cancelButtonS,
            },
          ]}
        >
          <div style={{ textAlign: "center" }}>
            <Player
              autoplay
              loop={false} // ✅ 애니메이션 반복 X
              keepLastFrame={true} // ✅ 애니메이션이 끝나도 마지막 프레임 유지
              src={lottieAnimation} // ✅ 동적으로 변경됨
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <span style={{marginTop: "15px", whiteSpace: "pre-line"}}>{modalMessage}</span>
            <br />
          </div>
        </SModal>
      </Modal>
    </div>
  )
}

export default ScheduleModify;