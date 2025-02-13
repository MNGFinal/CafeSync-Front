import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./Menus.module.css";

function MenuList() {
  const { category } = useParams();
  const [list, setList] = useState([]);

  useEffect(() => {
    async function fetchMenus() {
      const categoryMap = {
        coffee: 1,
        drink: 2,
        dessert: 3,
        goods: 4,
      };

      const categoryCode = categoryMap[category];
      if (!categoryCode) return;

      try {
        const response = await fetch(
          `http://localhost:8080/api/fran/menus/${categoryCode}`
        );
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        setList(data);
      } catch (error) {
        console.error("데이터 가져오기 실패:", error);
      }
    }

    fetchMenus();
  }, [category]);

  return (
    <div className={styles.menuGrid}>
      {list.map((menu) => (
        <div key={menu.menuCode} className={styles.menuCard}>
          <div className={styles.imageContainer}>
            <img
              src={menu.menuImage}
              alt={menu.menuNameKo}
              className={styles.menuImage}
            />
          </div>
          <h3 className={styles.menuName}>{menu.menuNameKo}</h3>
          <p className={styles.menuDetail}>{menu.menuDetail}</p>
        </div>
      ))}
    </div>
  );
}

export default MenuList;
