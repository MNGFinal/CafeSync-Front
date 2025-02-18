import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./Menus.module.css";

function CategoryButtons() {
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태
  const categories = [
    { id: "coffee", name: "커피" },
    { id: "drink", name: "음료" },
    { id: "dessert", name: "디저트" },
    { id: "goods", name: "상품" },
  ];

  const { category } = useParams();
  const navigate = useNavigate();

  // 검색어 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // 검색 버튼 클릭 시 필터링
  const onClickHandler = () => {
    if (searchQuery.trim() === "") {
      // 검색어가 비어 있으면 전체 메뉴 리스트를 보여주도록 처리
      navigate(`/fran/menus/${category}`);
    } else {
      navigate(`/fran/menus/${category}?query=${searchQuery}`); // 검색어와 함께 URL로 이동
    }
  };

  console.log('뭐라입력함?', searchQuery);

  return (
    <div className={styles.categoryContainer}>
      {/* 카테고리 버튼 */}
      <div className={styles.buttonContainer}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryButton} ${category === cat.id ? styles.active : ""}`}
            onClick={() => navigate(`/fran/menus/${cat.id}`)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <hr className={styles.divider} />

      {/* 검색창 */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="제품을 검색하세요"
          className={styles.searchInput}
          value={searchQuery}
          onChange={handleInputChange}
        />
        <button
          className={styles.searchButton}
          onClick={onClickHandler}
        >
          검색
        </button>
      </div>
    </div>
  );
}

export default CategoryButtons;
