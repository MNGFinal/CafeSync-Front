import { useParams, useNavigate, Outlet } from 'react-router-dom';
import style from '../page/Menus.module.css';

function MenusLayout() {
  const navigate = useNavigate();
  const { category } = useParams(); // URL에서 카테고리 값 가져오기

  console.log('카테', category)

  // 4가지 카테고리 메뉴 (한글-영어 매핑)
  const categories = [
    { name: "커피", path: "coffee" },
    { name: "음료", path: "drink" },
    { name: "디저트", path: "dessert" },
    { name: "상품", path: "goods" }
  ];

  return (
    <>
      {/* 카테고리 버튼을 클릭하면 URL이 변경되도록 설정 */}
      <div className={style.menuTabs}>
        {categories.map((cat) => (
          <button
            key={cat.path}
            className={category === cat.path ? style.menuBtnActive : style.menuBtn}
            onClick={() => navigate(`/fran/menus/${cat.path}`)} // URL 변경
          >
            {cat.name}
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
        <Outlet />
      </div>
    </>
  );
}

export default MenusLayout;
