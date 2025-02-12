import styles from '../itemList/MenuList';
import { useState } from 'react';
import MenuModal from '../page/Menus.module.css';

function MenuList() {

    const [menus, setMenus] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    const openModal = () => {
        setIsOpen(true);
    }
    const closeModal = () => {
        setIsOpen(false);
    }

    return (
        <>
            <div>
                <img
                    src="/images/menu/iceAmericano.jpg"
                    alt="아이스"
                    className={styles.menuIcon}
                    onClick={openModal}

                />
                <h4>메뉴 이름 {menus.nameKo}</h4>
                <p>메뉴 영어이름{menus.nameEn}</p>
                <p>메뉴 설명{setMenus.detail}</p>
            </div>

            {isOpen && <MenuModal onClose={closeModal} />}
        </>
    );
}
export default MenuList;