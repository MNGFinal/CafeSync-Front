import { useNavigate, useParams } from "react-router-dom";
import styles from "./Menus.module.css";

function CategoryButtons({fetchMenus, searchQuery, setSearchQuery}) {
  
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
    console.log(e.target.value)
    setSearchQuery(e.target.value);
  };

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
          onClick={fetchMenus}
        >
          검색
        </button>
      </div>
    </div>
  );
}

export default CategoryButtons;
