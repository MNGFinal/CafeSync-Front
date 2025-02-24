import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { fetchFrans } from "../../../apis/mgment/mgmentApi";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./itemList/FranList.module.css";


function HQMgment() {

  const [franList, setFranList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFran, setSelectedFran] = useState(null);
  const navigate = useNavigate();


  // 가맹점 목록 불러오기
  useEffect(() => {

    async function getFrans() {
      const data = await fetchFrans();  // 백엔드 API로부터 가맹점 리스트를 받아오는 함수
      setFranList(data);
    }
    getFrans();
  }, []);

  // 모달 열기
  const openModal = (fran) => {
    setSelectedFran(fran);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setSelectedFran(null);
    setIsModalOpen(false);
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
          onClick={() => navigate("regist")}
        >등록</button>


        <div className={styles.dividerContainer}>
          <hr className={styles.divider} />
          <Outlet />
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
            onClick={() => navigate("/hq/mgment/regist")}
          >
            검색
          </button>
        </div>
        {/*************************************************************************/}



        {/****************************** 가맹점 리스트 ******************************/}
        <div className={styles.gridContainer}>
          {franList.length > 0 ? (
            franList.map((fran) => (
              <div key={fran.franCode} className={styles.storeCard} onClick={() => openModal(fran)}>
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


      {/********************************* 모달창 *********************************/}
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
            onClick: () => {
              // 폐점 기능 구현 (예: 폐점 확인 후 API 호출)
              // 예: handleCloseStore(selectedFran.franCode);
            },
            className: modalStyle.deleteButtonB // 모달 버튼 스타일 적용 (선택 사항)
          },
        ]}
      >
        {selectedFran && (
          <div className={styles.modalContainer}>
            {/* 상단 헤더 영역 */}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{selectedFran.franName} 가맹점 조회</h2>
            </div>

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

    </>
  );
}

export default HQMgment;
