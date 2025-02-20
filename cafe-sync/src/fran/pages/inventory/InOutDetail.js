import Modal from "../../../components/Modal";
import styles from "./InOutDetail.module.css";
import modalStyle from "../../../components/ModalButton.module.css";

function InOutDetail({ isOpen, onClose, inoutData }) {
  if (!inoutData) return null; // 데이터가 없으면 아무것도 표시하지 않음

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      buttons={[
        {
          text: "확인",
          onClick: onClose,
          className: modalStyle.confirmButtonS,
        },
      ]}
    >
      <div className={styles.container}>
        <h3 className={styles.title}>입출고 상세</h3>

        {/* ✅ 출고 매장 & 입고 매장 정보 표시 */}
        <div className={styles.storeSelect}>
          <div className={styles.storeBox}>
            <span className={styles.label}>출고 매장</span>
            <span className={styles.storeName}>
              {inoutData.franOutCode?.franName || "-"}
            </span>
          </div>
          <span className={styles.arrow}>→</span>
          <div className={styles.storeBox}>
            <span className={styles.label}>입고 매장</span>
            <span className={styles.storeName}>
              {inoutData.franInCode?.franName || "-"}
            </span>
          </div>
        </div>

        {/* ✅ 제품 리스트 테이블 (보유 수량 제거) */}
        <div className={styles.productTableContainer}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>제품 코드</th>
                <th>제품명</th>
                <th>출고 수량</th>
              </tr>
            </thead>
            <tbody>
              {inoutData.inventoryList?.map((product, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={product.invenCode}
                      readOnly
                      className={styles.productCode}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={product.invenName || "-"}
                      readOnly
                    />
                  </td>
                  <td>
                    <input type="number" value={product.quantity} readOnly />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
}

export default InOutDetail;
