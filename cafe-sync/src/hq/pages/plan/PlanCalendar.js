import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import style from "./styles/Plan.module.css";

const Plan = () => {
  const [events, setEvents] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(false);

  useEffect( () => {fetchPlan()}, [] );
  const onUpdatePlan = async () => { await fetchPlan(); };

  const fetchPlan = async () => {
    try {
      let token = sessionStorage.getItem("accessToken");
      const response = await fetch(`http://localhost:8080/api/hq/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
    
      if(!response.ok) {
        throw new Error("서버 응답 실패");
      }
    
      const data = await response.json();
      console.log('data: ', data);
      
      setEvents(data);
    } catch (error) {
      console.log("조회 오류", error);
    }
  }

  return (
    <div className={`${style.cal}`}>
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
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3,
            eventDisplay: "list-item",
            eventContent: (arg) => {
              return (
                <div>
                  <span className="">{}</span>
                </div>
              )
            }
          }
        }}
      />
    </div>
  )
}

export default Plan;