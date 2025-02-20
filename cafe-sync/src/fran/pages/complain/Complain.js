import ComplainAdd from "./components/ComplainAdd"
import ComplainList from "./components/ComplainList"
import style from "./styles/Complain.module.css"

function Complain() {
  return (
    <>
      <div className="page-header">
        <h3>컴플레인</h3>
      </div>
      <div className={style.defSection}>
        <div className={style.addSection}>
          <ComplainAdd/>
        </div>
        <div className={style.listSection}>
          <ComplainList/>
        </div>
      </div>
    </>
  );
}

export default Complain;
