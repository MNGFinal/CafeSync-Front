import { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import style from "./styles/Plan.module.css";

const AddPlan = ({isAddModalOpen, setIsAddModalOpen, onUpdatePlan}) => {
  const [promotion, setPromotion] = useState("");
  const [addError, setAddError] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const confirmHandler = async () => {

  }

  const closeHandler = () => {
    setPromotion("");
    isAddModalOpen(false);
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
            className: modalStyle.confirmButtonB
          },
          { 
            text: "취소", 
            onClick: closeHandler, 
            className: modalStyle.cancelButtonB 
          }
        ]}
      >
        <h2 className={style.schH2}>일정 프로모션 등록</h2>
        <hr />
        <div className={style.addPlanTable}>
          <table>
            <tr>
              <th>프로모션 명<p style={{ color: "red", marginLeft: "2px" }}>*</p></th>
              <td>
                <input
                  type="text"
                  name="title"
                //   value={promotion.title}
                //   onChange={promotionChangeHandler}
                />
              </td>
            </tr>
            <tr>
              <th>프로모션 종류<p style={{ color: "red", marginLeft: "2px" }}>*</p></th>
              <td>
                <select 
                  name="categoryName"
                //   value={promotion.categoryName}
                // onChange={promotionChangeHandler}
                >
                  <option value="">선택</option>
                </select>
              </td>
            </tr>
          </table>
        </div>
        <SModal>
        </SModal>
      </Modal>
    </div>
  )
}

export default AddPlan