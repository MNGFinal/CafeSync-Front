import { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import style from "./styles/Plan.module.css";
import ModifyPlan from "./ModifyPlan";

const DetailPlan = ({
  isDetailModalOpen,
  setIsDetailModalOpen,
  selectedEvent,
  onUpdatePlan,
}) => {
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [isSModalOpen, setIsSModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [event, setEvent] = useState(() => ({
    promotionCode: selectedEvent?.publicId || 0,
    title: selectedEvent?.title || "",
    categoryName: selectedEvent?.extendedProps?.category || "",
    startDate: selectedEvent?.start || "",
    endDate: selectedEvent?.end || "",
    memo: selectedEvent?.extendedProps?.memo || "",
  }));

  console.log("selectedEvent!!!", selectedEvent);

  useEffect(() => {
    if (!selectedEvent) return null;
    if (selectedEvent) {
      setEvent((prev) => ({
        ...prev,
        promotionCode:
          selectedEvent._def?.publicId !== undefined &&
          selectedEvent._def?.publicId !== null
            ? Number(selectedEvent._def.publicId) // ✅ _def 내부에서 가져오기
            : prev.promotionCode,
        title: selectedEvent.title || prev.title,
        categoryName:
          selectedEvent.extendedProps?.category || prev.categoryName,
        startDate: selectedEvent.start || prev.startDate,
        endDate: selectedEvent.end || prev.endDate,
        memo: selectedEvent.extendedProps?.memo || prev.memo,
      }));
    }
  }, [selectedEvent]);

  const closeHandler = () => {
    setIsDetailModalOpen(false);
    onUpdatePlan();
  };

  const openModifyModal = () => {
    setIsModifyModalOpen(true); // ✅ 수정 모달 열기
  };

  const formatToKST = (utcDate) => {
    if (!utcDate) return "";
    const date = new Date(utcDate);
    date.setHours(date.getHours() + 9); // ✅ UTC → KST 변환
    return date.toISOString().split("T")[0]; // ✅ YYYY-MM-DD 형식으로 변환
  };

  const deleteHandler = async () => {
    try {
      let token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/hq/promotion/${event.promotionCode}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("삭제 실패");

      console.log("기존 데이터 삭제 성공!");
      setLottieAnimation("/animations/success-check.json");
      setModalMessage("스케줄을 정상 삭제하였습니다.");
      setIsDeleteModalOpen(false);
      setIsSModalOpen(true);
    } catch (error) {
      console.error("삭제 오류:", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("스케줄 삭제에 실패하였습니다.");
      setIsSModalOpen(true);
      setIsDeleteModalOpen(false);
    }
  };

  const rmPromotionHandler = () => {
    setIsDeleteModalOpen(true);
    setLottieAnimation("/animations/identify.json");
    setModalMessage("해당 프로모션을 정말로 삭제하시겠습니까?");
  };

  const closeSmodalHandler = () => {
    setIsSModalOpen(false);
    if (lottieAnimation === "/animations/success-check.json") {
      closeHandler(); // ✅ 성공한 경우만 기존 모달 닫기
    }
  };

  return (
    <div>
      <Modal
        isOpen={isDetailModalOpen}
        onClose={closeHandler}
        buttons={[
          {
            text: "수정",
            onClick: openModifyModal,
            className: modalStyle.modifyButtonB,
          },
          {
            text: "삭제",
            onClick: rmPromotionHandler,
            className: modalStyle.deleteButtonB,
          },
        ]}
      >
        <h2 className={style.schH2}>일정 프로모션 상세</h2>
        <hr />
        <div className={style.addTable}>
          <table>
            <tr>
              <th>프로모션 명</th>
              <td>{selectedEvent.title}</td>
            </tr>
            <tr>
              <th>프로모션 종류</th>
              <td>{selectedEvent.extendedProps?.category}</td>
            </tr>
            <tr>
              <th>프로모션 기간</th>
              <td>
                {formatToKST(selectedEvent.start)} ~{" "}
                {selectedEvent.end.toISOString().split("T")[0]}
              </td>
            </tr>
            <tr>
              <th>프로모션 내용</th>
            </tr>
          </table>
          <textarea
            className={style.addTextarea}
            value={selectedEvent.extendedProps?.memo || ""}
            readOnly
          />
        </div>
        <SModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          buttons={[
            {
              text: "삭제",
              onClick: () => deleteHandler(),
              className: modalStyle.deleteButtonS,
            },
            {
              text: "취소",
              onClick: () => setIsDeleteModalOpen(false),
              className: modalStyle.cancelButtonS,
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
            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {modalMessage}
            </span>
            <br />
          </div>
        </SModal>
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
            <span style={{ marginTop: "15px", whiteSpace: "pre-line" }}>
              {modalMessage}
            </span>
            <br />
          </div>
        </SModal>
      </Modal>
      {isModifyModalOpen && (
        <ModifyPlan
          isModifyModalOpen={isModifyModalOpen}
          setIsModifyModalOpen={setIsModifyModalOpen}
          selectedEvent={selectedEvent}
          onUpdatePlan={onUpdatePlan}
          closeHandler={closeHandler}
        />
      )}
    </div>
  );
};

export default DetailPlan;
