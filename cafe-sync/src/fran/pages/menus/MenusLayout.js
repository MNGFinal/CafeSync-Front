import style from './Menus.module.css';

function MenusLayout() {


    return (
        <>
            <div className={style.menuTabs}>
                <h4 className={style.menuBtnActive}>커피</h4>
                <h4 className={style.menuBtn}>음료</h4>
                <h4 className={style.menuBtn}>디저트</h4>
                <h4 className={style.menuBtn}>상품</h4>
            </div>
            <hr className={style.line}/>
            <div className={style.menuSearch}>
                <input type="text" placeholder='제품을 검색하세요' />
                <button className={style.menuSearchBtn}>검색</button>
            </div>

        </>
    );
}

export default MenusLayout;


