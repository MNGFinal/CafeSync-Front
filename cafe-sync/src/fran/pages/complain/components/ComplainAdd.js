import style from "../styles/Complain.module.css"

const ComplainAdd = () => {
    
    return(
        <>
            <h1 className={style.comH1}>컴플레인 등록</h1>
            <div>
                <table>
                    <tr>
                        <th>컴플레인 접수 일자</th>
                        <td><input type="datetime-local"/></td>
                    </tr>
                    <tr>
                        <th>컴플레인 구분</th>
                        <td>
                            <select>
                                <option>임시 데이터</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th>컴플레인 접수자</th>
                        <td><input type="text"/></td>
                    </tr>
                    <tr>
                        <th>컴플레인 제출자 연락처</th>
                        <td><input type="text"/></td>
                    </tr>
                    <tr>
                        <th>컴플레인 내용</th>
                    </tr>
                </table>
                <textarea/>
            </div>
            <div>
                <span>등록 버튼 영역</span>
            </div>
        </>
    )
};

export default ComplainAdd;