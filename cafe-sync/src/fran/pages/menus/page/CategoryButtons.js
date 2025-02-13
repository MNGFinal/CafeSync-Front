import { useNavigate, useParams } from "react-router-dom";
import styles from "./Menus.module.css";

function CategoryButtons() {
  const categories = [
    { id: "coffee", name: "커피" },
    { id: "drink", name: "음료" },
    { id: "dessert", name: "디저트" },
    { id: "goods", name: "상품" },
  ];

  const { category } = useParams();
  const navigate = useNavigate();

  return (
    <div className={styles.categoryContainer}>
      <div className={styles.buttonContainer}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.categoryButton} ${
              category === cat.id ? styles.active : ""
            }`}
            onClick={() => navigate(`/fran/menus/${cat.id}`)}
          >
            {cat.name}
          </button>
        ))}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="제품을 검색하세요"
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>검색</button>
        </div>
      </div>
    </div>
  );
}

export default CategoryButtons;
