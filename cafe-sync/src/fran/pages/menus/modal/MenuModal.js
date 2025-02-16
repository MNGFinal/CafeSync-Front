import { useState } from 'react';
import style from './MenuModal.module.css';


const MenuModal = ({ menu, onClose }) => {

    const [soldOut, setSoldOut] = useState("false"); 

    // Sold Out 버튼을 눌렀을 때 sold아웃 처리
    const onClickHandler = () => {
        setSoldOut(true);
    }

    console.log("메뉴에 뭐가들었니?",menu);
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
                className={style.addCart} type="button"
                onClick={onClickHandler}
                >
                    Sold Out
                </button>
            </div>
        </div>
    );
};

export default MenuModal;
