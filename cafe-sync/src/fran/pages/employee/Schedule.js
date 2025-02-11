import MyCalendar from "./FullCalendar";

function Schedule() {
  return (
    <>
      <div className="page-header">
        <h3>스케줄 조회</h3>
      </div>
      <div>
        <MyCalendar/>
      </div>
    </>
  );
}

export default Schedule;
