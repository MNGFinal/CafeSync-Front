import { useState, useEffect } from "react";
import { getVendorList } from "../../../apis/slip/slipApi";
import { uploadImageToFirebase } from "../../../firebase/uploadImageToFirebase";
import styles from "./HQVendor.module.css";
import ReactPaginate from "react-paginate";
import { insertVendor, updateVendor } from "../../../apis/inventory/vendorApi"; // updateVendor API 추가

// ✅ 모달 + 로티파일
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";

function HQVendor() {
  // 거래처 목록 관련 상태
  const [vendorList, setVendorList] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openPostcode, setOpenPostcode] = useState(false);

  // 페이징 관련 상태
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 6;
  const offset = currentPage * itemsPerPage;
  const currentPageData = filteredVendors.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(filteredVendors.length / itemsPerPage);

  // 이미지 미리보기 상태
  const [imagePreview, setImagePreview] = useState(null);

  // 신규 등록 폼 상태
  const [isRegistering, setIsRegistering] = useState(false);
  const [newVendor, setNewVendor] = useState({
    venCode: "",
    venName: "",
    businessNum: "",
    venOwner: "",
    venAddr: "",
    venDivision: "",
    venImage: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // 등록/수정 폼 버튼 비활성화 제어
  const [isFormValid, setIsFormValid] = useState(false);

  // 수정 모드 관련 상태
  const [isEditing, setIsEditing] = useState(false);
  const [editVendor, setEditVendor] = useState(null);

  // 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [lottieAnimation, setLottieAnimation] = useState(
    "/animations/warning.json"
  );

  // ✅ 폼 유효성 검사: isEditing 여부에 따라 필수값 체크
  useEffect(() => {
    if (isEditing) {
      // 수정 모드 → editVendor 검사
      const { venOwner, venAddr, venDivision } = editVendor || {};
      // 수정 폼에서 필수 입력: 대표자, 주소, 업체 구분
      if (
        venOwner?.trim() !== "" &&
        venAddr?.trim() !== "" &&
        venDivision?.trim() !== ""
      ) {
        setIsFormValid(true);
      } else {
        setIsFormValid(false);
      }
    } else {
      // 등록 모드 → newVendor 검사
      const { venName, businessNum, venOwner, venAddr, venDivision } =
        newVendor;
      if (
        venName.trim() !== "" &&
        businessNum.trim() !== "" &&
        venOwner.trim() !== "" &&
        venAddr.trim() !== "" &&
        venDivision.trim() !== ""
      ) {
        setIsFormValid(true);
      } else {
        setIsFormValid(false);
      }
    }
  }, [isEditing, newVendor, editVendor]);

  // 주소 검색 팝업 열기
  const openDaumPostcodePopup = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        if (isEditing) {
          setEditVendor((prev) => ({ ...prev, venAddr: data.address }));
        } else {
          setNewVendor((prev) => ({ ...prev, venAddr: data.address }));
        }
      },
    }).open();
  };

  // 초기 데이터 불러오기
  useEffect(() => {
    async function fetchVendors() {
      const data = await getVendorList();
      setVendorList(data.data);
      setFilteredVendors(data.data);
    }
    fetchVendors();
  }, []);

  // 검색 기능
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredVendors(vendorList);
    } else {
      const filtered = vendorList.filter((vendor) =>
        vendor.venName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVendors(filtered);
    }
    setCurrentPage(0);
  }, [searchTerm, vendorList]);

  const handleRowClick = (vendor) => {
    setSelectedVendor(vendor);
  };

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected);
  };

  const formatBusinessNum = (num) => {
    if (!num) return "정보 없음";
    return num.replace(/^(\d{3})(\d{2})(\d{5})$/, "$1-$2-$3");
  };

  // 이미지 업로드 처리 (등록/수정 모두 동일)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewURL = URL.createObjectURL(file);
    setImagePreview(previewURL);
    setImageFile(file);
    setIsUploading(true);

    try {
      const imageUrl = await uploadImageToFirebase(file);
      if (isEditing) {
        setEditVendor((prev) => ({ ...prev, venImage: imageUrl }));
        setSelectedVendor((prev) => ({ ...prev, venImage: imageUrl })); // 즉시 UI 반영
      } else {
        setNewVendor((prev) => ({ ...prev, venImage: imageUrl }));
      }
    } catch (error) {
      console.error("이미지 업로드 오류:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // 신규 등록 버튼 클릭 시 (신규 등록 폼 초기화 및 코드 자동 생성)
  const handleRegisterClick = async () => {
    setIsRegistering(true);
    setSelectedVendor(null);
    setIsEditing(false);
    try {
      const data = await getVendorList();
      const vendors = data.data;
      const maxCode =
        vendors.length > 0 ? Math.max(...vendors.map((v) => v.venCode)) : 0;
      const newCode = maxCode + 1;
      setNewVendor({
        venCode: newCode.toString(),
        venName: "",
        businessNum: "",
        venOwner: "",
        venAddr: "",
        venDivision: "",
        venImage: "",
      });
    } catch (error) {
      console.error("거래처 코드 자동 생성 중 오류 발생:", error);
    }
  };

  // 수정 버튼 클릭 시, 수정 모드 전환 (선택한 업체 데이터를 복사)
  const handleEditClick = () => {
    setIsEditing(true);
    setEditVendor({ ...selectedVendor });
  };

  // 입력 필드 변경 처리 (등록/수정 공통)
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "businessNum") {
      const numericValue = value.replace(/[^0-9]/g, "");
      if (numericValue.length > 10) return;
      if (isEditing) {
        setEditVendor((prev) => ({ ...prev, [name]: numericValue }));
      } else {
        setNewVendor((prev) => ({ ...prev, [name]: numericValue }));
      }
    } else {
      if (isEditing) {
        setEditVendor((prev) => ({ ...prev, [name]: value }));
      } else {
        setNewVendor((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  // 신규 등록 제출
  const handleRegisterSubmit = async () => {
    try {
      // 필수 입력값 누락 체크 (추가로 isFormValid로도 막지만, 혹시나 강제로 누를 경우 대비)
      if (
        !newVendor.venName.trim() ||
        !newVendor.businessNum.trim() ||
        !newVendor.venOwner.trim() ||
        !newVendor.venAddr.trim() ||
        !newVendor.venDivision.trim()
      ) {
        setModalMessage("필수값을 모두 입력해주세요.");
        setLottieAnimation("/animations/warning.json");
        setIsModalOpen(true);
        return;
      }

      let imageUrl = newVendor.venImage;
      if (imageFile) {
        imageUrl = await uploadImageToFirebase(imageFile);
      }
      const newVendorData = { ...newVendor, venImage: imageUrl };

      const response = await insertVendor(newVendorData);
      if (response.success) {
        setModalMessage("✅ 거래처 등록이 완료되었습니다!");
        setLottieAnimation("/animations/success-check.json");
        setIsModalOpen(true);

        const updatedVendors = await getVendorList();
        setVendorList(updatedVendors.data);
        setFilteredVendors(updatedVendors.data);

        // 폼 초기화
        setIsRegistering(false);
        setNewVendor({
          venCode: "",
          venName: "",
          businessNum: "",
          venOwner: "",
          venAddr: "",
          venDivision: "",
          venImage: "",
        });
        setImageFile(null);
        setImagePreview(null);
      } else {
        setModalMessage(`❌ 거래처 등록 실패: ${response.message}`);
        setLottieAnimation("/animations/warning.json");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("거래처 등록 중 오류 발생:", error);
      setModalMessage(
        "❌ 거래처 등록 중 오류가 발생했습니다. 다시 시도해주세요."
      );
      setLottieAnimation("/animations/warning.json");
      setIsModalOpen(true);
    }
  };

  // 수정 제출 처리 (필수값 누락 시 모달 + 성공 시 모달)
  const handleEditSubmit = async () => {
    try {
      // 수정 폼 필수값 (대표자, 주소, 업체 구분)
      if (
        !editVendor.venOwner.trim() ||
        !editVendor.venAddr.trim() ||
        !editVendor.venDivision.trim()
      ) {
        setModalMessage("필수값을 모두 입력해주세요.");
        setLottieAnimation("/animations/warning.json");
        setIsModalOpen(true);
        return; // 진행 중단
      }

      const response = await updateVendor(editVendor);
      if (response.success) {
        // ✅ 수정 성공 시 성공 모달
        setModalMessage("✅ 업체 정보 수정이 완료되었습니다!");
        setLottieAnimation("/animations/success-check.json");
        setIsModalOpen(true);

        const updatedVendors = await getVendorList();
        setVendorList(updatedVendors.data);
        setFilteredVendors(updatedVendors.data);

        setIsEditing(false);
        setEditVendor(null);
      } else {
        // 실패 시 경고 모달
        setModalMessage(`❌ 업체 수정 실패: ${response.message}`);
        setLottieAnimation("/animations/warning.json");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("업체 수정 중 오류 발생:", error);
      setModalMessage(
        "❌ 업체 수정 중 오류가 발생했습니다. 다시 시도해주세요."
      );
      setLottieAnimation("/animations/warning.json");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="page-header">
        <h3>공급업체 관리</h3>
      </div>

      <div className={styles.defSection}>
        <div className={styles.addSection}>
          <div className={styles.searchBox}>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="거래처 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className={styles.greenBtn} onClick={handleRegisterClick}>
              업체 등록하기
            </button>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.vendorTable}>
              <thead>
                <tr>
                  <th>로고</th>
                  <th>거래처명</th>
                  <th>사업자 번호</th>
                  <th>대표자</th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.length > 0 ? (
                  currentPageData.map((vendor) => (
                    <tr
                      key={vendor.venCode}
                      onClick={() => setSelectedVendor(vendor)}
                      className={styles.clickableRow}
                    >
                      <td>
                        <img
                          src={vendor.venImage}
                          alt="거래처 로고"
                          className={styles.vendorLogo}
                        />
                      </td>
                      <td>{vendor.venName}</td>
                      <td>{formatBusinessNum(vendor.businessNum)}</td>
                      <td>{vendor.venOwner}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      style={{ textAlign: "center", padding: "10px" }}
                    >
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <ReactPaginate
            previousLabel={"이전"}
            nextLabel={"다음"}
            breakLabel={"..."}
            pageCount={pageCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
            containerClassName={styles.paginationContainer}
            activeClassName={styles.activePage}
            disabledClassName={styles.disabled}
            pageRangeDisplayed={10}
          />
        </div>

        <div className={styles.listSection}>
          {isRegistering && !isEditing ? (
            // ✅ 신규 등록 폼
            <table className={styles.vendorDetailTable}>
              <thead>
                <tr>
                  <th colSpan="2">거래처 등록</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">
                    {imagePreview && (
                      <div className={styles.previewContainer}>
                        <p>로고 이미지 미리보기</p>
                        <img
                          src={imagePreview}
                          alt="미리보기"
                          className={styles.previewImage}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className={styles.uploadFile}
                    />
                    {isUploading && <p>이미지 업로드 중...</p>}
                  </td>
                </tr>
                <tr>
                  <th>거래처 코드</th>
                  <td>
                    <input
                      type="text"
                      name="venCode"
                      value={newVendor.venCode}
                      className={styles.inputField}
                      readOnly
                    />
                  </td>
                </tr>
                <tr>
                  <th>거래처명</th>
                  <td>
                    <input
                      type="text"
                      name="venName"
                      placeholder="거래처명 입력"
                      value={newVendor.venName}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </td>
                </tr>
                <tr>
                  <th>사업자 번호</th>
                  <td>
                    <input
                      type="text"
                      name="businessNum"
                      placeholder="숫자만 입력 (10자리)"
                      value={newVendor.businessNum}
                      onChange={handleInputChange}
                      className={styles.inputField}
                      maxLength={10}
                    />
                  </td>
                </tr>
                <tr>
                  <th>대표자</th>
                  <td>
                    <input
                      type="text"
                      name="venOwner"
                      placeholder="대표자 입력"
                      value={newVendor.venOwner}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체 주소</th>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        name="venAddr"
                        placeholder="업체 주소 입력"
                        value={newVendor.venAddr}
                        onChange={handleInputChange}
                        className={styles.inputField}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className={styles.greenBtn}
                        onClick={openDaumPostcodePopup}
                      >
                        주소찾기
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>업체 구분</th>
                  <td>
                    <select
                      name="venDivision"
                      value={newVendor.venDivision}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    >
                      <option>구분을 선택해주세요</option>
                      <option value="일반">일반</option>
                      <option value="도매">도매</option>
                      <option value="금융">금융</option>
                      <option value="카드">카드</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    <button
                      className={styles.greenBtn}
                      onClick={handleRegisterSubmit}
                      disabled={!isFormValid} // 필수값 없으면 비활성
                      style={{
                        backgroundColor: isFormValid ? "#28a745" : "#ccc",
                        cursor: isFormValid ? "pointer" : "not-allowed",
                      }}
                    >
                      등록 완료
                    </button>
                    <button
                      className={styles.redBtn}
                      onClick={() => setIsRegistering(false)}
                    >
                      취소
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : isEditing ? (
            // ✅ 수정 폼
            <table className={styles.vendorDetailTable}>
              <thead>
                <tr>
                  <th colSpan="2">업체 정보 수정</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">
                    {editVendor?.venImage && (
                      <div className={styles.previewContainer}>
                        <p>현재 로고 이미지 미리보기</p>
                        <img
                          src={editVendor.venImage}
                          alt="미리보기"
                          className={styles.previewImage}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleImageUpload}
                      className={styles.uploadFile}
                    />
                    {isUploading && <p>이미지 업로드 중...</p>}
                  </td>
                </tr>
                <tr>
                  <th>거래처 코드</th>
                  <td>
                    <input
                      type="text"
                      name="venCode"
                      value={editVendor?.venCode}
                      className={styles.inputField}
                      readOnly
                    />
                  </td>
                </tr>
                <tr>
                  <th>대표자</th>
                  <td>
                    <input
                      type="text"
                      name="venOwner"
                      value={editVendor?.venOwner || ""}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    />
                  </td>
                </tr>
                <tr>
                  <th>업체 주소</th>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input
                        type="text"
                        name="venAddr"
                        value={editVendor?.venAddr || ""}
                        onChange={handleInputChange}
                        className={styles.inputField}
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className={styles.greenBtn}
                        onClick={openDaumPostcodePopup}
                      >
                        주소찾기
                      </button>
                    </div>
                  </td>
                </tr>
                <tr>
                  <th>업체 구분</th>
                  <td>
                    <select
                      name="venDivision"
                      value={editVendor?.venDivision || ""}
                      onChange={handleInputChange}
                      className={styles.inputField}
                    >
                      <option>구분을 선택해주세요</option>
                      <option value="일반">일반</option>
                      <option value="도매">도매</option>
                      <option value="금융">금융</option>
                      <option value="카드">카드</option>
                    </select>
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    <button
                      className={styles.greenBtn}
                      onClick={handleEditSubmit}
                      disabled={!isFormValid} // 필수값 없으면 비활성
                      style={{
                        backgroundColor: isFormValid ? "#28a745" : "#ccc",
                        cursor: isFormValid ? "pointer" : "not-allowed",
                      }}
                    >
                      수정 완료
                    </button>
                    <button
                      className={styles.redBtn}
                      onClick={() => {
                        setIsEditing(false);
                        setEditVendor(null);
                      }}
                    >
                      취소
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : selectedVendor ? (
            // ✅ 상세 조회 화면
            <table className={styles.vendorDetailTable}>
              <thead>
                <tr>
                  <th colSpan="2">{selectedVendor.venName}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="2">
                    <img
                      src={selectedVendor.venImage}
                      alt="거래처 이미지"
                      className={styles.vendorDetailImage}
                    />
                  </td>
                </tr>
                <tr>
                  <th>거래처 코드</th>
                  <td>{selectedVendor.venCode}</td>
                </tr>
                <tr>
                  <th>사업자 번호</th>
                  <td>{formatBusinessNum(selectedVendor.businessNum)}</td>
                </tr>
                <tr>
                  <th>대표자</th>
                  <td>{selectedVendor.venOwner}</td>
                </tr>
                <tr>
                  <th>업체 주소</th>
                  <td>{selectedVendor.venAddr || "정보 없음"}</td>
                </tr>
                <tr>
                  <th>업체 구분</th>
                  <td>{selectedVendor.venDivision || "정보 없음"}</td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    <button
                      className={styles.greenBtn}
                      onClick={handleEditClick}
                    >
                      수정
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div className={styles.noData}>
              <img src="/images/icons/document.png" alt="문서" />
              <p className={styles.noSelection}>
                거래처를 선택하거나 등록하세요.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 모달 영역 */}
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
    </>
  );
}

export default HQVendor;
