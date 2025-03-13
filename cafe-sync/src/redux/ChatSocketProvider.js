import React, { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import moment from "moment";
import { addMessage, updateChatRooms } from "../redux/chatSlice";

const ChatSocketContext = createContext(null);

export const ChatSocketProvider = ({ children }) => {
  const token = sessionStorage.getItem("accessToken");
  const dispatch = useDispatch();
  const empCode = useSelector((state) => state.auth?.user?.employee?.empCode);
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!empCode) return;

    const newClient = new Client({
      webSocketFactory: () =>
        new SockJS("https://cafesync-back-production.up.railway.app/ws/chat"),
      connectHeaders: { Authorization: `Bearer ${token}` },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
    });

    newClient.onConnect = () => {
      console.log("✅ STOMP WebSocket 연결 성공 (전역)");

      newClient.subscribe("/topic/public", async (message) => {
        const newMsg = JSON.parse(message.body);
        console.log("📩 받은 메시지 (전역):", newMsg);

        if (!newMsg.roomId) return;

        const formattedSendTime = newMsg.sendTime
          ? moment(newMsg.sendTime, "YY.MM.DD HH:mm:ss").format(
              "YYYY-MM-DD HH:mm:ss"
            )
          : moment().format("YYYY-MM-DD HH:mm:ss");

        dispatch(
          addMessage({
            roomId: newMsg.roomId,
            message: {
              id: newMsg.id,
              message: newMsg.message,
              sendTime: formattedSendTime,
              sendCode: newMsg.sendCode,
            },
          })
        );

        dispatch(updateChatRooms(newMsg));
      });
    };

    newClient.activate();
    setClient(newClient);

    return () => {
      newClient.deactivate();
    };
  }, [dispatch, token, empCode]);

  return (
    <ChatSocketContext.Provider value={client}>
      {children}
    </ChatSocketContext.Provider>
  );
};

export const useChatSocket = () => useContext(ChatSocketContext);

export default ChatSocketProvider;
