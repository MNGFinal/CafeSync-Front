import { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import style from "./styles/Plan.module.css";

const ModifyPlan = ({ isModifyModalOpen, setIsModifyModalOpen, selectedEvent, onUpdatePlan, closeHandler }) => {
  const [updatedEvent, setUpdatedEvent] = useState(() => ({
    promotionCode: selectedEvent?.publicId || 0,
    title: selectedEvent?.title || "",
    categoryName: selectedEvent?.extendedProps?.category || "",
    startDate: selectedEvent?.start || "",
    endDate: selectedEvent?.end || "",
    memo: selectedEvent?.extendedProps?.memo || "",
  }));

  const [promotion, setPromotion] = useState(updatedEvent);
  const [addError, setAddError] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (selectedEvent) {
      setUpdatedEvent((prev) => ({
        ...prev,
        promotionCode:
          selectedEvent._def?.publicId !== undefined && selectedEvent._def?.publicId !== null
            ? Number(selectedEvent._def.publicId) // ✅ _def 내부에서 가져오기
            : prev.promotionCode,
        title: selectedEvent.title || prev.title,
        categoryName: selectedEvent.extendedProps?.category || prev.categoryName,
        startDate: selectedEvent.start || prev.startDate,
        endDate: selectedEvent.end || prev.endDate,
        memo: selectedEvent.extendedProps?.memo || prev.memo,
      }));
    }
  }, [selectedEvent]);

  const promotionChangeHandler = (e) => {
    const { name, value } = e.target;
  
    // ✅ 날짜 형식이 필요한 경우 YYYY-MM-DD 변환
    const formattedValue = (name === "startDate" || name === "endDate") ? new Date(value).toISOString().split("T")[0] : value;
  
    // ✅ updatedEvent 상태 업데이트
    setUpdatedEvent((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  
    // ✅ promotion 상태도 같이 업데이트
    setPromotion((prev) => ({
      ...prev,
      [name]: formattedValue,
      promotionCode: prev.promotionCode || updatedEvent.promotionCode, // 유지해야 하는 promotionCode
    }));
  };  

  const formatDateForInput = (date, name) => {
    if (!date) return ""; // 값이 없으면 빈 문자열 반환
    const kstDate = new Date(date);
    console.log('date: ', date);
    console.log('name: ', name);
    if (name === "startDate") {
      kstDate.setHours(kstDate.getHours() + 9);
    }

    return kstDate.toISOString().split("T")[0];
  };

  const saveHandler = async () => {
    if (!updatedEvent.title || !updatedEvent.categoryName || !updatedEvent.startDate || !updatedEvent.endDate) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("모든 항목을 입력해주세요.");
      setIsSModalOpen(true);
      return;
    }
  
    if (addError) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("종료일이 시작일보다 이전일 수 없습니다.");
      setIsSModalOpen(true);
      return;
    }
  
    try {
      console.log("✅ 보내는 데이터:", updatedEvent);
      let token = sessionStorage.getItem("accessToken");
  
      // ✅ 날짜 변환 시 undefined 체크 후 변환
      const formatDateToUTC = (date, isEndDate = false) => {
        if (!date) return ""; // 빈 값 방지
        const newDate = new Date(date);
        if (isEndDate) {
          newDate.setHours(23, 59, 59, 999);
        } else {
          newDate.setHours(0, 0, 0, 0);
        }
        return newDate.toISOString();
      };
  
      const formattedData = {
        promotionCode: Number(updatedEvent.promotionCode) || 0, // ✅ 숫자로 변환하여 ID 유지
        title: updatedEvent.title,
        categoryName: updatedEvent.categoryName,
        startDate: formatDateToUTC(updatedEvent.startDate, false),
        endDate: formatDateToUTC(updatedEvent.endDate, true),
        memo: updatedEvent.memo,
      };
  
      console.log("🚀 최종 전송 데이터:", formattedData);
  
      const response = await fetch(`http://localhost:8080/api/hq/promotion`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });
  
      const savedPromotion = await response.json();
      console.log("🎉 서버 응답 데이터:", savedPromotion);
  
      if (!response.ok) {
        throw new Error("프로모션 저장 실패");
      }
  
      console.log("✅ 프로모션 수정 성공!");
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("프로모션을 정상 수정하였습니다.");
      setIsSModalOpen(true);
      onUpdatePlan();
    } catch (error) {
      console.log("❌ 프로모션 수정 실패!", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("프로모션 수정에 실패하였습니다.");
      setIsSModalOpen(true);
    }
  };
  

  const closeMHandler = () => {
    setIsSModalOpen(false);
    setPromotion(updatedEvent);
    setIsModifyModalOpen(false);
    closeHandler();
  };

  return (
    <div>
      <Modal
        isOpen={isModifyModalOpen}
        onClose={() => setIsModifyModalOpen(false)}
        buttons={[
          {
            text: "저장",
            onClick: saveHandler,
            className: modalStyle.confirmButtonB
          },
          { 
            text: "취소", 
            onClick: () => setIsModifyModalOpen(false), 
            className: modalStyle.cancelButtonB 
          }
        ]}
      >
        <h2 className={style.schH2}>일정 프로모션 수정</h2>
        <hr />
        <div className={style.addTable}>
          <table>
            <tr>
              <th>프로모션 명<span style={{ color: "red", marginLeft: "2px" }}>*</span></th>
              <td>
                <input
                  type="text"
                  name="title"
                  value={updatedEvent.title}
                  onChange={promotionChangeHandler}
                />
              </td>
            </tr>
            <tr>
              <th>프로모션 종류<span style={{ color: "red", marginLeft: "2px" }}>*</span></th>
              <td>
                <select 
                  name="categoryName"
                  value={updatedEvent.categoryName}
                  onChange={promotionChangeHandler}
                >
                  <option value="">선택</option>
                  <option value="시즌">시즌</option>
                  <option value="이벤트">이벤트</option>
                  <option value="콜라보">콜라보</option>
                </select>
              </td>
            </tr>
            <tr>
              <th>프로모션 기간<span style={{ color: "red", marginLeft: "2px" }}>*</span></th>
              <td>
                <input 
                  type="date" 
                  name="startDate"
                  value={formatDateForInput(promotion.startDate, "startDate")}
                  onChange={promotionChangeHandler}
                /> ~ {" "}
                <input 
                  type="date" 
                  name="endDate"
                  value={formatDateForInput(promotion.endDate)}
                  onChange={promotionChangeHandler}
                />
              </td>
            </tr>
            {addError && (
              <tr>
                <td colSpan="2">
                  <p style={{ display: "inline-block", color: "red", marginLeft: "10px", fontSize: "12px" }}>{addError}</p>
                </td>
              </tr>
            )}
            <tr>
              <th>프로모션 내용</th>
            </tr>
          </table>
          <textarea 
            className={style.addTextarea} 
            name="memo" 
            value={updatedEvent.memo}
            onChange={promotionChangeHandler}
          />
        </div>
        <SModal
          isOpen={isSModalOpen}
          onClose={() => setIsSModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: closeMHandler,
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
            <br />
            <span style={{marginTop: "15px", whiteSpace: "pre-line"}}>{modalMessage}</span>
          </div>
        </SModal>
      </Modal>
    </div>
  )
}

export default ModifyPlan