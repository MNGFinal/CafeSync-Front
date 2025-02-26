import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import st from "../styles/FullCalendar.module.css";
import ScheduleAdd from "./ScheduleAdd";
import ScheduleModify from "./ScheduleModify";

const MyCalendar = () => {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(false);
  // const [selectedEvent, setSelectedEvent] = useState(null);
  const calendarRef = useRef();

  useEffect( () => { fetchSchedules(); }, [] );

  const onScheduleUpdate = (newSchedules) => {
    const formattedNewEvents = newSchedules.map((schedule) => ({
      id: schedule.scheduleCode,
      title: `${getScheduleType(schedule.scheduleDivision)} - ${schedule.empName}`,
      date: schedule.scheduleDate,
      emp: schedule.empCode,
      extendedProps: {
        scheduleDivision: schedule.scheduleDivision,
      },
      classNames: [`division-${schedule.scheduleDivision}`],
    }));
  
    setEvents((prevEvents) => [...prevEvents, ...formattedNewEvents]);
    setUpdateTrigger((prev) => !prev);
  };

  useEffect(() => {
    console.log("📌 새로운 이벤트가 추가됨:", events);
  }, [updateTrigger]);

  const fetchSchedules = async () => {
    // console.log("🔍 조회할 스케줄 franCode:", franCode);
    if (!franCode) return;

    try {
      const response = await fetch(
        `http://localhost:8080/api/fran/schedule/${franCode}`
      );

      if (!response.ok) {
        throw new Error("서버 응답 실패");
      }

      const data = await response.json();
      // console.log("✅ 기본 조회된 스케줄:", data);
      const sortOrder = { 1: 1, 2: 2, 3: 3, 4: 4 };

      const formattedEvents = data.data.map((schedule) => ({
        id: schedule.scheduleCode,
        title: `${getScheduleType(schedule.scheduleDivision)} - ${schedule.empName}`,
        date: schedule.scheduleDate,
        emp: schedule.empCode,
        extendedProps: {
          scheduleDivision: schedule.scheduleDivision,
        },
        classNames: [`division-${schedule.scheduleDivision}`],
      }))
      // .sort((a, b) => sortOrder[a.extendedProps.scheduleDivision] - sortOrder[b.extendedProps.scheduleDivision]);

      setEvents(formattedEvents);
      
    } catch (error) {
      console.error("조회 오류!!", error);
    }
  };

  const getScheduleType = (division) => {
    const scheduleTypes = ["", "오픈", "미들", "마감", "휴가"];
    return scheduleTypes[division] || "알 수 없음";
  };

  // const eventClickHandler = (clickInfo) => {
  //   setSelectedEvent({
  //     id: clickInfo.event.id,
  //     title: clickInfo.event.title,
  //     date: clickInfo.event.date,
  //     emp: clickInfo.event.extendedProps.emp,
  //     scheduleDivision: clickInfo.event.extendedProps.scheduleDivision,
  //   });
  //   setIsModifyModalOpen(true);
  //   console.log('선택한 이벤트', selectedEvent);
  // };

  // const closeModifyModal = () => {
  //   setIsModifyModalOpen(false);
  //   setSelectedEvent(null);
  // }

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
          end: "addEventBtn modifyEventBtn dayGridWeek",
          // dayGridMonth
        }}
        customButtons={{
          addEventBtn: {
            text: "스케줄 등록",
            click: () => setIsModalOpen(true),
          },
          modifyEventBtn: {
            text: "스케줄 수정",
            click: () => setIsModifyModalOpen(true),
          },
        }}
        events={events}
        eventOrder="scheduleDivision"
        // eventClick={eventClickHandler}
        views={{
          // dayGridMonth: {
          //   dayMaxEventRows: 3,
          //   eventDisplay: "list-item",
          //   eventContent: (arg) => {
          //     console.log("이벤트 ExtendedProps?", arg.event.extendedProps);
          //     const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
          //     const titleM = getScheduleType(arg.event.extendedProps.scheduleDivision);
          //     return (
          //       <div
          //         className="custom-event-month"
          //         title={arg.event.extendedProps.description}
          //       >
          //         <span className={divisionClass}>{titleM}</span>
          //       </div>
          //     );
          //   },
          // },
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
      <ScheduleAdd 
        isModalOpen={isModalOpen} 
        setIsModalOpen={setIsModalOpen} 
        franCode={franCode}
        onScheduleUpdate={onScheduleUpdate}
        existingSchedules={events}
      />
      {/* 스케줄 수정 모달 */}
      {isModifyModalOpen && (
        <ScheduleModify 
          isModifyModalOpen={isModifyModalOpen}
          setIsModifyModalOpen={setIsModifyModalOpen}
          franCode={franCode}
          onScheduleUpdate={onScheduleUpdate}
          existingSchedules={events}
        />
      )}
    </div>
  );
};

export default MyCalendar;
