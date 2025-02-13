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
  const [eventMap, setEventMap] = useState(new Map());
  const eventMapRef = useRef(new Map());
  const calendarRef = useRef();

  // franCcode가 변경될 때마다 스케줄 조회? 이건 나중에 확인
  useEffect(() => {
    if (franCode) {
      fetchSchedules();
    }
  }, [franCode]);

  // 이벤트를 날짜 + division 기준으로 필터링하는 Map 만들기
  const preprocessEvent = (eventsDate) => {
    const map = new Map();

    eventsDate.forEach((event) => {
      const date = event.date;
      console.log('date?', date);
      const division = event.extendedProps?.scheduleDivision?.toString() || "";
      console.log('division?', division);

      if (!map.has(date)) {
        map.set(date, new Set());   // division을 저장할 Set 생성
      }
      map.get(date).add(division);
    });
    
    console.log("이벤트 맵 생성:", map);
    return map;
  }

  // 스케줄 조회 함수
  const fetchSchedules = async () => {
    console.log("🔍 조회할 스케줄 franCode:", franCode);

    try {
      const response = await fetch(`http://localhost:8080/api/fran/schedule/${franCode}`);

      if (!response.ok) {
        throw new Error("서버 응답 실패ㅠㅠ!!!");
      }

      const data = await response.json();
      console.log("✅ 조회된 스케줄:", data);

      // FullCalendar 이벤트 형식으로 변환
      const formattedEvents = data.map((schedule) => ({
        id: schedule.scheduleCode,
        title: getScheduleType(schedule.scheduleDivision),
        date: schedule.scheduleDate,
        emp: schedule.empCode,
        extendedProps: {
          scheduleDivision: schedule.scheduleDivision
        }
        // classNames: [`division-${schedule.scheduleDivision}`],
        // description: getDescription(schedule), // 일정을 좀 더 설명하는 필드 (오픈, 미들, 마감, 휴가)
      }));
      console.log('조회된 이벤트?', formattedEvents);

      setEvents(formattedEvents);
      eventMapRef.current = preprocessEvent(formattedEvents);    // 이벤트 맵 ref로 관리
    } catch (error) {
      console.error("조회 오류!!", error);
    }
  };

  // 일정 타입 변환 함수
  const getScheduleType = (division) => {
    const scheduleTypes = ["", "오픈", "미들", "마감", "휴가"];
    return scheduleTypes[division] || "알 수 없음";
  };

  // 일정을 설명하는 텍스트
  // const getDescription = (schedule) => {
  //   return `${getScheduleType(schedule.scheduleDivision)}-${schedule.empCode}`;
  // };

  return (
    <div className={`${st.cal} test-class`}>            
      <FullCalendar 
        ref={calendarRef} // Ref 연결
        plugins={[ dayGridPlugin, 
          // timeGridPlugin,          // 잠깐 주석처리!!!
          interactionPlugin ]}
        initialView="dayGridWeek"
        height="800px"
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
        events={events}    // 일정 데이터 적용
        views={{
          dayGridMonth: {
            dayMaxEventRows: 2, // 한 날짜 칸에 최대 2개 일정
            eventDisplay: 'list-item',
            eventContent: (arg) => {
              const date = arg.event.startStr;
              const division = arg.event.extendedProps?.scheduleDivision?.toString() || "";

              // 이 날짜에 division이 있는가!
              if (!eventMapRef.current.has(date) || !eventMapRef.current.get(date).has(division)) {
                return null;
              }

              const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
              return (
                <div className = "custom-event-month">
                  <span className={divisionClass}>{arg.event.title}</span>
                </div>
              )
            }
            // dayMaxEventRows: 2, // 한 날짜 칸에 최대 2개 일정
            // eventDisplay: 'list-item',
            // eventContent: (arg) => {
            //   console.log('이벤트 ExtendedProps?', arg.event.extendedProps);

            //   const allEvents = arg.view.calendar.getEvents().filter(
            //     (event) => event.startStr === arg.event.startStr
            //   );
            //   const uniqueEvents = [];
            //   const seenDivision = new Set();
              
            //   allEvents.forEach((event) => {
            //     const division = event.extendedProps?.scheduleDivision || event.classNames?.[0]?.replace("division-", "");
            //     if (division && !seenDivision.has(division)) {
            //       uniqueEvents.push(event);
            //       seenDivision.add(division);
            //       console.log('event?',event);
            //       console.log('division?',division);
            //     }
            //   });

            //   if (!uniqueEvents.some((e)=> e.id === arg.event.id)) {
            //     return null;
            //   }

            //   const divisionClass = `division-${arg.event.extendedProps.scheduleDivision}`;
            //   // if (arg.event.extendedProps.scheduleDivision === undefined) {
            //   //   return null; // 렌더링 안 함
            //   // }
            //   return (
            //     <div className="custom-event-month">
            //       <span className='{divisionClass}'>{arg.event.title}</span>
            //     </div>
            //   );
            // },
          },
          timeGridWeek: {
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