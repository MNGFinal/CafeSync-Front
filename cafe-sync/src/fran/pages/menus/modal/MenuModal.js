import { useState, useEffect } from "react";
import style from './MenuModal.module.css';

const MenuModal = ({ menu, onClose, toggleSoldOut }) => {
    const [soldOut, setSoldOut] = useState(menu.orderableStatus === 0); // 'orderableStatus'가 0이면 Sold Out으로 초기화

    // Sold Out 버튼을 눌렀을 때 soldOut 처리
    const onClickHandler = () => {
        const newSoldOutStatus = !soldOut;
        setSoldOut(newSoldOutStatus); // soldOut 상태 변경
        toggleSoldOut(menu.menuCode); // 부모 컴포넌트에 상태 변경 요청
    };

    useEffect(() => {
        const updateMenuSoldOut = async () => {
            try {
                const response = await fetch(`http://localhost:8080/api/fran/menus/${menu.menuCode}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...menu,
                        orderableStatus: soldOut ? 0 : 1, // 'soldOut' 상태에 맞게 판매 여부 수정 (0: sold out, 1: available)
                    }),
                });

                if (response.ok) {
                    console.log("메뉴 상태가 성공적으로 업데이트되었습니다.");
                } else {
                    console.error("서버 요청 실패:", response);
                }
            } catch (error) {
                console.error("에러 발생:", error);
            }
        };

        // 상태 변경 시에만 서버에 요청
        if (menu.orderableStatus !== (soldOut ? 0 : 1)) {
            updateMenuSoldOut();
        }

    }, [soldOut, menu]);  // soldOut 상태가 변경될 때마다 실행

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
                    className={style.addCart}
                    type="button"
                    onClick={onClickHandler}
                >
                    {soldOut ? "On sale" : "Sold Out"} {/* 버튼 텍스트 변경 */}
                </button>
            </div>
        </div>
    );
};

export default MenuModal;
