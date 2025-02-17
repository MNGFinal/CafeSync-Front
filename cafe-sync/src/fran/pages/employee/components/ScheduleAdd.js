import { useState } from "react";
import Modal from "../../../../components/Modal";
import modalStyle from "../../../../components/ModalButton.module.css";
import style from "../styles/schedule.module.css"

const ScheduleAdd = ({isModalOpen, setIsModalOpen}) => {
    const [workers, setWorkers] = useState([
        { worker: '', division: '', key: Date.now() },
    ]);
    const closeHandler = () => {
        setIsModalOpen(false);
        setWorkers([{ worker: '', division: '', key: Date.now() }]);
    };
    const confirmHandler = null;

    // 근로자 추가
    const addWorkerHandler = () => {
        setWorkers([
            ...workers,
            { worker: '', division: '', key: Date.now() },
        ]);
    };

    // 근로자 삭제
    const rmWorkerHandler = (removeKey) => {
        setWorkers(workers.filter((worker) => worker.key !== removeKey));
    };

    // 근로자/근로 시간 변경
    const workerChangeHandler = (e, key) => {
        const { name, value } = e.target;
        setWorkers(workers.map((worker) => 
        worker.key === key ? { ...worker, [name]: value } : worker
        ));
    };

    return (
        <div>
            <Modal 
                isOpen={isModalOpen} 
                onClose={closeHandler}
                buttons={[
                    { text: "등록", onClick: confirmHandler, className: modalStyle.confirmButtonB },
                    { text: "취소", onClick: closeHandler, className: modalStyle.cancelButtonB }
                ]}
            >
                <div className={style.scheduleAddContainer}>
                    <h2>스케줄 신규 등록</h2>
                    <hr/>
                    <div className={style.scheduleAddBody}>
                        <span style={{ marginRight: "36px" }} className={style.span}>날짜</span>
                        <input type="date"/>
                        <h3>근로자 추가</h3>

                        {workers.map(({ worker, division, key }, index) => (
                            <div key={key} className={style.workers}>
                                <span className={style.span}>근로자</span>
                                <select
                                    name = "worker"
                                    value={worker}
                                    onChange={(e) => workerChangeHandler(e, key)}
                                >
                                    <option value="">근로자 선택</option>
                                    {/* 옵션이 이곳에 동적으로 추가되도록 하기 */}
                                </select>
                                <span style={{ marginLeft: "50px" }}  className={style.span}>근로 시간</span>
                                <input
                                    type="number"
                                    name="division"
                                    value={division}
                                    onChange={(e) => workerChangeHandler(e, key)}
                                    placeholder="근로 시간"
                                />
                                <button onClick={addWorkerHandler} className={style.addWorkerBtn}>+</button>
                                {index > 0 && (
                                    <button onClick={rmWorkerHandler} className={style.delWorkerBtn}>─</button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ScheduleAdd;
