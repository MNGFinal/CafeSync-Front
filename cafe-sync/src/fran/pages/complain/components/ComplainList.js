import { useEffect, useState } from "react";
import style from "../styles/Complain.module.css"
import Modal from "../../../../components/Modal"
import SModal from "../../../../components/SModal"
import modalStyle from "../../../../components/ModalButton.module.css"


const ComplainList = ({franCode, refresh}) => {
  const today = new Date();
  const getFirstDayOfMonth = () => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`;
  };
  const getLastDayOfMonth = () => {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, "0")}-${String(lastDay.getDate()).padStart(2, "0")}`;
  };
  const [firstDate, setFirstDate] = useState(getFirstDayOfMonth);
  const [lastDate, setLastDate] = useState(getLastDayOfMonth);
  const [complainList, setComplainList] = useState([]);
  const [seletedComplain, setSelectedComplain] = useState(null);
  const [isBModalOpen, setIsBModalOpen] = useState(false);

  const clickDetailHandler = (complain) => {
    setSelectedComplain(complain);
    setIsBModalOpen(true);
  }

  const fetchComplains = async () => {
    if(!franCode) return;

    try {
      console.log('컴플레인 조회 시작! :', franCode);
      let token = sessionStorage.getItem("accessToken");
      const responseComplain = await fetch(
        `http://localhost:8080/api/fran/complain/${franCode}?startDate=${firstDate}&endDate=${lastDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!responseComplain.ok) {
        throw new Error("컴플레인 응답 실패");
      }

      const complainData = await responseComplain.json();
      console.log('complainData',complainData)
      setComplainList(complainData.data);
    } catch (error) {
      console.log('조회 오류!', error);
      setComplainList([]);
    }
  };

  useEffect(() => {
    fetchComplains();
  }, [refresh]);
  
  return(
    <>
      <h1 className={style.comH1}>컴플레인 목록</h1>
      <div className={style.BoxSection}>
        <div className={style.searchBox + " " + style.Box}>
          <div className={style.dateSection}>
            <span className={style.period}>기간</span>
            <input type="date" value={firstDate} onChange={(e) => setFirstDate(e.target.value)} />
            <span className={style.waveSpan}> ~ </span>
            <input type="date" value={lastDate} onChange={(e) => setLastDate(e.target.value)}/>
          </div>
          <div>
            <button className={style.searchBtn} onClick={fetchComplains}>조회</button>
          </div>
        </div>
        <div className={style.listBox + " " + style.Box}>
          {/* <span>조회된 내용 들어갈 영역</span> */}
          <table className={style.listTable}>
            <tbody>
            {complainList.length > 0 ? (
              complainList.map(({complainDate, complainDivision, complainDetail}, index) => (
                  <tr 
                    key={index} 
                    onClick={() => clickDetailHandler({ complainDate, complainDivision, complainDetail })} 
                    style={{ cursor: "pointer" }}
                  >
                    <td>
                      {(() => {
                        const dateTime = new Date(complainDate).toLocaleString({
                          year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false
                        });
                        return dateTime.split(":").slice(0, 2).join(":")
                      })()}
                    </td>
                    <td>{complainDivision === 1 ? "서비스" : complainDivision === 2 ? "위생" : "기타"}</td>
                    <td>{complainDetail}</td>
                  </tr>
              ))
            ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center", color: "gray" }}>
                    해당 기간 내에 등록된 컴플레인이 없습니다.
                  </td>
                </tr>
            )}
            </tbody>
          </table>
          {isBModalOpen && (
            <Modal onClose={() => setIsBModalOpen(false)}>
              {/* 여기 이따가 상세 조회로 넘어가도록 만들기 */}
              <h1>일단 뜨긴 뜨니?</h1>
            </Modal>
          )}
        </div>
      </div>
      <div className={style.pagingBox}>
        <span>페이징 들어갈 영역(구현 전)</span>
      </div>
    </>
  )
};

export default ComplainList;