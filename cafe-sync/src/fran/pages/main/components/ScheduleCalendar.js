import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import style from "../../employee/styles/FullCalendar.module.css";

const ScheduleCalendar = () => {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );

  const [schedule, setSchedule] = useState([]);

  const fetchSchedules = async () => {
    if (!franCode) return;

    try {
      let token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `cafesync-back-production.up.railway.app/api/fran/schedule/${franCode}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const data = await response.json();

      const formattedEvents = data.data.map((schedule) => ({
        title: `${getScheduleType(schedule.scheduleDivision)} - ${
          schedule.empName
        }`,
        start: schedule.scheduleDate,
        allDay: true,
        division: schedule.scheduleDivision,
      }));

      setSchedule(formattedEvents);
    } catch (error) {
      console.error("스케줄 불러오기 오류:", error);
    }
  };

  const getScheduleType = (division) => {
    const scheduleTypes = ["", "오픈", "미들", "마감", "휴가"];
    return scheduleTypes[division] || "알 수 없음";
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return (
    <div className="mainPageScheduleSection">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridWeek"
        headerToolbar={false}
        locale={"ko"}
        events={schedule}
        eventOrder="division"
        editable={false}
        selectable={true}
        height="auto"
        contentHeight="auto"
        dayMaxEventRows={10}
        views={{
          dayGridWeek: {
            dayMaxEventRows: 10,
            eventContent: (arg) => {
              const divisionKey = `division-${arg.event.extendedProps?.division}`;
              return (
                <div className={divisionKey}>
                  <span className={style.eventFont}>{arg.event.title}</span>{" "}
                  {/* ✅ CSS 모듈 적용 */}
                </div>
              );
            },
          },
        }}
      />
    </div>
  );
};

export default ScheduleCalendar;
