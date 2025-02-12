import { useState } from 'react';
import style from '../page/Menus.module.css';

function MenusLayout() {
    const [categoryTab, setCategoryTab] = useState("커피");

    // 4가지 카테고리 메뉴
    const categories = ["커피", "음료", "디저트", "상품"];

    // 카테고리 선택 시 그에 맞는 페이지 호출
    const categoryContents = () => {
        switch (categoryTab) {
            case "커피":
                return <div>커피</div>;
            case "음료":
                return <div>음료</div>;
            case "디저트":
                return <div>디저트</div>;
            case "상품":
                return <div>상품</div>;
            default:
                return <div>커피</div>;
        }
    };

    return (
        <>
            {/* 카테고리 버튼을 클릭했을 때 css 색상이 변경되도록 하는 로직 */}
            <div className={style.menuTabs}>
                {categories.map((category) => (
                    <button
                        key={category}
                        className={categoryTab === category ? style.menuBtnActive : style.menuBtn}
                        onClick={() => setCategoryTab(category)}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <hr className={style.line} />
            {/* 제품 검색창 */}
            <div className={style.menuSearch}>
                <input type="text" placeholder='제품을 검색하세요' />
                <button className={style.menuSearchBtn}>검색</button>
            </div>

            {/* 카테고리에 맞는 콘텐츠 렌더링 */}
            <div className={style.categoryContent}>
                {categoryContents()}
            </div>
        </>
    );

}

export default MenusLayout;
