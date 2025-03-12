import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import style from "./styles/Plan.module.css";
import AddPlan from "./AddPlan";
import DetailPlan from "./DetailPlan";

const Plan = () => {
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect( () => {fetchPlan()}, [] );
  const onUpdatePlan = async () => { await fetchPlan(); };

  const fetchPlan = async () => {
    try {
      let token = sessionStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:8080/api/hq/promotions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    
      if(!response.ok) {
        throw new Error("서버 응답 실패");
      }
    
      const data = await response.json();
      console.log('data: ', data);

      const convertUTCToKST = (utcDate, isEndDate = false) => {
        if (!utcDate) return "";
        const date = new Date(utcDate);
        date.setHours(date.getHours() + 9); // ✅ UTC → KST 변환
      
        if (isEndDate) {
          date.setDate(date.getDate() + 1); // ✅ FullCalendar가 end 날짜를 포함하지 않으므로 +1일 증가
        }
      
        return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식 반환
      };      
      
      const formattedEvents = data.data.map((promotion) => ({
        id: promotion.promotionCode,
        title: promotion.title,
        category: promotion.categoryName,
        start: convertUTCToKST(promotion.startDate, false),  // ✅ UTC → KST 변환 후 저장
        end: convertUTCToKST(promotion.endDate, true), // ✅ 종료일 하루 감소 처리
        memo: promotion.memo,
        viewTitle: `[${promotion.categoryName}] ${promotion.title}`,
        color: getCategoryColor(promotion.categoryName),
        allDay: true, // ✅ 하루짜리도 상단에 고정되도록 설정
        display: "block",
      }));      
      
      setEvents(formattedEvents);
    } catch (error) {
      console.log("조회 오류", error);
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
        case "콜라보": return "#BDC0F1";
        case "이벤트": return "#bde5f1";
        case "시즌": return "#C9F1BD";
        default: return "#F1BDBD";
    }
  }

  return (
    <div className={`${style.promotionSection}`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={"ko"}
        dayCellContent={(arg) => arg.date.getDate()}
        height="730px"
        headerToolbar={{
          start: "prev next today",
          center: "title",
          end: "addEventBtn"
        }}
        customButtons={{
          addEventBtn: {
            text: "일정 등록",
            click: () => setIsAddModalOpen(true),
          },
        }}
        events={events}
        eventClick={(info) => {
          setSelectedEvent(info.event);
          setIsDetailModalOpen(true);
        }}
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3,
            eventDisplay: "list-item",
            eventContent: (arg) => {
              return (
                <div style={{textAlign:"center"}}>
                  <b>[{arg.event.extendedProps.category}] </b>
                  <span>{arg.event.title}</span>
                </div>
              )
            }
          }
        }}
      />
      <AddPlan 
        isAddModalOpen={isAddModalOpen} 
        setIsAddModalOpen={setIsAddModalOpen} 
        onUpdatePlan={onUpdatePlan}
      />
      {isDetailModalOpen && (
        <DetailPlan
          isDetailModalOpen={isDetailModalOpen}
          setIsDetailModalOpen={setIsDetailModalOpen}
          selectedEvent={selectedEvent}
          onUpdatePlan={onUpdatePlan}
        />
      )}
    </div>
  )
}

export default Plan;