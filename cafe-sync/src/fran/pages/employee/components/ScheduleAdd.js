import { useState, useEffect } from "react";
import Modal from "../../../../components/Modal";
import SModal from "../../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../../components/ModalButton.module.css";
import style from "../styles/ScheduleAdd.module.css";

const ScheduleAdd = ({ isModalOpen, setIsModalOpen, franCode, onScheduleUpdate, existingSchedules }) => {
  const today = new Date().toISOString().split("T")[0];

  const divisionOption = [
    { label: "오픈", value: 1 }, 
    { label: "미들", value: 2 }, 
    { label: "마감", value: 3 }, 
    { label: "휴가", value: 4 }
  ];

  const [workerList, setWorkerList] = useState([]);
  const [scheduleDate, setScheduleDate] = useState(today);
  const [workers, setWorkers] = useState([
    { empCode: "", empName: "", division: "", scheduleDate: today, key: Date.now() },
  ]);
  const [addError, setAddError] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  useEffect( () => { if (franCode) { fetchWorkers(); } }, [franCode] );
    
  const fetchWorkers = async () => {
    if(!franCode) return;
    
    try {
      let token = sessionStorage.getItem("accessToken");
      const responseWorker = await fetch(`http://localhost:8080/api/fran/employee/workers/${franCode}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      if(!responseWorker.ok) {throw new Error("근로자 응답 실패")};

      const workerData = await responseWorker.json();

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
    const newWorker = { empCode: "", empName: "", division: "", scheduleDate: scheduleDate, key: Date.now() };
    setWorkers((prevWorkers) => [...prevWorkers, newWorker]);
  };
  

  // ✅ 근로자 삭제
  const rmWorkerHandler = (removeKey) => {
    setWorkers(workers.filter((worker) => worker.key !== removeKey));
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

  useEffect(() => {
    if (workers.length === 0) return;
    // console.log("🛠 workers 변경 감지, 중복 검사 실행");

    const hasDuplicate = workers.some((worker, index, self) =>
      worker.empCode &&
      worker.division &&
      self.some(
        (w, i) => i !== index && w.empCode === worker.empCode && w.division === worker.division
      )
    );

    const hasDBDuplicate = workers.some((worker) =>
      existingSchedules.some((schedule) => {
        const scheduleDateFormatted = new Date(schedule.date).toISOString().split("T")[0];
        const workerDateFormatted = new Date(worker.scheduleDate).toISOString().split("T")[0];

        return (
          String(schedule.emp) === String(worker.empCode) &&
          Number(schedule.extendedProps.scheduleDivision) === Number(worker.division) &&
          scheduleDateFormatted === workerDateFormatted
        );
      })
    );

    // console.log("🔍 새로 추가된 데이터끼리의 중복 여부:", hasDuplicate);
    // console.log("🔍 기존 데이터와의 중복 여부:", hasDBDuplicate);

    if (hasDuplicate || hasDBDuplicate) {
      // console.log("🚨 중복 발견! 등록 불가");
      setAddError("동일 근무 시간에 중복된 근로자가 있습니다.");
    } else {
      // console.log("✅ 중복 없음!");
      setAddError("");
    }
  }, [workers, existingSchedules, scheduleDate]); // 🔥 workers, 기존 스케줄, 날짜 변경 시 실행  

  const getFilteredSchedules = (date) => {
    // console.log("기존 데이터 필터링 시작");
    // console.log("필터링할 날짜", date);
    return existingSchedules.filter((schedule) => {
      // console.log("기존 스케줄 날짜: ", schedule.date);
      return schedule.date === date;
    });
  };  

  const scheduleDateChangeHandler = (e) => {
    setScheduleDate(e.target.value);
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
        empName: worker.empName
      }
    });
  };

  const confirmHandler = async () => {

    if (workers.some((w) => !w.empCode || !w.division)) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("모든 항목을 입력해주세요.");
      setIsSModalOpen(true);
      return;
    }

    if(addError) {
      setLottieAnimation("/animations/warning.json"); // ⚠️ 경고 애니메이션
      setModalMessage("동일 근무 시간에 중복된 근로자가 있습니다. \n 수정 후 다시 시도하세요.");
      setIsSModalOpen(true);
      return;
    }

    const scheduleData = prepareScheduleData();
    // console.log("보낼 스케줄 정보: ", scheduleData);

    try {
      let token = sessionStorage.getItem("accessToken");
      const resopnse = await fetch("http://localhost:8080/api/fran/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(scheduleData)
      });
      const savedSchedules = await resopnse.json();
      // console.log('세이브 된 스케줄 자료', savedSchedules);
      if (!resopnse.ok) {
        throw new Error("스케줄 저장 실패ㅠ");
      }

      console.log("스케줄 등록 성공!!!!!");
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("스케줄을 정상 등록하였습니다.");
      setIsSModalOpen(true);
      setIsModalOpen(true);  // 성공했을 때만 모달 닫을 수 있도록 플래그 설정

      if (onScheduleUpdate) {
        onScheduleUpdate(savedSchedules.data);
      };

      // closeHandler();
    } catch (error) {
      console.log("스케줄 등록 실 패 !", error);
      // alert("스케줄 등록 실패");
      setLottieAnimation("/animations/warning.json");
      setModalMessage("스케줄 등록에 실패하였습니다.");
      setIsSModalOpen(true);
      setIsModalOpen(false);
    }
  }

  const closeSmodalHandler = () => {
    setIsSModalOpen(false);
    if (lottieAnimation === "/animations/success-check.json") {
      closeHandler(); // ✅ 성공한 경우만 기존 모달 닫기
    }
  };

  const closeHandler = () => {
    setWorkers([{ empCode: "", empName: "", division: "", scheduleDate:today , key: Date.now() }]);
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
            <input type="date" onChange={scheduleDateChangeHandler}/>
          </div>
          <div >
            <span className={style.spanH3}>근로자 추가</span>
            {addError && <p style={{ display: "inline-block", color: "red", marginBotton: "10px", fontSize: "12px" }}>{addError}</p>}

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
      </Modal>
    </div>
  );
};

export default ScheduleAdd
