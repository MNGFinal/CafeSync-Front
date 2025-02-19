import styles from "./Menus.module.css";

function CategoryButtons({ fetchMenus, searchQuery, setSearchQuery, category, setCategory }) {

  const categories = [
    { id: "coffee", name: "커피" },
    { id: "drink", name: "음료" },
    { id: "dessert", name: "디저트" },
    { id: "goods", name: "상품" },
  ];

  // 검색어 입력 필드 변경 핸들러
  const handleInputChange = (e) => {
    console.log(e.target.value)
    setSearchQuery(e.target.value);
  };

  // ✅ Enter 키 입력 시 검색 실행
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchMenus(); // ✅ 검색 실행
    }
  };

  return (
    <div className={styles.categoryContainer}>
      <div className={styles.categorySearchSet}>
        {/* 카테고리 버튼 */}
        <div className={styles.buttonContainer}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryButton} ${category === cat.id ? styles.active : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}



        </div>
        {/* 검색창 */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="제품을 검색하세요"
            className={styles.searchInput}
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className={styles.searchButton}
            onClick={fetchMenus}

          >
            검색
          </button>
        </div>

      </div>
      <hr className={styles.divider} />


    </div>
  );
}

export default CategoryButtons;
