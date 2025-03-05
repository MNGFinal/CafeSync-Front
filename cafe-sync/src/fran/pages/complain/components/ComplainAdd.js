import { useState, useEffect } from "react";
import SModal from "../../../../components/SModal";
import style from "../styles/Complain.module.css"
import modalStyle from "../../../../components/ModalButton.module.css"
import useFetchWorkers from "../../employee/hooks/useFetchWorkers";
import { Player } from "@lottiefiles/react-lottie-player";

const ComplainAdd = ({franCode, onComplainUpdate}) => {
  const today = new Date().toISOString().split("T")[0];
  const workerList = useFetchWorkers(franCode);
  const [complain, setComplain] = useState(
    { complainDate: today, complainDivision: "", empCode: "", empName: "", customerPhone: "", complainDetail: "", franCode: franCode },
  );
  const [addError, setAddError] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const divisionOption = [
    { label: "서비스", value: 1 },
    { label: "위생", value: 2 }, 
    { label: "기타", value: 3 },
  ]

  const complainChangeHandler = (e) => {
    const { name, value } = e.target;
    setComplain((prev) => ({
      ...prev, [name]: value,
    }));
  }

  const resetComplainHandler = () => {
    setComplain(
      { complainDate: today, complainDivision: "", empCode: "", empName: "", customerPhone: "", complainDetail: "", franCode: complain.franCode }
    );
  }

  const confirmHandler = async () => {
    console.log('confirmHandler 실행됨');
    if (!complain.complainDate || !complain.complainDivision || !complain.empCode || !complain.customerPhone || !complain.complainDetail || addError) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("모든 항목을 입력해주세요.");
      setIsSModalOpen(true);
      return;
    };
    
    console.log('confirmHandler에 저장된 complain: ', complain);

    try {
      let token = sessionStorage.getItem("accessToken");
      const resopnse = await fetch("http://localhost:8080/api/fran/complain", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(complain)
      });

      const savedComplain = await resopnse.json();
      console.log('세이브 된 컴플레인: ', savedComplain);

      if (!resopnse.ok) {
        throw new Error("컴플레인 저장 실패ㅠ");
      }

      console.log("컴플레인 등록 성공!!!!!");
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("컴플레인을 정상 등록하였습니다.");
      setIsSModalOpen(true);
      resetComplainHandler();
      onComplainUpdate();

      // if(onComplainUpdate) {onComplainUpdate(savedComplain)};
    } catch (error) {
      console.log("컴플레인 등록 실 패 !", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("컴플레인 등록에 실패하였습니다.");
      setIsSModalOpen(true);
    }
  }
  
  return(
    <>
      <h1 className={style.comH1}>컴플레인 등록</h1>
      <div className={style.addTable}>
        <table>
          <tr>
            <th>컴플레인 접수 일자</th>
            <td>
              <input 
                type="datetime-local" 
                name="complainDate" 
                value={complain.complainDate}
                onChange={complainChangeHandler}
              />
            </td>
          </tr>
          <tr>
            <th>컴플레인 구분</th>
            <td>
              <select name="complainDivision" value={complain.complainDivision} onChange={complainChangeHandler}>
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
                name="empCode"
                value={complain.empCode}
                onChange={(e) => {
                  const seletedEmp = workerList?.find(worker => String(worker.empCode) === e.target.value);
                  setComplain((prev) => ({
                    ...prev,
                    empCode: e.target.value,
                    empName: seletedEmp?.empName || "",
                  }));
                }}
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
            <td><input type="text" name="customerPhone" value={complain.customerPhone} onChange={complainChangeHandler}/></td>
          </tr>
          <tr>
            <th>컴플레인 내용</th>
          </tr>
        </table>
        <textarea className={style.addTextarea} name="complainDetail" value={complain.complainDetail} onChange={complainChangeHandler}/>
      </div>
      <div className={style.btnSection}>
        <button className={modalStyle.confirmButtonS} onClick={confirmHandler}>등록</button>
        <button 
          className={modalStyle.cancelButtonS} 
          onClick={resetComplainHandler}
        >취소</button>
      </div>
      <SModal
        isOpen={isSModalOpen}
        onClose={() => setIsSModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsSModalOpen(false),
            className: modalStyle.confirmButtonS,
          }
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={lottieAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <span style={{marginTop: "15px", whiteSpace: "pre-line"}}>{modalMessage}</span>
          <br />
        </div>
      </SModal>
    </>
  )
};

export default ComplainAdd;