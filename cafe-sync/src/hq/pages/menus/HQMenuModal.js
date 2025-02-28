import style from '../../../fran/pages/menus/modal/MenuModal.module.css';

const HQMenuModal = ({ menu, onClose, setSelectedMenu, fetchMenus }) => {


    // Sold Out 버튼을 눌렀을 때 soldOut 처리
    const onClickHandler = async() => {
        
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
                    {!menu.orderableStatus ? "On sale" : "Sold Out"} {/* 버튼 텍스트 변경 */}
                </button>
            </div>
        </div>
    );
};

export default HQMenuModal;