import style from '../../../fran/pages/menus/modal/MenuModal.module.css';
import modalStyle from '../../../components/ModalButton.module.css';
import HQModalStyles from './HQMenuModal.module.css';
import Modal from '../../../components/Modal';
import SModal from '../../../components/SModal';
import { useState } from 'react';
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ Lottie 애니메이션 추가


const HQMenuModal = ({ menu, onClose, setSelectedMenu, fetchMenus }) => {


    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ✅ 수정 모달 상태
    const [editedMenu, setEditedMenu] = useState({ ...menu }); // ✅ 수정 가능한 상태 저장
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lottieAnimation, setLottieAnimation] = useState("");
    const [modalMessage, setModalMessage] = useState("");


    // ✅ 수정 모달 열기
    const openEditModal = () => {
        setIsEditModalOpen(true);
    };

    // ✅ 수정 모달 닫기
    const closeEditModal = () => {
        setIsEditModalOpen(false);
    };

    // ✅ 삭제 확인 모달 열기
    const openDeleteModal = () => {
        setIsDeleteModalOpen(true);
    };

    // ✅ 삭제 확인 모달 닫기
    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
    };


    // ✅ 입력값 변경 핸들러
    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditedMenu((prev) => ({ ...prev, [name]: value }));
    };

    // ✅ 수정 완료 버튼 클릭 시 처리
    const onModifySubmit = async () => {


        try {
            const response = await fetch(`http://localhost:8080/api/hq/menus/${editedMenu.menuCode}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(editedMenu),
            });

            if (response.ok) {
                console.log("✅ 메뉴 수정 성공!");
                setIsModalOpen(true);
                fetchMenus(); // ✅ 수정 후 리스트 새로고침
                onClose(); // ✅ 수정 모달 닫기
            } else {
                console.error("❌ 수정 실패");
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("❌ 서버 오류:", error);

        }
    };


    // ✅ 삭제 실행 함수
    const onDeleteConfirm = async () => {
        try {
            const response = await fetch(`http://localhost:8080/api/hq/menus/${menu.menuCode}`, {
                method: "DELETE",
            });

            if (response.ok) {
                console.log("✅ 메뉴 삭제 성공!");

                // ✅ 성공 애니메이션 및 메시지 설정
                setLottieAnimation("https://assets9.lottiefiles.com/packages/lf20_j9g6fokl.json");
                setModalMessage("메뉴가 삭제되었습니다.");
                setIsModalOpen(true);

                fetchMenus(); // ✅ 삭제 후 리스트 새로고침
                onClose(); // ✅ 상세 모달 닫기
            } else {
                console.error("❌ 삭제 실패");

                // ❌ 실패 애니메이션 및 메시지 설정
                setLottieAnimation("https://assets9.lottiefiles.com/packages/lf20_s5e1qgsy.json");
                setModalMessage("삭제에 실패했습니다.");
                setIsModalOpen(true);
            }
        } catch (error) {
            console.error("❌ 서버 오류:", error);

            // ❌ 서버 오류 메시지 설정
            setLottieAnimation("https://assets9.lottiefiles.com/packages/lf20_s5e1qgsy.json");
            setModalMessage("서버 오류가 발생했습니다.");
            setIsModalOpen(true);
        }
        closeDeleteModal(); // ✅ 삭제 확인 모달 닫기
    };



    return (
        <>
            <div className={style.Overlay} onClick={onClose}>
                <div className={style.cartContainer} onClick={(e) => e.stopPropagation()}>
                    <button className={style.closeButton} onClick={onClose}>✖</button>

                    <span className={style.category}>{menu.category}</span>
                    <hr /><br />
                    <img src={menu.menuImage} alt={menu.menuNameKo} className={style.menuImage} /><br />
                    <br /><br /><br />
                    <span className={style.menuName}>{menu.menuNameKo}</span><br />
                    <span className={style.menuNameEN}>{menu.menuNameEN}</span>
                    <hr />
                    <span className={style.menuDetail}>{menu.menuDetail}</span>
                    <hr />
                    <button className={style.modifyButton} type="button" onClick={openEditModal}>수정</button>
                    <button className={style.deleteButton} type="button" onClick={openDeleteModal}>삭제</button>
                </div>
            </div>

            {/* ✅ 삭제 확인 모달 */}
            {isDeleteModalOpen && (
                <SModal
                    isOpen={true}
                    onClose={closeDeleteModal}
                    buttons={[
                        { text: "확인", onClick: onDeleteConfirm, className: modalStyle.confirmButtonS },
                        { text: "취소", onClick: closeDeleteModal, className: modalStyle.cancelButton },
                    ]}
                >
                    <div style={{ textAlign: "center" }}>
                        <p>정말 삭제하시겠습니까?</p>
                    </div>
                </SModal>
            )}

            {/* ✅ 수정 모달 */}
            {isEditModalOpen && (
                <Modal
                    isOpen={true}
                    onClose={closeEditModal}
                    buttons={[
                        { text: "확인", onClick: onModifySubmit, className: modalStyle.confirmButtonS },
                        { text: "취소", onClick: closeEditModal, className: modalStyle.confirmButtonS },
                    ]}
                >
                    <div className={HQModalStyles.container}>
                        <h3 className={HQModalStyles.title}>메뉴 수정</h3>
                        <div className={HQModalStyles.formGroup}><label>한글 이름:</label>
                            <input type="text" name="menuNameKo" value={editedMenu.menuNameKo} onChange={handleChange} className={HQModalStyles.formGroup} />
                        </div>
                        <div className={HQModalStyles.formGroup}>
                            <label>영어 이름:</label>
                            <input type="text" name="menuNameEN" value={editedMenu.menuNameEN} onChange={handleChange} className={HQModalStyles.formGroup} />
                        </div>
                        <div className={HQModalStyles.formGroup}>
                            <label>이미지 URL:</label>
                            <input type="text" name="menuImage" value={editedMenu.menuImage} onChange={handleChange} className={HQModalStyles.formGroup} />
                        </div>

                        <div className={HQModalStyles.formGroup}>
                            <label>메뉴 설명:</label>
                            <textarea
                                name="menuDetail"
                                value={editedMenu.menuDetail} // ✅ 메뉴 설명을 입력할 수 있도록 추가!
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* ✅ 삭제 완료 / 수정 완료 모달 (중복 제거) */}
            {isModalOpen && (
                <SModal
                    isOpen={true}
                    onClose={() => setIsModalOpen(false)}
                    buttons={[
                        { text: "확인", onClick: () => setIsModalOpen(false), className: modalStyle.confirmButtonS },
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
        </>
    );

};

export default HQMenuModal;