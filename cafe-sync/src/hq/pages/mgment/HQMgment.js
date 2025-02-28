import { useEffect, useState } from "react";
import { fetchFrans, deleteFran } from "../../../apis/mgment/mgmentApi";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./itemList/FranList.module.css";
import FranRegist from "./itemList/FranRegist"; // ✅ 가맹점 등록 컴포넌트 추가
import SModal from "../../../components/SModal"; // ✅ 이동 후 경로 수정
import { fetchSearchFrans } from "../../../apis/mgment/mgmentApi"; // ✅ API 경로 맞게 확인


function HQMgment() {

  const [franList, setFranList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  // ✅ 상세 모달 상태 추가
  const [isRegistModalOpen, setIsRegistModalOpen] = useState(false); // ✅ 등록 모달 상태 추가
  const [selectedFran, setSelectedFran] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ 폐점 확인 모달 상태 추가
  const [searchTerm, setSearchTerm] = useState(""); // 검색어 상태

  // 가맹점 목록 불러오기
  useEffect(() => {

    async function getFrans() {
      const data = await fetchFrans();  // 백엔드 API로부터 가맹점 리스트를 받아오는 함수
      setFranList(data);
    }
    getFrans();
  }, []);

  // 상세페이지 모달 열기
  const openModal = (fran) => {
    setSelectedFran(fran);
    setIsModalOpen(true);
  };

  // 상세페이지 모달 닫기
  const closeModal = () => {
    setSelectedFran(null);
    setIsModalOpen(false);
  };

  // ✅ 등록 모달 열기 (새로운 가맹점 등록)
  const openRegistModal = () => {
    setSelectedFran(null); // 등록 모드에서는 기존 데이터 없음
    setIsRegistModalOpen(true);
  };

  // ✅ 수정 모달 열기 (기존 가맹점 수정)
  const openModifyModal = () => {
    if (!selectedFran) return;
    setIsRegistModalOpen(true);
  };

  const closeRegistModal = () => {
    console.log("🚀 closeRegistModal 실행됨! (모달 닫기)");
    setIsRegistModalOpen(false);

    setTimeout(() => {
      console.log("✅ isRegistModalOpen 최신 값:", isRegistModalOpen);
      if (isRegistModalOpen) {
        setIsRegistModalOpen(false); // 한번 더 강제 업데이트
      }
    }, 300);
  };


  // ✅ 삭제 확인 모달 열기
  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  // ✅ 삭제 확인 모달 닫기
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  // ✅ 삭제 후 리스트에서 제거하는 함수 추가
  const handleDeleteSuccess = (franCode) => {
    setFranList((prevList) => prevList.filter(fran => fran.franCode !== franCode));
    closeModal();
  };

  // ✅ 삭제 기능 함수
  const handleDeleteFran = async () => {
    if (!selectedFran) return;

    const success = await deleteFran(selectedFran.franCode);
    if (success) {
      // alert("가맹점 삭제 성공!");
      handleDeleteSuccess(selectedFran.franCode); // ✅ 리스트에서 삭제
      closeDeleteModal(); // ✅ 모달 닫기 추가
    } else {
      alert("가맹점 삭제 실패");
    }
  };

  // 검색 함수 (최적화)
  const searchHandler = async () => {
    if (!searchTerm.trim()) {
      // ✅ 검색어가 없을 경우 전체 리스트 불러오기
      const allFrans = await fetchFrans();
      setFranList(allFrans);
      return;
    }

    try {
      const data = await fetchSearchFrans(searchTerm); // ✅ API 호출
      setFranList(data); // ✅ 기존 목록을 검색 결과로 교체
      console.log("검색 결과:", data);
    } catch (error) {
      console.error("검색 중 오류 발생:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  // ✅ Enter 키로도 검색 가능하게 이벤트 추가
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchHandler();
    }
  };




  return (
    <>
      <div className="page-header">
        <h3>가맹점 관리</h3>
      </div>
      <div>
        {/********************************* 등록창 *********************************/}
        <button
          className={styles.registButton}
          onClick={openRegistModal}
        >등록</button>


        <div className={styles.dividerContainer}>
          <hr className={styles.divider} />

        </div>
        {/*************************************************************************/}

        {/********************************* 검색창 *********************************/}
        <div className={styles.searchContainer}>
          <p className={styles.text}>점포 목록</p>
          <input
            type="text"
            placeholder="가맹점을 검색하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown} // ✅ Enter 키 검색 추가
            className={styles.searchInput}
          />
          <button
            className={styles.searchButton}
            onClick={searchHandler}
          >
            검색
          </button>
        </div>
        {/*************************************************************************/}

        {/****************************** 가맹점 리스트 ******************************/}
        <div className={styles.gridContainer}>
          {franList.length > 0 ? (
            franList.map((fran) => (
              <div
                key={fran.franCode}
                className={styles.storeCard}
                onClick={() => openModal(fran)}
              >
                <img className={styles.imagePlaceholder} src={fran.franImage} alt="가맹점 이미지"></img>
                <h3>{fran.franName}</h3>
                <p>{fran.franAddr}</p>
                <br />
                <p className={styles.managerName}>점장 : {fran.empName || "미등록"}</p>
              </div>
            ))
          ) : (
            <p>등록된 가맹점이 없습니다.</p>
          )}
        </div>
        {/*************************************************************************/}
      </div>


      {/******************************* 상세 모달창 *******************************/}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        buttons={[
          {
            text: "수정",
            onClick: openModifyModal, // ✅ 수정 버튼 클릭 시 수정 모달 열기
            className: modalStyle.modifyButtonB // 모달 버튼 스타일 적용 (선택 사항)
          },
          {
            text: "폐점",
            onClick: openDeleteModal, // ✅ 폐점 버튼 클릭 시 삭제 확인 모달 열기
            className: modalStyle.deleteButtonB
          },
        ]}
      >
        {selectedFran && (
          <div className={styles.modalContainer}>
            {/* 상단 헤더 영역 */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedFran.franName} 가맹점 조회</h2>
            </div>

            <hr className={styles.line} />

            {/* 점포 이미지 및 이름, 주소 */}
            <div className={styles.storeTopInfo}>
              <img
                src={selectedFran.franImage || "https://example.com/default-image.jpg"}
                alt={selectedFran.franName}
                className={styles.storeImage}
              />
              <div className={styles.textInfo}>
                <h3 className={styles.storeName}>{selectedFran.franName}</h3>
                <p className={styles.storeAddr}>{selectedFran.franAddr}</p>
              </div>
            </div>
            <hr className={styles.line} />
            {/* 세부 정보 */}
            <div className={styles.detailInfo}>
              <p>
                <strong>점장 :</strong> {selectedFran.empName || "정보 없음"}
              </p>
              <p>
                <strong>매장 대표번호 :</strong> {selectedFran.franPhone}
              </p>
              <p>
                <strong>주소 :</strong> {selectedFran.franAddr}
              </p>
              <p>
                <strong>특이사항 :</strong> {selectedFran.memo}
              </p>
            </div>
          </div>
        )}
        <SModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          buttons={[
            {
              text: "확인",
              onClick: () => handleDeleteFran(false),
              className: modalStyle.confirmButtonS,
            },
            {
              text: "취소",
              onClick: () => closeDeleteModal(false),
              className: modalStyle.cancelButtonS,
            },
          ]}
        >
          <div>
            <p className={styles.deleteFran}>{selectedFran?.franName} 가맹점을 정말 폐점하시겠습니까?</p>
          </div>

        </SModal>
      </Modal>

      {/*************************************************************************/}
      {/******************************* 등록 모달창 *******************************/}

      <Modal isOpen={isRegistModalOpen} onClose={closeRegistModal}>
        <FranRegist
          onClose={closeRegistModal} // 🔥 취소 버튼용 → 수정 모달만 닫음
          onConfirm={() => {  // 🔥 확인 버튼용 → 수정 & 상세 모달 둘 다 닫음
            closeRegistModal();
            closeModal();
          }}
          existingFran={selectedFran}
          setFranList={setFranList}
          fetchFrans={fetchFrans}
        />
      </Modal>

      {/*************************************************************************/}


    </>
  );
}

export default HQMgment;
