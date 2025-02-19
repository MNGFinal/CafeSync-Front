import { useSelector } from "react-redux";
import { useState } from "react";
import Modal from "../../../components/Modal";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./OutRegist.module.css";

function OutRegist({ isOpen, onClose }) {
  const franName = useSelector(
    (state) => state.auth?.user?.franchise?.franName ?? null
  );

  const [selectedFran, setSelectedFran] = useState(""); // ✅ 입고 매장 선택
  const [productList, setProductList] = useState([]); // ✅ 출고 제품 목록

  // ✅ 제품 추가
  const handleAddProduct = () => {
    setProductList([
      ...productList,
      { invenCode: "", invenName: "", stock: 0, quantity: "" },
    ]);
  };

  // ✅ 제품 선택 모달 열기 (추후 구현)
  const handleSelectProduct = (index) => {
    console.log(`제품 선택 모달 열기 (행: ${index})`);
  };

  // ✅ 출고 수량 입력
  const handleQuantityChange = (index, value) => {
    const updatedList = [...productList];
    updatedList[index].quantity = value;
    setProductList(updatedList);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      buttons={[
        {
          text: "등록",
          onClick: () => console.log("출고 등록 실행"),
          className: modalStyle.confirmButtonB,
        },
        {
          text: "취소",
          onClick: onClose,
          className: modalStyle.cancelButtonB,
        },
      ]}
    >
      <div className={styles.container}>
        <h3 className={styles.title}>출고 등록</h3>

        {/* ✅ 출고 매장 & 입고 매장 선택 */}
        <div className={styles.storeSelect}>
          <div className={styles.storeBox}>
            <span className={styles.label}>출고 매장</span>
            <span className={styles.storeName}>{franName}</span>
          </div>
          <span className={styles.arrow}>→</span>
          <div className={styles.storeBox}>
            <span className={styles.label}>입고 매장</span>
            <div className={styles.franSelect}>
              <input
                type="text"
                value={selectedFran}
                readOnly
                placeholder="입고 매장 선택"
              />
              <button
                className={styles.searchButton}
                onClick={() => console.log("입고 매장 검색")}
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        {/* ✅ 출고 제품 목록 */}
        <div className={styles.productTable}>
          <div className={styles.productHeader}>
            <button className={styles.addButton} onClick={handleAddProduct}>
              + 추가
            </button>
            <span>제품 코드</span>
            <span>제품명</span>
            <span>보유 수량</span>
            <span>출고 수량</span>
            <span>삭제</span>
          </div>
          {productList.map((product, index) => (
            <div key={index} className={styles.productRow}>
              <div
                className={styles.productCode}
                onClick={() => handleSelectProduct(index)}
              >
                {product.invenCode || "선택"}
              </div>
              <span>{product.invenName || "-"}</span>
              <span>{product.stock}</span>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) => handleQuantityChange(index, e.target.value)}
              />
              <button
                className={styles.deleteButton}
                onClick={() =>
                  setProductList(productList.filter((_, i) => i !== index))
                }
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

export default OutRegist;
