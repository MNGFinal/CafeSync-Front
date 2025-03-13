import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import style from "../../plan/styles/Plan.module.css";
import st from "./HQPromotion.module.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";

const HQPromotion = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetchPlan();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      document
        .querySelectorAll(".fc-daygrid-body-unbalanced .fc-daygrid-day-events")
        .forEach((el) => {
          el.style.minHeight = "1em";
        });
    }, 10); // FullCalendar가 로딩된 후 적용되도록 지연 추가
  }, []);

  const fetchPlan = async () => {
    try {
      let token = sessionStorage.getItem("accessToken");
      const response = await fetch(
        `cafesync-back-production.up.railway.app/api/hq/promotions`,
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
      console.log("data: ", data);

      const convertUTCToKST = (utcDate, isEndDate = false) => {
        if (!utcDate) return "";
        const date = new Date(utcDate);
        date.setHours(date.getHours() + 9); // ✅ UTC → KST 변환

        if (isEndDate) {
          date.setDate(date.getDate());
        }

        return date.toISOString().split("T")[0]; // YYYY-MM-DD 형식 반환
      };

      const formattedEvents = data.data.map((promotion) => {
        const isSingleDay = promotion.startDate === promotion.endDate;
        const eventObj = {
          id: promotion.promotionCode,
          title: promotion.title,
          category: promotion.categoryName,
          start: convertUTCToKST(promotion.startDate, false),
          end: convertUTCToKST(promotion.endDate, true),
          memo: promotion.memo,
          viewTitle: `[${promotion.categoryName}] ${promotion.title}`,
          color: getCategoryColor(promotion.categoryName),
          allDay: true, // ✅ 하루짜리 일정도 강제로 allDay 처리
          display: "block",
          // classNames: [isSingleDay ? "single-day" : "multi-day"],
        };

        console.log("📌 이벤트 데이터:", eventObj); // ✅ 로그 확인
        return eventObj;
      });

      setEvents(formattedEvents);
    } catch (error) {
      console.log("조회 오류", error);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "콜라보":
        return "#BDC0F1";
      case "이벤트":
        return "#bde5f1";
      case "시즌":
        return "#C9F1BD";
      default:
        return "#F1BDBD";
    }
  };

  return (
    <div className={`${st.mainPagePromotionSection}`}>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={"ko"}
        dayCellContent={(arg) => arg.date.getDate()}
        height={350}
        contentHeight={350}
        aspectRatio={1.0}
        slotHeight={1}
        dayCellDidMount={(info) => {
          info.el.style.height = "30px"; // ✅ 직접 DOM 조작으로 높이 줄이기
        }}
        headerToolbar={false}
        events={events}
        eventClassNames={(arg) => {
          const convertToKST = (utcDate) => {
            const date = new Date(utcDate);
            date.setHours(date.getHours() + 9);
            return date.toISOString().split("T")[0];
          };

          const startDate = convertToKST(arg.event.start);
          const endDate = new Date(arg.event.end).toISOString().split("T")[0];

          console.log("📌 변환된 KST StartDate:", startDate);
          console.log("📌 변환된 KST EndDate:", endDate);

          return startDate === endDate ? ["single-day"] : ["multi-day"];
        }}
        eventContent={(arg) => {
          return (
            <div
              style={{
                height: "0px",
                // borderTop: `1px solid ${arg.event.backgroundColor}`,
                overflow: "hidden",
                display: "inline-block",
                width: "100%",
              }}
            ></div>
          );
        }}
        views={{
          dayGridMonth: {
            dayMaxEventRows: 3,
            eventDisplay: "list-item",
            eventContent: (arg) => {
              return (
                <div
                  style={{
                    height: "0px",
                    // borderTop: `1px solid ${arg.event.backgroundColor}`,
                    overflow: "hidden",
                    display: "inline-block",
                    width: "100%",
                  }}
                ></div>
              );
            },
          },
        }}
        eventDidMount={(info) => {
          tippy(info.el, {
            content: `[${info.event.extendedProps.category}] ${info.event.title}`,
            placement: "top",
            arrow: true,
            animation: "scale",
          });
          info.el.style.height = "0px"; // ✅ 블록 요소의 높이를 없애고 border만 표시
          // info.el.style.borderTop = `1px solid ${info.event.backgroundColor}`; // ✅ 테두리로 줄을 표시
          info.el.style.display = "inline-block"; // ✅ 블록이 아닌 인라인 요소로 변경
          info.el.style.width = "100%";
        }}
      />
    </div>
  );
};

export default HQPromotion;
