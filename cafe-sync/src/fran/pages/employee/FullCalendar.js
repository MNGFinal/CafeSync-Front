import React, { Component } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import st from './FullCalendar.module.css'

class MyCalendar extends Component {
    render() {
        return (
          <div className={`${st.cal} test-class`}>            
            <FullCalendar 
              defaultView="dayGridMonth" 
              plugins={[ dayGridPlugin ]}
              height="800px"
              contentHeight="auto"
              headerToolbar={{
                start: "prev next today",
                center: "title",
                end: "dayGridMonth dayGridWeek",
              }}
              locale={'ko'}
              initialView="dayGridMonth"
              dayCellContent={(arg) => {
                // 날짜만 반환하도록 설정
                return `${arg.date.getDate()}`;
              }}
            />
          </div>
        );
    }
}
export default MyCalendar;