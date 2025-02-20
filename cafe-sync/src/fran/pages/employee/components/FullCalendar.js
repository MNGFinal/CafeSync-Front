import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import st from "../styles/FullCalendar.module.css";
import ScheduleAdd from "./ScheduleAdd";

const MyCalendar = () => {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const calendarRef = useRef();

  useEffect(() => {
    if (franCode) {
      fetchSchedules();
    }
  }, [franCode]);

  const fetchSchedules = async () => {
    console.log("🔍 조회할 스케줄 franCode:", franCode);
    if (!franCode) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/fran/schedule/${franCode}`
      );

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const data = await response.json();
      console.log("✅ 기본 조회된 스케줄:", data);

      const formattedEvents = data.map((schedule) => ({
        id: schedule.scheduleCode,
        title: `${getScheduleType(schedule.scheduleDivision)} - ${schedule.empName}`,
        date: schedule.scheduleDate,
        emp: schedule.empCode,
        extendedProps: {
          scheduleDivision: schedule.scheduleDivision,
        },
        classNames: [`division-${schedule.scheduleDivision}`],
      }));

      setEvents(formattedEvents);
    } catch (error) {
      console.error("조회 오류!!", error);
    }
  };

  const getScheduleType = (division) => {
    const scheduleTypes = ["", "오픈", "미들", "마감", "휴가"];
    return scheduleTypes[division] || "알 수 없음";
  };

  return (
    <div className={`${st.cal} test-class`}>
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridWeek"
        height="740px"
        locale={"ko"}
        headerToolbar={{
          start: "prev next today",
          center: "title",
          end: "addEventBtn dayGridMonth dayGridWeek",
        }}
        customButtons={{
          addEventBtn: {
            text: "스케줄 등록",
            click: () => setIsModalOpen(true),
          },
        }}
        events={events}
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3,
            eventDisplay: "list-item",
            eventContent: (arg) => {
              console.log("이벤트 ExtendedProps?", arg.event.extendedProps);
              const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
              const titleM = getScheduleType(arg.event.extendedProps.scheduleDivision);
              return (
                <div
                  className="custom-event-month"
                  title={arg.event.extendedProps.description}
                >
                  <span className={divisionClass}>{titleM}</span>
                </div>
              );
            },
          },
          timeGridWeek: {
            dayMaxEventRows: false,
            eventContent: (arg) => {
              const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
              console.log("title?", arg.event.title);
              return (
                <div className="custom-event-week">
                  <span className={divisionClass}>{arg.event.title}</span>
                </div>
              );
            },
          },
        }}
        eventClassNames={(arg) => {
          const division = arg.event.extendedProps.scheduleDivision;
          switch (division) {
            case 1:
              return ["open-event"];
            case 2:
              return ["middle-event"];
            case 3:
              return ["close-event"];
            case 4:
              return ["vacation-event"];
            default:
              return [];
          }
        }}
        dayCellContent={(arg) => `${arg.date.getDate()}`}
      />
      {/* 스케줄 등록 모달 */}
      <ScheduleAdd isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </div>
  );
};

export default MyCalendar;
