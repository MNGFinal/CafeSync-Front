import { useSelector } from "react-redux";
import ComplainAdd from "./components/ComplainAdd"
import ComplainList from "./components/ComplainList"
import style from "./styles/Complain.module.css"

function Complain() {
  console.log('커밋용')
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  return (
    <>
      <div className="page-header">
        <h3>컴플레인</h3>
      </div>
      <div className={style.defSection}>
        <div className={style.addSection}>
          <ComplainAdd
            franCode={franCode}
          />
        </div>
        <div className={style.listSection}>
          <ComplainList
            franCode={franCode}
          />
        </div>
      </div>
    </>
  );
}

export default Complain;