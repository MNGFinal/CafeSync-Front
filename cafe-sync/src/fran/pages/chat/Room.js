// src/fran/pages/chat/Room.js
import React, { useState, useEffect, useRef } from "react";
import styles from "./Room.module.css";
import { getUserChatRooms, getUnreadCount } from "../../../apis/chat/chatApi";
import { useSelector, useDispatch } from "react-redux";
import {
  setSelectedRoom,
  setChatRooms,
  setMessages,
  updateChatRoomLastMessage,
} from "../../../redux/chatSlice";
import axios from "axios";
import moment from "moment";

// Redux store 직접 import (store가 default export라 가정)
import store from "../../../redux/store";

function Room() {
  const [searchText, setSearchText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});

  // Redux 상태
  const chatRooms = useSelector((state) => state.chat.chatRooms || []);
  const selectedRoom = useSelector((state) => state.chat.selectedRoom);
  const empCode = useSelector(
    (state) => state.auth?.user?.employee?.empCode ?? null
  );
  const token = sessionStorage.getItem("accessToken");
  const dispatch = useDispatch();

  // 채팅방 목록 스크롤 관리
  const roomListRef = useRef(null);
  const scrollToBottom = () => {
    if (roomListRef.current) {
      roomListRef.current.scrollTop = roomListRef.current.scrollHeight;
    }
  };

  // 메시지 읽음 처리 API
  const markMessageAsRead = async (chatId) => {
    if (!chatId) return;
    try {
      await axios.post(
        `http://localhost:8080/api/chat/read/${chatId}/${empCode}`
      );
      console.log(
        `✅ 메시지(chatId=${chatId}) 읽음 처리 완료 for empCode=${empCode}`
      );
    } catch (error) {
      console.error("❌ 메시지 읽음 처리 실패", error);
    }
  };

  // [1] 채팅방 및 메시지 내역 불러오기
  const fetchChatRoomsAndMessages = async () => {
    if (!empCode) return;
    try {
      const fetchedRooms = await getUserChatRooms(empCode);
      console.log("📩 채팅방 목록:", fetchedRooms);
      if (!fetchedRooms) return;
      // 원래 순서 유지용
      fetchedRooms.forEach((room, idx) => {
        room.originalIndex = idx;
      });
      // 각 방의 메시지 내역 및 마지막 메시지 세팅
      for (let i = 0; i < fetchedRooms.length; i++) {
        const room = fetchedRooms[i];
        const res = await axios.get(
          `http://localhost:8080/api/chat/history/${room.roomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const messagesData = res.data.data || res.data || [];
        dispatch(setMessages({ roomId: room.roomId, messages: messagesData }));
        if (messagesData.length > 0) {
          const lastMsg = messagesData[messagesData.length - 1];
          const parsedTime = moment(lastMsg.sendTime, "YY.MM.DD HH:mm:ss");
          room.lastMessageTime = parsedTime.isValid()
            ? parsedTime.format("YYYY-MM-DD HH:mm:ss")
            : null;
          room.lastMessage = lastMsg.message;
        } else {
          room.lastMessage = "";
          room.lastMessageTime = null;
        }
      }
      dispatch(setChatRooms(fetchedRooms));
    } catch (error) {
      console.error("❌ 채팅방 및 메시지 불러오기 실패", error);
    }
  };

  // [2] 최초 렌더링 시 채팅방 및 메시지 불러오기
  useEffect(() => {
    fetchChatRoomsAndMessages();
  }, [empCode]);

  // [3] 주기적으로 읽지 않은 메시지 개수 갱신 (3초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUnreadCounts();
    }, 3000);
    return () => clearInterval(interval);
  }, [chatRooms, empCode]);

  const fetchUnreadCounts = async () => {
    if (!empCode || chatRooms.length === 0) return;
    try {
      const promises = chatRooms.map(async (room) => {
        const count = await getUnreadCount(room.roomId, empCode);
        return { roomId: room.roomId, count };
      });
      const results = await Promise.all(promises);
      const unreadData = results.reduce((acc, { roomId, count }) => {
        acc[roomId] = count;
        return acc;
      }, {});
      setUnreadCounts(unreadData);
    } catch (error) {
      console.error("❌ 읽지 않은 메시지 개수 불러오기 실패", error);
    }
  };

  // [4] 채팅방 클릭 시: 접속 상태 업데이트 및 읽음 처리, 그리고 방의 마지막 메시지 정보를 업데이트하여 정렬 유지
  const handleRoomClick = async (newRoom) => {
    // 이전 방 OFF 업데이트
    if (selectedRoom && selectedRoom.roomId !== newRoom.roomId) {
      try {
        await axios.post(
          `http://localhost:8080/api/chat/presence/${selectedRoom.roomId}/${empCode}?online=false`
        );
        console.log(`Presence OFF for room ${selectedRoom.roomId}`);
      } catch (error) {
        console.error("❌ 이전 방 OFF 업데이트 실패", error);
      }
    }
    // 새 방 ON 업데이트
    try {
      await axios.post(
        `http://localhost:8080/api/chat/presence/${newRoom.roomId}/${empCode}?online=true`
      );
      console.log(`Presence ON for room ${newRoom.roomId}`);
    } catch (error) {
      console.error("❌ 새 방 ON 업데이트 실패", error);
    }

    // 선택한 방 업데이트 및 unread 카운트 0 설정
    dispatch(setSelectedRoom(newRoom));
    setUnreadCounts((prev) => ({ ...prev, [newRoom.roomId]: 0 }));

    // 선택한 방의 메시지를 가져와 읽지 않은 메시지에 대해 읽음 처리
    const state = store.getState();
    const roomMessages = state.chat.messages[newRoom.roomId] || [];
    roomMessages.forEach((msg) => {
      if (msg.sendCode !== empCode && !msg.readTime) {
        markMessageAsRead(msg.id);
      }
    });

    // **추가**: 방 클릭 시, 마지막 메시지 시간(lastMessageTime)을 갱신하여 최근 활동한 방이 계속 상단에 있도록 함.
    // (예: 방 클릭 시 현재 시각으로 업데이트 - 실제 환경에서는 새 메시지 도착 시 업데이트되어야 함)
    const updatedTime = moment().format("YYYY-MM-DD HH:mm:ss");
    dispatch(
      updateChatRoomLastMessage({
        roomId: newRoom.roomId,
        lastMessage: newRoom.lastMessage,
        lastMessageTime: updatedTime,
      })
    );
  };

  // [5] 채팅방 검색 및 정렬 (최근 받은 메시지 순 내림차순)
  const filteredRooms = chatRooms
    .slice()
    .sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return (
          new Date(b.lastMessageTime).getTime() -
          new Date(a.lastMessageTime).getTime()
        );
      }
      if (a.lastMessageTime) return -1;
      if (b.lastMessageTime) return 1;
      return (a.originalIndex || 0) - (b.originalIndex || 0);
    })
    .filter((room) =>
      room.roomName.toLowerCase().includes(searchText.toLowerCase())
    );

  // [6] 참여자 프로필 렌더링
  const renderRoomMembers = (members) => {
    if (!members || members.length === 0) return <p>인원이 부족합니다.</p>;
    const filteredMembers = members.filter((m) => m.empCode !== empCode);
    const total = filteredMembers.length;
    if (total === 1) {
      return (
        <img
          src={filteredMembers[0].profileImage || "/images/default.png"}
          alt="프로필"
          className={styles.singleProfile}
        />
      );
    } else if (total === 2) {
      return (
        <div className={styles.multiProfile}>
          {filteredMembers.map((m) => (
            <img
              key={m.empCode}
              src={m.profileImage || "/images/default.png"}
              alt="프로필"
              className={styles.smallProfile}
            />
          ))}
        </div>
      );
    } else if (total === 3) {
      return (
        <div className={styles.triangleProfile}>
          {filteredMembers.map((m, index) => (
            <img
              key={m.empCode}
              src={m.profileImage || "/images/default.png"}
              alt="프로필"
              className={`${styles.triangleProfileItem} ${
                styles[`pos${index + 1}`]
              }`}
            />
          ))}
        </div>
      );
    } else if (total >= 4) {
      const shown = filteredMembers.slice(0, 4);
      return (
        <div className={styles.gridProfile}>
          {shown.map((m) => (
            <img
              key={m.empCode}
              src={m.profileImage || "/images/default.png"}
              alt="프로필"
              className={styles.gridProfileItem}
            />
          ))}
        </div>
      );
    }
  };

  // [7] 화면 렌더링
  return (
    <div className={styles.roomContainer}>
      {/* 상단 헤더: 채팅방 목록 및 검색창 */}
      <div className={styles.top}>
        <div className={styles.title}>
          <h2>채팅방 목록</h2>
        </div>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="채팅방명 or 이름을 입력해주세요"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      {/* 채팅방 목록 */}
      <div className={styles.roomList} ref={roomListRef}>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div
              key={room.roomId}
              className={`${styles.roomCard} ${
                (unreadCounts[room.roomId] || 0) > 0 ? styles.unreadRoom : ""
              }`}
              onClick={() => handleRoomClick(room)}
            >
              <div className={styles.profileSection}>
                {renderRoomMembers(room.participants)}
              </div>
              <div className={styles.roomDetails}>
                <p className={styles.roomName}>{room.roomName}</p>
                <p className={styles.lastMessage}>
                  {room.lastMessage
                    ? room.lastMessage.length > 18
                      ? room.lastMessage.substring(0, 18) + "..."
                      : room.lastMessage
                    : "메시지가 없습니다."}
                </p>
              </div>
              {(unreadCounts[room.roomId] || 0) > 0 && (
                <span className={styles.unreadBadge}>
                  {unreadCounts[room.roomId]}
                </span>
              )}
            </div>
          ))
        ) : (
          <p className={styles.noRooms}>참여 중인 채팅방이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

export default Room;
