import { useSelector } from "react-redux";
import ComplainAdd from "./components/ComplainAdd"
import ComplainList from "./components/ComplainList"
import style from "./styles/Complain.module.css"
import { useState } from "react";

function Complain() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [refresh, setRefresh] = useState(false);
  const refreshHandler = () => setRefresh((prev) => !prev);

  return (
    <>
      <div className="page-header">
        <h3>컴플레인</h3>
      </div>
      <div className={style.defSection}>
        <div className={style.addSection}>
          <ComplainAdd
            franCode={franCode}
            onComplainUpdate = {refreshHandler}
          />
        </div>
        <div className={style.listSection}>
          <ComplainList
            franCode={franCode}
            refresh = {refresh}
          />
        </div>
      </div>
    </>
  );
}

export default Complain;