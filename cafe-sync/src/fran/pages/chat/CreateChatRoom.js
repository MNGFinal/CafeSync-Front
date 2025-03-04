import React, { useState, useEffect } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./CreateChatRoom.module.css";
import { createChatRoom } from "../../../apis/chat/chatApi";

function CreateChatRoom({
  isOpen,
  onClose,
  onConfirm,
  availableEmployeesFromParent,
  loggedInUserData,
}) {
  const [roomName, setRoomName] = useState("");
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([
    loggedInUserData,
  ]);

  // 🔔 경고 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  // ✅ 성공 모달 상태
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const warningAnimation = "/animations/warning.json";
  const successAnimation = "/animations/success-check.json";

  useEffect(() => {
    if (availableEmployeesFromParent) {
      setAvailableEmployees(availableEmployeesFromParent);
    }
  }, [availableEmployeesFromParent]);

  // ★ selectedEmployees가 변경될 때마다 채팅방 제목을 자동 업데이트
  useEffect(() => {
    const autoTitle = selectedEmployees.map((emp) => emp.empName).join(", ");
    setRoomName(autoTitle);
  }, [selectedEmployees]);

  const handleLeftCheck = (empCode, checked) => {
    setAvailableEmployees((prev) =>
      prev.map((emp) => (emp.empCode === empCode ? { ...emp, checked } : emp))
    );
  };

  const handleRightCheck = (empCode, checked) => {
    setSelectedEmployees((prev) =>
      prev.map((emp) => (emp.empCode === empCode ? { ...emp, checked } : emp))
    );
  };

  const moveToRight = () => {
    const leftChecked = availableEmployees.filter((emp) => emp.checked);
    if (leftChecked.length === 0) return;

    setAvailableEmployees((prev) => prev.filter((emp) => !emp.checked));
    setSelectedEmployees((prev) => [
      ...prev,
      ...leftChecked.map((emp) => ({ ...emp, checked: false })),
    ]);
  };

  const moveToLeft = () => {
    const rightChecked = selectedEmployees.filter(
      (emp) => emp.checked && emp.empCode !== loggedInUserData.empCode
    );
    if (rightChecked.length === 0) return;

    setSelectedEmployees((prev) =>
      prev.filter(
        (emp) => !emp.checked || emp.empCode === loggedInUserData.empCode
      )
    );
    setAvailableEmployees((prev) => [
      ...prev,
      ...rightChecked.map((emp) => ({ ...emp, checked: false })),
    ]);
  };

  // ✅ 채팅방 생성 버튼 클릭 시 유효성 검사
  const handleConfirm = async () => {
    if (!roomName.trim()) {
      setModalMessage("채팅방 제목을 입력해주세요.");
      setIsModalOpen(true);
      return;
    }
    if (selectedEmployees.length < 2) {
      setModalMessage("1명 이상의 참여자를 선택해주세요.");
      setIsModalOpen(true);
      return;
    }

    const result = await createChatRoom(roomName, selectedEmployees);
    if (result) {
      console.log("✅ 채팅방 생성 완료:", result);

      // ✅ 성공 메시지 설정 & 성공 모달 띄우기
      setSuccessMessage("채팅방이 성공적으로 생성되었습니다!");
      setIsSuccessModalOpen(true);

      setRoomName("");
    } else {
      setModalMessage("채팅방 생성에 실패했습니다.");
      setIsModalOpen(true);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    onConfirm(); // 채팅방 목록 새로고침
    onClose(); // 모달 닫기
    setTimeout(() => {
      window.location.reload(); // ✅ 사이트 새로고침 추가
    }, 500); // 0.5초 후 새로고침 (부드러운 UX를 위해)
  };

  return (
    <>
      {/* ✅ 메인 채팅방 생성 모달 */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        buttons={[
          {
            text: "생성",
            onClick: handleConfirm,
            className: modalStyle.confirmButtonB,
          },
          {
            text: "취소",
            onClick: onClose,
            className: modalStyle.confirmButtonB,
          },
        ]}
      >
        <div className={styles.modalWrapper}>
          <div className={styles.title}>
            <p>채팅방 만들기</p>
          </div>

          <div className={styles.modalContent}>
            <label>채팅방 제목</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="채팅방 제목을 입력하세요"
            />
          </div>

          <div className={styles.container}>
            <div className={styles.empBox}>
              <h3>직원목록</h3>
              <ul className={styles.listBox}>
                {availableEmployees.map((emp) => (
                  <li key={emp.empCode}>
                    <label>
                      <input
                        type="checkbox"
                        checked={emp.checked || false}
                        onChange={(e) =>
                          handleLeftCheck(emp.empCode, e.target.checked)
                        }
                      />
                      {emp.franChise?.franName} - {emp.empName}{" "}
                      {emp.job?.jobName ? `(${emp.job?.jobName})` : ""}
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.arrowBox}>
              <button onClick={moveToRight} className={styles.arrowBtn}>
                {">"}
              </button>
              <button onClick={moveToLeft} className={styles.arrowBtn}>
                {"<"}
              </button>
            </div>

            <div className={styles.addEmp}>
              <h3>참여자</h3>
              <ul className={styles.listBox}>
                {selectedEmployees.map((emp) => (
                  <li key={emp.empCode}>
                    <label>
                      <input
                        type="checkbox"
                        checked={emp.checked || false}
                        onChange={(e) =>
                          handleRightCheck(emp.empCode, e.target.checked)
                        }
                        disabled={emp.empCode === loggedInUserData.empCode}
                      />
                      {emp.franChise?.franName || "지점 없음"} - {emp.empName}{" "}
                      {emp.job?.jobName
                        ? `(${emp.job.jobName})`
                        : "(직급 없음)"}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Modal>

      {/* ✅ 성공 모달 (success-check 애니메이션) */}
      <SModal
        isOpen={isSuccessModalOpen}
        onClose={handleSuccessClose}
        buttons={[
          {
            text: "확인",
            onClick: handleSuccessClose,
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={successAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <br />
          <p>{successMessage}</p>
        </div>
      </SModal>
    </>
  );
}

export default CreateChatRoom;
