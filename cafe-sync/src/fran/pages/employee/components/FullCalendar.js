import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from "react-redux";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import st from './FullCalendar.module.css'

const MyCalendar = () => {
  const franCode = useSelector(
    (state) => state.auth?.user?.franchise?.franCode ?? null
  );
  const [events, setEvents] = useState([]);
  const calendarRef = useRef();

  // 이벤트가 바뀔 때마다
  useEffect(() => {
    if (franCode) {
      fetchSchedules();
    }
  }, [franCode]);

  // 스케줄 조회 함수
  const fetchSchedules = async () => {
    console.log("🔍 조회할 스케줄 franCode:", franCode);
    if (!franCode) return;

    try {
      const response = await fetch(`http://localhost:8080/api/fran/schedule/${franCode}`);

      if (!response.ok) {throw new Error("서버 응답 실패");}

      const data = await response.json();
      console.log("✅ 기본 조회된 스케줄:", data);

      // FullCalendar 이벤트 형식으로 변환 - 기본
      const formattedEvents = data.map((schedule) => ({
        id: schedule.scheduleCode,
        title: `${getScheduleType(schedule.scheduleDivision)} - ${schedule.empCode}`,
        date: schedule.scheduleDate,
        emp: schedule.empCode,
        extendedProps: {
          scheduleDivision: schedule.scheduleDivision
        },
        classNames: [`division-${schedule.scheduleDivision}`],
      }));
      console.log('조회된 이벤트?', formattedEvents);
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("조회 오류!!", error);
    }
  };

  // 일정 타입 변환 함수
  const getScheduleType = (division) => {
    const scheduleTypes = ["", "오픈", "미들", "마감", "휴가"];
    return scheduleTypes[division] || "알 수 없음";
  };

  return (
    <div className={`${st.cal} test-class`}>            
      <FullCalendar 
        ref={calendarRef} // Ref 연결
        plugins={[ dayGridPlugin, 
          // timeGridPlugin, 
          interactionPlugin ]}
        initialView="dayGridWeek"
        height="740px"
        locale={'ko'}
        headerToolbar={{
          start: "prev next today",
          center: "title",
          end: "addEventBtn dayGridMonth dayGridWeek",
        }}
        customButtons={{
          addEventBtn: {
            text: '스케줄 등록',
            // click: this.addEventHandler,
          },
        }}
        events={events}
        views={{
          dayGridMonth: {   // 월별
            dayMaxEventRows: 3, // 한 날짜 칸에 최대 3개 일정
            eventDisplay: 'list-item',
            eventContent: (arg) => {
              console.log('이벤트 ExtendedProps?', arg.event.extendedProps);
              const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
              
              return (
                <div className="custom-event-month" title={arg.event.extendedProps.description}>
                <span className={divisionClass}>{arg.event.title}</span>
              </div>
              );
            }
          },
          timeGridWeek: {   // 주별
            dayMaxEventRows: false, // 한 날짜 칸에 일정이 여러 개 표시되도록
            eventContent: (arg) => {
              const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
              console.log('title?',arg.event.title);
              return (
                <div className="custom-event-week">
                  <span className={divisionClass}>{arg.event.title}</span>
                </div>
              );
            },
          },
        }}

        // 일정별 스타일 적용
        eventClassNames={(arg) => {
          // scheduleDivision 값에 따라 다른 색상 지정
          const division = arg.event.extendedProps.scheduleDivision;
          switch (division) {
            case 1: return ['open-event'];
            case 2: return ['middle-event'];
            case 3: return ['close-event'];
            case 4: return ['vacation-event'];
            default: return [];
          }
        }}
        dayCellContent={(arg) => {
          // 날짜만 반환하도록 설정
          return `${arg.date.getDate()}`;
        }}
      />
    </div>
  )
}
export default MyCalendar;