import { useEffect, useState } from "react";
import style from "../styles/Complain.module.css"


const ComplainList = ({franCode}) => {
  const today = new Date();
  const getToday = today.toISOString().split("T")[0]
  const getOneMonthAgo = () => {
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split("T")[0];
  };
  const [prevDate, setPrevDate] = useState(getOneMonthAgo);
  const [nowDate, setNowDate] = useState(getToday);
  const [complainList, setComplainList] = useState([]);

  useEffect(() => {
    const fetchComplains = async () => {
      if(!franCode) return;

      try {
        console.log('컴플레인 조회 시작! :', franCode);
        let token = sessionStorage.getItem("accessToken");
        const responseComplain = await fetch(
          `http://localhost:8080/api/fran/complain/${franCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('혹시 찍히나?', responseComplain);

        if (!responseComplain.ok) {
          throw new Error("컴플레인 응답 실패");
        }

        const complainData = await responseComplain.json();
        console.log('complainData',complainData)
        setComplainList(complainData.data);
      } catch (error) {
        console.log('조회 오류!', error);
      }
    };
    
    fetchComplains();
  }, [franCode]);
  
  return(
    <>
      <h1 className={style.comH1}>컴플레인 목록</h1>
      <div className={style.BoxSection}>
        <div className={style.searchBox + " " + style.Box}>
          <div className={style.dateSection}>
            <span className={style.period}>기간</span>
            <input type="date" value={prevDate} onChange={(e) => setPrevDate(e.target.value)} />
            <span className={style.waveSpan}> ~ </span>
            <input type="date" value={nowDate} onChange={(e) => setNowDate(e.target.value)}/>
          </div>
          <div>
            <button className={style.searchBtn}>조회</button>
          </div>
        </div>
        <div className={style.listBox + " " + style.Box}>
          {/* <span>조회된 내용 들어갈 영역</span> */}
          <table className={style.listTable}>
            {complainList.length > 0 ? (
              complainList.map(({complainDate, complainDivision, complainDetail}, index) => (
                <tr key={index}>
                  <td>{new Date(complainDate).toLocaleString()}</td>
                  <td>{complainDivision === 1 ? "서비스" : complainDivision === 2 ? "위생" : "기타"}</td>
                  <td>{complainDetail}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", color: "gray" }}>
                  등록된 컴플레인이 없습니다.
                </td>
              </tr>
            )}
          </table>
        </div>
      </div>
      <div className={style.pagingBox}>
        <span>페이징 들어갈 영역(구현 전)</span>
      </div>
    </>
  )
};

export default ComplainList;