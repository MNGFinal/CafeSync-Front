import { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import style from "./styles/Plan.module.css";

const AddPlan = ({ isAddModalOpen, setIsAddModalOpen, onUpdatePlan }) => {
  const initialPromotionState = {
    title: "",
    categoryName: "",
    startDate: "",
    endDate: "",
    memo: "",
  };
  const [promotion, setPromotion] = useState(initialPromotionState);
  const [addError, setAddError] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const promotionChangeHandler = (e) => {
    const { name, value } = e.target;

    if (name === "startDate" || name === "endDate") {
      setPromotion((prev) => ({
        ...prev,
        [name]: value, // input에 맞게 YYYY-MM-DD 형식 유지
      }));
    } else {
      setPromotion((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const formatToUTC = (dateString, isEndDate = false) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isEndDate) {
      date.setUTCHours(23, 59, 59, 999);
    } else {
      date.setUTCHours(0, 0, 0, 0);
    }

    return date.toISOString();
  };

  const confirmHandler = async () => {
    if (
      !promotion.title ||
      !promotion.categoryName ||
      !promotion.startDate ||
      !promotion.endDate
    ) {
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
      let token = sessionStorage.getItem("accessToken");
      const formattedData = {
        ...promotion,
        startDate: formatToUTC(promotion.startDate, false), // UTC 00:00:00 변환
        endDate: formatToUTC(promotion.endDate, true), // UTC 23:59:59 변환
      };
      const resopnse = await fetch(
        "https://cafesync-back-production.up.railway.app/api/hq/promotion",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formattedData),
        }
      );

      const savedPromotion = await resopnse.json();
      console.log("savedPromotion? :", savedPromotion);

      if (!resopnse.ok) {
        throw new Error("프로모션 저장 실패");
      }

      console.log("프로모션 등록 성공!!!!!");
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("프로모션을 정상 등록하였습니다.");
      setIsSModalOpen(true);
      onUpdatePlan();
    } catch (error) {
      console.log("프로모션 등록 실 패 !", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("프로모션 등록에 실패하였습니다.");
      setIsSModalOpen(true);
    }
  };

  const closeHandler = () => {
    setPromotion(initialPromotionState);
    setIsSModalOpen(false);
    setIsAddModalOpen(false);
  };

  return (
    <div>
      <Modal
        isOpen={isAddModalOpen}
        onClose={closeHandler}
        buttons={[
          {
            text: "등록",
            onClick: confirmHandler,
            className: modalStyle.confirmButtonB,
          },
          {
            text: "취소",
            onClick: closeHandler,
            className: modalStyle.cancelButtonB,
          },
        ]}
      >
        <h2 className={style.schH2}>일정 프로모션 등록</h2>
        <hr />
        <div className={style.addTable}>
          <table>
            <tr>
              <th>
                프로모션 명
                <span style={{ color: "red", marginLeft: "2px" }}>*</span>
              </th>
              <td>
                <input
                  type="text"
                  name="title"
                  value={promotion.title}
                  onChange={promotionChangeHandler}
                />
              </td>
            </tr>
            <tr>
              <th>
                프로모션 종류
                <span style={{ color: "red", marginLeft: "2px" }}>*</span>
              </th>
              <td>
                <select
                  name="categoryName"
                  value={promotion.categoryName}
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
              <th>
                프로모션 기간
                <span style={{ color: "red", marginLeft: "2px" }}>*</span>
              </th>
              <td>
                <input
                  type="date"
                  name="startDate"
                  value={promotion.startDate}
                  onChange={promotionChangeHandler}
                />{" "}
                ~{" "}
                <input
                  type="date"
                  name="endDate"
                  value={promotion.endDate}
                  onChange={promotionChangeHandler}
                />
              </td>
            </tr>
            {addError && (
              <tr>
                <td colSpan="2">
                  <p
                    style={{
                      display: "inline-block",
                      color: "red",
                      marginLeft: "10px",
                      fontSize: "12px",
                    }}
                  >
                    {addError}
                  </p>
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
            value={promotion.memo}
            onChange={promotionChangeHandler}
          />
        </div>
        <SModal
          isOpen={isSModalOpen}
          onClose={() => setIsSModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: closeHandler,
              className: modalStyle.confirmButtonS,
            },
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
            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {modalMessage}
            </span>
          </div>
        </SModal>
      </Modal>
    </div>
  );
};

export default AddPlan;
