import style from '../../../fran/pages/menus/modal/MenuModal.module.css';
import modalStyles from '../../../components/Modal.module.css';
import HQModalStyles from './HQMenuModal.module.css';
import Modal from '../../../components/Modal';
import { useState } from 'react';


const HQMenuModal = ({ menu, onClose, setSelectedMenu, fetchMenus }) => {


    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ✅ 수정 모달 상태
    const [editedMenu, setEditedMenu] = useState({ ...menu }); // ✅ 수정 가능한 상태 저장

    // Sold Out 버튼을 눌렀을 때 soldOut 처리
    const onClickHandler = async () => {

        try {
            const response = await fetch(`http://localhost:8080/api/fran/menus/${menu.menuCode}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...menu,
                    orderableStatus: menu.orderableStatus ? false : true, // 'soldOut' 상태에 맞게 판매 여부 수정 (0: sold out, 1: available)
                }),
            });

            if (response.ok) {
                console.log("메뉴 상태가 성공적으로 업데이트되었습니다.");
                setSelectedMenu({
                    ...menu,
                    orderableStatus: menu.orderableStatus ? false : true,
                })
                fetchMenus();
            } else {
                console.error("서버 요청 실패:", response);
            }
        } catch (error) {
            console.error("에러 발생:", error);
        }
    };

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
                fetchMenus(); // ✅ 수정 후 리스트 새로고침
                closeEditModal(); // ✅ 수정 모달 닫기
            } else {
                console.error("❌ 수정 실패");
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
                            { text: "확인", onClick: onModifySubmit },
                            { text: "취소", onClick: closeEditModal, className: "confirmButton" },
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
                    </Modal>
                )}

            </div>
        </div>
    );
};

export default HQMenuModal;