import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { uploadProfileImageToFirebase } from "../../../firebase/uploadProfileImageToFirebase";
import {
  createEmployee,
  updateEmployee,
} from "../../../apis/employee/employeeApi";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import styles from "./EmployeeDetail.module.css";
import modalStyle from "../../../components/ModalButton.module.css";

function EmployeeDetail({ employee, formatDate, fetchEmployees, onClose }) {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 로그인한 사용자 직급코드 (21=점장, 22=바리스타)
  const loginJobCode = useSelector(
    (state) => state.auth?.user?.job?.jobCode ?? null
  );
  const isManagerLoggedIn = loginJobCode === 21;

  // employee가 null이면 → "신규 등록 모드"
  const isCreateMode = !employee;

  // "수정" 모드 관리: 신규 등록이면 처음부터 true(수정 가능 상태)
  const [isEditing, setIsEditing] = useState(isCreateMode);

  // 수정용 상태: employee로부터 초기화 (신규 등록이면 빈 값)
  const [editedEmployee, setEditedEmployee] = useState(() => {
    if (isCreateMode) {
      // 신규 등록 모드 기본값
      return {
        empCode: "",
        empName: "",
        phone: "",
        email: "",
        hireDate: "",
        retireDate: "",
        salaryUnit: "",
        salary: "",
        addr: "",
        memo: "",
        jobCode: 22, // 기본 바리스타
        job: {
          jobCode: 22,
          jobName: "바리스타",
        },
        profileImage: "",
      };
    } else {
      // 수정 모드
      return {
        ...employee,
        // 만약 jobCode가 없으면 22(바리스타)로 기본값
        jobCode: employee?.jobCode ?? 22,
        job: {
          jobCode: employee?.jobCode ?? 22,
          jobName: employee?.job?.jobName ?? "바리스타",
        },
      };
    }
  });

  // 모달(결과 표시) 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState("");

  // 파일 인풋 ref
  const fileInputRef = useRef(null);

  // 직급 변경
  const handleJobChange = (e) => {
    const selectedJobCode = Number(e.target.value);
    setEditedEmployee((prev) => ({
      ...prev,
      jobCode: selectedJobCode,
      job: {
        jobCode: selectedJobCode,
        jobName: selectedJobCode === 21 ? "점장" : "바리스타",
      },
    }));
  };

  // 인풋 변경
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedEmployee((prev) => ({ ...prev, [name]: value }));
  };

  // 주소 검색
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: (data) => {
        setEditedEmployee((prev) => ({ ...prev, addr: data.address }));
      },
    }).open();
  };

  // 프로필 이미지 업로드
  const handleProfileImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const downloadURL = await uploadProfileImageToFirebase(file);
      setEditedEmployee((prev) => ({ ...prev, profileImage: downloadURL }));
      console.log("프로필 이미지 업로드 성공:", downloadURL);
    } catch (error) {
      console.error("프로필 이미지 업로드 실패:", error);
    }
  };

  // 저장 버튼
  // 저장 버튼 클릭 시 호출
  const handleSave = async () => {
    // 필수 입력값 검증
    if (
      !editedEmployee.empName ||
      !editedEmployee.profileImage ||
      !editedEmployee.phone ||
      !editedEmployee.email ||
      !editedEmployee.hireDate ||
      !editedEmployee.salaryUnit ||
      !editedEmployee.salary ||
      !editedEmployee.addr
    ) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("모든 필수 정보를 입력해주세요.");
      setIsModalOpen(true);
      return;
    }

    // 서버로 보낼 데이터
    const dataToSend = {
      empCode: editedEmployee.empCode, // 수정 시 필요
      empName: editedEmployee.empName,
      phone: editedEmployee.phone,
      email: editedEmployee.email,
      hireDate: editedEmployee.hireDate,
      retireDate: editedEmployee.retireDate,
      salaryUnit: editedEmployee.salaryUnit,
      salary: editedEmployee.salary,
      addr: editedEmployee.addr,
      memo: editedEmployee.memo,
      jobCode: editedEmployee.jobCode,
      profileImage: editedEmployee.profileImage,
      franCode: franCode,
    };

    // 신규 등록 or 수정
    let result;
    if (isCreateMode) {
      result = await createEmployee(dataToSend); // ✅ 신규 등록 API 호출
    } else {
      result = await updateEmployee(dataToSend); // ✅ 기존 직원 수정 API 호출
    }

    // API 호출 결과 처리
    if (result.success) {
      setLottieAnimation("/animations/success-check.json");
      setModalMessage(isCreateMode ? "신규 등록되었습니다" : "수정되었습니다");
      setIsModalOpen(true);

      // 직원 목록 새로고침
      if (fetchEmployees) {
        await fetchEmployees();
      }

      // 완료 후 모달 닫기
      setTimeout(() => {
        onClose?.();
      }, 800);
    } else {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("작업에 실패했습니다. 다시 시도해주세요.");
      setIsModalOpen(true);
    }
  };

  // 취소 버튼
  const handleCancel = () => {
    onClose?.();
  };

  // 읽기 전용 텍스트
  const readOnlyValue = (key, fallback = "정보 없음") => {
    const val = editedEmployee[key];
    if (!val) return fallback;
    if (key === "hireDate" || key === "retireDate") {
      return formatDate ? formatDate(val) : val;
    }
    return val;
  };

  return (
    <div className={styles.modalContainer}>
      {/* 신규 등록 모드면 "신규 직원 등록", 수정 모드면 "이름" 표시 */}
      {/* 모달 제목 대신 입력 필드 추가 */}
      <div className={styles.modalTitle}>
        {isEditing ? (
          <input
            type="text"
            name="empName"
            value={editedEmployee.empName}
            onChange={handleInputChange}
            className={styles.nameInput} // 새로운 스타일 추가
            placeholder="직원 이름 입력"
          />
        ) : (
          <span>{editedEmployee.empName}</span>
        )}
      </div>

      <div className={styles.contentWrapper}>
        {/* 프로필 박스 */}
        <div className={styles.profileBox}>
          <img
            src={editedEmployee.profileImage || "/images/icons/default.png"}
            alt={`${editedEmployee.empName} 프로필`}
            className={styles.profileImage}
          />
          {isEditing && (
            <div className={styles.fileButtonWrapper}>
              <label className={styles.fileInputWrapper}>
                사진 선택
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className={styles.fileInput}
                  ref={fileInputRef}
                />
              </label>
            </div>
          )}
        </div>

        {/* 정보 입력 영역 */}
        {isManagerLoggedIn ? (
          <div className={styles.infoGrid}>
            {/* 직급 */}
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>직급</span>
                {isEditing ? (
                  <select
                    name="jobCode"
                    value={editedEmployee.jobCode}
                    onChange={handleJobChange}
                    className={styles.selectField}
                  >
                    <option value="21">점장</option>
                    <option value="22">바리스타</option>
                  </select>
                ) : (
                  <span className={styles.value}>
                    {editedEmployee.job?.jobName || "직책 정보 없음"}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.infoColumn} />

            {/* 연락처 / 입사일 */}
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>연락처</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="phone"
                    value={editedEmployee.phone || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("phone", "연락처 없음")}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>입사일</span>
                {isEditing ? (
                  <input
                    type="date"
                    name="hireDate"
                    value={editedEmployee.hireDate || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("hireDate")}
                  </span>
                )}
              </div>
            </div>

            {/* 이메일 / 퇴사일 */}
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>이메일</span>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editedEmployee.email || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("email", "이메일 없음")}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>퇴사일</span>
                {isEditing ? (
                  <input
                    type="date"
                    name="retireDate"
                    value={editedEmployee.retireDate || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("retireDate")}
                  </span>
                )}
              </div>
            </div>

            {/* 급여단위 / 급여 */}
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>급여단위</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="salaryUnit"
                    value={editedEmployee.salaryUnit || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("salaryUnit")}
                  </span>
                )}
              </div>
            </div>
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <span className={styles.label}>급여</span>
                {isEditing ? (
                  <input
                    type="text"
                    name="salary"
                    value={editedEmployee.salary || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                ) : (
                  <span className={styles.value}>
                    {readOnlyValue("salary")}
                  </span>
                )}
              </div>
            </div>

            {/* 주소 */}
            <div className={styles.fullRow}>
              <span className={styles.label}>주소</span>
              {isEditing ? (
                <>
                  <input
                    type="text"
                    name="addr"
                    value={editedEmployee.addr || ""}
                    onChange={handleInputChange}
                    className={styles.inputField}
                  />
                  <button
                    type="button"
                    className={styles.addressButton}
                    onClick={handleAddressSearch}
                  >
                    검색
                  </button>
                </>
              ) : (
                <span className={styles.value}>
                  {readOnlyValue("addr", "주소 없음")}
                </span>
              )}
            </div>
          </div>
        ) : (
          // 바리스타 로그인 시 (읽기 전용)
          <div className={styles.infoSingleColumn}>
            <div className={styles.infoRow}>
              <span className={styles.label}>직급</span>
              <span className={styles.value}>
                {editedEmployee.job?.jobName || "직책 정보 없음"}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>연락처</span>
              <span className={styles.value}>
                {readOnlyValue("phone", "연락처 없음")}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>이메일</span>
              <span className={styles.value}>
                {readOnlyValue("email", "이메일 없음")}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>입사일</span>
              <span className={styles.value}>{readOnlyValue("hireDate")}</span>
            </div>
            <div className={styles.fullRow}>
              <span className={styles.label}>주소</span>
              <span className={styles.value}>
                {readOnlyValue("addr", "주소 없음")}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 메모 영역 */}
      <div className={styles.memoBox}>
        <div className={styles.memoLabel}>메모</div>
        {isEditing ? (
          <textarea
            className={styles.memoInput}
            name="memo"
            value={editedEmployee.memo || ""}
            onChange={handleInputChange}
          />
        ) : (
          <textarea
            className={styles.memoInput}
            value={editedEmployee.memo || ""}
            readOnly
          />
        )}
      </div>

      {/* 버튼 영역 */}
      <div className={styles.buttonBox}>
        {/* 신규 등록 모드/수정 모드 모두 공통: isEditing일 때만 저장/취소 버튼 */}
        {isEditing && (
          <div className={styles.buttonBox2}>
            <button className={styles.confirmButton} onClick={handleSave}>
              등록
            </button>
            <button className={styles.cancelButton} onClick={handleCancel}>
              취소
            </button>
          </div>
        )}
        {/* 수정 모드 + 점장 로그인일 때만 보이는 '수정' 버튼 */}
        {!isCreateMode && isManagerLoggedIn && !isEditing && (
          <button
            className={styles.editButton}
            onClick={() => setIsEditing(true)}
          >
            수정
          </button>
        )}
      </div>

      {/* SModal로 결과 메시지 표시 */}
      <SModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsModalOpen(false),
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
            style={{
              height: "100px",
              width: "100px",
              margin: "0 auto",
            }}
          />
          <br />
          <p>{modalMessage}</p>
        </div>
      </SModal>
    </div>
  );
}

export default EmployeeDetail;
