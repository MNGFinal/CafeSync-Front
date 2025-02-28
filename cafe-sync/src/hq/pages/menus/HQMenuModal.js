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




    return (
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
                <button
                    className={style.modifyButton}
                    type="button"
                    onClick={openEditModal}
                >
                    수정
                </button>
                <button
                    className={style.deleteButton}
                    type="button"
                >
                    삭제
                </button>
                {/* ✅ 수정 모달 (공통 모달 활용) */}
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

                            {/* ✅ 메뉴 설명 입력 추가 */}
                            <div className={HQModalStyles.formGroup}>
                                <label>메뉴 설명:</label>
                                <textarea
                                    name="menuDetail"
                                    value={editedMenu.menuDetail} // ✅ 메뉴 설명을 입력할 수 있도록 추가!
                                    onChange={handleChange}
                                />
                            </div>
                        </div>


                        {/* ✅ 모달 추가 (애니메이션 포함) */}
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
                                    loop={false} // ✅ 애니메이션 반복 X
                                    keepLastFrame={true} // ✅ 애니메이션이 끝나도 마지막 프레임 유지
                                    src={lottieAnimation} // ✅ 동적으로 변경됨
                                    style={{ height: "100px", width: "100px", margin: "0 auto" }}
                                />
                                <br />
                                <p>{modalMessage}</p>
                            </div>
                        </SModal>


                    </Modal>
                )}

            </div>
        </div>
    );
};

export default HQMenuModal;