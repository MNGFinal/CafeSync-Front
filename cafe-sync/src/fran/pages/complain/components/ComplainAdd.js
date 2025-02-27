import { useState, useEffect } from "react";
import style from "../styles/Complain.module.css"
import mStyle from "../../../../components/ModalButton.module.css"
import useFetchWorkers from "../../employee/hooks/useFetchWorkers";

const ComplainAdd = ({franCode}) => {
  const workerList = useFetchWorkers(franCode);
  const [selectedWorker, setSelectedWorker] = useState("");

  const divisionOption = [
    { label: "서비스", value: 1 },
    { label: "위생", value: 2 }, 
    { label: "기타", value: 3 },
  ]
  
  return(
    <>
      <h1 className={style.comH1}>컴플레인 등록</h1>
      <div className={style.addTable}>
        <table>
          <tr>
            <th>컴플레인 접수 일자</th>
            <td><input type="datetime-local"/></td>
          </tr>
          <tr>
            <th>컴플레인 구분</th>
            <td>
              <select>
                <option value="">선택</option>
                {divisionOption.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>컴플레인 접수자</th>
            <td>
              <select
                value={selectedWorker}
                onChange={(e) => setSelectedWorker(e.target.value)}
              >
                <option value="">선택</option>
                {workerList?.map(({empCode, empName}) => (
                  <option key={empCode} value={empCode}>
                    {empName}
                  </option>
                ))}
              </select>
            </td>
          </tr>
          <tr>
            <th>컴플레인 제출자 연락처</th>
            <td><input type="text"/></td>
          </tr>
          <tr>
            <th>컴플레인 내용</th>
          </tr>
        </table>
        <textarea className={style.addTextarea}/>
      </div>
      <div className={style.btnSection}>
        <button className={mStyle.confirmButtonS}>등록</button>
        <button className={mStyle.cancelButtonS}>취소</button>
      </div>
    </>
  )
};

export default ComplainAdd;