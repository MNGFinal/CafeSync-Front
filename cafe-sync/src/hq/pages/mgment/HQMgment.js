import { useEffect, useState } from "react";
import { fetchFrans, deleteFran } from "../../../apis/mgment/mgmentApi";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./itemList/FranList.module.css";
import FranRegist from "./itemList/FranRegist"; // ✅ 가맹점 등록 컴포넌트 추가



function HQMgment() {

  const [franList, setFranList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);  // ✅ 상세 모달 상태 추가
  const [isRegistModalOpen, setIsRegistModalOpen] = useState(false); // ✅ 등록 모달 상태 추가
  const [selectedFran, setSelectedFran] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // ✅ 폐점 확인 모달 상태 추가



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

  // ✅ 등록 모달 열기
  const openRegistModal = () => {
    setIsRegistModalOpen(true);
  };

  // ✅ 등록 모달 닫기
  const closeRegistModal = () => {
    setIsRegistModalOpen(false);
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
          {/* <Outlet /> */}
        </div>
        {/*************************************************************************/}

        {/********************************* 검색창 *********************************/}
        <div className={styles.searchContainer}>
          <p className={styles.text}>점포 목록</p>
          <input
            type="text"
            placeholder="가맹점을 검색하세요"
            className={styles.searchInput}
          />
          <button
            className={styles.searchButton}
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
            onClick: () => {
              // 수정 기능 구현 (예: 해당 가맹점 수정 페이지로 이동)
              // 예: navigate(`/hq/mgment/edit/${selectedFran.franCode}`);
            },
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
      </Modal>

      {/*************************************************************************/}
      {/******************************* 등록 모달창 *******************************/}

      <Modal isOpen={isRegistModalOpen} onClose={closeRegistModal}>
        <FranRegist onClose={closeRegistModal} />
      </Modal>
      {/*************************************************************************/}

      {/******************************* 폐점 확인 모달 *******************************/}
      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal}>
        <div className={styles.deleteConfirm}>
          <p>{selectedFran?.franName} 가맹점을 정말 폐점하시겠습니까?</p>
        </div>
        <div className={styles.buttonContainer}>
          <button className={modalStyle.deleteButtonS} onClick={handleDeleteFran}>확인</button>
          <button className={modalStyle.cancelButtonS} onClick={closeDeleteModal}>취소</button>
        </div>
      </Modal>
      {/*************************************************************************/}

    </>
  );
}

export default HQMgment;
