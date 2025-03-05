import { useSelector } from "react-redux";

function HQStats() {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  console.log("로그인된 가맹점코드", franCode)

  return (
    <>
      <div className="page-header">
        <h3>통계</h3>
      </div>
    </>
  );
}

export default HQStats;
