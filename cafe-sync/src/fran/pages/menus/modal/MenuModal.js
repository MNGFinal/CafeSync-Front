import { useState, useEffect } from "react";
import style from './MenuModal.module.css';

const MenuModal = ({ menu, onClose, toggleSoldOut }) => {
    const [soldOut, setSoldOut] = useState(menu.orderableStatus);

    // Sold Out 버튼을 눌렀을 때 soldOut 처리
    const onClickHandler = () => {
        setSoldOut(!soldOut);
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
                        orderableStatus: !soldOut, // 'soldOut' 상태에 맞게 판매 여부 수정
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

        if (soldOut !== false) { // soldOut 상태가 true로 변경되었을 때만 서버에 요청
            updateMenuSoldOut();
        }
    }, [soldOut]);  // soldOut 상태가 변경될 때마다 실행

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
                    Sold Out
                </button>

            </div>
        </div>
    );
};

export default MenuModal;
