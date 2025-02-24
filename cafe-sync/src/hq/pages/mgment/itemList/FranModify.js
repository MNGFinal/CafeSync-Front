import { useState } from "react";
import styles from "./FranModify.module.css"; // ✅ 스타일 파일 추가

function FranModify({ fran, onSave, onCancel }) {  // ✅ 수정 저장 & 취소 함수 props
    const [formData, setFormData] = useState({
        empName: fran.empName || "",
        memo: fran.memo || "",
    });

    // 입력 값 변경 처리
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // 수정 저장 버튼 클릭 시
    const handleSave = () => {
        onSave(formData); // ✅ 수정된 데이터 부모 컴포넌트로 전달
    };

    return (
        <div className={styles.modifyContainer}>
            <h2 className={styles.modifyTitle}>{fran.franName} 정보 수정</h2>

            <div className={styles.formGroup}>
                <label>점장명 :</label>
                <input
                    type="text"
                    name="empName"
                    value={formData.empName}
                    onChange={handleChange}
                    className={styles.inputField}
                />
            </div>

            <div className={styles.formGroup}>
                <label>특이사항 :</label>
                <textarea
                    name="memo"
                    value={formData.memo}
                    onChange={handleChange}
                    className={styles.textAreaField}
                />
            </div>

            <div className={styles.buttonGroup}>
                <button className={styles.saveButton} onClick={handleSave}>저장</button>
                <button className={styles.cancelButton} onClick={onCancel}>취소</button>
            </div>
        </div>
    );
}

export default FranModify;
