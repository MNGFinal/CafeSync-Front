import { useEffect, useState, useMemo } from "react";
import ReactPaginate from "react-paginate";
import style from "../styles/Complain.module.css";
import Detail from "./ComplainDetail";

const ComplainList = ({ franCode, refresh }) => {
  const today = new Date();
  const getFirstDayOfMonth = () => {
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return `${firstDay.getFullYear()}-${String(
      firstDay.getMonth() + 1
    ).padStart(2, "0")}-${String(firstDay.getDate()).padStart(2, "0")}`;
  };
  const getLastDayOfMonth = () => {
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(lastDay.getDate()).padStart(2, "0")}`;
  };
  const [firstDate, setFirstDate] = useState(getFirstDayOfMonth);
  const [lastDate, setLastDate] = useState(getLastDayOfMonth);
  const [complainList, setComplainList] = useState([]);
  const [selectedComplain, setSelectedComplain] = useState(null);
  const [isBModalOpen, setIsBModalOpen] = useState(false);

  // const [slicedList, setSlicedList] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 9;

  const slicedList = useMemo(() => {
    return complainList.slice(
      currentPage * itemsPerPage,
      (currentPage + 1) * itemsPerPage
    );
  }, [complainList, currentPage]);

  const clickDetailHandler = (complainCode) => {
    const selected = complainList.find(
      (item) => item.complainCode === complainCode
    );
    if (selected) {
      setSelectedComplain(selected);
      setIsBModalOpen(true);
    }
  };

  const fetchComplains = async () => {
    if (!franCode) return;

    try {
      // console.log('컴플레인 조회 시작! :', franCode);
      let token = sessionStorage.getItem("accessToken");
      const responseComplain = await fetch(
        `cafesync-back-production.up.railway.app/api/fran/complain/${franCode}?startDate=${firstDate}&endDate=${lastDate}`,
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
      console.log("complainData", complainData);
      setComplainList(complainData.data);
      setCurrentPage(0);
    } catch (error) {
      console.log("조회 오류!", error);
      setComplainList([]);
    }
  };

  const pageChangeHandler = ({ selected }) => {
    console.log("페이지 변경됨:", selected);
    setCurrentPage(selected);
  };

  useEffect(() => {
    fetchComplains();
  }, [refresh]);

  return (
    <>
      <h1 className={style.comH1}>컴플레인 목록</h1>
      <div className={style.BoxSection}>
        <div className={style.searchBox + " " + style.Box}>
          <div className={style.dateSection}>
            <span className={style.period}>기간</span>
            <input
              type="date"
              value={firstDate}
              onChange={(e) => setFirstDate(e.target.value)}
            />
            <span className={style.waveSpan}> ~ </span>
            <input
              type="date"
              value={lastDate}
              onChange={(e) => setLastDate(e.target.value)}
            />
          </div>
          <div>
            <button className={style.searchBtn} onClick={fetchComplains}>
              조회
            </button>
          </div>
        </div>
        <div className={style.listBox + " " + style.Box}>
          {/* <span>조회된 내용 들어갈 영역</span> */}
          <table className={style.listTable}>
            <tbody>
              {slicedList.length > 0 ? (
                slicedList.map(
                  (
                    {
                      complainCode,
                      complainDate,
                      complainDivision,
                      complainDetail,
                    },
                    index
                  ) => (
                    <tr
                      key={index}
                      // onClick={() => clickDetailHandler({ complainDate, complainDivision, complainDetail })}
                      onClick={() => clickDetailHandler(complainCode)}
                      style={{ cursor: "pointer" }}
                    >
                      <td>
                        {(() => {
                          const dateTime = new Date(
                            complainDate
                          ).toLocaleString({
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          });
                          return dateTime.split(":").slice(0, 2).join(":");
                        })()}
                      </td>
                      <td>
                        {complainDivision === 1
                          ? "서비스"
                          : complainDivision === 2
                          ? "위생"
                          : "기타"}
                      </td>
                      <td>{complainDetail}</td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="3"
                    style={{ textAlign: "center", color: "gray" }}
                  >
                    해당 기간 내에 등록된 컴플레인이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {isBModalOpen && (
            <Detail
              isModalOpen={isBModalOpen}
              setIsModalOpen={setIsBModalOpen}
              complain={selectedComplain}
            />
          )}
        </div>
      </div>
      <div className={style.pagingBox}>
        <ReactPaginate
          previousLabel={"이전"}
          nextLabel={"다음"}
          breakLabel={"..."}
          pageCount={Math.ceil(complainList.length / itemsPerPage)}
          marginPagesDisplayed={2}
          pageRangeDisplayed={3}
          onPageChange={pageChangeHandler}
          containerClassName={style.pagination}
          activeClassName={style.active}
          previousClassName={style.previous}
          nextClassName={style.next}
          disabledClassName={style.disabled}
        />
      </div>
    </>
  );
};

export default ComplainList;
