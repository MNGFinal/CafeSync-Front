import { useState } from "react";
import style from "../styles/Complain.module.css"

const today = new Date();
const getToday = today.toISOString().split("T")[0]
const getOneMonthAgo = () => {
    today.setMonth(today.getMonth() - 1);
    return today.toISOString().split("T")[0];
};

const ComplainList = () => {
    const [prevDate, setPrevDate] = useState(getOneMonthAgo);
    const [nowDate, setNowDate] = useState(getToday);
    // console.log('prevDate', prevDate);
    // console.log('today', today);
    
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
                    <span>조회된 내용 들어갈 영역</span>
                </div>
            </div>
            <div className={style.pagingBox}>
                <span>페이징 들어갈 영역(구현 전)</span>
            </div>
        </>
    )
};

export default ComplainList;