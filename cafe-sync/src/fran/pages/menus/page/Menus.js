import { useParams, useNavigate, Outlet } from 'react-router-dom';
import style from '../page/Menus.module.css';
import { useState, useEffect } from "react";

function MenusLayout() {
  const navigate = useNavigate();
  const { category } = useParams(); // URL에서 카테고리 값 가져오기
  const [list, setList] = useState([]);

  // category 문자열을 categoryCode 숫자로 변환하는 매핑 테이블
  const categoryMap = {
    coffee: 1,
    drink: 2,
    dessert: 3,
    goods: 4
  };

  useEffect(() => {
    async function fetchMenus() {
      console.log("category:", category); // category 값 확인
      const categoryCode = categoryMap[category];
      if (!categoryCode) return; // 잘못된 category면 요청 안 함

      try {
        const response = await fetch(`http://localhost:8080/api/fran/menus/${categoryCode}`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json(); // 바로 JSON으로 파싱
        setList(data); // 메뉴 리스트 업데이트
        console.log("백에서 가져온 데이터:", data);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
        setList([]); // 오류 시 빈 배열 설정
      }
    }

    fetchMenus();
  }, [category]); // category가 바뀔 때마다 실행


  console.log('카테고리:', category);

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
