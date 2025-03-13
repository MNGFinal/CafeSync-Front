import style from "../../../fran/pages/menus/modal/MenuModal.module.css";
import modalStyle from "../../../components/ModalButton.module.css";
import HQModalStyles from "./HQMenuModal.module.css";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import { uploadMenuImageToFirebase } from "../../../firebase/uploadMenuImageToFirebase";

const HQMenuModal = ({ menu, onClose, setSelectedMenu, fetchMenus }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 수정 모달 상태
  const [editedMenu, setEditedMenu] = useState({ ...menu }); // 수정 가능한 상태 저장
  const [imageFile, setImageFile] = useState(null); // 파일 선택 상태
  const [isUploading, setIsUploading] = useState(false); // 업로드 상태
  const [isResultModalOpen, setIsResultModalOpen] = useState(false); // 결과(완료/오류) 모달 상태
  const [lottieAnimation, setLottieAnimation] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // 추가: 확인 모달 상태 및 내용
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  // ✅ 이미지 업로드 핸들러
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const imageUrl = await uploadMenuImageToFirebase(file);
      setEditedMenu((prev) => ({ ...prev, menuImage: imageUrl })); // 업로드된 URL로 변경
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // 수정 모달 열기/닫기
  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedMenu((prev) => ({ ...prev, [name]: value }));
  };

  // 수정 완료 버튼 클릭 시 처리
  const onModifySubmit = async () => {
    try {
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/hq/menus/${editedMenu.menuCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedMenu),
        }
      );

      if (response.ok) {
        console.log("✅ 메뉴 수정 성공!");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("메뉴가 수정되었습니다.");
        setIsResultModalOpen(true);
        fetchMenus(); // 수정 후 리스트 새로고침
        onClose(); // 수정 모달 닫기
      } else {
        console.error("❌ 수정 실패");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("수정에 실패했습니다.");
        setIsResultModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 서버 오류:", error);
    }
  };

  // 단종 처리 함수: 메뉴의 disconStatus를 true로 업데이트
  const onDiscontinueConfirm = async () => {
    try {
      const updatedMenu = { ...menu, disconStatus: true };
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/hq/menus/${menu.menuCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMenu),
        }
      );

      if (response.ok) {
        console.log("✅ 메뉴 단종 처리 성공!");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("메뉴가 단종되었습니다.");
        setIsResultModalOpen(true);
        fetchMenus();
        onClose();
      } else {
        console.error("❌ 단종 처리 실패");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("단종 처리에 실패했습니다.");
        setIsResultModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 서버 오류:", error);
      setLottieAnimation("/animations/alert2.json");
      setModalMessage("서버 오류가 발생했습니다.");
      setIsResultModalOpen(true);
    }
  };

  // 단종해제 처리 함수: 메뉴의 disconStatus를 false로 업데이트
  const onRevertDiscontinueConfirm = async () => {
    try {
      const updatedMenu = { ...menu, disconStatus: false };
      const response = await fetch(
        `https://cafesync-back-production.up.railway.app/api/hq/menus/${menu.menuCode}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedMenu),
        }
      );

      if (response.ok) {
        console.log("✅ 메뉴 단종해제 성공!");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("메뉴 단종해제가 완료되었습니다.");
        setIsResultModalOpen(true);
        fetchMenus();
        onClose();
      } else {
        console.error("❌ 메뉴 단종해제 실패");
        setLottieAnimation("/animations/alert2.json");
        setModalMessage("단종해제 처리에 실패했습니다.");
        setIsResultModalOpen(true);
      }
    } catch (error) {
      console.error("❌ 서버 오류:", error);
      setLottieAnimation("/animations/alert2.json");
      setModalMessage("서버 오류가 발생했습니다.");
      setIsResultModalOpen(true);
    }
  };

  // 확인 모달을 위한 핸들러들
  const handleDiscontinueClick = () => {
    setConfirmMessage("단종 하시겠습니까?");
    setConfirmAction(() => onDiscontinueConfirm);
    setIsConfirmModalOpen(true);
  };

  const handleRevertDiscontinueClick = () => {
    setConfirmMessage("단종해제 하시겠습니까?");
    setConfirmAction(() => onRevertDiscontinueConfirm);
    setIsConfirmModalOpen(true);
  };

  // 확인 모달에서 "확인" 클릭 시 실행
  const onConfirm = () => {
    if (confirmAction) confirmAction();
    setIsConfirmModalOpen(false);
  };

  // 확인 모달에서 "취소" 클릭 시
  const onCancelConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <div className={style.Overlay} onClick={onClose}>
        <div
          className={style.cartContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={style.closeButton} onClick={onClose}>
            ✖
          </button>

          <span className={style.category}>{menu.category}</span>
          <hr />
          <br />
          <img
            src={menu.menuImage}
            alt={menu.menuNameKo}
            className={style.menuImage}
          />
          <br />
          <br />
          <br />
          <br />
          <span className={style.menuName}>{menu.menuNameKo}</span>
          <br />
          <span className={style.menuNameEN}>{menu.menuNameEN}</span>
          <hr />
          <span className={style.menuDetail}>{menu.menuDetail}</span>
          <hr />
          <button
            className={style.modifyButton}
            type="button"
            onClick={openEditModal}
          >
            수정
          </button>
          {/* 조건에 따라 단종 또는 단종해제 버튼 표시 */}
          {menu.disconStatus ? (
            <button
              className={style.deleteButton}
              type="button"
              onClick={handleRevertDiscontinueClick}
            >
              해제
            </button>
          ) : (
            <button
              className={style.deleteButton}
              type="button"
              onClick={handleDiscontinueClick}
            >
              단종
            </button>
          )}
        </div>
      </div>

      {/* 수정 모달 */}
      {isEditModalOpen && (
        <Modal
          isOpen={true}
          onClose={closeEditModal}
          buttons={[
            {
              text: "확인",
              onClick: onModifySubmit,
              className: modalStyle.confirmButtonS,
            },
            {
              text: "취소",
              onClick: closeEditModal,
              className: modalStyle.confirmButtonS,
            },
          ]}
        >
          <div className={HQModalStyles.container}>
            <h3 className={HQModalStyles.title}>메뉴 수정</h3>
            <div className={HQModalStyles.formGroup}>
              <label>한글 이름:</label>
              <input
                type="text"
                name="menuNameKo"
                value={editedMenu.menuNameKo}
                onChange={handleChange}
                className={HQModalStyles.formGroup}
              />
            </div>
            <div className={HQModalStyles.formGroup}>
              <label>영어 이름:</label>
              <input
                type="text"
                name="menuNameEN"
                value={editedMenu.menuNameEN}
                onChange={handleChange}
                className={HQModalStyles.formGroup}
              />
            </div>
            <div className={HQModalStyles.formGroup}>
              <label>이미지 업로드:</label>
              <input type="file" onChange={handleImageUpload} />

              {/* ✅ 강제로 줄 바꿈하여 아래로 배치 */}

              {isUploading && (
                <p className={HQModalStyles.uploadStatus}>
                  이미지 업로드 중...
                </p>
              )}
            </div>

            <div className={HQModalStyles.formGroup}>
              <label>메뉴 설명:</label>
              <textarea
                name="menuDetail"
                value={editedMenu.menuDetail}
                onChange={handleChange}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* 결과(완료/오류) 모달 */}
      {isResultModalOpen && (
        <SModal
          isOpen={true}
          onClose={() => setIsResultModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: () => setIsResultModalOpen(false),
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
            <p>{modalMessage}</p>
          </div>
        </SModal>
      )}

      {/* 확인 모달: 단종/단종해제 확인 */}
      {isConfirmModalOpen && (
        <SModal
          isOpen={true}
          onClose={onCancelConfirm}
          buttons={[
            {
              text: "확인",
              onClick: onConfirm,
              className: modalStyle.confirmButtonS,
            },
            {
              text: "취소",
              onClick: onCancelConfirm,
              className: modalStyle.cancelButtonS,
            },
          ]}
        >
          <div style={{ textAlign: "center" }}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src="/animations/alert2.json"
              style={{ height: "100px", width: "100px", margin: "0 auto" }}
            />
            <p
              style={{
                fontSize: "16px",
                fontWeight: "bold",
                marginTop: "13px",
              }}
            >
              {confirmMessage}
            </p>
          </div>
        </SModal>
      )}
    </>
  );
};

export default HQMenuModal;
