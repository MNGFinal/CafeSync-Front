// src/fran/pages/chat/Chatting.js
import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./Chatting.module.css";
import { useSelector, useDispatch } from "react-redux";
import {
  setMessages,
  addMessage, // LEAVE 메시지 처리를 위해 필요
  setChatRooms,
  setSelectedRoom,
} from "../../../redux/chatSlice";
import axios from "axios";
import moment from "moment";
import { TiArrowSortedDown, TiUser } from "react-icons/ti";
import { AiOutlineSend } from "react-icons/ai";
import { useChatSocket } from "../../../redux/ChatSocketProvider";

import SModal from "../../../components/SModal";
import modalStyle from "../../../components/ModalButton.module.css";
import { Player } from "@lottiefiles/react-lottie-player";

function Chatting() {
  const dispatch = useDispatch();
  const selectedRoom = useSelector((state) => state.chat.selectedRoom);
  const messages = useSelector(
    (state) => state.chat.messages[selectedRoom?.roomId] || []
  );
  const chatRooms = useSelector((state) => state.chat.chatRooms);

  const [messageText, setMessageText] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);

  const chatBoxRef = useRef(null);
  const client = useChatSocket();
  const token = sessionStorage.getItem("accessToken");
  const { user } = useSelector((state) => state.auth);
  const loggedInEmpCode = user?.employee?.empCode;
  const [subscription, setSubscription] = useState(null);

  // [A] 채팅방 WebSocket 구독
  useEffect(() => {
    if (!client || !selectedRoom?.roomId) return;

    // 기존에 구독된 WebSocket이 있으면 해제
    if (subscription) {
      console.log("🚨 기존 WebSocket 구독 해제:", selectedRoom.roomId);
      subscription.unsubscribe();
    }

    console.log("✅ WebSocket 새로 구독 시작:", selectedRoom.roomId);

    const newSubscription = client.subscribe(
      `/topic/room/${selectedRoom.roomId}`,
      (stompMessage) => {
        const data = JSON.parse(stompMessage.body);
        console.log("📩 [WebSocket 수신 데이터]:", data);

        dispatch((getState) => {
          const existingMessages = getState().chat.messages[data.roomId] || [];
          const existingMessageIds = new Set(
            existingMessages.map((msg) => msg.id)
          );

          if (!existingMessageIds.has(data.id)) {
            dispatch(
              addMessage({
                roomId: data.roomId,
                message: {
                  id: data.id,
                  message: data.message,
                  sendTime: data.sendTime,
                  sendCode: data.sendCode,
                },
              })
            );
            console.log("✅ [Redux 추가 완료]:", data);
          } else {
            console.log("⚠️ [중복 메시지 제거]:", data);
          }
        });
      }
    );

    setSubscription(newSubscription);

    return () => {
      console.log("🚨 WebSocket 구독 해제:", selectedRoom.roomId);
      newSubscription.unsubscribe();
    };
  }, [client, selectedRoom, dispatch]);

  // [B] 메시지 렌더링 후 자동 스크롤
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // [C] 채팅방 변경 시: 히스토리 불러오기 + 자동 읽음
  useEffect(() => {
    if (selectedRoom?.participants) {
      const names = selectedRoom.participants.map((p) => p.empName).join(", ");
      setWelcomeMessage(`💬 ${names} 대화방에 참여되었습니다.`);

      fetchChatHistory(selectedRoom.roomId);
      markAllUnreadMessages();
    } else {
      setWelcomeMessage("");
    }
  }, [selectedRoom]);

  const fetchChatHistory = async (roomId) => {
    if (!roomId) return;
    try {
      const response = await axios.get(
        `cafesync-back-production.up.railway.app/api/chat/history/${roomId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("📩 [채팅 내역 불러오기]:", response.data);

      if (response.data.data) {
        dispatch((getState) => {
          const existingMessages = getState().chat.messages[roomId] || [];
          const existingMessageIds = new Set(
            existingMessages.map((msg) => msg.id)
          );

          // ✅ 기존 Redux에 없는 메시지만 추가
          const newMessages = response.data.data.filter(
            (msg) => !existingMessageIds.has(msg.id)
          );

          console.log("🛑 [중복 제거 후 추가할 메시지]:", newMessages);

          dispatch(
            setMessages({
              roomId,
              messages: [...existingMessages, ...newMessages],
            })
          );
        });
      }
    } catch (error) {
      console.error("❌ 채팅 내역 불러오기 실패", error);
    }
  };

  // 읽지 않은 메시지 자동 읽음
  const markAllUnreadMessages = useCallback(() => {
    if (!selectedRoom?.roomId) return;
    messages.forEach((msg) => {
      if (msg.sendCode !== loggedInEmpCode && !msg.readTime) {
        markMessageAsRead(msg.id);
      }
    });
  }, [messages, selectedRoom, loggedInEmpCode]);

  useEffect(() => {
    markAllUnreadMessages();
  }, [messages, markAllUnreadMessages]);

  const markMessageAsRead = async (chatId) => {
    if (!chatId) return;
    try {
      await axios.post(
        `cafesync-back-production.up.railway.app/api/chat/read/${chatId}/${loggedInEmpCode}`
      );
      console.log(`메시지 ${chatId} 읽음 처리 완료`);
    } catch (error) {
      console.error("❌ 메시지 읽음 처리 실패", error);
    }
  };

  // [D] 메시지 전송 핸들러
  const handleSendMessage = useCallback(
    (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!messageText.trim()) return;

        console.log("📤 [메시지 전송 요청]:", messageText);

        const newMessage = {
          roomId: selectedRoom?.roomId,
          sendCode: loggedInEmpCode,
          message: messageText,
          sendTime: moment().format("YY.MM.DD HH:mm:ss"),
        };

        if (client && client.connected) {
          client.publish({
            destination: "/app/chat.sendMessage",
            body: JSON.stringify(newMessage),
          });

          // ✅ 메시지가 중복 전송되지 않도록 0.1초 동안 추가 입력 방지
          setTimeout(() => setMessageText(""), 100);
        } else {
          console.error("❌ WebSocket이 연결되지 않았습니다.");
        }
      }
    },
    [client, messageText, selectedRoom, loggedInEmpCode]
  );

  const handleClickSend = () => {
    handleSendMessage({
      key: "Enter",
      shiftKey: false,
      preventDefault: () => {},
    });
  };

  // [E] 채팅방 나가기
  const handleClickExit = () => {
    setIsExitModalOpen(true);
  };

  const confirmExit = async () => {
    if (!selectedRoom) return;
    try {
      await axios.delete(
        `cafesync-back-production.up.railway.app/api/chat/room/${selectedRoom.roomId}/participants/${loggedInEmpCode}`
      );
      console.log("채팅방에서 나갔습니다.");

      // 방 목록에서 제거
      const updatedRooms = chatRooms.filter(
        (room) => room.roomId !== selectedRoom.roomId
      );
      dispatch(setChatRooms(updatedRooms));
      dispatch(setSelectedRoom(null));

      setIsExitModalOpen(false);
    } catch (error) {
      console.error("채팅방 나가기 실패:", error);
      alert("채팅방 나가기에 실패했습니다.");
      setIsExitModalOpen(false);
    }
  };

  // [F] 참여자 프로필 및 이름
  const getProfileImage = (sendCode) => {
    const participant = selectedRoom?.participants.find(
      (p) => p.empCode === sendCode
    );
    return participant?.profileImage
      ? participant.profileImage
      : "/images/icons/default.png";
  };

  const getSenderName = (sendCode) => {
    return (
      selectedRoom?.participants.find((p) => p.empCode === sendCode)?.empName ||
      ""
    );
  };

  return (
    <>
      {/* 상단 바 */}
      <div className={styles.roomTitle}>
        <div
          className={styles.people}
          onClick={() => setShowParticipants((prev) => !prev)}
        >
          참여자 <TiArrowSortedDown />
        </div>
        <p className={styles.roomName}>
          {selectedRoom?.roomName || "채팅방을 선택하세요"}
        </p>
        <div className={styles.exit} onClick={handleClickExit}>
          <p>나가기</p>
        </div>
      </div>

      {/* 참여자 목록 드롭다운 */}
      {showParticipants && selectedRoom?.participants?.length > 0 && (
        <div className={styles.participantList}>
          {selectedRoom.participants.map((member) => (
            <p key={member.empCode} className={styles.participantItem}>
              <TiUser /> {member.empName}
            </p>
          ))}
        </div>
      )}

      {/* 채팅 내용 */}
      <div className={styles.chatBox} ref={chatBoxRef}>
        {welcomeMessage && (
          <div className={styles.welcomeMessage}>
            <p>{welcomeMessage}</p>
          </div>
        )}
        {messages.length > 0 &&
          messages.map((msg, index) => {
            const isMine = msg.sendCode === loggedInEmpCode;
            const isSystem = msg.type === "LEAVE";

            return (
              <div
                key={index}
                className={`${styles.message} ${
                  isMine ? styles.myMessage : styles.otherMessage
                } ${isSystem ? styles.systemMessage : ""}`}
              >
                <div className={styles.messageHeader}>
                  {!isSystem && (
                    <img
                      src={getProfileImage(msg.sendCode)}
                      alt="profile"
                      className={styles.profileImage}
                    />
                  )}
                  <span className={styles.senderName}>
                    {!isSystem ? getSenderName(msg.sendCode) : "SYSTEM"}
                  </span>
                </div>
                <div className={styles.bubble}>
                  <p className={styles.messageText}>{msg.message}</p>
                  <span className={styles.time}>
                    {msg.sendTime
                      ? moment(msg.sendTime, "YYYY-MM-DD HH:mm:ss").format(
                          "YY.MM.DD HH:mm:ss"
                        )
                      : "-"}
                  </span>
                </div>
              </div>
            );
          })}
      </div>

      {/* 메시지 입력창 */}
      <div className={styles.sendBox}>
        <textarea
          className={styles.inputField}
          placeholder={
            selectedRoom
              ? "메시지를 입력하세요..."
              : "채팅방을 선택해야 입력이 가능합니다."
          }
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleSendMessage}
          disabled={!selectedRoom}
        />
        <button
          className={styles.sendButton}
          onClick={handleClickSend}
          disabled={!selectedRoom}
        >
          <AiOutlineSend size={20} />
        </button>
      </div>

      {/* 채팅방 나가기 확인 모달 */}
      {isExitModalOpen && (
        <SModal
          isOpen={isExitModalOpen}
          onClose={() => setIsExitModalOpen(false)}
          buttons={[
            {
              text: "확인",
              onClick: confirmExit,
              className: modalStyle.confirmButtonS,
            },
            {
              text: "취소",
              onClick: () => setIsExitModalOpen(false),
              className: modalStyle.cancelButtonS,
            },
          ]}
        >
          <div style={{ textAlign: "center", padding: "20px" }}>
            <Player
              autoplay
              loop={false}
              keepLastFrame={true}
              src="/animations/alert2.json"
              style={{ height: "80px", width: "80px" }}
            />
            <h3>채팅방 나가기</h3>
            <p>정말 이 채팅방에서 나가시겠습니까?</p>
          </div>
        </SModal>
      )}
    </>
  );
}

export default Chatting;
