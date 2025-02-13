// import React, { Component } from 'react';
// import FullCalendar from '@fullcalendar/react';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import interactionPlugin from "@fullcalendar/interaction";
// import st from './FullCalendar.module.css'

// class MyCalendar extends Component {
// /*
//   constructor(props) {
//     super(props);
//     this.calendarRef = React.createRef(); // React Ref 객체 생성
//     this.state = {
//       event: [], // 일정 데이터를 저장할 상태
//     }
//   }

//   // 컴포넌트가 마운트될 때 백엔드에서 일정 데이터 가지고 오기
//   componentDidMount() {
//     this.fetchSchedules(200);   // 우선 확인용 200, 이후에는 공란
//   }

//   // 일정 조회 (백엔드에서 가지고 오기)
//   fetchSchedules = async (franCode) => {
//     console.log('franCode?', franCode);
//     try {
//       // franCode를 URL에 포함시켜 fetch 요청
//       const response = await fetch(`http://localhost:8080/api/fran/schedule/regist/${franCode}`);
//       console.log(response);
//       if (!response.ok) {
//         throw new Error("서버 응답 실패!");
//       }
//       const data = await response.json();
//       console.log('data?', data);

//       // FullCalendar 형식으로 변환
//       const formattedEvents = data.map((schedule) => ({
//         id: schedule.scheduleCode,
//         title: this.getScheduleType(schedule.scheduleDivision),
//         date: schedule.scheduleDate,
//         emp: schedule.empCode,
//       }));
//       this.setState({events: formattedEvents});   // 상태 업데이트
//     } catch (error) {
//       console.log("조회 오류:", error);
//     }
//   } 

//   getScheduleType = (division) => {
//     const scheduleTypes = ["휴가", "오픈", "미들", "마감"];
//     return scheduleTypes[division] || "알 수 없음";
//   }
  
//   addEventHandler = () => {
//     const title = prompt('일정 제목을 입력하세요:');
//     if (title) {
//       this.calendarRef.getApi().addEvent({
//         title,
//         start: new Date(),
//         allDay: true,
//       });
//     }
//   };
// */
//   render() {
//     return (
//       <div className={`${st.cal} test-class`}>            
//         <FullCalendar 
//           ref={this.calendarRef} // ✅ Ref 연결
//           plugins={[ dayGridPlugin, interactionPlugin ]}
//           initialView="dayGridWeek"
//           height="800px"
//           contentHeight="auto"
//           locale={'ko'}
//           headerToolbar={{
//             start: "prev next today",
//             center: "title",
//             end: "addEventBtn dayGridMonth dayGridWeek",
//           }}
//           customButtons={{
//             addEventBtn: {
//               text: '스케줄 등록',
//               click: this.addEventHandler,
//             },
//           }}
//           events={this.state.events}    // 일정 데이터 적용
//           dayCellContent={(arg) => {
//             // 날짜만 반환하도록 설정
//             return `${arg.date.getDate()}`;
//           }}
//         />
//       </div>
//     );
//   }
// }
// export default MyCalendar;