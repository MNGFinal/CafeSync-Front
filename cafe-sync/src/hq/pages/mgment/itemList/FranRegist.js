import { useState } from "react";
import styles from "./FranRegist.module.css"; // 스타일 파일 추가
import { useNavigate } from "react-router-dom";
import { registFran } from "../../../../apis/mgment/mgmentApi";

function FranRegist({ onClose }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        franCode: "",
        franName: "",
        franAddr: "",
        empCode: "",
        franPhone: "",
        franImage: null,
        memo: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        setFormData({ ...formData, franImage: e.target.files[0] });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("등록 요청 데이터:", formData); // ✅ 데이터 확인
        try {
            await registFran(formData); // API 요청
            alert("가맹점 등록 성공!");
            navigate("/hq/mgment"); // 등록 후 목록 페이지로 이동
        } catch (error) {
            console.error("등록 중 오류 발생:", error); // ✅ 에러 확인
            alert("등록 중 오류 발생");
        }
    };

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>신규 점포 등록</h2>
            <form className={styles.form} onSubmit={handleSubmit}>

                {/* ✅ 가맹점 코드 필드 추가 */}
                <div className={styles.formGroup}>
                    <label>가맹점 코드 :</label>
                    <input type="text" name="franCode" value={formData.franCode} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>점포명 :</label>
                    <input type="text" name="franName" value={formData.franName} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>점포 위치 :</label>
                    <input type="text" name="franAddr" value={formData.franAddr} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>사원번호 :</label>
                    <input type="number" name="empCode" value={formData.empCode} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>매장 대표번호 :</label>
                    <input type="text" name="franPhone" value={formData.franPhone} onChange={handleChange} required />
                </div>

                <div className={styles.formGroup}>
                    <label>점포 이미지 :</label>
                    <input type="file" name="franImage" onChange={handleFileChange} />
                </div>

                <div className={styles.formGroup}>
                    <label>특이사항 :</label>
                    <textarea name="memo" value={formData.memo} onChange={handleChange}></textarea>
                </div>

                <div className={styles.buttonGroup}>
                    <button type="submit" className={styles.submitButton}>등록</button>
                    <button type="button" className={styles.cancelButton} onClick={onClose}>취소</button>
                </div>
            </form>
        </div>
    );
}

export default FranRegist;
