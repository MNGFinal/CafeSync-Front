import { useState } from "react";
import styles from "./Slip.module.css";
import { getFranSlipList } from "../../../apis/slip/slipApi";
import { useSelector } from "react-redux";
import SModal from "../../../components/SModal"; // ✅ 모달 추가
import { Player } from "@lottiefiles/react-lottie-player"; // ✅ 애니메이션 추가
import modalStyle from "../../../components/ModalButton.module.css"; // ✅ 모달 스타일

function Slip() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [slipList, setSlipList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // ✅ 모달 상태 추가
  const [modalMessage, setModalMessage] = useState(""); // ✅ 모달 메시지
  const [lottieAnimation, setLottieAnimation] = useState(""); // ✅ 애니메이션
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  // 🔹 날짜 변경 이벤트 핸들러
  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startDate") setStartDate(value);
    if (name === "endDate") setEndDate(value);
  };

  // 🔹 조회 버튼 클릭 시 데이터 불러오기
  const fetchSlips = async () => {
    if (!startDate || !endDate) {
      setLottieAnimation("/animations/warning.json");
      setModalMessage("날짜를 선택해주세요!");
      setIsModalOpen(true);
      return;
    }

    try {
      const data = await getFranSlipList(franCode, startDate, endDate);
      console.log("✅ 응답 데이터:", data); // 🔥 백엔드 응답 확인

      if (!data || data.length === 0) {
        setLottieAnimation("/animations/warning.json");
        setModalMessage("해당 날짜에 대한 데이터가 없습니다!");
        setIsModalOpen(true);
        return;
      }

      setSlipList(data);
    } catch (error) {
      console.error("❌ 데이터 조회 오류:", error);
      setLottieAnimation("/animations/warning.json");
      setModalMessage("데이터 조회 중 오류가 발생했습니다!");
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="page-header">
        <h3>전표 관리</h3>
      </div>

      <div className={styles.searchBox}>
        <div className={styles.textBox}>기간</div>
        <div className={styles.dateInput}>
          <input
            type="date"
            name="startDate"
            value={startDate}
            onChange={handleDateChange}
          />
          ~
          <input
            type="date"
            name="endDate"
            value={endDate}
            onChange={handleDateChange}
          />
        </div>
        <div className={styles.searchBtn}>
          <button onClick={fetchSlips}>조회</button>
        </div>
      </div>

      <div className={styles.boxContainer}>
        <div className={styles.addBtn}>
          <button>행 추가</button>
          <button>저장</button>
          <button>삭제</button>
        </div>
        <div className={styles.billBox}>
          <button>세금 계산서 생성</button>
          <button>손익 계산서 생성</button>
        </div>
      </div>

      {/* 🔹 테이블 추가 */}
      <table className={styles.slipTable}>
        <thead>
          <tr>
            <th>
              <input type="checkbox" />
            </th>
            <th>날짜</th>
            <th>거래처 코드</th>
            <th>거래처명</th>
            <th>구분</th>
            <th>계정과목 코드</th>
            <th>계정과목명</th>
            <th>적요 코드</th>
            <th>적요명</th>
            <th>차변(출금)</th>
            <th>대변(입금)</th>
          </tr>
        </thead>
        <tbody>
          {slipList && slipList.data && slipList.data.length > 0 ? (
            slipList.data.map((slip, index) => (
              <tr key={index}>
                <td>
                  <input type="checkbox" />
                </td>
                <td>{slip.slipDate.split("T")[0]}</td>
                <td>{slip.venCode.venCode}</td>
                <td>{slip.venCode.venName}</td>
                <td>{slip.slipDivision}</td>
                <td>{slip.actCode.actCode}</td>
                <td>{slip.actCode.actName}</td>
                <td>{slip.summaryCode.summaryCode}</td>
                <td>{slip.summaryCode.summaryName}</td>
                <td>{slip.debit ? slip.debit.toLocaleString() : "-"}</td>
                <td>{slip.credit ? slip.credit.toLocaleString() : "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="11" className={styles.noData}>
                <img src="/images/icons/document.png" alt="문서" />
                <h3>데이터가 없습니다.</h3>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ✅ SModal 추가 (애니메이션 포함) */}
      <SModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        buttons={[
          {
            text: "확인",
            onClick: () => setIsModalOpen(false),
            className: modalStyle.confirmButtonS,
          },
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Player
            autoplay
            loop={false}
            keepLastFrame={true} // ✅ 마지막 프레임 유지
            src={lottieAnimation} // ✅ 동적으로 변경됨
            style={{ height: "100px", width: "100px", margin: "0 auto" }}
          />
          <br />
          <p>{modalMessage}</p>
        </div>
      </SModal>
    </>
  );
}

export default Slip;
