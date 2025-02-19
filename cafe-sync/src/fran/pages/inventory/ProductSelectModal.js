import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import Modal from "../../../components/Modal";
import styles from "./ProductSelectModal.module.css";
import { getFranInventoryList } from "../../../apis/inventory/inventoryApi";
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ Lottie 추가

function ProductSelectModal({ isOpen, onClose, onSelect }) {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode
  );

  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const observer = useRef();

  // ✅ 무한 스크롤을 위한 마지막 아이템 감지
  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          console.log("🔽 다음 페이지 로드");
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading]
  );

  useEffect(() => {
    if (isOpen && franCode) {
      async function fetchData() {
        setLoading(true);
        const data = await getFranInventoryList(franCode);

        // ✅ `inventory` 객체 내부 데이터만 가져오기
        const mappedData = data.map((item) => ({
          invenCode: item.inventory.invenCode,
          invenName: item.inventory.invenName,
          invenImage: item.inventory.invenImage, // ✅ 이미지 추가
          stockQty: item.stockQty,
        }));

        setProductList((prev) => [...prev, ...mappedData]);
        setLoading(false);
      }
      fetchData();
    }
  }, [isOpen, franCode, page]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h3 className={styles.title}>📦 제품 선택</h3>

      {/* ✅ 테이블 헤더 */}
      <div className={styles.tableHeader}>
        <span className={styles.headerItem}>제품 코드</span>
        <span className={styles.headerItem}>이미지</span>
        <span className={styles.headerItem}>제품명</span>
        <span className={styles.headerItem}>보유 수량</span>
      </div>

      {/* ✅ 제품 리스트 - 무한 스크롤 적용 */}
      <div className={styles.productList}>
        {productList.map((product, index) => (
          <div
            key={product.invenCode}
            ref={index === productList.length - 1 ? lastProductRef : null}
            className={styles.productItem}
            onClick={() => {
              onSelect(product);
              onClose(); // 선택 후 모달 닫기
            }}
          >
            <span className={styles.code}>{product.invenCode}</span>
            <div className={styles.imageContainer}>
              <img
                src={product.invenImage}
                alt={product.invenName}
                className={styles.productImage}
              />
            </div>
            <span className={styles.name}>{product.invenName}</span>
            <span className={styles.stock}>{product.stockQty}개</span>
          </div>
        ))}

        {/* ✅ Lottie 애니메이션으로 로딩 표시 */}
        {loading && (
          <div className={styles.loadingContainer}>
            <Player
              autoplay
              loop
              src="/animations/loading.json" // ✅ Lottie 애니메이션 적용
              style={{ height: "50px", width: "50px" }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ProductSelectModal;
