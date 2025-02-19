import { useSelector } from "react-redux";
import { useState } from "react";
import Modal from "../../../components/Modal";
import SModal from "../../../components/SModal";
import { Player } from "@lottiefiles/react-lottie-player";
import modalStyle from "../../../components/ModalButton.module.css";
import styles from "./OutRegist.module.css";
import FranchiseModal from "../../../home/modal/FranchiseModal";
import ProductSelectModal from "./ProductSelectModal";
import { insertOutRegister } from "../../../apis/inventory/inventoryApi";

function OutRegist({ isOpen, onClose, onRegisterSuccess }) {
  const franName = useSelector(
    (state) => state.auth?.user?.franchise?.franName ?? null
  );

  const loggedInFranCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode
  );

  const [selectedFran, setSelectedFran] = useState("");
  const [selectedFranCode, setSelectedFranCode] = useState("");
  const [productList, setProductList] = useState([]);
  const [isFranModalOpen, setIsFranModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  // ✅ 성공 모달 상태 추가
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // ✅ 경고 모달 상태
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");

  // ✅ 가맹점 선택 핸들러
  const handleFranSelect = (fran) => {
    if (fran.franName === franName) {
      setWarningMessage("동일한 매장은 선택하실 수 없습니다.");
      setIsWarningModalOpen(true);
    } else {
      setSelectedFran(fran.franName);
      setSelectedFranCode(fran.franCode);
      setIsFranModalOpen(false);
    }
  };

  // ✅ 제품 추가 핸들러
  const handleAddProduct = () => {
    setProductList([
      ...productList,
      { invenCode: "", invenName: "", stock: 0, quantity: "" },
    ]);
  };

  // ✅ 제품 삭제 핸들러
  const handleRemoveProduct = (index) => {
    setProductList(productList.filter((_, i) => i !== index));
  };

  // ✅ 제품 선택 시 중복 체크 후 productList 업데이트
  const handleProductSelect = (selectedProduct) => {
    const isDuplicate = productList.some(
      (product, index) =>
        product.invenCode === selectedProduct.invenCode &&
        index !== selectedRowIndex
    );

    if (isDuplicate) {
      setWarningMessage("동일한 제품은 선택하실 수 없습니다.");
      setIsWarningModalOpen(true);
      // 해당 행을 초기화
      setProductList((prevList) =>
        prevList.map((product, index) =>
          index === selectedRowIndex
            ? { invenCode: "", invenName: "", stock: 0, quantity: "" }
            : product
        )
      );
    } else {
      setProductList((prevList) =>
        prevList.map((product, index) =>
          index === selectedRowIndex
            ? {
                ...product,
                invenCode: selectedProduct.invenCode,
                invenName: selectedProduct.invenName,
                stock: selectedProduct.stockQty,
              }
            : product
        )
      );
    }
    setIsProductModalOpen(false);
  };

  // ✅ 유효성 검사 함수
  const isFormValid = () => {
    console.log("🔍 selectedFranCode:", selectedFranCode);
    console.log("🔍 productList:", productList);

    const isValid =
      selectedFranCode && // 입고 매장이 선택되었는지 확인
      productList.length > 0 &&
      productList.every((product, index) => {
        console.log(`📌 제품 ${index + 1} 검증:`, product);
        return (
          product.invenCode && product.invenName && Number(product.quantity) > 0 // 🔄 출고 수량이 0보다 커야 함
        );
      });

    console.log("✅ 최종 유효성 검사 결과:", isValid);
    return isValid;
  };

  // ✅ 등록 버튼 클릭 시 실행되는 함수
  const handleRegister = async () => {
    if (!isFormValid()) {
      setWarningMessage("모든 필드값을 입력해주세요.");
      setIsWarningModalOpen(true);
      return;
    }

    const outRegisterData = [
      {
        inoutDate: new Date().toISOString(),
        franOutCode: { franCode: loggedInFranCode },
        franInCode: { franCode: selectedFranCode },
        inventoryList: productList.map((product) => ({
          invenCode: product.invenCode,
          quantity: product.quantity,
        })),
      },
    ];

    console.log(
      "📤 API 요청 데이터:",
      JSON.stringify(outRegisterData, null, 2)
    );

    const result = await insertOutRegister(outRegisterData);

    if (result.success) {
      console.log("✅ 출고 등록 성공:", result.data);

      // ✅ 먼저 성공 모달을 띄우기
      setIsSuccessModalOpen(true);

      // ✅ 1초 후 모달을 닫고 리스트 갱신
      setTimeout(() => {
        setIsSuccessModalOpen(false);
        onRegisterSuccess(); // 🔥 리스트 갱신 실행
        onClose(); // 🔥 출고 등록 모달 닫기
      }, 1000);
    } else {
      setWarningMessage(result.error || "출고 등록에 실패했습니다.");
      setIsWarningModalOpen(true);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      buttons={[
        {
          text: "등록",
          onClick: handleRegister, // ✅ API 호출 추가
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
                onClick={() => setIsFranModalOpen(true)}
              >
                🔍
              </button>
            </div>
          </div>
        </div>

        {/* ✅ 제품 추가 버튼 */}
        <button className={styles.addButton} onClick={handleAddProduct}>
          + 제품 추가
        </button>

        {/* ✅ 테이블 스크롤 컨테이너 추가 */}
        <div className={styles.productTableContainer}>
          <table className={styles.productTable}>
            <thead>
              <tr>
                <th>제품 코드</th>
                <th>제품명</th>
                <th>보유 수량</th>
                <th>출고 수량</th>
                <th>삭제</th>
              </tr>
            </thead>
            <tbody>
              {productList.map((product, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={product.invenCode}
                      readOnly
                      placeholder="여기를 클릭"
                      onClick={() => {
                        setSelectedRowIndex(index);
                        setIsProductModalOpen(true);
                      }}
                      className={styles.productCode}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={product.invenName}
                      placeholder="제품명"
                      readOnly
                    />
                  </td>
                  <td>
                    <input type="number" value={product.stock} readOnly />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity}
                      placeholder="수량"
                      onChange={(e) => {
                        const updatedValue = e.target.value
                          ? Number(e.target.value)
                          : ""; // 🔄 숫자로 변환
                        setProductList((prevList) =>
                          prevList.map((p, i) =>
                            i === index ? { ...p, quantity: updatedValue } : p
                          )
                        );
                      }}
                    />
                  </td>

                  <td>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleRemoveProduct(index)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SModal
        isOpen={isSuccessModalOpen}
        onClose={() => {
          setIsSuccessModalOpen(false);
          onClose(); // ✅ 출고 등록 모달 닫기
        }}
        buttons={[
          {
            text: "확인",
            onClick: () => {
              setIsSuccessModalOpen(false);
              onClose(); // ✅ 출고 등록 모달 닫기
            },
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "10px",
          }}
        >
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src="/animations/success-check.json"
            style={{ height: "80px", width: "80px" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "14px",
            }}
          >
            출고 등록이 완료되었습니다.
          </p>
        </div>
      </SModal>

      {/* ✅ 기존 FranchiseModal 사용 */}
      {isFranModalOpen && (
        <FranchiseModal
          onClose={() => setIsFranModalOpen(false)}
          onSelect={handleFranSelect}
        />
      )}

      {/* ✅ 제품 선택 모달 추가 */}
      {isProductModalOpen && (
        <ProductSelectModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSelect={handleProductSelect}
        />
      )}

      {/* ✅ 동일한 제품 선택 경고 모달 및 등록 시 데이터 없다면 경고 모달*/}
      <SModal
        isOpen={isWarningModalOpen}
        onClose={() => setIsWarningModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsWarningModalOpen(false),
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "10px",
          }}
        >
          <Player
            autoplay
            loop={false}
            keepLastFrame={true}
            src="/animations/warning.json"
            style={{ height: "80px", width: "80px" }}
          />
          <p
            style={{
              fontSize: "16px",
              fontWeight: "bold",
              textAlign: "center",
              paddingTop: "14px",
            }}
          >
            {warningMessage}
          </p>
        </div>
      </SModal>
    </Modal>
  );
}

export default OutRegist;
