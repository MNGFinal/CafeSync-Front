import { useState, useEffect } from "react";
import styles from "./FranRegist.module.css";
import { registFran, updateFran } from "../../../../apis/mgment/mgmentApi";
import { uploadFranImageToFirebase } from "../../../../firebase/uploadFranImageToFirebase";
import EmpSearchModal from "./EmpSearchModal";
import SModal from "../../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../../components/ModalButton.module.css";

function FranRegist({
  onClose,
  existingFran,
  setFranList,
  fetchFrans, // 전체 가맹점 목록 조회 API
  onConfirm,
}) {
  const [formData, setFormData] = useState({
    franCode: "",
    franName: "",
    franAddr: "",
    empCode: "",
    empName: "", // 점장 이름(화면 표시용)
    franPhone: "",
    franImage: null,
    memo: "",
  });

  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);

  // 모달 관련 상태 (alert 대신 사용할 모달)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  // 기본 경고 애니메이션은 alert2.json, 성공 시 success-check.json 사용
  const [lottieAnimation, setLottieAnimation] = useState(
    "/animations/alert2.json"
  );

  // 신규 등록 시 자동 코드 부여 / 수정 시 기존 데이터 세팅
  useEffect(() => {
    if (!existingFran) {
      const setAutoFranCode = async () => {
        try {
          const allFrans = await fetchFrans();
          const filteredFrans = allFrans.filter((f) => f.franCode !== 10000);
          if (filteredFrans.length === 0) {
            setFormData((prev) => ({ ...prev, franCode: 10001 }));
          } else {
            const maxCode = Math.max(...filteredFrans.map((f) => f.franCode));
            setFormData((prev) => ({ ...prev, franCode: maxCode + 1 }));
          }
        } catch (error) {
          console.error("가맹점 목록 조회 실패:", error);
        }
      };
      setAutoFranCode();
    } else {
      setFormData({
        franCode: existingFran.franCode,
        franName: existingFran.franName,
        franAddr: existingFran.franAddr,
        empCode: existingFran.empCode,
        empName: existingFran.empName || "",
        franPhone: existingFran.franPhone,
        franImage: existingFran.franImage,
        memo: existingFran.memo,
      });
    }
  }, [existingFran, fetchFrans]);

  // 인풋 및 textarea 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // 파일 업로드 처리 (이미지 업로드 성공/실패 시 모달로 알림)
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const imageUrl = await uploadFranImageToFirebase(file);
      setFormData({ ...formData, franImage: imageUrl });
      setModalMessage("이미지 업로드 성공!");
      setLottieAnimation("/animations/success-check.json");
      setIsModalOpen(true);
    } catch (error) {
      setModalMessage("이미지 업로드 실패!");
      setLottieAnimation("/animations/alert2.json");
      setIsModalOpen(true);
    }
  };

  // 다음 우편번호 API (주소 검색)
  const handleAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        setFormData((prevData) => ({
          ...prevData,
          franAddr: data.address,
        }));
      },
    }).open();
  };

  // 직원 조회 모달 열기/닫기
  const openEmpSearchModal = () => setIsEmpModalOpen(true);
  const closeEmpSearchModal = () => setIsEmpModalOpen(false);

  // 모달에서 직원 선택 시
  const handleSelectEmployee = (emp) => {
    setFormData((prevData) => ({
      ...prevData,
      empCode: emp.empCode,
      empName: emp.empName,
    }));
  };

  // 등록/수정 처리 (유효성 검사 포함)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("formData:", formData); // 디버깅 로그 추가

    // 필수 입력값 검사 (특이사항 제외)
    if (
      !formData.franName.trim() ||
      !formData.franAddr.trim() ||
      !formData.franPhone.trim() ||
      !formData.empCode
    ) {
      console.log("필수 입력값 누락");
      setModalMessage("필수 입력값을 모두 입력해주세요.");
      setLottieAnimation("/animations/alert2.json");
      setIsModalOpen(true);
      return; // API 호출 방지
    }

    // 등록 또는 수정 처리
    const success = existingFran
      ? await updateFran(formData.franCode, formData)
      : await registFran(formData);

    if (success) {
      setModalMessage(existingFran ? "수정 완료!" : "가맹점 등록 성공!");
      setLottieAnimation("/animations/success-check.json");
      setIsModalOpen(true);

      // ⏳ 1초 후에 fetchFrans 실행 및 onConfirm 호출
      setTimeout(async () => {
        const updatedData = await fetchFrans();
        setFranList(updatedData);
        onConfirm();
        setIsModalOpen(false); // 모달 닫기
      }, 2000); // 1초 후 실행 (모달 유지)
    } else {
      setModalMessage("처리 중 오류 발생");
      setLottieAnimation("/animations/alert2.json");
      setIsModalOpen(true);
    }
  };

  // 이미지가 없으면 기본 이미지 사용 (public/images/icons/cafe.png)
  const displayedImage = formData.franImage || "/images/icons/cafe.png";

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {existingFran ? "가맹점 수정" : "신규 점포 등록"}
      </h2>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* 가맹점 명 (수정 시에는 비활성화) */}
        <div className={styles.formGroup}>
          <label>가맹점 명</label>
          <input
            type="text"
            name="franName"
            value={formData.franName}
            onChange={handleChange}
            disabled={!!existingFran}
            placeholder="예: 강남점"
          />
        </div>

        {/* 점장 이름 & 조회 버튼 */}
        <div className={styles.formGroup}>
          <label>점장 이름</label>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="empName"
              value={formData.empName || ""}
              readOnly
              placeholder="점장 이름"
            />
            <button
              type="button"
              className={styles.searchButton}
              onClick={openEmpSearchModal}
            >
              조회
            </button>
          </div>
        </div>

        {/* 가맹점 위치 */}
        <div className={styles.formGroup}>
          <label>가맹점 위치</label>
          <div className={styles.inputContainer}>
            <input
              type="text"
              name="franAddr"
              value={formData.franAddr}
              onChange={handleChange}
              placeholder="예: 서울특별시 강남구 ..."
            />
            <button
              type="button"
              className={styles.addressButton}
              onClick={handleAddressSearch}
            >
              찾기
            </button>
          </div>
        </div>

        {/* 가맹점 대표번호 */}
        <div className={styles.formGroup}>
          <label>가맹점 대표번호</label>
          <input
            type="text"
            name="franPhone"
            value={formData.franPhone}
            onChange={handleChange}
            placeholder="예: 02-1234-5678"
          />
        </div>

        {/* 이미지 업로드 */}
        <div className={styles.formGroup}>
          <label>가맹점 이미지</label>
          <div className={styles.imageContainer}>
            <input
              type="file"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
            <div className={styles.previewContainer}>
              <img
                src={displayedImage}
                alt="미리보기"
                className={styles.previewImage}
              />
            </div>
          </div>
        </div>

        {/* 특이사항 (선택 사항) */}
        <div className={styles.formGroup}>
          <label>특이사항</label>
          <textarea
            name="memo"
            value={formData.memo}
            onChange={handleChange}
            placeholder="매출 상위권, 주차 협소 등"
          />
        </div>

        {/* 버튼 그룹 */}
        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>
            확인
          </button>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            취소
          </button>
        </div>
      </form>

      {/* 직원 조회 모달 */}
      {isEmpModalOpen && (
        <EmpSearchModal
          onClose={closeEmpSearchModal}
          onSelect={handleSelectEmployee}
        />
      )}

      {/* SModal을 통한 알림 표시 */}
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
        <div className={styles.modalContent}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src={lottieAnimation}
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "18px",
            }}
          >
            {modalMessage}
          </p>
        </div>
      </SModal>
    </div>
  );
}

export default FranRegist;
